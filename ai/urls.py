from django.urls import path
from . import views

app_name = 'ai'

urlpatterns = [
    # AI Recommendations
    path('recommendations/', views.AIRecommendationListView.as_view(), name='recommendations'),
    path('recommendations/request/', views.RequestRecommendationView.as_view(), name='request-recommendation'),
    path('recommendations/<int:pk>/', views.AIRecommendationDetailView.as_view(), name='recommendation-detail'),
    path('recommendations/<int:pk>/feedback/', views.RecommendationFeedbackView.as_view(), name='recommendation-feedback'),
    
    # Specific recommendation types
    path('recommendations/chefs/', views.ChefRecommendationView.as_view(), name='chef-recommendations'),
    path('recommendations/menus/', views.MenuRecommendationView.as_view(), name='menu-recommendations'),
    
    # AI Chat
    path('chat/sessions/', views.ChatSessionListView.as_view(), name='chat-sessions'),
    path('chat/sessions/create/', views.ChatSessionCreateView.as_view(), name='create-chat-session'),
    path('chat/sessions/<int:pk>/', views.ChatSessionDetailView.as_view(), name='chat-session-detail'),
    path('chat/sessions/<int:session_id>/messages/', views.ChatMessageListView.as_view(), name='chat-messages'),
    path('chat/messages/create/', views.ChatMessageCreateView.as_view(), name='create-chat-message'),
    
    # User preferences
    path('preferences/', views.UserPreferenceLearningView.as_view(), name='user-preferences'),
    path('preferences/update/', views.UpdatePreferencesView.as_view(), name='update-preferences'),
    
    # Analytics (admin only)
    path('analytics/', views.AIAnalyticsView.as_view(), name='ai-analytics'),
]
