from django.db.models import Sum, Count
from rest_framework import viewsets, status, views
from rest_framework.decorators import action
from rest_framework.response import Response
import django.utils.timezone as timezone
from users.models import User
from bookings.models import Booking, MenuItem
from payments.models import Payment, ChefPayout
from chefs.models import ChefProfile, ChefOnboarding
from .serializers import (
    UserAdminSerializer, 
    ChefAdminSerializer, 
    ChefOnboardingSerializer,
    BookingAdminSerializer,
    PaymentAdminSerializer,
    MenuItemAdminSerializer,
    PayoutAdminSerializer
)
from .permissions import IsAdminUser

class DashboardStatsView(views.APIView):
    """
    API endpoint for admin dashboard statistics.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        # User stats
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        chefs = User.objects.filter(role=User.Role.CHEF).count()
        
        # Booking stats
        total_bookings = Booking.objects.count()
        active_bookings = Booking.objects.filter(
            status__in=[Booking.Status.CONFIRMED, Booking.Status.IN_PROGRESS]
        ).count()
        
        # Revenue stats (Total successful payments)
        revenue_data = Payment.objects.filter(
            status=Payment.Status.COMPLETED
        ).aggregate(total=Sum('amount'))
        total_revenue = revenue_data['total'] or 0
        
        # Payout stats
        pending_payouts_data = ChefPayout.objects.filter(
            status=ChefPayout.Status.PENDING
        ).aggregate(total=Sum('amount'))
        pending_payouts = pending_payouts_data['total'] or 0
        
        return Response({
            'kpis': [
                {
                    'name': 'Total Users',
                    'value': f"{total_users:,}",
                    'change': '+0%', 
                    'trend': 'up',
                    'icon': 'Users',
                    'color': 'bg-blue-500'
                },
                {
                    'name': 'Active Bookings',
                    'value': str(active_bookings),
                    'change': '+0%',
                    'trend': 'up',
                    'icon': 'CalendarDays',
                    'color': 'bg-purple-500'
                },
                {
                    'name': 'Total Revenue',
                    'value': f"KES {total_revenue:,.2f}",
                    'change': '+0%',
                    'trend': 'up',
                    'icon': 'TrendingUp',
                    'color': 'bg-emerald-500'
                },
                {
                    'name': 'Pending Payouts',
                    'value': f"KES {pending_payouts:,.2f}",
                    'change': '+0%',
                    'trend': 'up',
                    'icon': 'CreditCard',
                    'color': 'bg-orange-500'
                }
            ],
            'recent_activity': []
        })

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin user management.
    """
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        return Response({
            'status': 'User status updated',
            'is_active': user.is_active
        })

class ChefViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin chef management.
    """
    queryset = ChefProfile.objects.all().order_by('-created_at')
    serializer_class = ChefAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        chef = self.get_object()
        chef.is_verified = True
        chef.save()
        
        # Also update onboarding status if exists
        onboarding = ChefOnboarding.objects.filter(user=chef.user).first()
        if onboarding:
            onboarding.identity_verification_status = 'verified'
            onboarding.save()
            
        return Response({'status': 'Chef verified successfully'})

class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin booking management.
    """
    queryset = Booking.objects.all().order_by('-created_at')
    serializer_class = BookingAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.CANCELLED
        booking.save()
        return Response({'status': 'Booking cancelled'})

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for admin payment tracking.
    """
    queryset = Payment.objects.all().order_by('-created_at')
    serializer_class = PaymentAdminSerializer
    permission_classes = [IsAdminUser]

class ChefOnboardingViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View pending chef applications.
    """
    queryset = ChefOnboarding.objects.filter(identity_verification_status='pending').order_by('-updated_at')
    serializer_class = ChefOnboardingSerializer
    permission_classes = [IsAdminUser]

class MenuItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin menu item management.
    """
    queryset = MenuItem.objects.all().order_by('chef', 'category', 'name')
    serializer_class = MenuItemAdminSerializer
    permission_classes = [IsAdminUser]

class PayoutViewSet(viewsets.ModelViewSet):
    """
    ViewSet for admin payout management.
    """
    queryset = ChefPayout.objects.all().order_by('-created_at')
    serializer_class = PayoutAdminSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        payout = self.get_object()
        payout.status = ChefPayout.Status.COMPLETED
        payout.processed_at = timezone.now()
        payout.save()
        return Response({'status': 'Payout marked as completed'})

class SettingsView(views.APIView):
    """
    API endpoint for platform settings.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            'commission_rate': 15,
            'cancellation_window_hours': 24,
            'payout_threshold': 5000,
            'feature_flags': {
                'ai_recommendations': True,
                'mpesa_direct': True,
                'chef_onboarding': True
            }
        })
    
    def post(self, request):
        return Response({'status': 'Settings updated'})
