from django.db import models
from users.models import User
from django.core.validators import MinValueValidator

class FarmerProfile(models.Model):
    """Profile for farmers listing produce"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmer_profile')
    farm_name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    bio = models.TextField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.farm_name

class FarmProduct(models.Model):
    """Produce/Ingredients listed by farmers"""
    class Category(models.TextChoices):
        VEGETABLE = 'vegetable', 'Vegetable'
        FRUIT = 'fruit', 'Fruit'
        SPICE = 'spice', 'Spice'
        MEAT = 'meat', 'Meat'
        DAIRY = 'dairy', 'Dairy'
        GRAIN = 'grain', 'Grain'
        OTHER = 'other', 'Other'

    class Unit(models.TextChoices):
        KILOGRAM = 'kg', 'Kilogram'
        GRAM = 'g', 'Gram'
        BUNCH = 'bunch', 'Bunch'
        PIECE = 'piece', 'Piece'
        LITER = 'liter', 'Liter'
        BOX = 'box', 'Box'

    farmer = models.ForeignKey(FarmerProfile, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=Category.choices)
    description = models.TextField(blank=True)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=10, choices=Unit.choices)
    quantity_available = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.URLField(blank=True, null=True)  # Cloudinary URL
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.farmer.farm_name})"
