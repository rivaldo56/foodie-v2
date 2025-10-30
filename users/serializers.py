from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, ClientProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 
            'phone_number', 'role', 'password', 'password_confirm'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include email and password')


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'full_name', 'phone_number', 'role', 'is_verified', 
            'profile_picture', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'is_verified']


class ClientProfileSerializer(serializers.ModelSerializer):
    """Serializer for client profile"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ClientProfile
        fields = [
            'user', 'dietary_preferences', 'allergies', 'preferred_cuisines',
            'address', 'city', 'state', 'zip_code', 'emergency_contact',
            'emergency_phone', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ClientProfileCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating client profile"""
    
    class Meta:
        model = ClientProfile
        fields = [
            'dietary_preferences', 'allergies', 'preferred_cuisines',
            'address', 'city', 'state', 'zip_code', 'emergency_contact',
            'emergency_phone'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user information"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'profile_picture'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
