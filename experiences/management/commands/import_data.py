import csv
import json
import os
import sys
from django.core.management.base import BaseCommand
from experiences.models import Experience, Menu, Meal, MenuMeal
from django.conf import settings

# Increase field size limit for large CSV fields
csv.field_size_limit(sys.maxsize)


class Command(BaseCommand):
    help = "Import menu data from CSV files"

    def handle(self, *args, **options):
        base_path = os.path.join(settings.BASE_DIR, "venv", "tablecvs")
        
        self.import_experiences(os.path.join(base_path, "experiences_rows.csv"))
        self.import_meals(os.path.join(base_path, "meals_rows.csv"))
        self.import_menus(os.path.join(base_path, "menus_rows.csv"))
        self.import_menu_meals(os.path.join(base_path, "menu_meals_rows.csv"))

        self.stdout.write(self.style.SUCCESS("Data import completed successfully!"))

    def import_experiences(self, file_path):
        self.stdout.write("Importing Experiences...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                slug = row.get("slug")
                if not slug:
                    slug = None
                
                self.stdout.write(f"  Row: {row['id']} | Slug: {slug}")
                
                Experience.objects.update_or_create(
                    id=row["id"],
                    defaults={
                        "name": row["name"],
                        "description": row.get("description"),
                        "category": row.get("category"),
                        "image_url": row.get("image_url"),
                        "is_featured": row.get("is_featured", "false").lower() == "true",
                        "status": row.get("status", "published"),
                        "slug": slug,
                    },
                )

    def import_meals(self, file_path):
        self.stdout.write("Importing Meals...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dietary_tags = []
                try:
                    if row.get("dietary_tags"):
                        dietary_tags = json.loads(row["dietary_tags"])
                except Exception:
                    pass

                name = row["name"].lower()
                kcal = row.get("kcal")
                price = row.get("price")

                # Heuristic estimation if kcal or price is missing
                if not kcal or kcal == "":
                    if any(kw in name for kw in ["salad", "fruit", "veg", "soup", "burrata"]):
                        kcal = 250
                    elif any(kw in name for kw in ["chicken", "steak", "beef", "salmon", "lamb", "pork"]):
                        kcal = 750
                    elif any(kw in name for kw in ["tart", "cake", "dessert", "mousse", "parfait", "chocolate", "sweet"]):
                        kcal = 450
                    elif any(kw in name for kw in ["pasta", "pizza", "burger", "rice", "station"]):
                        kcal = 650
                    else:
                        kcal = 500
                else:
                    kcal = int(kcal)

                if not price or price == "":
                    # Price in KES (Kenya Shillings are usually around 1000-5000 for these items)
                    if any(kw in name for kw in ["station", "platter", "experience"]):
                        price = 4500
                    elif any(kw in name for kw in ["steak", "salmon", "lamb", "beef"]):
                        price = 3500
                    elif any(kw in name for kw in ["pasta", "chicken", "burger", "pizza"]):
                        price = 2200
                    elif any(kw in name for kw in ["salad", "starter", "bruschetta", "burrata", "soup"]):
                        price = 1200
                    elif any(kw in name for kw in ["dessert", "tart", "cake", "mousse"]):
                        price = 900
                    else:
                        price = 1500
                else:
                    price = float(price)

                Meal.objects.update_or_create(
                    id=row["id"],
                    defaults={
                        "name": row["name"],
                        "description": row.get("description"),
                        "image_url": row.get("image_url"),
                        "kcal": kcal,
                        "category": row.get("category"),
                        "cuisine_type": row.get("cuisine_type"),
                        "dietary_tags": dietary_tags,
                        "price": price,
                        "total_bookings": int(row.get("total_bookings", 0)),
                        "average_rating": float(row.get("average_rating", 0)),
                        "is_active": row.get("is_active", "true").lower() == "true",
                    },
                )

    def import_menus(self, file_path):
        self.stdout.write("Importing Menus...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                dietary_tags = []
                try:
                    if row.get("dietary_tags"):
                        dietary_tags = json.loads(row["dietary_tags"])
                except Exception:
                    pass

                experience = Experience.objects.get(id=row["experience_id"])
                Menu.objects.update_or_create(
                    id=row["id"],
                    defaults={
                        "experience": experience,
                        "name": row["name"],
                        "description": row.get("description"),
                        "price_per_person": float(row["price_per_person"]),
                        "guest_min": int(row.get("guest_min", 1)),
                        "guest_max": int(row["guest_max"]) if row.get("guest_max") else None,
                        "dietary_tags": dietary_tags,
                        "image_url": row.get("image_url"),
                        "base_price": float(row["base_price"]) if row.get("base_price") else None,
                        "featured": row.get("featured", "false").lower() == "true",
                        "status": row.get("status", "active"),
                    },
                )

    def import_menu_meals(self, file_path):
        self.stdout.write("Importing Menu Meals (Junction)...")
        with open(file_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    menu = Menu.objects.get(id=row["menu_id"])
                    meal = Meal.objects.get(id=row["meal_id"])
                    MenuMeal.objects.update_or_create(
                        id=row["id"],
                        defaults={
                            "menu": menu,
                            "meal": meal,
                            "course_type": row.get("course_type"),
                            "order_index": int(row.get("order_index", 0)),
                        },
                    )
                except (Menu.DoesNotExist, Meal.DoesNotExist):
                    self.stdout.write(self.style.WARNING(f"Skipping MenuMeal {row['id']}: Menu or Meal not found."))
