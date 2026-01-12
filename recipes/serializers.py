from rest_framework import serializers
from .models import Category, Recipe, SavedRecipe, RecipeRequest

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class RecipeSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    is_saved = serializers.SerializerMethodField()
    is_requested = serializers.SerializerMethodField()
    image = serializers.ImageField(read_only=True) # Cloudinary field serialize as URL string usually

    class Meta:
        model = Recipe
        fields = [
            'id', 'title', 'description', 'image', 'ingredients', 'steps',
            'prep_time', 'servings', 'difficulty', 'category', 'category_id', 'diet_tags',
            'source_type', 'created_at', 'updated_at', 'is_saved', 'is_requested'
        ]

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedRecipe.objects.filter(user=request.user, recipe=obj).exists()
        return False
    
    def get_is_requested(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
             return RecipeRequest.objects.filter(user=request.user, recipe=obj).values_list('action', flat=True)
        return []

class SavedRecipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedRecipe
        fields = ['id', 'user', 'recipe', 'timestamp']
        read_only_fields = ['user', 'timestamp']

class RecipeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecipeRequest
        fields = ['id', 'user', 'recipe', 'action', 'timestamp']
        read_only_fields = ['user', 'timestamp']
