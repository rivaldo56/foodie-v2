from django.contrib import admin
from .models import Payment, Refund, ChefPayout, MpesaPayment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "booking", "client", "amount", "status", "created_at")
    list_filter = ("status", "payment_method", "created_at")
    search_fields = ("id", "client__email", "booking__id")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Refund)
class RefundAdmin(admin.ModelAdmin):
    list_display = ("id", "payment", "amount", "status", "created_at")
    list_filter = ("status", "refund_type", "created_at")
    search_fields = ("id", "payment__id")


@admin.register(ChefPayout)
class ChefPayoutAdmin(admin.ModelAdmin):
    list_display = ("id", "chef", "amount", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("id", "chef__email")


@admin.register(MpesaPayment)
class MpesaPaymentAdmin(admin.ModelAdmin):
    list_display = (
        "checkout_request_id",
        "payment",
        "phone_number",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("checkout_request_id", "phone_number", "mpesa_receipt_number")
