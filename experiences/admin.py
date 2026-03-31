from django.contrib import admin
from .models import Experience, Menu, Meal, MenuMeal


class MenuInline(admin.TabularInline):
    model = Menu
    extra = 0
    show_change_link = True


class MenuMealInline(admin.TabularInline):
    model = MenuMeal
    extra = 0


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "category",
        "status",
        "is_featured",
        "display_order",
    ]
    list_filter = ["status", "is_featured", "category"]
    prepopulated_fields = {"slug": ("name",)}
    ordering = ["display_order"]
    search_fields = ["name", "description"]
    inlines = [MenuInline]


@admin.register(Meal)
class MealAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price", "is_active"]
    list_filter = ["category", "is_active", "cuisine_type"]
    search_fields = ["name", "description"]


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ["name", "experience", "price_per_person", "status", "featured"]
    list_filter = ["status", "featured", "experience"]
    search_fields = ["name", "description"]
    inlines = [MenuMealInline]
