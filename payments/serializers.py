from rest_framework import serializers
from .models import Payment, Refund, ChefPayout
from users.serializers import UserSerializer
from bookings.serializers import BookingSerializer


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for payments"""
    client = UserSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'booking', 'client', 'amount', 'currency', 'payment_method',
            'status', 'stripe_payment_intent_id', 'stripe_charge_id',
            'paystack_reference', 'external_transaction_id', 'platform_fee',
            'processing_fee', 'chef_payout', 'payment_metadata',
            'failure_reason', 'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'client', 'stripe_payment_intent_id', 'stripe_charge_id',
            'paystack_reference', 'external_transaction_id', 'platform_fee',
            'processing_fee', 'chef_payout', 'payment_metadata',
            'failure_reason', 'created_at', 'updated_at', 'processed_at'
        ]


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payments"""
    booking_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'booking_id', 'amount', 'currency', 'payment_method'
        ]
    
    def validate_booking_id(self, value):
        from bookings.models import Booking
        try:
            booking = Booking.objects.get(id=value)
            user = self.context['request'].user
            
            if booking.client != user:
                raise serializers.ValidationError("You can only pay for your own bookings")
            
            if booking.status != 'confirmed':
                raise serializers.ValidationError("Booking must be confirmed before payment")
            
            # Check if payment already exists
            if booking.payments.filter(status='completed').exists():
                raise serializers.ValidationError("Payment already completed for this booking")
            
            return value
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value
    
    def create(self, validated_data):
        from bookings.models import Booking
        booking_id = validated_data.pop('booking_id')
        booking = Booking.objects.get(id=booking_id)
        
        # Calculate platform fees (example: 5% platform fee + 3% processing fee)
        amount = validated_data['amount']
        platform_fee = amount * 0.05
        processing_fee = amount * 0.03
        chef_payout = amount - platform_fee - processing_fee
        
        payment = Payment.objects.create(
            booking=booking,
            client=self.context['request'].user,
            platform_fee=platform_fee,
            processing_fee=processing_fee,
            chef_payout=chef_payout,
            **validated_data
        )
        
        return payment


class RefundSerializer(serializers.ModelSerializer):
    """Serializer for refunds"""
    payment = PaymentSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    processed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'id', 'payment', 'booking', 'refund_type', 'amount', 'reason',
            'status', 'stripe_refund_id', 'external_refund_id', 'processed_by',
            'admin_notes', 'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'stripe_refund_id', 'external_refund_id', 'processed_by',
            'admin_notes', 'created_at', 'updated_at', 'processed_at'
        ]


class RefundCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating refund requests"""
    payment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Refund
        fields = [
            'payment_id', 'refund_type', 'amount', 'reason'
        ]
    
    def validate_payment_id(self, value):
        try:
            payment = Payment.objects.get(id=value)
            user = self.context['request'].user
            
            if payment.client != user:
                raise serializers.ValidationError("You can only request refunds for your own payments")
            
            if payment.status != 'completed':
                raise serializers.ValidationError("Can only refund completed payments")
            
            # Check if refund already exists
            if payment.refunds.filter(status__in=['pending', 'processing', 'completed']).exists():
                raise serializers.ValidationError("Refund already requested for this payment")
            
            return value
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found")
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Refund amount must be greater than 0")
        return value
    
    def validate(self, attrs):
        payment_id = attrs['payment_id']
        amount = attrs['amount']
        
        payment = Payment.objects.get(id=payment_id)
        if amount > payment.amount:
            raise serializers.ValidationError("Refund amount cannot exceed payment amount")
        
        return attrs
    
    def create(self, validated_data):
        payment_id = validated_data.pop('payment_id')
        payment = Payment.objects.get(id=payment_id)
        
        refund = Refund.objects.create(
            payment=payment,
            booking=payment.booking,
            **validated_data
        )
        
        return refund


class ChefPayoutSerializer(serializers.ModelSerializer):
    """Serializer for chef payouts"""
    chef = UserSerializer(read_only=True)
    booking = BookingSerializer(read_only=True)
    payment = PaymentSerializer(read_only=True)
    processed_by = UserSerializer(read_only=True)
    
    class Meta:
        model = ChefPayout
        fields = [
            'id', 'chef', 'booking', 'payment', 'amount', 'currency', 'status',
            'bank_account_number', 'bank_routing_number', 'bank_name',
            'stripe_transfer_id', 'external_payout_id', 'processed_by',
            'admin_notes', 'created_at', 'updated_at', 'processed_at'
        ]
        read_only_fields = [
            'id', 'chef', 'booking', 'payment', 'stripe_transfer_id',
            'external_payout_id', 'processed_by', 'admin_notes',
            'created_at', 'updated_at', 'processed_at'
        ]


class ChefPayoutCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating chef payouts"""
    payment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ChefPayout
        fields = [
            'payment_id', 'amount', 'currency', 'bank_account_number',
            'bank_routing_number', 'bank_name'
        ]
    
    def validate_payment_id(self, value):
        try:
            payment = Payment.objects.get(id=value)
            
            if payment.status != 'completed':
                raise serializers.ValidationError("Payment must be completed before payout")
            
            # Check if payout already exists
            if payment.chef_payouts.filter(status__in=['pending', 'processing', 'completed']).exists():
                raise serializers.ValidationError("Payout already exists for this payment")
            
            return value
        except Payment.DoesNotExist:
            raise serializers.ValidationError("Payment not found")
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Payout amount must be greater than 0")
        return value
    
    def validate(self, attrs):
        payment_id = attrs['payment_id']
        amount = attrs['amount']
        
        payment = Payment.objects.get(id=payment_id)
        if amount > payment.chef_payout:
            raise serializers.ValidationError("Payout amount cannot exceed chef payout amount")
        
        return attrs
    
    def create(self, validated_data):
        payment_id = validated_data.pop('payment_id')
        payment = Payment.objects.get(id=payment_id)
        
        payout = ChefPayout.objects.create(
            chef=payment.booking.chef.user,
            booking=payment.booking,
            payment=payment,
            **validated_data
        )
        
        return payout


class PaymentIntentSerializer(serializers.Serializer):
    """Serializer for creating Stripe payment intent"""
    booking_id = serializers.IntegerField()
    
    def validate_booking_id(self, value):
        from bookings.models import Booking
        try:
            booking = Booking.objects.get(id=value)
            user = self.context['request'].user
            
            if booking.client != user:
                raise serializers.ValidationError("You can only create payment intent for your own bookings")
            
            if booking.status != 'confirmed':
                raise serializers.ValidationError("Booking must be confirmed before payment")
            
            return value
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found")
