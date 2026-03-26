from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, 
    DashboardStatsView, 
    ChefViewSet, 
    ChefOnboardingViewSet,
    BookingViewSet,
    PaymentViewSet,
    MenuItemViewSet,
    PayoutViewSet,
    SettingsView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='admin-users')
router.register(r'chefs', ChefViewSet, basename='admin-chefs')
router.register(r'chef-onboarding', ChefOnboardingViewSet, basename='admin-chef-onboarding')
router.register(r'bookings', BookingViewSet, basename='admin-bookings')
router.register(r'payments', PaymentViewSet, basename='admin-payments')
router.register(r'menu-items', MenuItemViewSet, basename='admin-menu-items')
router.register(r'payouts', PayoutViewSet, basename='admin-payouts')

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='admin-stats'),
    path('settings/', SettingsView.as_view(), name='admin-settings'),
    path('', include(router.urls)),
]
