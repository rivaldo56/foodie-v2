from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ClientProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'role', 'is_verified', 'date_joined']
    list_filter = ['role', 'is_verified', 'is_active', 'date_joined']
    search_fields = ['email', 'username', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {
            'fields': ('phone_number', 'role', 'is_verified', 'profile_picture')
        }),
    )
    
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Fields', {
            'fields': ('email', 'phone_number', 'role', 'is_verified')
        }),
    )


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'city', 'state', 'created_at']
    list_filter = ['city', 'state', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'city']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = [
        ('User Information', {
            'fields': ['user']
        }),
        ('Preferences', {
            'fields': ['dietary_preferences', 'allergies', 'preferred_cuisines']
        }),
        ('Location', {
            'fields': ['address', 'city', 'state', 'zip_code']
        }),
        ('Emergency Contact', {
            'fields': ['emergency_contact', 'emergency_phone']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
