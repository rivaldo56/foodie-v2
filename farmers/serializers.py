from rest_framework import serializers
from .models import FarmerProfile, FarmProduct
from users.serializers import UserSerializer

class FarmerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = FarmerProfile
        fields = ['id', 'user', 'farm_name', 'location', 'bio', 'is_verified', 'created_at']
        read_only_fields = ['is_verified', 'created_at']

class FarmProductSerializer(serializers.ModelSerializer):
    farmer_name = serializers.CharField(source='farmer.farm_name', read_only=True)
    
    class Meta:
        model = FarmProduct
        fields = [
            'id', 'farmer', 'farmer_name', 'name', 'category', 'description', 
            'price_per_unit', 'unit', 'quantity_available', 'image', 
            'is_available', 'created_at'
        ]
        read_only_fields = ['farmer', 'created_at']

    def create(self, validated_data):
        # Automatically assign the product to the logged-in farmer
        request = self.context.get('request')
        if request and hasattr(request.user, 'farmer_profile'):
            validated_data['farmer'] = request.user.farmer_profile
        return super().create(validated_data)
