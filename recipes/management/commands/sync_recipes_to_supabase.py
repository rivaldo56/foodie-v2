"""
Django management command to sync existing recipes to Supabase
Usage: python manage.py sync_recipes_to_supabase
"""
from django.core.management.base import BaseCommand
from recipes.models import Recipe
from utils.supabase_client import bulk_sync_recipes_to_supabase


class Command(BaseCommand):
    help = 'Sync all existing recipes to Supabase'

    def add_arguments(self, parser):
        parser.add_argument(
            '--recipe-id',
            type=int,
            help='Sync a specific recipe by ID',
        )

    def handle(self, *args, **options):
        recipe_id = options.get('recipe_id')
        
        if recipe_id:
            try:
                recipe = Recipe.objects.get(id=recipe_id)
                recipes = [recipe]
                self.stdout.write(f"Syncing recipe: {recipe.title}")
            except Recipe.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Recipe with ID {recipe_id} not found"))
                return
        else:
            recipes = Recipe.objects.all()
            self.stdout.write(f"Syncing {recipes.count()} recipes to Supabase...")
        
        stats = bulk_sync_recipes_to_supabase(recipes)
        
        self.stdout.write(
            self.style.SUCCESS(
                f"\nSync complete!\n"
                f"✓ Success: {stats['success']}\n"
                f"✗ Failed: {stats['failed']}"
            )
        )
