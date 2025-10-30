from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import Booking, MenuItem, BookingMenuItem
from .serializers import BookingSerializer, MenuItemSerializer, BookingMenuItemSerializer


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user)


class BookingCreateView(generics.CreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingDetailView(generics.RetrieveAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user)


class BookingUpdateView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user)


class BookingStatusUpdateView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.all()


class BookingCancelView(generics.UpdateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user)


class MenuItemListView(generics.ListAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]


class MenuItemDetailView(generics.RetrieveAPIView):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]


class ChefMenuItemsView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        chef_id = self.kwargs['chef_id']
        return MenuItem.objects.filter(chef_id=chef_id)


class BookingMenuItemListView(generics.ListAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        booking_id = self.kwargs['booking_id']
        return BookingMenuItem.objects.filter(booking_id=booking_id)


class BookingMenuItemCreateView(generics.CreateAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingMenuItemDeleteView(generics.DestroyAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return BookingMenuItem.objects.all()
