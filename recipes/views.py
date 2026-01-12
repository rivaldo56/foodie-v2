from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Recipe, SavedRecipe, RecipeRequest
from .serializers import CategorySerializer, RecipeSerializer, SavedRecipeSerializer, RecipeRequestSerializer

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]

class RecipeViewSet(viewsets.ModelViewSet):
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'difficulty', 'prep_time', 'source_type']
    search_fields = ['title', 'description']
    ordering_fields = ['prep_time', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        tag = self.request.query_params.get('tag')
        if tag:
            # Filter by diet_tags JSON list containing the tag
            # Note: This relies on DB supporting JSON operations or exact string match if simple
            # For list containment in Django:
            queryset = queryset.filter(diet_tags__contains=tag)
        return queryset

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def save(self, request, pk=None):
        recipe = self.get_object()
        saved, created = SavedRecipe.objects.get_or_create(user=request.user, recipe=recipe)
        if not created:
            saved.delete()
            return Response({'status': 'unsaved', 'is_saved': False}, status=status.HTTP_200_OK)
        return Response({'status': 'saved', 'is_saved': True}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def request_action(self, request, pk=None):
        recipe = self.get_object()
        action_type = request.data.get('action')
        if action_type not in dict(RecipeRequest.ACTION_CHOICES):
            return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
        
        req, created = RecipeRequest.objects.get_or_create(
            user=request.user, recipe=recipe, action=action_type
        )
        return Response(
            {'status': 'requested', 'created': created}, 
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
