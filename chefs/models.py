from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from users.models import User


class ChefProfile(models.Model):
    """
    Extended profile for chefs.
    Stores professional details, availability, and ratings.
    """

    class ExperienceLevel(models.TextChoices):
        BEGINNER = "beginner", _("0-2 years")
        INTERMEDIATE = "intermediate", _("3-5 years")
        EXPERIENCED = "experienced", _("6-10 years")
        EXPERT = "expert", _("10+ years")

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="chef_profile"
    )
    bio = models.TextField(max_length=1000, blank=True)
    specialties = models.JSONField(
        default=list, blank=True
    )  # e.g., ['italian', 'french']
    experience_level = models.CharField(
        max_length=20, choices=ExperienceLevel.choices, default=ExperienceLevel.BEGINNER
    )
    years_of_experience = models.PositiveIntegerField(default=0)
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    service_radius = models.PositiveIntegerField(
        default=10, help_text=_("Service radius in miles")
    )

    # Location
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )

    # Verification and ratings
    is_verified = models.BooleanField(default=False)
    background_check_completed = models.BooleanField(default=False)
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(5.00)],
    )
    total_reviews = models.PositiveIntegerField(default=0)
    total_bookings = models.PositiveIntegerField(default=0)

    # Availability
    is_available = models.BooleanField(default=True)
    availability_schedule = models.JSONField(
        default=dict, blank=True
    )  # Weekly schedule

    # Portfolio
    portfolio_images = models.JSONField(default=list, blank=True)  # URLs to images
    certifications = models.JSONField(
        default=list, blank=True
    )  # Culinary certifications (legacy field)
    culinary_paths = models.JSONField(
        default=list, blank=True
    )  # e.g. ['Private Dining', 'Catering']
    document_uploads = models.JSONField(
        default=list, blank=True
    )  # Uploaded cert document URLs
    identity_verification_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("verified", "Verified"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-average_rating", "-total_bookings"]
        verbose_name = _("chef profile")
        verbose_name_plural = _("chef profiles")

    def __init__(self, *args, **kwargs):
        # Support experience_years as alias for years_of_experience
        if "experience_years" in kwargs:
            kwargs["years_of_experience"] = kwargs.pop("experience_years")
        super().__init__(*args, **kwargs)

    def __str__(self):
        return f"Chef {self.user.full_name} - {self.get_experience_level_display()}"

    @property
    def rating_display(self):
        return f"{self.average_rating}/5.0 ({self.total_reviews} reviews)"

    @property
    def experience_years(self):
        """Alias for years_of_experience to support test compatibility"""
        return self.years_of_experience

    @property
    def get_badge(self):
        """Calculate chef badge based on performance"""
        # Optimization: Use annotated dish_count if available to avoid N+1 query
        if hasattr(self, "dish_count"):
            dish_count = self.dish_count
        else:
            # Avoid circular import
            from bookings.models import MenuItem

            dish_count = MenuItem.objects.filter(chef=self).count()

        # Badge Logic
        if dish_count >= 20 and self.average_rating >= 4.8:
            return "michelin"  # Michelin Star
        elif dish_count >= 5 and self.average_rating >= 4.0:
            return "rising"  # Rising Chef
        else:
            return "new"  # New Chef


class ChefCertification(models.Model):
    """
    Chef certifications and credentials.
    Stores verified documents for chefs.
    """

    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="chef_certifications"
    )
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    certificate_image = models.ImageField(
        upload_to="certifications/", blank=True, null=True
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.chef.user.full_name} - {self.name}"


class ChefReview(models.Model):
    """
    Reviews for chefs.
    Links a client, a chef, and a specific booking.
    """

    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="reviews"
    )
    client = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="chef_reviews_given"
    )
    booking = models.OneToOneField(
        "bookings.Booking", on_delete=models.CASCADE, related_name="review"
    )

    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(max_length=1000, blank=True)
    food_quality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    professionalism = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    punctuality = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], null=True, blank=True
    )
    platform_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)], 
        null=True, 
        blank=True,
        help_text=_("How would you rate the Foodie platform experience?")
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["chef", "client", "booking"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review for {self.chef.user.full_name} by {self.client.full_name} - {self.rating}/5"


class FavoriteChef(models.Model):
    """
    User's favorite chefs.
    Allows clients to bookmark chefs they like.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="favorite_chefs"
    )
    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="favorited_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "chef"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.full_name} favorites {self.chef.user.full_name}"


class ChefEvent(models.Model):
    """
    Personal events for chefs (e.g., vacation, prep time).
    Used to block off time on their calendar.
    """

    chef = models.ForeignKey(
        ChefProfile, on_delete=models.CASCADE, related_name="events"
    )
    title = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    description = models.TextField(blank=True)
    is_all_day = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_time"]

    def __str__(self):
        return f"{self.chef.user.full_name} - {self.title}"


class ChefOnboarding(models.Model):
    """
    Temporary storage for chef onboarding data.
    """

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="chef_onboarding"
    )
    culinary_paths = models.JSONField(default=list, blank=True)
    specialties = models.JSONField(default=list, blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    portfolio_media = models.JSONField(default=list, blank=True)  # List of URLs
    availability_options = models.JSONField(default=list, blank=True)
    pricing_tier = models.CharField(max_length=50, blank=True)
    certifications = models.JSONField(default=list, blank=True)
    identity_verification_status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("verified", "Verified"),
            ("rejected", "Rejected"),
        ],
        default="pending",
    )
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Onboarding - {self.user.email}"
