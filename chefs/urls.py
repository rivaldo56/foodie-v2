from django.urls import path
from . import views

app_name = 'chefs'

urlpatterns = [
    # Chef profiles
    path('', views.ChefListView.as_view(), name='chef-list'),
    path('search/', views.ChefSearchView.as_view(), name='chef-search'),
    path('<int:pk>/', views.ChefDetailView.as_view(), name='chef-detail'),
    path('profile/', views.ChefProfileView.as_view(), name='chef-profile'),
    
    # Reviews
    path('<int:chef_id>/reviews/', views.ChefReviewListView.as_view(), name='chef-reviews'),
    path('reviews/create/', views.ChefReviewCreateView.as_view(), name='create-review'),
    path('reviews/<int:pk>/', views.ChefReviewDetailView.as_view(), name='review-detail'),
    
    # Certifications
    path('certifications/', views.ChefCertificationListView.as_view(), name='certifications'),
    path('certifications/create/', views.ChefCertificationCreateView.as_view(), name='create-certification'),
    path('certifications/<int:pk>/', views.ChefCertificationDetailView.as_view(), name='certification-detail'),
    
    # Menu items
    path('menu-items/', views.MenuItemListView.as_view(), name='menu-items'),
    path('menu-items/create/', views.MenuItemCreateView.as_view(), name='create-menu-item'),
    path('menu-items/<int:pk>/', views.MenuItemDetailView.as_view(), name='menu-item-detail'),
]
