import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


class Experience(models.Model):
    """
    Top-level marketplace category (e.g., Private Dinner, Birthday Party).
    Clients browse experiences before seeing menus.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default="published")

    # Keep some of the existing fields if useful for the frontend/tasks
    short_description = models.CharField(
        max_length=120, blank=True, help_text="Short tagline shown on cards"
    )
    icon_emoji = models.CharField(max_length=10, blank=True, default="🍽️")
    price_display = models.CharField(
        max_length=80, blank=True
    )  # "From KES 2,500/person"
    guest_display = models.CharField(max_length=60, blank=True)  # "For 2+ guests"
    available_chef_count = models.PositiveIntegerField(default=0)
    display_order = models.PositiveIntegerField(
        default=0, help_text="Lower = shown first"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "name"]
        verbose_name = _("experience")
        verbose_name_plural = _("experiences")

    def __str__(self):
        return self.name


class Meal(models.Model):
    """
    Individual food items that make up a menu.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    kcal = models.IntegerField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    cuisine_type = models.CharField(max_length=100, blank=True, null=True)
    dietary_tags = models.JSONField(default=list, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    total_bookings = models.PositiveIntegerField(default=0)
    average_rating = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Menu(models.Model):
    """
    A collection of meals offered as a package for an experience.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    experience = models.ForeignKey(
        Experience, on_delete=models.CASCADE, related_name="marketplace_menus"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price_per_person = models.DecimalField(max_digits=10, decimal_places=2)
    guest_min = models.PositiveIntegerField(default=1)
    guest_max = models.PositiveIntegerField(null=True, blank=True)
    dietary_tags = models.JSONField(default=list, blank=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    base_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    featured = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default="active")
    meals = models.ManyToManyField(Meal, through="MenuMeal", related_name="menus")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.experience.name} - {self.name}"


class MenuMeal(models.Model):
    """
    Junction table for Menu and Meal with additional ordering and course info.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE)
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
    course_type = models.CharField(
        max_length=50, blank=True, null=True
    )  # starter, main, dessert, etc.
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order_index"]
        unique_together = ("menu", "meal", "order_index")
