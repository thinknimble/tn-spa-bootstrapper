from django.conf import settings
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


class IsEmailVerified(permissions.BasePermission):
    """
    Permission to check if user's email is verified.
    Can be disabled via REQUIRE_EMAIL_VERIFICATION setting.
    Staff users bypass this check.
    """

    message = "Email verification required. Please verify your email address to continue."

    def has_permission(self, request, view):
        # If email verification is not required, allow access
        if not getattr(settings, "REQUIRE_EMAIL_VERIFICATION", False):
            return True

        # Staff users bypass verification check
        if request.user.is_staff:
            return True

        # Allow access to resend verification email endpoint
        if view.get_view_name() == "Resend Verification Email":
            return True

        # Check if user's email is verified
        return request.user.email_verified
