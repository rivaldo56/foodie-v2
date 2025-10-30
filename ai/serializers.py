from rest_framework import serializers
from .models import AIRecommendation, ChatSession, ChatMessage, UserPreferenceLearning, AIAnalytics
from users.serializers import UserSerializer
from chefs.serializers import ChefProfileSerializer
from bookings.serializers import BookingSerializer


class AIRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for AI recommendations"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = AIRecommendation
        fields = [
            'id', 'user', 'recommendation_type', 'user_preferences',
            'dietary_restrictions', 'budget_range', 'occasion', 'location',
            'recommendations', 'confidence_score', 'reasoning', 'is_accepted',
            'feedback_rating', 'feedback_comment', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'recommendations', 'confidence_score', 'reasoning',
            'created_at', 'updated_at'
        ]


class AIRecommendationRequestSerializer(serializers.Serializer):
    """Serializer for requesting AI recommendations"""
    recommendation_type = serializers.ChoiceField(choices=AIRecommendation.RECOMMENDATION_TYPE_CHOICES)
    user_preferences = serializers.DictField(required=False, default=dict)
    dietary_restrictions = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    budget_range = serializers.DictField(required=False, default=dict)
    occasion = serializers.CharField(required=False, allow_blank=True)
    location = serializers.DictField(required=False, default=dict)
    
    def validate_budget_range(self, value):
        if value:
            if 'min' in value and 'max' in value:
                if value['min'] < 0 or value['max'] < 0:
                    raise serializers.ValidationError("Budget values must be positive")
                if value['min'] > value['max']:
                    raise serializers.ValidationError("Minimum budget cannot be greater than maximum")
        return value


class ChatSessionSerializer(serializers.ModelSerializer):
    """Serializer for AI chat sessions"""
    user = UserSerializer(read_only=True)
    booking_context = BookingSerializer(read_only=True)
    chef_context = ChefProfileSerializer(read_only=True)
    message_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChatSession
        fields = [
            'id', 'user', 'session_name', 'session_type', 'title', 'context_data',
            'booking_context', 'chef_context', 'is_active', 'message_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
    
    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AI chat sessions"""
    booking_context_id = serializers.IntegerField(required=False, allow_null=True)
    chef_context_id = serializers.IntegerField(required=False, allow_null=True)
    
    class Meta:
        model = ChatSession
        fields = [
            'session_name', 'session_type', 'title', 'context_data', 'booking_context_id', 'chef_context_id'
        ]
    
    def validate_booking_context_id(self, value):
        if value:
            from bookings.models import Booking
            try:
                booking = Booking.objects.get(id=value)
                user = self.context['request'].user
                if booking.client != user and booking.chef.user != user:
                    raise serializers.ValidationError("You don't have access to this booking")
                return value
            except Booking.DoesNotExist:
                raise serializers.ValidationError("Booking not found")
        return value
    
    def validate_chef_context_id(self, value):
        if value:
            from chefs.models import ChefProfile
            try:
                ChefProfile.objects.get(id=value)
                return value
            except ChefProfile.DoesNotExist:
                raise serializers.ValidationError("Chef not found")
        return value
    
    def create(self, validated_data):
        booking_context_id = validated_data.pop('booking_context_id', None)
        chef_context_id = validated_data.pop('chef_context_id', None)
        
        session = ChatSession.objects.create(**validated_data)
        
        if booking_context_id:
            from bookings.models import Booking
            session.booking_context = Booking.objects.get(id=booking_context_id)
        
        if chef_context_id:
            from chefs.models import ChefProfile
            session.chef_context = ChefProfile.objects.get(id=chef_context_id)
        
        session.save()
        return session


class ChatMessageSerializer(serializers.ModelSerializer):
    """Serializer for AI chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'session', 'sender', 'content', 'ai_model_version',
            'token_count', 'processing_time', 'message_metadata',
            'attachments', 'created_at'
        ]
        read_only_fields = [
            'id', 'ai_model_version', 'token_count', 'processing_time',
            'message_metadata', 'created_at'
        ]


class ChatMessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating AI chat messages"""
    
    class Meta:
        model = ChatMessage
        fields = ['session', 'content', 'attachments']
    
    def validate_session(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("You can only send messages to your own chat sessions")
        if not value.is_active:
            raise serializers.ValidationError("Chat session is not active")
        return value
    
    def create(self, validated_data):
        validated_data['sender'] = 'user'
        return super().create(validated_data)


class ChatMessageAPISerializer(serializers.Serializer):
    """API serializer for chat messages that accepts message/message_type and triggers AI"""
    session = serializers.PrimaryKeyRelatedField(queryset=ChatSession.objects.all())
    message = serializers.CharField()
    message_type = serializers.ChoiceField(choices=['user', 'ai', 'system'], default='user')
    
    def validate_session(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("You can only send messages to your own chat sessions")
        if not value.is_active:
            raise serializers.ValidationError("Chat session is not active")
        return value
    
    def create(self, validated_data):
        from .services import GeminiAIService
        
        session = validated_data['session']
        message_content = validated_data['message']
        message_type = validated_data.get('message_type', 'user')
        
        # Create user message
        user_message = ChatMessage.objects.create(
            session=session,
            sender=message_type,
            content=message_content
        )
        
        # If it's a user message, get AI response
        if message_type == 'user':
            ai_service = GeminiAIService()
            result = ai_service.chat_with_ai(
                message=message_content,
                context=f"Session: {session.session_name or session.id}"
            )
            
            if result.get('success'):
                ChatMessage.objects.create(
                    session=session,
                    sender='ai',
                    content=result.get('response', 'I apologize, but I could not generate a response.'),
                    ai_model_version='gemini-pro'
                )
        
        return user_message


class UserPreferenceLearningSerializer(serializers.ModelSerializer):
    """Serializer for user preference learning"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserPreferenceLearning
        fields = [
            'id', 'user', 'preferred_cuisines', 'dietary_patterns',
            'price_sensitivity', 'booking_patterns', 'chef_preferences',
            'interaction_count', 'last_learning_update', 'confidence_level',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'interaction_count', 'last_learning_update',
            'confidence_level', 'created_at', 'updated_at'
        ]


class AIAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for AI analytics"""
    user = UserSerializer(read_only=True)
    session = ChatSessionSerializer(read_only=True)
    
    class Meta:
        model = AIAnalytics
        fields = [
            'id', 'metric_type', 'metric_value', 'metric_data',
            'user', 'session', 'recorded_at'
        ]
        read_only_fields = ['id', 'recorded_at']


class AIFeedbackSerializer(serializers.Serializer):
    """Serializer for AI feedback"""
    recommendation_id = serializers.IntegerField()
    is_accepted = serializers.BooleanField()
    feedback_rating = serializers.IntegerField(min_value=1, max_value=5, required=False)
    feedback_comment = serializers.CharField(required=False, allow_blank=True)
    
    def validate_recommendation_id(self, value):
        try:
            recommendation = AIRecommendation.objects.get(id=value)
            user = self.context['request'].user
            if recommendation.user != user:
                raise serializers.ValidationError("You can only provide feedback on your own recommendations")
            return value
        except AIRecommendation.DoesNotExist:
            raise serializers.ValidationError("Recommendation not found")


class MenuRecommendationSerializer(serializers.Serializer):
    """Serializer for menu recommendation requests"""
    dietary_restrictions = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    cuisine_preferences = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    budget_per_person = serializers.DecimalField(max_digits=8, decimal_places=2, required=False)
    number_of_guests = serializers.IntegerField(min_value=1, required=False, default=1)
    occasion = serializers.CharField(required=False, allow_blank=True)
    chef_id = serializers.IntegerField(required=False)
    
    def validate_chef_id(self, value):
        if value:
            from chefs.models import ChefProfile
            try:
                ChefProfile.objects.get(id=value)
                return value
            except ChefProfile.DoesNotExist:
                raise serializers.ValidationError("Chef not found")
        return value


class ChefRecommendationSerializer(serializers.Serializer):
    """Serializer for chef recommendation requests"""
    location = serializers.DictField(required=False, default=dict)
    cuisine_preferences = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    budget_range = serializers.DictField(required=False, default=dict)
    experience_level = serializers.ChoiceField(
        choices=[('any', 'Any')] + list(ChefProfileSerializer.Meta.model.EXPERIENCE_CHOICES),
        required=False,
        default='any'
    )
    service_date = serializers.DateTimeField(required=False)
    number_of_guests = serializers.IntegerField(min_value=1, required=False, default=1)
    
    def validate_budget_range(self, value):
        if value:
            if 'min' in value and 'max' in value:
                if value['min'] < 0 or value['max'] < 0:
                    raise serializers.ValidationError("Budget values must be positive")
                if value['min'] > value['max']:
                    raise serializers.ValidationError("Minimum budget cannot be greater than maximum")
        return value
