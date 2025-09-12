from rest_framework import permissions


class HasUserPermissions(permissions.BasePermission):
    """Admins should be able to perform any action, regular users should be able to edit and delete self."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (request.user.is_staff or obj == request.user)


class IsStaffOrReadOnly(permissions.BasePermission):
    """Allow read-only access for authenticated users, but require staff for list actions."""

    def has_permission(self, request, view):
        # Allow unauthenticated access for create action (user registration)
        if view.action == "create":
            return True

        if not request.user.is_authenticated:
            return False

        # For list actions, require staff permission
        if view.action == "list":
            return request.user.is_staff

        # For other actions, use the existing permission logic
        return True
