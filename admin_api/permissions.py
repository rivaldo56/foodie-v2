from rest_framework import permissions
from users.models import User


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to users with 'admin' role or superusers.
    """

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        return (
            request.user.role == User.Role.ADMIN
            or request.user.is_staff
            or request.user.is_superuser
        )
