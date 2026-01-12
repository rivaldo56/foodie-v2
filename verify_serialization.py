import os
import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chefconnect.settings')
django.setup()

from recipes.models import Recipe
from recipes.serializers import RecipeSerializer
from rest_framework.test import APIRequestFactory

def verify_serialization():
    recipes = Recipe.objects.all()
    print(f"Found {recipes.count()} recipes")
    
    factory = APIRequestFactory()
    request = factory.get('/')
    from django.contrib.auth.models import AnonymousUser
    request.user = AnonymousUser()
    
    context = {'request': request}
    
    for recipe in recipes:
        print(f"\nSerializing Recipe ID: {recipe.id}")
        try:
            serializer = RecipeSerializer(recipe, context=context)
            data = serializer.data
            print("  Title:", data.get('title'))
            print("  Category:", data.get('category'))
            print("  Image:", data.get('image'))
            print("  Steps Type:", type(data.get('steps')))
            print("  Ingredients Type:", type(data.get('ingredients')))
        except Exception as e:
            print(f"  Serialization Error: {e}")
            import traceback
            traceback.print_exc()

verify_serialization()
