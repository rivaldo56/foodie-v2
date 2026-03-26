from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import User, ClientProfile
from .permissions import IsClient, IsChef
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserSerializer,
    ClientProfileSerializer, ClientProfileCreateUpdateSerializer,
    UserUpdateSerializer, ClientOnboardingSerializer, PasswordChangeSerializer
)

# Import models at module level to avoid circular imports inside functions
# We use string references where possible, but for dashboard we need to query
from bookings.models import Booking
from chefs.models import ChefProfile


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_token_view(request):
    """Verify auth token and return user identifying info"""
    user = request.user
    return Response({
        'user_id': user.id,
        'email': user.email,
        'role': user.role,
        'is_verified': user.is_verified
    }, status=status.HTTP_200_OK)


class UserRegistrationView(generics.CreateAPIView):
    """
    User registration endpoint.
    Creates a new user and generates an auth token.
    Profile creation is handled by signals.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token for the user
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class UserLoginView(generics.GenericAPIView):
    """
    User login endpoint.
    Returns user data and auth token.
    """
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User profile view and update.
    Allows users to view and update their basic account info.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer


class ClientProfileView(generics.RetrieveUpdateAPIView):
    """
    Client profile view and update.
    Specific to client role.
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]
    
    def get_object(self):
        profile, created = ClientProfile.objects.get_or_create(user=self.request.user)
        return profile
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ClientProfileSerializer
        return ClientProfileCreateUpdateSerializer


class PasswordChangeView(generics.GenericAPIView):
    """
    Change user password endpoint.
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint.
    Deletes the user's auth token.
    """
    try:
        token = Token.objects.get(user=request.user)
        token.delete()
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Token.DoesNotExist:
        return Response({
            'message': 'Token not found'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """
    User dashboard with basic stats based on role.
    """
    user = request.user
    dashboard_data = {'user': UserSerializer(user).data}
    
    if user.role == User.Role.CLIENT:
        # Client dashboard data
        bookings = Booking.objects.filter(client=user)
        
        dashboard_data.update({
            'stats': {
                'total_bookings': bookings.count(),
                'pending_bookings': bookings.filter(status='pending').count(),
                'completed_bookings': bookings.filter(status='completed').count(),
                'upcoming_bookings': bookings.filter(
                    status__in=['confirmed', 'in_progress']
                ).count(),
            },
            'recent_bookings': []  # TODO: Add recent bookings serializer data
        })
        
    elif user.role == User.Role.CHEF:
        # Chef dashboard data
        try:
            chef_profile = ChefProfile.objects.get(user=user)
            bookings = chef_profile.bookings.all()
            
            dashboard_data.update({
                'chef_profile': {
                    'id': chef_profile.id,
                    'average_rating': chef_profile.average_rating,
                    'total_reviews': chef_profile.total_reviews,
                    'is_verified': chef_profile.is_verified,
                },
                'stats': {
                    'total_bookings': bookings.count(),
                    'pending_bookings': bookings.filter(status='pending').count(),
                    'completed_bookings': bookings.filter(status='completed').count(),
                    'monthly_earnings': 0,  # TODO: Calculate monthly earnings
                },
                'recent_bookings': []  # TODO: Add recent bookings serializer data
            })
        except ChefProfile.DoesNotExist:
            dashboard_data['message'] = 'Chef profile not found. Please complete your profile setup.'
    
    else:
        # Admin dashboard data
        dashboard_data.update({
            'stats': {
                'total_users': User.objects.count(),
                'total_chefs': User.objects.filter(role=User.Role.CHEF).count(),
                'total_clients': User.objects.filter(role=User.Role.CLIENT).count(),
            }
        })
    
    return Response(dashboard_data, status=status.HTTP_200_OK)


class OnboardingStatusView(generics.RetrieveAPIView):
    """
    Get current user onboarding status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({
            'onboarding_status': request.user.onboarding_status,
            'role': request.user.role
        })


class ClientOnboardingView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update client onboarding data.
    """
    permission_classes = [permissions.IsAuthenticated, IsClient]
    serializer_class = ClientOnboardingSerializer

    def get_object(self):
        from .models import ClientOnboarding
        obj, created = ClientOnboarding.objects.get_or_create(user=self.request.user)
        return obj

    def perform_update(self, serializer):
        # Set status to in_progress if currently not_started
        if self.request.user.onboarding_status == User.OnboardingStatus.NOT_STARTED:
            self.request.user.onboarding_status = User.OnboardingStatus.IN_PROGRESS
            self.request.user.save()
        serializer.save()


class OnboardingCompleteView(generics.GenericAPIView):
    """
    Mark onboarding as complete.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user = request.user
        
        # Verify required data exists based on role
        if user.role == User.Role.CLIENT:
            from .models import ClientOnboarding
            try:
                onboarding = user.client_onboarding
                onboarding.completed = True
                onboarding.save()
            except ClientOnboarding.DoesNotExist:
                return Response(
                    {'error': 'Onboarding data not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif user.role == User.Role.CHEF:
            from chefs.models import ChefOnboarding
            try:
                onboarding = user.chef_onboarding
                onboarding.completed = True
                onboarding.save()
            except ChefOnboarding.DoesNotExist:
                return Response(
                    {'error': 'Onboarding data not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Update user status
        user.onboarding_status = User.OnboardingStatus.COMPLETE
        user.save()

        # Trigger welcome email
        try:
            from .tasks import send_post_onboarding_email
            # Use on_commit to ensure DB transaction is done if applicable (though this view isn't explicitly atomic, better safe)
            transaction.on_commit(lambda: send_post_onboarding_email.delay(user.id))
        except Exception as e:
            # Fallback if task queue fails or not set up
            print(f"Failed to queue email task: {e}")
        
        return Response({
            'message': 'Onboarding completed',
            'next_screen': '/client/home' if user.role == User.Role.CLIENT else '/chef/dashboard'
        })
