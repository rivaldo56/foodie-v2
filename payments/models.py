from django.db import models
from django.core.validators import MinValueValidator
from django.utils.translation import gettext_lazy as _
from users.models import User
from bookings.models import Booking


class Payment(models.Model):
    """
    Payment transactions for bookings.
    Tracks payments made by clients.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')
        REFUNDED = 'refunded', _('Refunded')
        PARTIALLY_REFUNDED = 'partially_refunded', _('Partially Refunded')
    
    class PaymentMethod(models.TextChoices):
        MPESA = 'mpesa', _('M-Pesa')
        BANK_TRANSFER = 'bank_transfer', _('Bank Transfer')
        CASH = 'cash', _('Cash')
    
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='payments')
    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments_made')
    
    # Payment details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    currency = models.CharField(max_length=3, default='KES')
    payment_method = models.CharField(
        max_length=20, 
        choices=PaymentMethod.choices, 
        default=PaymentMethod.MPESA
    )
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    
    # External payment provider details
    external_transaction_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Platform fees
    platform_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    processing_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    chef_payout = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Metadata
    payment_metadata = models.JSONField(default=dict, blank=True)
    failure_reason = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('payment')
        verbose_name_plural = _('payments')
    
    def __str__(self):
        return f"Payment #{self.id} - {self.amount} {self.currency} - {self.status}"
    
    @property
    def is_successful(self):
        return self.status == self.Status.COMPLETED


class Refund(models.Model):
    """
    Refund transactions.
    Tracks refunds issued to clients.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')
    
    class RefundType(models.TextChoices):
        FULL = 'full', _('Full Refund')
        PARTIAL = 'partial', _('Partial Refund')
        CANCELLATION = 'cancellation', _('Cancellation Refund')
    
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='refunds')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='refunds')
    
    # Refund details
    refund_type = models.CharField(
        max_length=20, 
        choices=RefundType.choices, 
        default=RefundType.FULL
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    reason = models.TextField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    
    # External refund details
    external_refund_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Processing
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_refunds')
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('refund')
        verbose_name_plural = _('refunds')
    
    def __str__(self):
        return f"Refund #{self.id} - {self.amount} - {self.status}"


class ChefPayout(models.Model):
    """
    Payouts to chefs.
    Tracks payments made to chefs after service completion.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PROCESSING = 'processing', _('Processing')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')
    
    chef = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payouts')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='chef_payouts')
    payment = models.ForeignKey(Payment, on_delete=models.CASCADE, related_name='chef_payouts')
    
    # Payout details
    amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    currency = models.CharField(max_length=3, default='KES')
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    
    # Bank details (encrypted in production)
    bank_account_number = models.CharField(max_length=50, blank=True)
    bank_routing_number = models.CharField(max_length=20, blank=True)
    bank_name = models.CharField(max_length=100, blank=True)
    
    # External payout details
    external_payout_id = models.CharField(max_length=200, blank=True, null=True)
    
    # Processing
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_payouts')
    admin_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('chef payout')
        verbose_name_plural = _('chef payouts')
    
    def __str__(self):
        return f"Payout #{self.id} - {self.chef.full_name} - {self.amount} {self.currency}"


class MpesaPayment(models.Model):
    """
    M-Pesa specific payment details.
    Stores metadata from M-Pesa API.
    """
    
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        COMPLETED = 'completed', _('Completed')
        FAILED = 'failed', _('Failed')
        CANCELLED = 'cancelled', _('Cancelled')

    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='mpesa_payment')
    phone_number = models.CharField(max_length=15)
    checkout_request_id = models.CharField(max_length=255, unique=True)
    merchant_request_id = models.CharField(max_length=255)
    mpesa_receipt_number = models.CharField(max_length=255, blank=True, null=True)
    transaction_date = models.CharField(max_length=20, blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    failure_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('M-Pesa payment')
        verbose_name_plural = _('M-Pesa payments')

    def __str__(self):
        return f"M-Pesa Payment {self.checkout_request_id} - {self.status}"
