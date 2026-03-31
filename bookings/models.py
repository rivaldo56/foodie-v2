from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from users.models import User
from chefs.models import ChefProfile


class Booking(models.Model):
    """
    Main booking model for chef services.
    Tracks the lifecycle of a booking from pending to completed/cancelled.
    """

    class Status(models.TextChoices):
        PENDING = "pending", _("Pending")
        PENDING_ASSIGNMENT = "pending_assignment", _("Pending Assignment")
        PENDING_CHEF_ACCEPTANCE = "pending_chef_acceptance", _(
            "Pending Chef Acceptance"
        )
        CONFIRMED = "confirmed", _("Confirmed")
        IN_PROGRESS = "in_progress", _("In Progress")
        COMPLETED = "completed", _("Completed")
        CANCELLED = "cancelled", _("Cancelled")
        REFUNDED = "refunded", _("Refunded")

    class ServiceType(models.TextChoices):
        PERSONAL_MEAL = "personal_meal", _("Personal Meal")
        EVENT_CATERING = "event_catering", _("Event Catering")
        COOKING_CLASS = "cooking_class", _("Cooking Class")
        MEAL_PREP = "meal_prep", _("Meal Prep")

    # Core booking information
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookings")
    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="bookings"
    )

    # Booking details
    service_type = models.CharField(
        max_length=20, choices=ServiceType.choices, default=ServiceType.PERSONAL_MEAL
    )
    booking_date = models.DateTimeField()
    duration_hours = models.PositiveIntegerField(default=2)
    number_of_guests = models.PositiveIntegerField(
        default=1, validators=[MinValueValidator(1)]
    )

    # Location
    service_address = models.TextField()
    service_city = models.CharField(max_length=100)
    service_state = models.CharField(max_length=100)
    service_zip_code = models.CharField(max_length=20)

    # Menu and preferences
    dietary_requirements = models.JSONField(default=list, blank=True)
    special_requests = models.TextField(blank=True)

    # Pricing
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    additional_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # Priority / Commitment
    is_priority = models.BooleanField(
        default=False, help_text=_("Client committed with a down payment")
    )
    down_payment_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.00
    )

    # Status and tracking
    status = models.CharField(
        max_length=30, choices=Status.choices, default=Status.PENDING
    )
    confirmation_code = models.CharField(max_length=20, unique=True, blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by_client_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    # Notes
    client_notes = models.TextField(blank=True)
    chef_notes = models.TextField(blank=True)
    admin_notes = models.TextField(blank=True)

    # V4 Marketplace link
    v4_menu = models.ForeignKey(
        "bookings.ChefMenu",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("booking")
        verbose_name_plural = _("bookings")

    def __str__(self):
        return f"Booking #{self.id} - {self.client.full_name} with {self.chef.user.full_name}"

    def save(self, *args, **kwargs):
        if not self.confirmation_code:
            import uuid

            self.confirmation_code = str(uuid.uuid4())[:8].upper()
        super().save(*args, **kwargs)


class MenuItem(models.Model):
    """
    Menu items that chefs can offer.
    Can be added to bookings.
    """

    class Category(models.TextChoices):
        APPETIZER = "appetizer", _("Appetizer")
        MAIN_COURSE = "main_course", _("Main Course")
        DESSERT = "dessert", _("Dessert")
        BEVERAGE = "beverage", _("Beverage")
        SIDE_DISH = "side_dish", _("Side Dish")

    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="menu_items"
    )
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=500, blank=True)
    category = models.CharField(max_length=20, choices=Category.choices)
    price_per_serving = models.DecimalField(max_digits=8, decimal_places=2)
    preparation_time = models.PositiveIntegerField(
        help_text=_("Preparation time in minutes")
    )
    calories = models.PositiveIntegerField(
        null=True, blank=True, help_text=_("Estimated calories (kcal)")
    )

    # Dietary information
    is_vegetarian = models.BooleanField(default=False)
    is_vegan = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)
    is_dairy_free = models.BooleanField(default=False)
    allergens = models.JSONField(
        default=list, blank=True
    )  # e.g., ['nuts', 'shellfish']

    # Availability
    is_available = models.BooleanField(default=True)
    seasonal_availability = models.JSONField(
        default=list, blank=True
    )  # e.g., ['spring', 'summer']

    # Media
    image = models.URLField(max_length=500, blank=True, null=True)  # Cloudinary URL

    # Ingredients
    ingredients = models.JSONField(default=list, blank=True)

    # Fulfillment options
    delivery_available = models.BooleanField(default=True)
    pickup_available = models.BooleanField(default=True)
    meal_prep_available = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["category", "name"]
        verbose_name = _("menu item")
        verbose_name_plural = _("menu items")

    def __str__(self):
        return f"{self.chef.user.full_name} - {self.name}"


class BookingMenuItem(models.Model):
    """
    Junction table for booking menu items with quantities.
    Links a booking to specific menu items.
    """

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="booking_menu_items"
    )
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    total_price = models.DecimalField(max_digits=8, decimal_places=2)
    special_instructions = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["booking", "menu_item"]
        verbose_name = _("booking menu item")
        verbose_name_plural = _("booking menu items")

    def save(self, *args, **kwargs):
        self.total_price = self.quantity * self.unit_price
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.booking.confirmation_code} - {self.menu_item.name} x{self.quantity}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# V4 Marketplace Models
# ─────────────────────────────────────────────────────────────────────────────


class ChefMenu(models.Model):
    """
    V4: Chef-submitted menu tied to an Experience category.
    Chef identity is hidden from clients until booking is confirmed.
    Admins must approve before the menu is publicly visible.

    pricing_rules JSON schema:
    {
        "guest_tiers": [
            {"min": 1,  "max": 5,  "price_per_person": 3000},
            {"min": 6,  "max": 15, "price_per_person": 2500},
            {"min": 16, "max": 50, "price_per_person": 2000}
        ],
        "labour_fee": 5000,
        "event_multiplier": 1.2
    }
    """

    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="v4_menus"
    )
    experience = models.ForeignKey(
        "experiences.Experience", on_delete=models.CASCADE, related_name="menus"
    )

    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.URLField(max_length=500, blank=True)
    highlights = models.JSONField(
        default=list, blank=True
    )  # ["3 courses", "Locally sourced"]

    # Dynamic pricing engine config
    pricing_rules = models.JSONField(
        default=dict, blank=True, help_text="guest_tiers, labour_fee, event_multiplier"
    )

    # Guest limits
    min_guests = models.PositiveIntegerField(default=1)
    max_guests = models.PositiveIntegerField(default=20)

    # Approval workflow
    is_approved = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_menus",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = _("chef menu")
        verbose_name_plural = _("chef menus")

    def __str__(self):
        return f"{self.title} by {self.chef.user.full_name}"

    def calculate_price(
        self, guest_count: int, event_multiplier_override: float = None
    ) -> dict:
        """
        Calculates the total price for a given guest count based on pricing_rules.
        Returns a breakdown dict for transparent display to the client.
        """
        rules = self.pricing_rules
        tiers = rules.get("guest_tiers", [])
        labour_fee = rules.get("labour_fee", 0)
        multiplier = event_multiplier_override or rules.get("event_multiplier", 1.0)

        price_per_person = 0
        for tier in tiers:
            if tier["min"] <= guest_count <= tier["max"]:
                price_per_person = tier["price_per_person"]
                break
        # If no tier matched, use the last tier's price
        if price_per_person == 0 and tiers:
            price_per_person = tiers[-1]["price_per_person"]

        subtotal = price_per_person * guest_count + labour_fee
        total = subtotal * multiplier

        return {
            "price_per_person": price_per_person,
            "guest_count": guest_count,
            "food_subtotal": price_per_person * guest_count,
            "labour_fee": labour_fee,
            "subtotal": subtotal,
            "event_multiplier": multiplier,
            "total": round(total, 2),
            "platform_fee": round(total * 0.15, 2),
            "grand_total": round(total * 1.15, 2),
        }


class BookingAssignment(models.Model):
    """
    V4: Tracks which chef was notified for a booking and their SLA status.
    Enables the priority-based auto-rotation assignment engine.
    """

    class AssignmentStatus(models.TextChoices):
        PENDING = "pending", _("Notified — Awaiting Response")
        ACCEPTED = "accepted", _("Accepted")
        DECLINED = "declined", _("Declined")
        EXPIRED = "expired", _("SLA Expired — Auto-rotated")

    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="assignments"
    )
    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="booking_assignments"
    )

    # Assignment tier (1 = menu creator, 2 = qualified pool, 3 = fallback)
    tier = models.PositiveSmallIntegerField(default=1)

    # SLA tracking
    notified_at = models.DateTimeField(auto_now_add=True)
    sla_deadline = models.DateTimeField(help_text="Auto-rotate after this time")

    status = models.CharField(
        max_length=20,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.PENDING,
    )
    responded_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-notified_at"]
        verbose_name = _("booking assignment")
        verbose_name_plural = _("booking assignments")

    def __str__(self):
        return (
            f"Assignment #{self.id} | "
            f"Booking #{self.booking.id} → {self.chef.user.full_name} "
            f"[Tier {self.tier}] [{self.status}]"
        )
