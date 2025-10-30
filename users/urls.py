from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.logout_view, name='logout'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('client-profile/', views.ClientProfileView.as_view(), name='client-profile'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change-password'),
    
    # Dashboard
    path('dashboard/', views.user_dashboard, name='dashboard'),
]
