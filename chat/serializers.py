from rest_framework import serializers
from .models import ChatRoom, Message, MessageReadStatus
from users.serializers import UserSerializer
from bookings.serializers import BookingSerializer


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for chat messages"""
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id', 'chat_room', 'sender', 'message_type', 'content',
            'file_attachment', 'image_attachment', 'is_read', 'is_edited',
            'is_deleted', 'created_at', 'updated_at', 'read_at'
        ]
        read_only_fields = [
            'id', 'sender', 'is_read', 'is_edited', 'is_deleted',
            'created_at', 'updated_at', 'read_at'
        ]
    
    def validate(self, attrs):
        message_type = attrs.get('message_type', 'text')
        
        if message_type == 'text' and not attrs.get('content'):
            raise serializers.ValidationError("Text messages must have content")
        
        if message_type == 'image' and not attrs.get('image_attachment'):
            raise serializers.ValidationError("Image messages must have an image attachment")
        
        if message_type == 'file' and not attrs.get('file_attachment'):
            raise serializers.ValidationError("File messages must have a file attachment")
        
        return attrs


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    
    class Meta:
        model = Message
        fields = [
            'chat_room', 'message_type', 'content', 'file_attachment', 'image_attachment'
        ]
    
    def validate_chat_room(self, value):
        user = self.context['request'].user
        if user not in [value.client, value.chef]:
            raise serializers.ValidationError("You are not a participant in this chat room")
        return value
    
    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class ChatRoomSerializer(serializers.ModelSerializer):
    """Serializer for chat rooms"""
    client = UserSerializer(read_only=True)
    chef = UserSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    last_message = MessageSerializer(read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatRoom
        fields = [
            'id', 'booking', 'client', 'chef', 'is_active',
            'last_message', 'unread_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(
            sender__ne=user,
            is_read=False,
            is_deleted=False
        ).count()


class MessageReadStatusSerializer(serializers.ModelSerializer):
    """Serializer for message read status"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = MessageReadStatus
        fields = ['id', 'message', 'user', 'read_at']
        read_only_fields = ['id', 'user', 'read_at']


class MessageUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating messages (editing)"""
    
    class Meta:
        model = Message
        fields = ['content']
    
    def validate(self, attrs):
        message = self.instance
        user = self.context['request'].user
        
        if message.sender != user:
            raise serializers.ValidationError("You can only edit your own messages")
        
        if message.message_type != 'text':
            raise serializers.ValidationError("Only text messages can be edited")
        
        if message.is_deleted:
            raise serializers.ValidationError("Cannot edit deleted messages")
        
        return attrs
    
    def update(self, instance, validated_data):
        instance.is_edited = True
        return super().update(instance, validated_data)


class ChatRoomCreateSerializer(serializers.Serializer):
    """Serializer for creating chat rooms"""
    booking_id = serializers.IntegerField()
    
    def validate_booking_id(self, value):
        from bookings.models import Booking
        try:
            booking = Booking.objects.get(id=value)
            user = self.context['request'].user
            
            if user != booking.client and user != booking.chef.user:
                raise serializers.ValidationError("You are not involved in this booking")
            
            # Check if chat room already exists
            if hasattr(booking, 'chat_room'):
                raise serializers.ValidationError("Chat room already exists for this booking")
            
            return value
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
    
    def create(self, validated_data):
        from bookings.models import Booking
        booking = Booking.objects.get(id=validated_data['booking_id'])
        
        chat_room = ChatRoom.objects.create(
            booking=booking,
            client=booking.client,
            chef=booking.chef.user
        )
        
        return chat_room
