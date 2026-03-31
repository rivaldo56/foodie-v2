from rest_framework import serializers
from .models import Experience, Menu, Meal, MenuMeal


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if not (request and request.user and request.user.is_authenticated):
            representation["price"] = 0  # Mask price for anonymous users
        return representation


class MenuMealSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)

    class Meta:
        model = MenuMeal
        fields = ["id", "meal", "course_type", "order_index"]


class MenuSerializer(serializers.ModelSerializer):
    meals = MenuMealSerializer(source="menumeal_set", many=True, read_only=True)
    starters = serializers.SerializerMethodField()
    mains = serializers.SerializerMethodField()
    desserts = serializers.SerializerMethodField()

    class Meta:
        model = Menu
        fields = [
            "id",
            "experience",
            "name",
            "description",
            "price_per_person",
            "guest_min",
            "guest_max",
            "dietary_tags",
            "image_url",
            "base_price",
            "featured",
            "status",
            "meals",
            "starters",
            "mains",
            "desserts",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if not (request and request.user and request.user.is_authenticated):
            representation["price_per_person"] = 0
            representation["base_price"] = 0
        return representation

    def get_starters(self, obj):
        menu_meals = obj.menumeal_set.filter(course_type__icontains="starter").order_by("order_index")
        return MenuMealSerializer(menu_meals, many=True, context=self.context).data

    def get_mains(self, obj):
        menu_meals = obj.menumeal_set.filter(course_type__icontains="main").order_by("order_index")
        return MenuMealSerializer(menu_meals, many=True, context=self.context).data

    def get_desserts(self, obj):
        menu_meals = obj.menumeal_set.filter(course_type__icontains="dessert").order_by("order_index")
        return MenuMealSerializer(menu_meals, many=True, context=self.context).data


class ExperienceListSerializer(serializers.ModelSerializer):
    """Public read-only serializer for the home feed cards."""

    class Meta:
        model = Experience
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "image_url",
            "is_featured",
            "status",
            "short_description",
            "icon_emoji",
            "price_display",
            "guest_display",
            "available_chef_count",
            "display_order",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get("request")
        if not (request and request.user and request.user.is_authenticated):
            representation["price_display"] = ""  # Mask display price
        return representation


class ExperienceDetailSerializer(serializers.ModelSerializer):
    """Full detail — includes nested menus."""

    menus = MenuSerializer(source="marketplace_menus", many=True, read_only=True)

    class Meta:
        model = Experience
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
