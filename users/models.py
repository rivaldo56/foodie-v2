from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """
    Custom User model with role-based authentication.
    Extends AbstractUser to include role, phone number, and verification status.
    """
    
    class Role(models.TextChoices):
        CLIENT = 'client', _('Client')
        CHEF = 'chef', _('Chef')
        FARMER = 'farmer', _('Farmer')
        BUSINESS = 'business', _('Business')
        ADMIN = 'admin', _('Admin')
    
    # Onboarding Status
    class OnboardingStatus(models.TextChoices):
        NOT_STARTED = 'not_started', _('Not Started')
        IN_PROGRESS = 'in_progress', _('In Progress')
        COMPLETE = 'complete', _('Complete')

    email = models.EmailField(_('email address'), unique=True)
    phone_regex = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message=_("Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.")
    )
    phone_number = models.CharField(validators=[phone_regex], max_length=17, blank=True)
    role = models.CharField(
        max_length=10, 
        choices=Role.choices, 
        default=Role.CLIENT
    )
    onboarding_status = models.CharField(
        max_length=20,
        choices=OnboardingStatus.choices,
        default=OnboardingStatus.NOT_STARTED
    )
    is_verified = models.BooleanField(default=False)
    profile_picture = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    @property
    def full_name(self):
        """Returns the user's full name."""
        return f"{self.first_name} {self.last_name}".strip()


class ClientProfile(models.Model):
    """
    Extended profile for clients.
    Stores dietary preferences, allergies, and location info.
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_profile')
    dietary_preferences = models.JSONField(default=list, blank=True)  # e.g., ['vegetarian', 'gluten-free']
    allergies = models.JSONField(default=list, blank=True)  # e.g., ['nuts', 'dairy']
    preferred_cuisines = models.JSONField(default=list, blank=True)  # e.g., ['italian', 'asian']
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    zip_code = models.CharField(max_length=20, blank=True)
    emergency_contact = models.CharField(max_length=100, blank=True)
    emergency_phone = models.CharField(max_length=17, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Client Profile - {self.user.full_name}"


class ClientOnboarding(models.Model):
    """
    Temporary storage for client onboarding data.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='client_onboarding')
    preferred_cuisines = models.JSONField(default=list, blank=True)
    allergies = models.JSONField(default=list, blank=True)
    budget_range = models.CharField(max_length=100, blank=True)
    occasion_types = models.JSONField(default=list, blank=True)
    dining_frequency = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=255, blank=True)
    dietary_preferences = models.JSONField(default=list, blank=True)
    completed = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Onboarding - {self.user.email}"


class CommunicationLog(models.Model):
    """
    Tracks email and other communications sent to users.
    Ensures idempotency and provides audit trail.
    """
    class Status(models.TextChoices):
        SENT = 'sent', _('Sent')
        FAILED = 'failed', _('Failed')
        PENDING = 'pending', _('Pending')

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='communication_logs')
    communication_type = models.CharField(max_length=50)  # e.g., 'onboarding_welcome'
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    sent_at = models.DateTimeField(auto_now_add=True)
    error_message = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"{self.communication_type} - {self.user.email} ({self.status})"
