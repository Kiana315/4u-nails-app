from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAuthenticatedCustom(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_staff or user.is_superuser)
        )

class IsTechnician(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'tech')

class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == 'customer')

class IsOwnerOrAdminOrAssignedTech(BasePermission):
    """For Appointment objects."""
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        role = getattr(request.user, 'role', None)
        if role == 'admin':
            return True
        if role == 'tech':
            return obj.technician_id == getattr(request.user, 'technician_profile_id', None)
        # customer
        return obj.customer_id == request.user.id

class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
