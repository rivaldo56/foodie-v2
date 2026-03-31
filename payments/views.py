from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse
import json
from .models import Payment, Refund, ChefPayout
from .serializers import PaymentSerializer, RefundSerializer, ChefPayoutSerializer
from .mpesa_service import MpesaPaymentService


class PaymentListView(generics.ListAPIView):
    """List payments for the authenticated user"""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(client=self.request.user)


class AdminPaymentListView(generics.ListAPIView):
    """Admin only: list all payments for the platform."""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Payment.objects.all().order_by("-created_at")


class PaymentCreateView(generics.CreateAPIView):
    """Create a new payment"""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentDetailView(generics.RetrieveAPIView):
    """Retrieve payment details"""

    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(client=self.request.user)


class RefundListView(generics.ListAPIView):
    """List refunds for the authenticated user"""

    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Refund.objects.filter(payment__client=self.request.user)


class RefundCreateView(generics.CreateAPIView):
    """Create a new refund request"""

    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]


class RefundDetailView(generics.RetrieveAPIView):
    """Retrieve refund details"""

    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Refund.objects.filter(payment__client=self.request.user)


class ProcessRefundView(generics.UpdateAPIView):
    """Process a refund (Admin/Staff only)"""

    serializer_class = RefundSerializer
    permission_classes = [permissions.IsAuthenticated]
    # TODO: Add IsAdmin or IsStaff permission

    def get_queryset(self):
        return Refund.objects.all()


class ChefPayoutListView(generics.ListAPIView):
    """List payouts for the authenticated chef"""

    serializer_class = ChefPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChefPayout.objects.filter(chef=self.request.user)


class ChefPayoutCreateView(generics.CreateAPIView):
    """Create a new payout request"""

    serializer_class = ChefPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]


class ChefPayoutDetailView(generics.RetrieveAPIView):
    """Retrieve payout details"""

    serializer_class = ChefPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChefPayout.objects.filter(chef=self.request.user)


class ProcessPayoutView(generics.UpdateAPIView):
    """Process a payout (Admin/Staff only)"""

    serializer_class = ChefPayoutSerializer
    permission_classes = [permissions.IsAuthenticated]
    # TODO: Add IsAdmin or IsStaff permission

    def get_queryset(self):
        return ChefPayout.objects.all()


# M-Pesa Payment Views
class MpesaPaymentView(generics.CreateAPIView):
    """Initiate M-Pesa payment"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        booking_id = request.data.get("booking_id")
        phone_number = request.data.get("phone_number")

        if not booking_id or not phone_number:
            return Response(
                {"error": "booking_id and phone_number are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        mpesa_service = MpesaPaymentService()
        result = mpesa_service.process_booking_payment(booking_id, phone_number)

        if result["success"]:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class MpesaStatusView(generics.RetrieveAPIView):
    """Check M-Pesa payment status"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, mpesa_payment_id, *args, **kwargs):
        mpesa_service = MpesaPaymentService()
        result = mpesa_service.check_payment_status(mpesa_payment_id)

        if result["success"]:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class MpesaCallbackView(generics.CreateAPIView):
    """Handle M-Pesa callback"""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            callback_data = json.loads(request.body)
            mpesa_service = MpesaPaymentService()
            mpesa_service.handle_callback(callback_data)

            return HttpResponse("OK", status=200)
        except Exception:
            return HttpResponse("Error", status=400)


# Stripe webhook disabled - using M-Pesa only
# @method_decorator(csrf_exempt, name='dispatch')
# class StripeWebhookView(generics.CreateAPIView):
#     permission_classes = [permissions.AllowAny]
#
#     def post(self, request, *args, **kwargs):
#         payload = request.body
#         sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
#
#         result = WebhookService.handle_stripe_webhook(payload, sig_header)
#
#         if result['success']:
#             return HttpResponse("OK", status=200)
#         else:
#             return HttpResponse("Error", status=400)


class PaystackInitializeView(generics.CreateAPIView):
    """Scaffold for Paystack Payment Initialization"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Implementation to follow
        return Response(
            {"message": "Paystack initialization endpoint scaffolded"}, status=200
        )


@method_decorator(csrf_exempt, name="dispatch")
class PaystackWebhookView(generics.CreateAPIView):
    """Scaffold for Paystack Webhook Verification"""

    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Implementation to verify Paystack signature and update booking status
        return HttpResponse("OK", status=200)
