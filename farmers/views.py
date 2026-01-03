from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import FarmerProfile, FarmProduct
from .serializers import FarmerProfileSerializer, FarmProductSerializer

class IsFarmer(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and hasattr(request.user, 'farmer_profile')

class FarmerProfileViewSet(viewsets.ModelViewSet):
    queryset = FarmerProfile.objects.all()
    serializer_class = FarmerProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['farm_name', 'location', 'bio']

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            profile = request.user.farmer_profile
            if request.method == 'GET':
                serializer = self.get_serializer(profile)
                return Response(serializer.data)
            else:
                serializer = self.get_serializer(profile, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response(serializer.data)
        except FarmerProfile.DoesNotExist:
            return Response({"detail": "Farmer profile not found."}, status=404)

class FarmProductViewSet(viewsets.ModelViewSet):
    queryset = FarmProduct.objects.filter(is_available=True)
    serializer_class = FarmProductSerializer
    permission_classes = [IsFarmer]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['price_per_unit', 'created_at']

    def get_queryset(self):
        # If user is a farmer viewing their own products, show all (even unavailable)
        user = self.request.user
        if self.action == 'my_products' and user.is_authenticated and hasattr(user, 'farmer_profile'):
            return FarmProduct.objects.filter(farmer=user.farmer_profile)
        return super().get_queryset()

    @action(detail=False, methods=['get'], url_path='my-products')
    def my_products(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
