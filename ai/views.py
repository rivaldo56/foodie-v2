from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import AIRecommendation, ChatSession, ChatMessage, UserPreferenceLearning
from .serializers import (
    AIRecommendationSerializer, ChatSessionSerializer, ChatMessageSerializer,
    ChatSessionCreateSerializer, ChatMessageCreateSerializer, ChatMessageAPISerializer
)


class AIRecommendationListView(generics.ListAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)


class RequestRecommendationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # TODO: Implement AI recommendation request
        return Response({'message': 'AI recommendation not implemented yet'})


class AIRecommendationDetailView(generics.RetrieveAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)


class RecommendationFeedbackView(generics.UpdateAPIView):
    serializer_class = AIRecommendationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AIRecommendation.objects.filter(user=self.request.user)


class ChefRecommendationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from .services import GeminiAIService
        
        ai_service = GeminiAIService()
        preferences = request.data.get('preferences', '')
        location = request.data.get('location', '')
        budget = request.data.get('budget', '')
        
        result = ai_service.get_chef_recommendations(
            user_preferences=preferences,
            location=location,
            budget=budget
        )
        
        if result.get('success'):
            return Response({
                'recommendations': result.get('recommendations', '')
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result.get('error', 'Failed to get recommendations')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MenuRecommendationView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from .services import GeminiAIService
        
        ai_service = GeminiAIService()
        dietary_restrictions = request.data.get('dietary_restrictions', '')
        cuisine_type = request.data.get('cuisine_type', '')
        occasion = request.data.get('occasion', '')
        
        result = ai_service.get_menu_suggestions(
            dietary_restrictions=dietary_restrictions,
            cuisine_type=cuisine_type,
            occasion=occasion
        )
        
        if result.get('success'):
            return Response({
                'suggestions': result.get('suggestions', '')
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': result.get('error', 'Failed to get menu suggestions')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChatSessionListView(generics.ListAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatSessionCreateView(generics.CreateAPIView):
    serializer_class = ChatSessionCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ChatSessionDetailView(generics.RetrieveAPIView):
    serializer_class = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)


class ChatMessageListView(generics.ListAPIView):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        session_id = self.kwargs['session_id']
        return ChatMessage.objects.filter(session_id=session_id)


class ChatMessageCreateView(generics.CreateAPIView):
    serializer_class = ChatMessageAPISerializer
    permission_classes = [permissions.IsAuthenticated]


class UserPreferenceLearningView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        obj, created = UserPreferenceLearning.objects.get_or_create(user=self.request.user)
        return obj


class UpdatePreferencesView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # TODO: Implement preference learning update
        return Response({'message': 'Preference update not implemented yet'})


class AIAnalyticsView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    
    def get(self, request, *args, **kwargs):
        # TODO: Implement AI analytics
        return Response({'message': 'AI analytics not implemented yet'})
