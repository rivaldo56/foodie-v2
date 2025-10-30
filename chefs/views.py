from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ChefProfile, ChefCertification, ChefReview
from .serializers import ChefProfileSerializer, ChefCertificationSerializer, ChefReviewSerializer


class ChefListView(generics.ListAPIView):
    """List all chefs"""
    queryset = ChefProfile.objects.all()
    serializer_class = ChefProfileSerializer
    permission_classes = [permissions.AllowAny]


class ChefSearchView(generics.ListAPIView):
    """Search chefs with filters"""
    serializer_class = ChefProfileSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        # TODO: Implement search logic
        return ChefProfile.objects.all()


class ChefDetailView(generics.RetrieveAPIView):
    """Chef detail view"""
    queryset = ChefProfile.objects.all()
    serializer_class = ChefProfileSerializer
    permission_classes = [permissions.AllowAny]


class ChefProfileView(generics.RetrieveUpdateAPIView):
    """Chef profile management"""
    serializer_class = ChefProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = ChefProfile.objects.get_or_create(user=self.request.user)
        return profile


class ChefReviewListView(generics.ListAPIView):
    """List chef reviews"""
    serializer_class = ChefReviewSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        chef_id = self.kwargs['chef_id']
        return ChefReview.objects.filter(chef_id=chef_id)


class ChefReviewCreateView(generics.CreateAPIView):
    """Create chef review"""
    serializer_class = ChefReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChefReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Chef review detail"""
    queryset = ChefReview.objects.all()
    serializer_class = ChefReviewSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChefCertificationListView(generics.ListAPIView):
    """List chef certifications"""
    serializer_class = ChefCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChefCertification.objects.filter(chef__user=self.request.user)


class ChefCertificationCreateView(generics.CreateAPIView):
    """Create chef certification"""
    serializer_class = ChefCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChefCertificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Chef certification detail"""
    serializer_class = ChefCertificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ChefCertification.objects.filter(chef__user=self.request.user)


class MenuItemListView(generics.ListAPIView):
    """List menu items"""
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        from bookings.models import MenuItem
        return MenuItem.objects.all()
    
    def get_serializer_class(self):
        from bookings.serializers import MenuItemSerializer
        return MenuItemSerializer


class MenuItemCreateView(generics.CreateAPIView):
    """Create menu item"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        from bookings.serializers import MenuItemSerializer
        return MenuItemSerializer


class MenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Menu item detail"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from bookings.models import MenuItem
        return MenuItem.objects.filter(chef__user=self.request.user)
    
    def get_serializer_class(self):
        from bookings.serializers import MenuItemSerializer
        return MenuItemSerializer
