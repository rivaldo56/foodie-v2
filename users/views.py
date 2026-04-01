from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.authtoken.models import Token
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .models import User, ClientProfile
from .permissions import IsClient
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserSerializer,
    ClientProfileSerializer,
    ClientProfileCreateUpdateSerializer,
    UserUpdateSerializer,
    ClientOnboardingSerializer,
    PasswordChangeSerializer,
)

# Import models at module level to avoid circular imports inside functions
# We use string references where possible, but for dashboard we need to query
from bookings.models import Booking
from chefs.models import ChefProfile


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def verify_token_view(request):
    """Verify auth token and return user identifying info"""
    user = request.user
    return Response(
        {
            "user_id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "is_verified": user.is_verified,
            "onboarding_status": user.onboarding_status,
        },
        status=status.HTTP_200_OK,
    )


class ImageUploadView(APIView):
    """
    Upload an image to Cloudinary and return the URL.
    Used to replace Supabase Storage.
    """

    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        if "image" not in request.FILES:
            return Response(
                {"error": "No image provided"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            from utils.cloudinary_upload import upload_to_cloudinary

            result = upload_to_cloudinary(request.FILES["image"])
            if result and "url" in result:
                return Response({"url": result["url"]}, status=status.HTTP_200_OK)
            return Response(
                {"error": "Upload failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name="dispatch")
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
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role

        response = Response(
            {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "User registered successfully",
            },
            status=status.HTTP_201_CREATED,
        )

        # Set HttpOnly cookies
        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=24 * 60 * 60,  # 24 hours
        )
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )

        return response


@method_decorator(csrf_exempt, name="dispatch")
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

        user = serializer.validated_data["user"]
        # Token for rest_framework.authtoken (legacy/fallback)
        token, created = Token.objects.get_or_create(user=user)

        # SimpleJWT tokens
        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role

        response = Response(
            {
                "user": UserSerializer(user).data,
                "token": str(refresh.access_token),
                "refresh": str(refresh),
                "message": "Login successful",
            },
            status=status.HTTP_200_OK,
        )

        # Set HttpOnly cookies
        response.set_cookie(
            key="access",
            value=str(refresh.access_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=24 * 60 * 60,  # 24 hours
        )
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,  # 7 days
        )

        return response


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
        if self.request.method in ["PUT", "PATCH"]:
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
        if self.request.method == "GET":
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
        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(
            {"message": "Password changed successfully"}, status=status.HTTP_200_OK
        )


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint.
    Deletes the user's auth token and clears HttpOnly cookies.
    """
    try:
        from rest_framework.authtoken.models import Token

        Token.objects.filter(user=request.user).delete()
    except Exception:
        pass

    response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

    # Clear HttpOnly cookies
    response.delete_cookie("access")
    response.delete_cookie("refresh")

    return response


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """
    User dashboard with basic stats based on role.
    """
    user = request.user
    dashboard_data = {"user": UserSerializer(user).data}

    if user.role == User.Role.CLIENT:
        # Client dashboard data
        bookings = Booking.objects.filter(client=user)

        dashboard_data.update(
            {
                "stats": {
                    "total_bookings": bookings.count(),
                    "pending_bookings": bookings.filter(status="pending").count(),
                    "completed_bookings": bookings.filter(status="completed").count(),
                    "upcoming_bookings": bookings.filter(
                        status__in=["confirmed", "in_progress"]
                    ).count(),
                },
                "recent_bookings": [],  # TODO: Add recent bookings serializer data
            }
        )

    elif user.role == User.Role.CHEF:
        # Chef dashboard data
        try:
            chef_profile = ChefProfile.objects.get(user=user)
            bookings = chef_profile.bookings.all()

            dashboard_data.update(
                {
                    "chef_profile": {
                        "id": chef_profile.id,
                        "average_rating": chef_profile.average_rating,
                        "total_reviews": chef_profile.total_reviews,
                        "is_verified": chef_profile.is_verified,
                    },
                    "stats": {
                        "total_bookings": bookings.count(),
                        "pending_bookings": bookings.filter(status="pending").count(),
                        "completed_bookings": bookings.filter(
                            status="completed"
                        ).count(),
                        "monthly_earnings": 0,  # TODO: Calculate monthly earnings
                    },
                    "recent_bookings": [],  # TODO: Add recent bookings serializer data
                }
            )
        except ChefProfile.DoesNotExist:
            dashboard_data["message"] = (
                "Chef profile not found. Please complete your profile setup."
            )

    else:
        # Admin dashboard data
        dashboard_data.update(
            {
                "stats": {
                    "total_users": User.objects.count(),
                    "total_chefs": User.objects.filter(role=User.Role.CHEF).count(),
                    "total_clients": User.objects.filter(role=User.Role.CLIENT).count(),
                }
            }
        )

    return Response(dashboard_data, status=status.HTTP_200_OK)


class OnboardingStatusView(generics.RetrieveAPIView):
    """
    Get current user onboarding status.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response(
            {
                "onboarding_status": request.user.onboarding_status,
                "role": request.user.role,
            }
        )


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

    @transaction.atomic
    def post(self, request, *args, **kwargs):

        user = request.user

        if user.role == User.Role.CLIENT:
            from .models import ClientOnboarding, ClientProfile

            try:
                onboarding = user.client_onboarding
                onboarding.completed = True
                onboarding.save()

                # Update the main User model status
                user.onboarding_status = User.OnboardingStatus.COMPLETE
                user.save()

                # Sync collected data to the canonical ClientProfile

                profile, created = ClientProfile.objects.get_or_create(user=user)
                profile.preferred_cuisines = onboarding.preferred_cuisines
                profile.allergies = onboarding.allergies
                profile.allergies_details = onboarding.allergies_details
                profile.location = onboarding.location
                profile.budget_range = onboarding.budget_range
                profile.occasion_types = onboarding.occasion_types
                profile.dietary_preferences = onboarding.dietary_preferences
                profile.save()

                # Sync to Recommendation Engine for immediate personalization
                try:
                    from ai.recommendation_engine import RecommendationEngine
                    engine = RecommendationEngine(user)
                    engine.seed_preferences_from_onboarding(onboarding)
                except Exception as e:
                    # Don't fail the whole onboarding if recommendation sync fails
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Failed to seed recommendations: {str(e)}")


            except ClientOnboarding.DoesNotExist:
                return Response(
                    {"error": "Onboarding data not found"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        elif user.role == User.Role.CHEF:
            from chefs.models import ChefOnboarding, ChefProfile

            try:
                onboarding = user.chef_onboarding
                onboarding.completed = True
                onboarding.save()

                # Sync collected data to the canonical ChefProfile
                profile = ChefProfile.objects.get(user=user)
                profile.specialties = onboarding.specialties
                profile.culinary_paths = onboarding.culinary_paths
                profile.portfolio_images = onboarding.portfolio_media
                profile.document_uploads = onboarding.certifications
                profile.certifications = onboarding.certifications
                profile.identity_verification_status = (
                    onboarding.identity_verification_status
                )

                # Availability & Pricing Sync
                import json as _json

                availability_list = onboarding.availability_options or []

                # Default fallback for availability schedule
                profile.availability_schedule = {
                    slot: True for slot in availability_list
                }

                # Parse rich JSON from availability_options if present
                for slot in availability_list:
                    try:
                        if slot.startswith("{"):
                            avail = _json.loads(slot)
                            if isinstance(avail, dict):
                                # Extract meaningful schedule for structured rendering
                                profile.availability_schedule = {
                                    "type": avail.get("availabilityType", "casual"),
                                    "days": avail.get("casualDays", []),
                                    "slots": avail.get("timeSlots", []),
                                    "guest_limit": avail.get("guestLimit", 10),
                                }

                                # Sync location fields
                                if avail.get("city"):
                                    profile.city = avail["city"]
                                if avail.get("state"):
                                    profile.state = avail["state"]
                                if avail.get("travelDistance"):
                                    profile.service_radius = int(
                                        avail["travelDistance"]
                                    )
                                if avail.get("lat"):
                                    profile.latitude = avail["lat"]
                                if avail.get("lng"):
                                    profile.longitude = avail["lng"]
                                break
                    except (ValueError, TypeError):
                        continue

                # Validate and assign experience level
                valid_levels = [
                    choice[0] for choice in ChefProfile.ExperienceLevel.choices
                ]
                if onboarding.experience_level in valid_levels:
                    profile.experience_level = onboarding.experience_level
                else:
                    profile.experience_level = ChefProfile.ExperienceLevel.BEGINNER

                # Map pricing_tier to KES hourly_rate (based on Nairobi market rates)
                if onboarding.pricing_tier == "Budget":
                    profile.hourly_rate = 2500.00
                elif onboarding.pricing_tier == "Fair Market":
                    profile.hourly_rate = 4500.00
                elif onboarding.pricing_tier == "Premium":
                    profile.hourly_rate = 10000.00

                profile.save()

            except ChefOnboarding.DoesNotExist:
                return Response(
                    {"error": "Onboarding data not found"},
                    status=status.HTTP_400_BAD_REQUEST,
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

        return Response(
            {
                "message": "Onboarding completed",
                "next_screen": (
                    "/client/home"
                    if user.role == User.Role.CLIENT
                    else "/chef/dashboard"
                ),
            }
        )
