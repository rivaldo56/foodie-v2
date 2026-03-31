from rest_framework import generics, status, permissions, viewsets
from rest_framework.decorators import action
from django.utils import timezone
from rest_framework.response import Response
from decimal import Decimal
from .models import Booking, MenuItem, BookingMenuItem, BookingAssignment
from .utils import notify_booking_created, notify_booking_confirmed, notify_booking_cancelled
from .serializers import (
    BookingSerializer,
    BookingCreateSerializer,
    BookingUpdateSerializer,
    BookingStatusUpdateSerializer,
    MenuItemSerializer,
    BookingMenuItemSerializer,
    BookingAssignmentSerializer,
)


class BookingListView(generics.ListAPIView):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "admin":
            return Booking.objects.all().order_by("-created_at")
        elif user.role == "chef":
            # Chefs see bookings for their profile
            from chefs.models import ChefProfile

            try:
                chef_profile = ChefProfile.objects.get(user=user)
                return Booking.objects.filter(chef=chef_profile).order_by("-created_at")
            except ChefProfile.DoesNotExist:
                return Booking.objects.none()
        else:
            # Clients see their own bookings
            return Booking.objects.filter(client=user).order_by("-created_at")


class BookingCreateView(generics.CreateAPIView):
    """
    Create a new booking.
    Calculates initial pricing based on chef's hourly rate and selected menu items.
    """

    serializer_class = BookingCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        booking = serializer.save(client=request.user)

        # Trigger notification
        notify_booking_created(booking)

        # Initialize Paystack Payment
        from payments.paystack_service import paystack_service

        payment_data = paystack_service.initialize_payment(
            email=request.user.email,
            amount=booking.total_amount * Decimal("0.25"),  # 25% down payment
            reference=f"BOOK-{booking.id}-{timezone.now().timestamp()}",
            metadata={"booking_id": booking.id},
        )

        response_data = serializer.data
        if payment_data.get("success"):
            response_data["authorization_url"] = payment_data["authorization_url"]
        else:
            # Still return 201 but with error info
            response_data["payment_error"] = payment_data.get("error")

        return Response(response_data, status=status.HTTP_201_CREATED)


class BookingDetailView(generics.RetrieveAPIView):
    """Retrieve booking details"""

    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "chef":
            from chefs.models import ChefProfile

            try:
                chef_profile = ChefProfile.objects.get(user=user)
                return Booking.objects.filter(chef=chef_profile)
            except ChefProfile.DoesNotExist:
                return Booking.objects.none()
        else:
            return Booking.objects.filter(client=user)


class BookingUpdateView(generics.UpdateAPIView):
    """Update booking details (client only, before confirmation)"""

    serializer_class = BookingUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user, status="pending")


class BookingStatusUpdateView(generics.UpdateAPIView):
    """Update booking status (chef only)"""

    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "chef":
            from chefs.models import ChefProfile

            try:
                chef_profile = ChefProfile.objects.get(user=user)
                return Booking.objects.filter(chef=chef_profile)
            except ChefProfile.DoesNotExist:
                return Booking.objects.none()
        return Booking.objects.none()

    def perform_update(self, serializer):
        instance = serializer.save()

        # Trigger activation/confirmation hooks
        if instance.status == "confirmed":
            notify_booking_confirmed(instance)
        elif instance.status == "cancelled":
            notify_booking_cancelled(instance, "the chef")


class BookingCancelView(generics.UpdateAPIView):
    """Cancel a booking"""

    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "chef":
            from chefs.models import ChefProfile

            try:
                chef_profile = ChefProfile.objects.get(user=user)
                return Booking.objects.filter(chef=chef_profile)
            except ChefProfile.DoesNotExist:
                return Booking.objects.none()
        else:
            return Booking.objects.filter(client=user)

    def perform_update(self, serializer):
        instance = serializer.save(status="cancelled")
        
        cancelled_by = 'the chef' if self.request.user.role == 'chef' else 'the client'
        notify_booking_cancelled(instance, cancelled_by)


class BookingConfirmSatisfactionView(generics.UpdateAPIView):
    """
    Confirm satisfaction with a booking (client only, after completion).
    This is used to release escrow.
    """

    serializer_class = BookingStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(client=self.request.user, status="completed")

    def perform_update(self, serializer):
        instance = serializer.save(confirmed_by_client_at=timezone.now())
        # In a real scenario, this would trigger an escrow release function
        # via a task queue or direct service call.
        print(f"DEBUG: Escrow released for booking {instance.id}")


class MenuItemCreateView(generics.CreateAPIView):
    """
    Create menu items for chefs.
    Supports image upload via Cloudinary.
    """

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Ensure user is a chef
        if request.user.role != "chef":
            return Response(
                {"error": "Only chefs can create menu items"},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Get chef profile
        from chefs.models import ChefProfile

        try:
            chef_profile = ChefProfile.objects.get(user=request.user)
        except ChefProfile.DoesNotExist:
            return Response(
                {"error": "Chef profile not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Handle image upload to Cloudinary if present
        image_url = None
        if "image" in request.FILES:
            from utils.cloudinary_upload import upload_to_cloudinary

            upload_result = upload_to_cloudinary(request.FILES["image"])
            if upload_result:
                image_url = upload_result["url"]

        # Prepare data
        data = request.data.copy()
        data["chef"] = chef_profile.id
        if image_url:
            data["image"] = image_url

        # Set default preparation_time if not provided
        if "preparation_time" not in data:
            data["preparation_time"] = 30

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        menu_item = serializer.save()

        return Response(
            MenuItemSerializer(menu_item).data, status=status.HTTP_201_CREATED
        )


class MenuItemUpdateView(generics.UpdateAPIView):
    """Update menu items - only chef who created can update"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from chefs.models import ChefProfile

        try:
            chef_profile = ChefProfile.objects.get(user=self.request.user)
            return MenuItem.objects.filter(chef=chef_profile)
        except ChefProfile.DoesNotExist:
            return MenuItem.objects.none()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", True)
        instance = self.get_object()

        # Handle image upload if present
        if "image" in request.FILES:
            from utils.cloudinary_upload import upload_to_cloudinary

            upload_result = upload_to_cloudinary(request.FILES["image"])
            if upload_result:
                request.data["image"] = upload_result["url"]

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


class MenuItemDeleteView(generics.DestroyAPIView):
    """Delete menu items - only chef who created can delete"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from chefs.models import ChefProfile

        try:
            chef_profile = ChefProfile.objects.get(user=self.request.user)
            return MenuItem.objects.filter(chef=chef_profile)
        except ChefProfile.DoesNotExist:
            return MenuItem.objects.none()


class MyMenuItemListView(generics.ListAPIView):
    """List menu items for the authenticated chef"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from chefs.models import ChefProfile

        try:
            chef_profile = ChefProfile.objects.get(user=self.request.user)
            return MenuItem.objects.filter(chef=chef_profile)
        except ChefProfile.DoesNotExist:
            return MenuItem.objects.none()


class MenuItemDetailView(generics.RetrieveAPIView):
    """Retrieve menu item details"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Allow viewing any menu item, but maybe restrict editing in other views
        return MenuItem.objects.all()


class PublicMenuItemListView(generics.ListAPIView):
    """List all available menu items (publicly accessible)"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]
    queryset = MenuItem.objects.filter(is_available=True)


class ChefMenuItemsView(generics.ListAPIView):
    """List menu items for a specific chef (publicly accessible)"""

    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        chef_id = self.kwargs["chef_id"]
        return MenuItem.objects.filter(chef_id=chef_id)


class BookingMenuItemListView(generics.ListAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        booking_id = self.kwargs["booking_id"]
        return BookingMenuItem.objects.filter(booking_id=booking_id)


class BookingMenuItemCreateView(generics.CreateAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]


class BookingMenuItemDeleteView(generics.DestroyAPIView):
    serializer_class = BookingMenuItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BookingMenuItem.objects.all()


class BookingAssignmentViewSet(viewsets.ModelViewSet):
    """
    V4: ViewSet for chefs to manage their booking assignments.
    """

    serializer_class = BookingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from chefs.models import ChefProfile

        try:
            chef_profile = ChefProfile.objects.get(user=self.request.user)
            return BookingAssignment.objects.filter(chef=chef_profile)
        except ChefProfile.DoesNotExist:
            return BookingAssignment.objects.none()

    @action(detail=True, methods=["post"])
    def respond(self, request, pk=None):
        assignment = self.get_object()
        response = request.data.get("response")  # 'accepted' or 'declined'

        if assignment.status != BookingAssignment.AssignmentStatus.PENDING:
            return Response(
                {"error": "Assignment already responded to or expired"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if response == "accepted":
            assignment.status = BookingAssignment.AssignmentStatus.ACCEPTED
            assignment.responded_at = timezone.now()
            assignment.save()

            # Update booking status and link chef
            booking = assignment.booking
            booking.chef = assignment.chef
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save()

            # Notify client
            from .utils import notify_booking_confirmed

            notify_booking_confirmed(booking)

            return Response({"status": "accepted", "message": "Booking confirmed"})

        elif response == "declined":
            assignment.status = BookingAssignment.AssignmentStatus.DECLINED
            assignment.responded_at = timezone.now()
            assignment.save()

            # Record reason on booking if possible, or assignment
            reason = request.data.get("reason", "No reason provided")
            # For now, just log or add to a field if we add one.
            # booking.chef_notes = f"Declined by {chef_profile.user.full_name}: {reason}"

            # TODO: Trigger next rotation in pool if needed
            return Response(
                {"status": "declined", "message": f"Assignment declined: {reason}"}
            )

        return Response(
            {"error": "Invalid response"}, status=status.HTTP_400_BAD_REQUEST
        )
