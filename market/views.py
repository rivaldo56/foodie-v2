from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import IngredientOrder
from .serializers import IngredientOrderSerializer
from farmers.models import FarmProduct
from farmers.serializers import FarmProductSerializer

class MarketplaceViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for browsing the marketplace (read-only view of FarmProducts)"""
    queryset = FarmProduct.objects.filter(is_available=True)
    serializer_class = FarmProductSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields = ['category', 'farmer__location']
    search_fields = ['name', 'description']

class IngredientOrderViewSet(viewsets.ModelViewSet):
    """Viewset for managing ingredient orders"""
    serializer_class = IngredientOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # If user is a farmer, show orders containing their products (complex query, simplified for hackathon)
        # For now, just show orders where the user is the buyer
        return IngredientOrder.objects.filter(buyer=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
