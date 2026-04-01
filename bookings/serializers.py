from rest_framework import serializers
from decimal import Decimal
from django.utils import timezone
from .models import Booking, MenuItem, BookingMenuItem, ChefMenu, BookingAssignment
from users.serializers import UserSerializer
from chefs.serializers import ChefProfileSerializer


class MenuItemSerializer(serializers.ModelSerializer):
    """Serializer for menu items"""

    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "chef",
            "chef_name",
            "name",
            "description",
            "category",
            "price_per_serving",
            "preparation_time",
            "calories",
            "is_vegetarian",
            "is_vegan",
            "is_gluten_free",
            "is_dairy_free",
            "allergens",
            "is_available",
            "seasonal_availability",
            "image",
            "ingredients",
            "delivery_available",
            "pickup_available",
            "meal_prep_available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_price_per_serving(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Price per serving must be greater than 0"
            )
        return value

    def validate_preparation_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Preparation time must be greater than 0")
        return value


class BookingMenuItemSerializer(serializers.ModelSerializer):
    """Serializer for booking menu items"""

    menu_item = MenuItemSerializer(read_only=True)
    menu_item_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = BookingMenuItem
        fields = [
            "id",
            "menu_item",
            "menu_item_id",
            "quantity",
            "unit_price",
            "total_price",
            "special_instructions",
            "created_at",
        ]
        read_only_fields = ["id", "total_price", "created_at"]


class ChefMenuSerializer(serializers.ModelSerializer):
    """Serializer for chef menus (V4)"""

    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)
    experience_name = serializers.CharField(source="experience.name", read_only=True)

    class Meta:
        model = ChefMenu
        fields = [
            "id",
            "chef",
            "chef_name",
            "experience",
            "experience_name",
            "title",
            "description",
            "image",
            "highlights",
            "pricing_rules",
            "min_guests",
            "max_guests",
            "is_approved",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_approved", "created_at", "updated_at"]


class AnonymousChefMenuSerializer(serializers.ModelSerializer):
    """Serializer for chef menus with hidden identity (V4 discovery)"""

    experience_name = serializers.CharField(source="experience.name", read_only=True)
    
    # Frontend aliases for compatibility
    name = serializers.CharField(source="title", read_only=True)
    base_price = serializers.SerializerMethodField()
    price_per_person = serializers.SerializerMethodField()
    guest_min = serializers.IntegerField(source="min_guests", read_only=True)
    guest_max = serializers.IntegerField(source="max_guests", read_only=True)

    def get_base_price(self, obj):
        return obj.pricing_rules.get("labour_fee", 0)

    def get_price_per_person(self, obj):
        # Return the first tier's price or 0
        tiers = obj.pricing_rules.get("guest_tiers", [])
        if tiers:
            return tiers[0].get("price_per_person", 0)
        return 0

    class Meta:
        model = ChefMenu
        fields = [
            "id",
            "experience",
            "experience_name",
            "title",
            "name",
            "description",
            "image",
            "highlights",
            "pricing_rules",
            "min_guests",
            "max_guests",
            "guest_min",
            "guest_max",
            "base_price",
            "price_per_person",
        ]


class BookingSerializer(serializers.ModelSerializer):
    """Serializer for bookings"""

    client = UserSerializer(read_only=True)
    chef = ChefProfileSerializer(read_only=True)
    booking_menu_items = BookingMenuItemSerializer(many=True, read_only=True)
    
    # Frontend aliases
    date_time = serializers.DateTimeField(source="booking_date", read_only=True)
    guests_count = serializers.IntegerField(source="number_of_guests", read_only=True)
    total_price = serializers.DecimalField(
        source="total_amount", max_digits=10, decimal_places=2, read_only=True
    )
    address = serializers.CharField(source="service_address", read_only=True)
    payment_model = serializers.SerializerMethodField()
    menu = serializers.SerializerMethodField()

    def get_payment_model(self, obj):
        # Matching frontend expectations
        return "cash_balance"

    def get_menu(self, obj):
        # V4 Marketplace menu
        if obj.v4_menu:
            return {
                "name": obj.v4_menu.title,
                "experience": {"name": obj.v4_menu.experience.name},
            }
            
        # Attempt to return a structure compatible with frontend
        first_item = obj.booking_menu_items.first()
        if first_item:
            return {
                "name": first_item.menu_item.name,
                "experience": {"name": obj.get_service_type_display()},
            }
        return {
            "name": obj.get_service_type_display(),
            "experience": {"name": "Personal Chef Service"},
        }

    class Meta:
        model = Booking
        fields = [
            "id",
            "client",
            "chef",
            "service_type",
            "booking_date",
            "duration_hours",
            "number_of_guests",
            "service_address",
            "service_city",
            "service_state",
            "service_zip_code",
            "dietary_requirements",
            "special_requests",
            "base_price",
            "additional_fees",
            "total_amount",
            "is_priority",
            "down_payment_amount",
            "deposit_amount",
            "payment_mode",
            "external_payment_status",
            "status",
            "confirmation_code",
            "client_notes",
            "chef_notes",
            "booking_menu_items",
            "date_time",
            "guests_count",
            "total_price",
            "address",
            "payment_model",
            "menu",
            "created_at",
            "updated_at",
            "confirmed_at",
            "completed_at",
            "cancelled_at",
        ]
        read_only_fields = [
            "id",
            "confirmation_code",
            "created_at",
            "updated_at",
            "confirmed_at",
            "completed_at",
            "cancelled_at",
        ]

    def validate_booking_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Booking date must be in the future")
        return value

    def validate_number_of_guests(self, value):
        if value < 1:
            raise serializers.ValidationError("Number of guests must be at least 1")
        return value

    def validate_duration_hours(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Duration must be between 1 and 12 hours")
        return value


class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""

    chef_id = serializers.IntegerField(write_only=True, required=False)
    v4_menu_id = serializers.IntegerField(required=False, write_only=True)
    menu_items = serializers.ListField(
        child=serializers.DictField(), write_only=True, required=False
    )

    class Meta:
        model = Booking
        fields = [
            "chef_id",
            "v4_menu_id",
            "service_type",
            "booking_date",
            "duration_hours",
            "number_of_guests",
            "service_address",
            "service_city",
            "service_state",
            "service_zip_code",
            "dietary_requirements",
            "special_requests",
            "client_notes",
            "menu_items",
            "is_priority",
            "down_payment_amount",
            "payment_mode",
        ]

    def validate_booking_date(self, value):
        from django.utils import timezone
        if value <= timezone.now():
            raise serializers.ValidationError("Booking date must be in the future")
        return value

    def validate_chef_id(self, value):
        if value is None:
            return None
        from chefs.models import ChefProfile

        try:
            chef = ChefProfile.objects.get(id=value)
            if not chef.is_available:
                raise serializers.ValidationError("Chef is not available")
            return value
        except ChefProfile.DoesNotExist:
            raise serializers.ValidationError("Chef not found")

    def create(self, validated_data):
        # Remove client if passed in validated_data to avoid duplicate argument error
        validated_data.pop("client", None)
        
        v4_menu_id = validated_data.pop("v4_menu_id", None)
        chef_id = validated_data.pop("chef_id", None)
        menu_items_data = validated_data.pop("menu_items", [])

        if v4_menu_id:
            from bookings.models import ChefMenu, BookingAssignment
            from django.utils import timezone
            from datetime import timedelta

            try:
                menu = ChefMenu.objects.get(id=v4_menu_id, is_approved=True, is_active=True)
            except ChefMenu.DoesNotExist:
                raise serializers.ValidationError({"v4_menu_id": "Menu not found or not approved"})

            # Pricing from V4 engine
            guests = validated_data.get("number_of_guests", 1)
            pricing = menu.calculate_price(guests)
            
            # Assignment
            chef = menu.chef
            
            booking = Booking.objects.create(
                client=self.context["request"].user,
                chef=chef,
                v4_menu=menu,
                base_price=pricing["subtotal"],
                additional_fees=pricing["platform_fee"],
                total_amount=pricing["grand_total"],
                status=Booking.Status.PENDING_CHEF_ACCEPTANCE,
                **validated_data
            )
            
            # Create first assignment (Tier 1)
            BookingAssignment.objects.create(
                booking=booking,
                chef=chef,
                tier=1,
                sla_deadline=timezone.now() + timedelta(hours=2), # 2 hour SLA
                status=BookingAssignment.AssignmentStatus.PENDING
            )
            
            return booking

        # Fallback to V3 logic
        from chefs.models import ChefProfile
        from decimal import Decimal

        if not chef_id:
            raise serializers.ValidationError({"chef_id": "This field is required for non-marketplace bookings."})

        chef = ChefProfile.objects.get(id=chef_id)

        # Calculate pricing
        base_price = chef.hourly_rate * Decimal(validated_data.get("duration_hours", 2))

        # First save the booking to get an ID
        booking = Booking.objects.create(
            client=self.context["request"].user,
            chef=chef,
            base_price=base_price,
            total_amount=base_price,  # Temporary, will update
            **validated_data,
        )

        menu_items_cost = Decimal("0.00")
        for item_data in menu_items_data:
            from bookings.models import MenuItem, BookingMenuItem
            menu_item = MenuItem.objects.get(id=item_data["menu_item_id"])
            quantity = Decimal(item_data["quantity"])
            unit_price = menu_item.price_per_serving
            total_price = unit_price * quantity

            BookingMenuItem.objects.create(
                booking=booking,
                menu_item=menu_item,
                quantity=quantity,
                unit_price=unit_price,
                special_instructions=item_data.get("special_instructions", ""),
            )
            menu_items_cost += total_price

        # Update booking total amount with 15% platform fee matching old Edge Function logic
        subtotal = base_price + menu_items_cost
        platform_fee = subtotal * Decimal("0.15")

        booking.base_price = subtotal
        booking.additional_fees = platform_fee
        booking.total_amount = subtotal + platform_fee
        booking.save()

        return booking


class BookingUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating bookings"""

    class Meta:
        model = Booking
        fields = [
            "booking_date",
            "duration_hours",
            "number_of_guests",
            "dietary_requirements",
            "special_requests",
            "client_notes",
        ]

    def validate_booking_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Booking date must be in the future")
        return value

    def validate(self, attrs):
        booking = self.instance
        if booking.status not in ["pending", "confirmed"]:
            raise serializers.ValidationError("Cannot update booking in current status")
        return attrs


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating booking status"""

    class Meta:
        model = Booking
        fields = ["status", "chef_notes"]

    def validate_status(self, value):
        booking = self.instance
        user = self.context["request"].user

        # Define allowed status transitions
        allowed_transitions = {
            "pending": ["confirmed", "deposit_paid", "cancelled"],
            "deposit_paid": ["confirmed", "cancelled"],
            "confirmed": ["in_progress", "cancelled"],
            "in_progress": ["completed", "cancelled"],
        }

        if booking.status not in allowed_transitions:
            raise serializers.ValidationError("Cannot change status from current state")

        if value not in allowed_transitions[booking.status]:
            raise serializers.ValidationError(
                f"Cannot change status from {booking.status} to {value}"
            )

        # Only chef can confirm or start bookings
        if value in ["confirmed", "in_progress"] and user != booking.chef.user:
            raise serializers.ValidationError("Only the chef can perform this action")

        return value


class BookingAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for tracking which chef was notified for a booking (V4)"""

    chef_name = serializers.CharField(source="chef.user.full_name", read_only=True)
    booking_details = BookingSerializer(source="booking", read_only=True)

    # Flattened booking fields for JobCard compatibility
    date_time = serializers.DateTimeField(source="booking.booking_date", read_only=True)
    guests_count = serializers.IntegerField(
        source="booking.number_of_guests", read_only=True
    )
    total_price = serializers.DecimalField(
        source="booking.total_amount", max_digits=10, decimal_places=2, read_only=True
    )
    address = serializers.CharField(source="booking.service_address", read_only=True)
    menu = serializers.SerializerMethodField()

    def get_menu(self, obj):
        # Delegate to BookingSerializer logic or similar
        first_item = obj.booking.booking_menu_items.first()
        if first_item:
            return {
                "name": first_item.menu_item.name,
                "experience": {"name": obj.booking.get_service_type_display()},
            }
        return {
            "name": obj.booking.get_service_type_display(),
            "experience": {"name": "Personal Chef Service"},
        }

    class Meta:
        model = BookingAssignment
        fields = [
            "id",
            "booking",
            "booking_details",
            "chef",
            "chef_name",
            "tier",
            "notified_at",
            "sla_deadline",
            "status",
            "responded_at",
            "date_time",
            "guests_count",
            "total_price",
            "address",
            "menu",
        ]
        read_only_fields = [
            "id",
            "notified_at",
            "sla_deadline",
            "status",
            "responded_at",
        ]
