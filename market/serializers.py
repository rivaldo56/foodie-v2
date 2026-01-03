from rest_framework import serializers
from .models import IngredientOrder, OrderItem
from farmers.serializers import FarmProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_details = FarmProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_details', 'quantity', 'price_at_purchase']
        read_only_fields = ['price_at_purchase']

class IngredientOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    buyer_name = serializers.CharField(source='buyer.full_name', read_only=True)
    
    class Meta:
        model = IngredientOrder
        fields = ['id', 'buyer', 'buyer_name', 'total_amount', 'status', 'items', 'created_at']
        read_only_fields = ['buyer', 'total_amount', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')
        
        # Calculate total amount
        total_amount = 0
        for item in items_data:
            product = item['product']
            quantity = item['quantity']
            total_amount += product.price_per_unit * quantity
            
        order = IngredientOrder.objects.create(
            buyer=request.user,
            total_amount=total_amount,
            **validated_data
        )
        
        for item_data in items_data:
            OrderItem.objects.create(
                order=order,
                price_at_purchase=item_data['product'].price_per_unit,
                **item_data
            )
            
        return order
