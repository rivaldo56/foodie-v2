from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FarmerProfileViewSet, FarmProductViewSet

router = DefaultRouter()
router.register(r'profiles', FarmerProfileViewSet, basename='farmer-profile')
router.register(r'products', FarmProductViewSet, basename='farm-product')

urlpatterns = [
    path('', include(router.urls)),
]
