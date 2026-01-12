from django.contrib import admin
from .models import Category, Recipe, SavedRecipe, RecipeRequest

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'prep_time', 'servings', 'difficulty', 'source_type', 'supabase_id', 'created_at')
    list_filter = ('category', 'difficulty', 'source_type')
    search_fields = ('title', 'description')
    readonly_fields = ('supabase_id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'source_type')
        }),
        ('Recipe Details', {
            'fields': ('image', 'ingredients', 'steps', 'prep_time', 'servings', 'difficulty', 'diet_tags')
        }),
        ('Metadata', {
            'fields': ('supabase_id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['sync_to_supabase']
    
    def sync_to_supabase(self, request, queryset):
        """Admin action to manually sync selected recipes to Supabase"""
        from utils.supabase_client import bulk_sync_recipes_to_supabase
        stats = bulk_sync_recipes_to_supabase(queryset)
        self.message_user(
            request,
            f"Synced {stats['success']} recipes successfully. {stats['failed']} failed."
        )
    sync_to_supabase.short_description = "Sync selected recipes to Supabase"

@admin.register(SavedRecipe)
class SavedRecipeAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'timestamp')
    list_filter = ('timestamp',)

@admin.register(RecipeRequest)
class RecipeRequestAdmin(admin.ModelAdmin):
    list_display = ('user', 'recipe', 'action', 'timestamp')
    list_filter = ('action', 'timestamp')
