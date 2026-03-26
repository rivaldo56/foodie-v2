import requests
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

class PaystackService:
    """
    Service for integrating with Paystack API.
    Handles payment initialization, verification, and webhook processing.
    """
    
    def __init__(self):
        self.secret_key = getattr(settings, 'PAYSTACK_SECRET_KEY', 'sk_test_mock')
        self.base_url = "https://api.paystack.co"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
        
    def initialize_payment(self, email: str, amount: Decimal, reference: str, metadata: dict = None) -> dict:
        """
        Initialize a payment transaction with Paystack.
        Amount must be provided in standard currency unit (e.g. KES, NGN). It will be converted to lowest denomination (kobo/cents).
        """
        try:
            # Convert to strictly integer lowest denomination (multiply by 100)
            amount_in_kobo = int(amount * Decimal('100'))
            
            payload = {
                "email": email,
                "amount": amount_in_kobo,
                "reference": reference,
                "currency": "KES", # Default to KES for Foodie V2 context
            }
            
            if metadata:
                payload["metadata"] = metadata
                
            response = requests.post(
                f"{self.base_url}/transaction/initialize",
                json=payload,
                headers=self.headers
            )
            response.raise_for_status()
            
            data = response.json()
            return {
                "success": data.get("status"),
                "authorization_url": data["data"].get("authorization_url"),
                "access_code": data["data"].get("access_code"),
                "reference": data["data"].get("reference")
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack initialization failed for {email}: {str(e)}")
            return {"success": False, "error": str(e)}

    def verify_payment(self, reference: str) -> dict:
        """
        Verify the status of a Paystack transaction using its reference.
        """
        try:
            response = requests.get(
                f"{self.base_url}/transaction/verify/{reference}",
                headers=self.headers
            )
            response.raise_for_status()
            
            data = response.json()
            return {
                "success": data.get("status"),
                "transaction_status": data["data"].get("status"),
                "gateway_response": data["data"].get("gateway_response"),
                "amount_paid": Decimal(data["data"].get("amount")) / Decimal('100')
            }
        except requests.exceptions.RequestException as e:
            logger.error(f"Paystack verification failed for {reference}: {str(e)}")
            return {"success": False, "error": str(e)}

paystack_service = PaystackService()
