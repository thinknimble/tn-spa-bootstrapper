from rest_framework import permissions


class HasUserPermissions(permissions.BasePermission):
    """Admins should be able to perform any action, regular users should be able to edit and delete self."""

    def has_object_permission(self, request, view, obj):
        return request.user.is_authenticated and (request.user.is_staff or obj == request.user)
