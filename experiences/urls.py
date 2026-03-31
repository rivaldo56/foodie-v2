from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"menus", views.MenuViewSet, basename="menu")
router.register(r"meals", views.MealViewSet, basename="meal")
router.register(r"", views.ExperienceViewSet, basename="experience")

urlpatterns = [
    path("feed/discovery/", views.DiscoveryView.as_view(), name="discovery-feed"),
    path("", include(router.urls)),
    # Deprecated / Legacy paths
    path(
        "legacy/menus/", views.ExperienceMenusView.as_view(), name="legacy-global-menus"
    ),
    path(
        "legacy/<uuid:experience_id>/menus/",
        views.ExperienceMenusView.as_view(),
        name="legacy-experience-menus",
    ),
]
