from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MarketplaceViewSet, IngredientOrderViewSet

router = DefaultRouter()
router.register(r'browse', MarketplaceViewSet, basename='marketplace-browse')
router.register(r'orders', IngredientOrderViewSet, basename='ingredient-order')

urlpatterns = [
    path('', include(router.urls)),
]
