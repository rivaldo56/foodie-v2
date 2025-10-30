from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    # Chat rooms
    path('rooms/', views.ChatRoomListView.as_view(), name='chat-rooms'),
    path('rooms/create/', views.ChatRoomCreateView.as_view(), name='create-chat-room'),
    path('rooms/<int:pk>/', views.ChatRoomDetailView.as_view(), name='chat-room-detail'),
    
    # Messages
    path('rooms/<int:room_id>/messages/', views.MessageListView.as_view(), name='messages'),
    path('messages/create/', views.MessageCreateView.as_view(), name='create-message'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message-detail'),
    path('messages/<int:pk>/edit/', views.MessageUpdateView.as_view(), name='edit-message'),
    path('messages/<int:pk>/delete/', views.MessageDeleteView.as_view(), name='delete-message'),
    path('messages/<int:pk>/read/', views.MessageMarkReadView.as_view(), name='mark-message-read'),
    
    # Bulk operations
    path('rooms/<int:room_id>/mark-all-read/', views.MarkAllMessagesReadView.as_view(), name='mark-all-read'),
]
