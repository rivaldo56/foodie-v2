import unittest
from decimal import Decimal
from unittest.mock import patch, Mock
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework.authtoken.models import Token

from bookings.models import Booking
from chefs.models import ChefProfile
from payments.models import Payment, MpesaPayment
from payments.mpesa_service import MpesaService, MpesaPaymentService

User = get_user_model()


@unittest.skip("Legacy Stripe disabled - services removed")
class StripePaymentServiceTestCase(TestCase):
    """Test cases for Stripe payment service (Legacy)"""
    pass


class MpesaServiceTestCase(TestCase):
    """Test cases for M-Pesa service"""

    def setUp(self):
        self.mpesa_service = MpesaService()
        self.user = User.objects.create_user(
            email="client@example.com",
            username="client",
            password="testpass123",
            role="client",
        )

    @patch("requests.get")
    def test_get_access_token_success(self, mock_get):
        """Test successful access token retrieval"""
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"access_token": "test_token_123"}
        mock_get.return_value = mock_response

        result = self.mpesa_service.get_access_token()

        self.assertTrue(result["success"])
        self.assertEqual(result["access_token"], "test_token_123")

    @patch("requests.get")
    def test_get_access_token_failure(self, mock_get):
        """Test access token retrieval failure"""
        mock_response = Mock()
        mock_response.status_code = 400
        mock_response.text = "Error message"
        mock_get.return_value = mock_response

        result = self.mpesa_service.get_access_token()

        self.assertFalse(result["success"])
        self.assertIn("error", result)

    def test_generate_password(self):
        """Test password generation for STK push"""
        timestamp = "20231201120000"
        password = self.mpesa_service.generate_password(timestamp)

        self.assertIsInstance(password, str)
        self.assertTrue(len(password) > 0)

    @patch.object(MpesaService, "get_access_token")
    @patch("requests.post")
    def test_initiate_stk_push_success(self, mock_post, mock_token):
        """Test successful STK push initiation"""
        mock_token.return_value = {"success": True, "access_token": "test_token"}

        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "ResponseCode": "0",
            "CheckoutRequestID": "ws_CO_test123",
            "MerchantRequestID": "mr_test123",
            "ResponseDescription": "Success",
        }
        mock_post.return_value = mock_response

        result = self.mpesa_service.initiate_stk_push(
            phone_number="254712345678",
            amount=100,
            account_reference="TEST123",
            transaction_desc="Test payment",
        )

        self.assertTrue(result["success"])
        self.assertEqual(result["checkout_request_id"], "ws_CO_test123")
        self.assertEqual(result["merchant_request_id"], "mr_test123")


class PaymentAPITestCase(APITestCase):
    """Test cases for payment API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            email="client@example.com",
            username="client",
            password="testpass123",
            role="client",
        )

        self.chef_user = User.objects.create_user(
            email="chef@example.com",
            username="chef",
            password="testpass123",
            role="chef",
        )

        self.chef_profile = ChefProfile.objects.create(
            user=self.chef_user,
            bio="Test chef",
            experience_years=5,
            hourly_rate=Decimal("50.00"),
        )

        self.booking = Booking.objects.create(
            client=self.user,
            chef=self.chef_profile,
            booking_date="2024-01-15T18:00:00Z",
            number_of_guests=4,
            base_price=Decimal("200.00"),
            total_amount=Decimal("200.00"),
            status="pending",
        )

        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)

    def test_payment_list_authenticated(self):
        """Test payment list for authenticated user"""
        # Create a payment for the user
        Payment.objects.create(
            booking=self.booking,
            client=self.user,
            amount=Decimal("210.00"),
            platform_fee=Decimal("10.00"),
            status="completed",
        )

        response = self.client.get("/api/payments/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["results"]), 1)

    def test_payment_list_unauthenticated(self):
        """Test payment list for unauthenticated user"""
        self.client.credentials()  # Remove authentication
        response = self.client.get("/api/payments/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch.object(MpesaPaymentService, "process_booking_payment")
    def test_mpesa_payment_creation_success(self, mock_process):
        """Test successful M-Pesa payment creation"""
        mock_process.return_value = {
            "success": True,
            "payment_id": 1,
            "mpesa_payment_id": 1,
            "checkout_request_id": "ws_CO_test123",
            "message": "STK push sent",
        }

        data = {"booking_id": self.booking.id, "phone_number": "254712345678"}

        response = self.client.post("/api/payments/mpesa/pay/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["checkout_request_id"], "ws_CO_test123")

    def test_mpesa_payment_missing_data(self):
        """Test M-Pesa payment with missing required data"""
        data = {
            "booking_id": self.booking.id
            # Missing phone_number
        }

        response = self.client.post("/api/payments/mpesa/pay/", data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)

    @patch.object(MpesaPaymentService, "check_payment_status")
    def test_mpesa_status_check(self, mock_check):
        """Test M-Pesa payment status check"""
        # Create M-Pesa payment
        payment = Payment.objects.create(
            booking=self.booking,
            client=self.user,
            amount=Decimal("210.00"),
            platform_fee=Decimal("10.00"),
            payment_method="mpesa",
            status="pending",
        )

        mpesa_payment = MpesaPayment.objects.create(
            payment=payment,
            phone_number="254712345678",
            checkout_request_id="ws_CO_test123",
            merchant_request_id="mr_test123",
            status="pending",
        )

        mock_check.return_value = {
            "success": True,
            "status": "completed",
            "receipt_number": "MPesa123",
        }

        response = self.client.get(f"/api/payments/mpesa/status/{mpesa_payment.id}/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        self.assertEqual(response.data["status"], "completed")


@unittest.skip("Legacy Stripe disabled - services removed")
class PaymentProcessingTestCase(TestCase):
    """Legacy Payment Processing tests - skipped"""
    pass
