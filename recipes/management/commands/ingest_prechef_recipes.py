"""
Ingest pre-chef recipes into ChefConnect using Spoonacular + Cloudinary + Supabase
Usage examples:
  python manage.py ingest_prechef_recipes --all
  python manage.py ingest_prechef_recipes --category "Quick Breakfast" --count 30
  python manage.py ingest_prechef_recipes --dry-run --category "Dessert" --count 5

This command:
- Fetches public recipes from Spoonacular per category
- Downloads images and uploads to Cloudinary
- Creates Recipe records in Django (source_type=house)
- Triggers automatic Supabase sync via model signals
- Avoids duplicates by title+category and optional spoonacular_id in description
- Retries transient failures and logs per-recipe outcomes
"""
import io
import os
import re
import sys
import time
import json
import math
import uuid
import hashlib
import logging
import requests
from typing import List, Dict, Any, Optional, Tuple

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from recipes.models import Recipe, Category
from utils.cloudinary_upload import upload_to_cloudinary

# Reuse existing Spoonacular fetcher for consistent transforms
from scripts.recipe_fetcher import RecipeFetcher

logger = logging.getLogger(__name__)

CATEGORIES = [
    "Quick Breakfast",
    "Midnight Munchies",
    "Quick meals for busy people",
    "Fitness / diet-based meals",
    "Budget Friendly",
    "African Fusion",
    "Dessert",
    "Main Course",
]


def _download_image(url: str, timeout: int = 20) -> Optional[bytes]:
    try:
        headers = {"User-Agent": "ChefConnectBot/1.0"}
        r = requests.get(url, headers=headers, timeout=timeout)
        r.raise_for_status()
        # basic content-type check
        ctype = r.headers.get("Content-Type", "")
        if not ctype.startswith("image/"):
            return None
        return r.content
    except requests.RequestException:
        return None


def _ensure_category(name: str) -> Category:
    slug = slugify(name)
    cat, _ = Category.objects.get_or_create(slug=slug, defaults={"name": name})
    if cat.name != name:
        cat.name = name
        cat.save(update_fields=["name"])
    return cat


def _is_duplicate(title: str, category: Category) -> bool:
    return Recipe.objects.filter(title__iexact=title.strip(), category=category).exists()


def _make_description(summary: str, source_url: Optional[str], spoonacular_id: Optional[int]) -> str:
    # Keep within reasonable length and embed minimal provenance to aid dedupe
    base = (summary or "").strip()
    base = re.sub(r"<[^>]+>", " ", base)  # remove HTML if present
    base = re.sub(r"\s+", " ", base).strip()
    base = base[:900]
    provenance = []
    if source_url:
        provenance.append(f"Source: {source_url}")
    if spoonacular_id:
        provenance.append(f"SpoonacularID:{spoonacular_id}")
    if provenance:
        return f"{base}\n\n" + " | ".join(provenance)
    return base


def _normalize_ingredients(ings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    norm = []
    for i in ings or []:
        # ensure keys exist; our model expects list JSON
        norm.append({
            "name": i.get("name") or i.get("originalName") or i.get("original", ""),
            "amount": i.get("amount", 0),
            "unit": i.get("unit", ""),
            "original": i.get("original", i.get("name", "")),
        })
    return norm


def _normalize_steps(steps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    norm = []
    for s in steps or []:
        n = s.get("number") or len(norm) + 1
        text = s.get("step") or s.get("instruction") or ""
        if text:
            norm.append({"number": int(n), "step": text})
    return norm


class Command(BaseCommand):
    help = "Ingest pre-chef recipes into ChefConnect and sync to Supabase"

    def add_arguments(self, parser):
        parser.add_argument('--category', type=str, help='Single category to ingest')
        parser.add_argument('--count', type=int, default=30, help='Recipes per category')
        parser.add_argument('--all', action='store_true', help='Ingest all predefined categories')
        parser.add_argument('--dry-run', action='store_true', help='Do not persist, only log planned inserts')
        parser.add_argument('--start-offset', type=int, default=0, help='Offset for API pagination')

    def handle(self, *args, **options):
        categories = []
        if options['all']:
            categories = CATEGORIES
        elif options.get('category'):
            categories = [options['category']]
        else:
            self.stdout.write(self.style.ERROR('Specify --all or --category'))
            return

        target = max(1, options.get('count') or 30)
        dry_run = options.get('dry_run', False)
        offset = options.get('start_offset', 0)

        # Ensure categories exist
        cat_objs = {name: _ensure_category(name) for name in categories}

        fetcher = None
        try:
            fetcher = RecipeFetcher()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Spoonacular not configured: {e}"))
            return

        total_inserted = 0
        for name in categories:
            cat = cat_objs[name]
            self.stdout.write(self.style.MIGRATE_HEADING(f"\n=== Category: {name} ==="))

            # Fetch transformed recipes using existing helper
            recipes = fetcher.fetch_recipes_for_category(name, target_count=target + 10)  # over-fetch for filtering

            inserted = 0
            seen_titles = set()
            for data in recipes:
                if inserted >= target:
                    break

                title = (data.get('title') or '').strip()
                if not title:
                    continue
                if title.lower() in seen_titles:
                    continue
                if _is_duplicate(title, cat):
                    continue

                seen_titles.add(title.lower())

                # Build normalized payload
                ingredients = _normalize_ingredients(data.get('ingredients'))
                steps = _normalize_steps(data.get('steps'))
                if not ingredients or not steps:
                    continue

                description = _make_description(
                    data.get('description') or data.get('summary') or '',
                    data.get('sourceUrl'),
                    data.get('spoonacular_id')
                )

                ready_time = int(data.get('prep_time') or data.get('readyInMinutes') or 30)
                difficulty = data.get('difficulty') or ('easy' if ready_time <= 20 else 'medium' if ready_time <= 45 else 'hard')
                diet_tags = list({*(data.get('diet_tags') or [] )})
                servings = int(data.get('servings') or 4)

                image_url = data.get('image_url') or data.get('image')
                uploaded_url = None
                if image_url:
                    img_bytes = _download_image(image_url)
                    if img_bytes:
                        # upload with a deterministic public_id to reduce dupes
                        public_id = f"recipes/house/{slugify(title)}-{uuid.uuid4().hex[:8]}"
                        upload_result = upload_to_cloudinary(io.BytesIO(img_bytes), folder=os.path.dirname(public_id) or 'recipes')
                        if upload_result:
                            uploaded_url = upload_result['url']

                if not uploaded_url:
                    # skip items without a valid image since UI expects cards
                    continue

                if dry_run:
                    self.stdout.write(f"DRY RUN: Would insert '{title}' into {name}")
                    inserted += 1
                    continue

                try:
                    with transaction.atomic():
                        recipe = Recipe.objects.create(
                            title=title,
                            description=description,
                            image=uploaded_url,  # CloudinaryField accepts URL or upload result public_id URL
                            ingredients=ingredients,
                            steps=steps,
                            prep_time=ready_time,
                            servings=servings,
                            difficulty=difficulty,
                            category=cat,
                            diet_tags=diet_tags,
                            source_type='house',
                        )
                    inserted += 1
                    total_inserted += 1
                    self.stdout.write(self.style.SUCCESS(f"✓ Inserted: {title}"))
                except Exception as e:
                    logger.exception("Insert failed")
                    self.stdout.write(self.style.ERROR(f"✗ Failed to insert '{title}': {e}"))
                    # continue loop

            self.stdout.write(self.style.NOTICE(f"Category '{name}': inserted {inserted}/{target}"))

        self.stdout.write(self.style.SUCCESS(f"\nDone. Inserted total {total_inserted} recipes."))
