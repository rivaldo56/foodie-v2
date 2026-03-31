from rest_framework import serializers
from users.models import User
from chefs.models import ChefProfile, ChefOnboarding
from bookings.models import Booking, MenuItem
from payments.models import Payment, ChefPayout


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
            "onboarding_status",
            "is_verified",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class ChefAdminSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ChefProfile
        fields = [
            "id",
            "user_email",
            "user_full_name",
            "bio",
            "specialties",
            "average_rating",
            "total_bookings",
            "is_verified",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "average_rating",
            "total_bookings",
            "created_at",
            "updated_at",
        ]


class ChefOnboardingSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model = ChefOnboarding
        fields = "__all__"


class BookingAdminSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(source="client.email", read_only=True)
    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class PaymentAdminSerializer(serializers.ModelSerializer):
    client_email = serializers.EmailField(source="client.email", read_only=True)
    booking_code = serializers.CharField(
        source="booking.confirmation_code", read_only=True
    )

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class MenuItemAdminSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)

    class Meta:
        model = MenuItem
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class PayoutAdminSerializer(serializers.ModelSerializer):
    chef_name = serializers.CharField(source="chef.full_name", read_only=True)
    chef_email = serializers.EmailField(source="chef.email", read_only=True)
    booking_code = serializers.CharField(
        source="booking.confirmation_code", read_only=True
    )

    class Meta:
        model = ChefPayout
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at", "processed_at"]
