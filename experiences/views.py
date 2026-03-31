import random
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Experience, Menu, Meal
from .serializers import (
    ExperienceListSerializer,
    ExperienceDetailSerializer,
    MenuSerializer,
    MealSerializer,
)


class ExperienceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Experience.
    List/Retrieve are public, Create/Update/Delete are admin-only.
    """

    queryset = Experience.objects.all().order_by("display_order", "name")
    lookup_field = "id"

    def get_serializer_class(self):
        if self.action == "list":
            return ExperienceListSerializer
        return ExperienceDetailSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "menus"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve", "menus"] and not (
            self.request.user and self.request.user.is_staff
        ):
            return queryset.filter(status="published")
        return queryset

    @action(detail=True, methods=["get"])
    def menus(self, request, id=None):
        experience = self.get_object()
        menus = experience.marketplace_menus.filter(status="active")
        serializer = MenuSerializer(menus, many=True, context={"request": request})
        return Response(serializer.data)


class MenuViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Menu.
    List/Retrieve are public (only active), Create/Update/Delete are admin-only.
    """

    queryset = Menu.objects.all().order_by("base_price")
    serializer_class = MenuSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action in ["list", "retrieve"] and not self.request.user.is_staff:
            return queryset.filter(status="active")
        return queryset


class MealViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Meal.
    Admin-only for most actions, public read-only.
    """

    queryset = Meal.objects.all().order_by("name")
    serializer_class = MealSerializer
    lookup_field = "id"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]


class ExperienceMenusView(APIView):
    """
    DEPRECATED: Legacy endpoint for V4 marketplace.
    New frontend should use MenuViewSet with experience_id filter.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request, experience_id=None):
        from bookings.models import ChefMenu
        from bookings.serializers import AnonymousChefMenuSerializer

        queryset = ChefMenu.objects.filter(is_approved=True, is_active=True)

        if experience_id:
            queryset = queryset.filter(experience_id=experience_id)

        menus = queryset.order_by("?")
        serializer = AnonymousChefMenuSerializer(
            menus, many=True, context={"request": request}
        )
        return Response(serializer.data)


class DiscoveryView(APIView):
    """
    Unified discovery feed for the home page.
    Combines Experiences, Menus, and Meals into a single shuffled list.
    """

    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Fetch featured/active items
        experiences = Experience.objects.filter(status="published").order_by("?")[:6]
        menus = Menu.objects.filter(status="active").order_by("?")[:6]
        meals = Meal.objects.all().order_by("?")[:10]

        # Serialize using appropriate serializers
        exp_data = ExperienceListSerializer(
            experiences, many=True, context={"request": request}
        ).data
        menu_data = MenuSerializer(menus, many=True, context={"request": request}).data
        meal_data = MealSerializer(meals, many=True, context={"request": request}).data

        # Add item_type markers for the frontend
        for item in exp_data:
            item["item_type"] = "experience"
        for item in menu_data:
            item["item_type"] = "menu"
        for item in meal_data:
            item["item_type"] = "meal"

        # Combine and shuffle
        combined = exp_data + menu_data + meal_data
        random.shuffle(combined)

        return Response(combined[:20])  # Limit to 20 for performance
