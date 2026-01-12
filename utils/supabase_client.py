"""
Supabase client utility for ChefConnect
Handles syncing recipe data to Supabase for future scalability
"""
import os
import logging
from typing import Optional, Dict, Any, List
from django.conf import settings
from supabase import create_client, Client

logger = logging.getLogger(__name__)

# Initialize Supabase client
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Get or create Supabase client instance
    Returns None if Supabase is not configured
    """
    global _supabase_client
    
    if _supabase_client is not None:
        return _supabase_client
    
    supabase_url = getattr(settings, 'SUPABASE_URL', '')
    supabase_key = getattr(settings, 'SUPABASE_KEY', '')
    
    if not supabase_url or not supabase_key:
        logger.warning("Supabase credentials not configured. Skipping Supabase integration.")
        return None
    
    try:
        # Create Supabase client with just URL and key (no extra options)
        _supabase_client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully")
        return _supabase_client
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        return None


def sync_recipe_to_supabase(recipe) -> Optional[Dict[str, Any]]:
    """
    Sync a recipe instance to Supabase
    
    Args:
        recipe: Django Recipe model instance
    
    Returns:
        Dict with Supabase record data or None if failed
    """
    client = get_supabase_client()
    if not client:
        return None
    
    try:
        # Prepare recipe data for Supabase
        recipe_data = {
            'django_id': recipe.id,
            'title': recipe.title,
            'description': recipe.description,
            'image_url': str(recipe.image.url) if recipe.image else '',
            'ingredients': recipe.ingredients,
            'steps': recipe.steps,
            'prep_time': recipe.prep_time,
            'servings': getattr(recipe, 'servings', 4),  # Default to 4 if not set yet
            'difficulty': recipe.difficulty,
            'category_name': recipe.category.name if recipe.category else '',
            'category_slug': recipe.category.slug if recipe.category else '',
            'diet_tags': recipe.diet_tags,
            'source_type': recipe.source_type,
        }
        
        # Check if recipe already exists in Supabase
        existing = client.table('recipes').select('id').eq('django_id', recipe.id).execute()
        
        if existing.data:
            # Update existing record
            result = client.table('recipes').update(recipe_data).eq('django_id', recipe.id).execute()
            logger.info(f"Updated recipe {recipe.id} in Supabase")
        else:
            # Insert new record
            result = client.table('recipes').insert(recipe_data).execute()
            logger.info(f"Inserted recipe {recipe.id} into Supabase")
        
        return result.data[0] if result.data else None
        
    except Exception as e:
        logger.error(f"Failed to sync recipe {recipe.id} to Supabase: {str(e)}")
        return None


def get_recipes_from_supabase(filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Fetch recipes from Supabase with optional filters
    
    Args:
        filters: Dict of filter conditions (e.g., {'difficulty': 'easy'})
    
    Returns:
        List of recipe dictionaries
    """
    client = get_supabase_client()
    if not client:
        return []
    
    try:
        query = client.table('recipes').select('*')
        
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)
        
        result = query.execute()
        return result.data or []
        
    except Exception as e:
        logger.error(f"Failed to fetch recipes from Supabase: {str(e)}")
        return []


def delete_recipe_from_supabase(recipe_id: int) -> bool:
    """
    Delete a recipe from Supabase by django_id
    
    Args:
        recipe_id: Django recipe ID
    
    Returns:
        True if successful, False otherwise
    """
    client = get_supabase_client()
    if not client:
        return False
    
    try:
        client.table('recipes').delete().eq('django_id', recipe_id).execute()
        logger.info(f"Deleted recipe {recipe_id} from Supabase")
        return True
        
    except Exception as e:
        logger.error(f"Failed to delete recipe {recipe_id} from Supabase: {str(e)}")
        return False


def bulk_sync_recipes_to_supabase(recipes) -> Dict[str, int]:
    """
    Bulk sync multiple recipes to Supabase
    
    Args:
        recipes: QuerySet or list of Recipe instances
    
    Returns:
        Dict with sync statistics {'success': n, 'failed': n}
    """
    stats = {'success': 0, 'failed': 0}
    
    for recipe in recipes:
        result = sync_recipe_to_supabase(recipe)
        if result:
            stats['success'] += 1
        else:
            stats['failed'] += 1
    
    return stats
