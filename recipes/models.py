from django.db import models
from django.conf import settings
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from cloudinary.models import CloudinaryField
import logging

logger = logging.getLogger(__name__)

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Recipe(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]
    SOURCE_TYPE_CHOICES = [
        ('house', 'House'),
        ('chef', 'Chef'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    image = CloudinaryField('image')
    ingredients = models.JSONField(help_text="List of ingredients")
    steps = models.JSONField(help_text="List of cooking steps")
    prep_time = models.PositiveIntegerField(help_text="Preparation time in minutes")
    servings = models.PositiveIntegerField(default=4, help_text="Number of servings")
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='recipes')
    diet_tags = models.JSONField(default=list, blank=True, help_text="List of diet tags e.g. ['vegan', 'gluten-free']")
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES, default='house')
    
    # Supabase integration tracking
    supabase_id = models.UUIDField(null=True, blank=True, help_text="Supabase record ID")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class SavedRecipe(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='saved_recipes')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='saved_by')
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe')

    def __str__(self):
        return f"{self.user} saved {self.recipe}"

class RecipeRequest(models.Model):
    ACTION_CHOICES = [
        ('would_order', 'Would Order'),
        ('request_chef', 'Request Chef Version'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recipe_requests')
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='requests')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'recipe', 'action')

    def __str__(self):
        return f"{self.user} - {self.action} - {self.recipe}"


# Supabase sync signals
@receiver(post_save, sender=Recipe)
def sync_recipe_on_save(sender, instance, created, **kwargs):
    """
    Automatically sync recipe to Supabase when saved
    """
    try:
        from utils.supabase_client import sync_recipe_to_supabase
        result = sync_recipe_to_supabase(instance)
        if result and not instance.supabase_id:
            # Store Supabase UUID for future reference
            Recipe.objects.filter(pk=instance.pk).update(
                supabase_id=result.get('id')
            )
    except Exception as e:
        logger.error(f"Failed to sync recipe {instance.id} to Supabase: {str(e)}")


@receiver(post_delete, sender=Recipe)
def sync_recipe_on_delete(sender, instance, **kwargs):
    """
    Automatically delete recipe from Supabase when deleted
    """
    try:
        from utils.supabase_client import delete_recipe_from_supabase
        delete_recipe_from_supabase(instance.id)
    except Exception as e:
        logger.error(f"Failed to delete recipe {instance.id} from Supabase: {str(e)}")
