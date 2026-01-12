"""
Recipe Fetcher - Integrates with Spoonacular API to fetch recipe data
"""
import os
import requests
import time
import logging
from typing import List, Dict, Optional, Any
from django.conf import settings

logger = logging.getLogger(__name__)


class RecipeFetcher:
    """Fetches recipes from Spoonacular API with rate limiting and error handling"""
    
    BASE_URL = "https://api.spoonacular.com/recipes"
    
    # Category to search query mapping
    CATEGORY_QUERIES = {
        "Quick Breakfast": {
            "query": "breakfast",
            "type": "breakfast",
            "maxReadyTime": 30,
            "tags": ["quick", "easy", "morning"]
        },
        "Midnight Munchies": {
            "query": "snack",
            "type": "snack",
            "tags": ["quick", "comfort", "late-night"]
        },
        "Quick meals for busy people": {
            "query": "quick easy meal",
            "type": "main course",
            "maxReadyTime": 30,
            "tags": ["quick", "easy", "weeknight"]
        },
        "Fitness / diet-based meals": {
            "query": "healthy",
            "diet": "healthy",
            "tags": ["healthy", "low-calorie", "high-protein", "fitness"]
        },
        "Budget Friendly": {
            "query": "cheap budget",
            "tags": ["budget", "affordable", "economical"]
        },
        "African Fusion": {
            "query": "african cuisine",
            "cuisine": "african",
            "tags": ["african", "fusion", "ethnic"]
        },
        "Dessert": {
            "query": "dessert",
            "type": "dessert",
            "tags": ["sweet", "dessert", "treat"]
        },
        "Main Course": {
            "query": "dinner main course",
            "type": "main course",
            "tags": ["dinner", "main-dish", "entree"]
        }
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with API key from settings or parameter"""
        self.api_key = api_key or os.getenv('SPOONACULAR_API_KEY')
        if not self.api_key:
            raise ValueError("SPOONACULAR_API_KEY not found in environment variables")
        
        self.request_count = 0
        self.last_request_time = 0
        self.min_request_interval = 1.0  # Minimum 1 second between requests
    
    def _rate_limit(self):
        """Implement rate limiting to avoid hitting API limits"""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.min_request_interval:
            sleep_time = self.min_request_interval - time_since_last_request
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    def search_recipes(self, category: str, number: int = 30, offset: int = 0) -> List[Dict[str, Any]]:
        """
        Search for recipes by category
        
        Args:
            category: Category name from CATEGORY_QUERIES
            number: Number of recipes to fetch (max 100 per request)
            offset: Pagination offset
            
        Returns:
            List of recipe dictionaries
        """
        if category not in self.CATEGORY_QUERIES:
            raise ValueError(f"Unknown category: {category}")
        
        query_params = self.CATEGORY_QUERIES[category]
        
        params = {
            "apiKey": self.api_key,
            "query": query_params.get("query", ""),
            "number": min(number, 100),  # API max is 100
            "offset": offset,
            "addRecipeInformation": True,
            "fillIngredients": True,
            "instructionsRequired": True,
        }
        
        # Add optional filters
        if "type" in query_params:
            params["type"] = query_params["type"]
        if "maxReadyTime" in query_params:
            params["maxReadyTime"] = query_params["maxReadyTime"]
        if "diet" in query_params:
            params["diet"] = query_params["diet"]
        if "cuisine" in query_params:
            params["cuisine"] = query_params["cuisine"]
        
        self._rate_limit()
        
        try:
            logger.info(f"Fetching recipes for category '{category}' (offset: {offset})")
            response = requests.get(
                f"{self.BASE_URL}/complexSearch",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            recipes = data.get("results", [])
            logger.info(f"Found {len(recipes)} recipes for '{category}'")
            
            return recipes
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching recipes for '{category}': {str(e)}")
            return []
    
    def get_recipe_details(self, recipe_id: int) -> Optional[Dict[str, Any]]:
        """
        Get detailed information for a specific recipe
        
        Args:
            recipe_id: Spoonacular recipe ID
            
        Returns:
            Recipe details dictionary or None if failed
        """
        params = {
            "apiKey": self.api_key,
            "includeNutrition": True
        }
        
        self._rate_limit()
        
        try:
            logger.debug(f"Fetching details for recipe ID {recipe_id}")
            response = requests.get(
                f"{self.BASE_URL}/{recipe_id}/information",
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            return response.json()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching recipe {recipe_id} details: {str(e)}")
            return None
    
    def transform_to_chefconnect_format(self, spoonacular_recipe: Dict[str, Any], category_name: str) -> Dict[str, Any]:
        """
        Transform Spoonacular recipe format to ChefConnect format
        
        Args:
            spoonacular_recipe: Recipe data from Spoonacular API
            category_name: Target category name
            
        Returns:
            Dictionary ready for ChefConnect Recipe model
        """
        # Extract ingredients
        ingredients = []
        for ingredient in spoonacular_recipe.get("extendedIngredients", []):
            ingredients.append({
                "name": ingredient.get("name", ""),
                "amount": ingredient.get("amount", 0),
                "unit": ingredient.get("unit", ""),
                "original": ingredient.get("original", "")
            })
        
        # Extract steps
        steps = []
        analyzed_instructions = spoonacular_recipe.get("analyzedInstructions", [])
        if analyzed_instructions:
            for instruction_set in analyzed_instructions:
                for step in instruction_set.get("steps", []):
                    steps.append({
                        "number": step.get("number", 0),
                        "step": step.get("step", "")
                    })
        else:
            # Fallback to instructions string if analyzedInstructions not available
            instructions = spoonacular_recipe.get("instructions", "")
            if instructions:
                # Split by periods or newlines
                step_texts = [s.strip() for s in instructions.split('.') if s.strip()]
                steps = [{"number": i+1, "step": text} for i, text in enumerate(step_texts)]
        
        # Determine difficulty based on ready time and steps
        ready_time = spoonacular_recipe.get("readyInMinutes", 30)
        num_steps = len(steps)
        
        if ready_time <= 20 and num_steps <= 5:
            difficulty = "easy"
        elif ready_time <= 45 and num_steps <= 10:
            difficulty = "medium"
        else:
            difficulty = "hard"
        
        # Extract diet tags
        diet_tags = []
        if spoonacular_recipe.get("vegetarian"):
            diet_tags.append("vegetarian")
        if spoonacular_recipe.get("vegan"):
            diet_tags.append("vegan")
        if spoonacular_recipe.get("glutenFree"):
            diet_tags.append("gluten-free")
        if spoonacular_recipe.get("dairyFree"):
            diet_tags.append("dairy-free")
        if spoonacular_recipe.get("veryHealthy"):
            diet_tags.append("healthy")
        if spoonacular_recipe.get("cheap"):
            diet_tags.append("budget-friendly")
        
        # Add category-specific tags
        category_tags = self.CATEGORY_QUERIES.get(category_name, {}).get("tags", [])
        diet_tags.extend(category_tags)
        diet_tags = list(set(diet_tags))  # Remove duplicates
        
        # Get calories (from nutrition if available)
        calories = None
        nutrition = spoonacular_recipe.get("nutrition", {})
        if nutrition:
            nutrients = nutrition.get("nutrients", [])
            for nutrient in nutrients:
                if nutrient.get("name") == "Calories":
                    calories = int(nutrient.get("amount", 0))
                    break
        
        return {
            "title": spoonacular_recipe.get("title", "Untitled Recipe"),
            "description": spoonacular_recipe.get("summary", "")[:500],  # Limit length
            "image_url": spoonacular_recipe.get("image", ""),
            "ingredients": ingredients,
            "steps": steps,
            "prep_time": ready_time,
            "servings": spoonacular_recipe.get("servings", 4),
            "difficulty": difficulty,
            "diet_tags": diet_tags,
            "calories": calories,
            "source_type": "house",
            "category_name": category_name,
            "spoonacular_id": spoonacular_recipe.get("id")
        }
    
    def fetch_recipes_for_category(self, category: str, target_count: int = 30) -> List[Dict[str, Any]]:
        """
        Fetch and transform recipes for a specific category
        
        Args:
            category: Category name
            target_count: Target number of recipes to fetch
            
        Returns:
            List of transformed recipes ready for ChefConnect
        """
        recipes = []
        offset = 0
        batch_size = 50  # Fetch 50 at a time
        
        while len(recipes) < target_count:
            batch = self.search_recipes(category, number=batch_size, offset=offset)
            
            if not batch:
                logger.warning(f"No more recipes found for '{category}' at offset {offset}")
                break
            
            for recipe_data in batch:
                # Get detailed information if needed
                if not recipe_data.get("analyzedInstructions"):
                    detailed = self.get_recipe_details(recipe_data["id"])
                    if detailed:
                        recipe_data = detailed
                
                # Transform to ChefConnect format
                transformed = self.transform_to_chefconnect_format(recipe_data, category)
                
                # Basic validation
                if transformed["steps"] and transformed["ingredients"]:
                    recipes.append(transformed)
                    logger.info(f"✓ Fetched: {transformed['title']}")
                else:
                    logger.warning(f"✗ Skipped (incomplete): {transformed['title']}")
                
                if len(recipes) >= target_count:
                    break
            
            offset += batch_size
            
            # Safety check to avoid infinite loop
            if offset > 500:
                logger.warning(f"Reached maximum offset for '{category}'")
                break
        
        logger.info(f"Fetched {len(recipes)} recipes for '{category}'")
        return recipes[:target_count]
