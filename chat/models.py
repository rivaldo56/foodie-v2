from django.db import models
from django.utils.translation import gettext_lazy as _
from users.models import User
from bookings.models import Booking


class ChatRoom(models.Model):
    """
    Chat room for client-chef communication.
    Can be associated with a specific booking or be a general inquiry.
    """
    
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='chat_room', null=True, blank=True)
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_chat_rooms')
    chef = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chef_chat_rooms')
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['client', 'chef', 'booking']
        ordering = ['-updated_at']
        verbose_name = _('chat room')
        verbose_name_plural = _('chat rooms')
    
    def __init__(self, *args, **kwargs):
        # Support passing ChefProfile as chef (extract user)
        if 'chef' in kwargs and hasattr(kwargs['chef'], 'user'):
            kwargs['chef'] = kwargs['chef'].user
        super().__init__(*args, **kwargs)
    
    def __str__(self):
        booking_info = f"Booking #{self.booking.id}" if self.booking else "No Booking"
        return f"Chat: {self.client.full_name} & {self.chef.full_name} - {booking_info}"
    
    @property
    def last_message(self):
        return self.messages.first()


class Message(models.Model):
    """
    Individual messages in chat rooms.
    Supports text, images, files, and system messages.
    """
    
    class MessageType(models.TextChoices):
        TEXT = 'text', _('Text')
        IMAGE = 'image', _('Image')
        FILE = 'file', _('File')
        SYSTEM = 'system', _('System')
    
    chat_room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    
    message_type = models.CharField(
        max_length=10, 
        choices=MessageType.choices, 
        default=MessageType.TEXT
    )
    content = models.TextField(blank=True)  # Text content
    file_attachment = models.FileField(upload_to='chat_files/', blank=True, null=True)
    image_attachment = models.ImageField(upload_to='chat_images/', blank=True, null=True)
    
    # Message status
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('message')
        verbose_name_plural = _('messages')
    
    def __str__(self):
        return f"{self.sender.full_name}: {self.content[:50]}..." if self.content else f"{self.sender.full_name}: [{self.message_type}]"


class MessageReadStatus(models.Model):
    """
    Track read status of messages for each user.
    Useful for group chats or detailed read receipts.
    """
    
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_statuses')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    read_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['message', 'user']
        verbose_name = _('message read status')
        verbose_name_plural = _('message read statuses')
    
    def __str__(self):
        return f"{self.user.full_name} read message at {self.read_at}"
