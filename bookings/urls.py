from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from experiences.views import MealViewSet

app_name = "bookings"

router = DefaultRouter()
router.register(r"assignments", views.BookingAssignmentViewSet, basename="assignment")

urlpatterns = [
    path("api/", include(router.urls)),
    # Bookings
    path("", views.BookingListView.as_view(), name="booking-list"),
    path("create/", views.BookingCreateView.as_view(), name="create-booking"),
    path("<int:pk>/", views.BookingDetailView.as_view(), name="booking-detail"),
    path("<int:pk>/update/", views.BookingUpdateView.as_view(), name="update-booking"),
    path(
        "<int:pk>/status/",
        views.BookingStatusUpdateView.as_view(),
        name="update-booking-status",
    ),
    path("<int:pk>/cancel/", views.BookingCancelView.as_view(), name="cancel-booking"),
    path(
        "<int:pk>/confirm-satisfaction/",
        views.BookingConfirmSatisfactionView.as_view(),
        name="confirm-satisfaction",
    ),
    # Menu items
    path(
        "menu-items/discovery/",
        MealViewSet.as_view({"get": "list"}),
        name="menu-items-discovery",
    ),
    path("menu-items/", views.MyMenuItemListView.as_view(), name="menu-items"),
    path(
        "menu-items/create/",
        views.MenuItemCreateView.as_view(),
        name="create-menu-item",
    ),
    path(
        "menu-items/<int:pk>/",
        views.MenuItemDetailView.as_view(),
        name="menu-item-detail",
    ),
    path(
        "menu-items/<int:pk>/update/",
        views.MenuItemUpdateView.as_view(),
        name="update-menu-item",
    ),
    path(
        "menu-items/<int:pk>/delete/",
        views.MenuItemDeleteView.as_view(),
        name="delete-menu-item",
    ),
    path(
        "chef/<int:chef_id>/menu-items/",
        views.ChefMenuItemsView.as_view(),
        name="chef-menu-items",
    ),
    # Booking menu items
    path(
        "<int:booking_id>/menu-items/",
        views.BookingMenuItemListView.as_view(),
        name="booking-menu-items",
    ),
    path(
        "<int:booking_id>/menu-items/add/",
        views.BookingMenuItemCreateView.as_view(),
        name="add-booking-menu-item",
    ),
    path(
        "menu-items/<int:pk>/remove/",
        views.BookingMenuItemDeleteView.as_view(),
        name="remove-booking-menu-item",
    ),
]
