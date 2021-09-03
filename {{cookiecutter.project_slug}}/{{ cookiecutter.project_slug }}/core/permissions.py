from rest_framework import permissions
from rest_framework.exceptions import MethodNotAllowed


class CreateOnlyPermissions(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == "create":
            return True
        return False


class UserViewSetPermissions(permissions.BasePermission):
    """
    Permissions for UserViewSet (C=Create R=Retrieve L=List U=Update D=Delete)
        Role Applied:
            - Only anonymous users can create an User [C]
            - Admins can access Users [CRUL]
            - Both admins and user can retrieve account only the users can retrieve them selfs only [R]
            - Both users and admins can retrieve and update [RU]
    """

    def has_permission(self, request, view):
        if request.method == "DELETE":
            return MethodNotAllowed(request.method)
        # only anonymous users can create
        if request.user.is_anonymous and (view.action == "create" or view.action == "check_email"):
            return True
        elif bool(request.user and request.user.is_authenticated):
            # only admins can list users
            if view.action == "list":
                return True
            # both admins and user can retrieve only the users can retrieve them selfs only
            # admins and user can 'update' and 'partial_update'
            # Users can call these extra actions 'get_payment_methods','update_default_payment_method'.
            # 'update_default_card_billing_address'
            if view.action in (
                "me",
                "check_email",
                "update",
                "partial_update",
                "retrieve",
                {%- if cookiecutter.use_stripe == 'y' %}
                "get_payment_methods",
                "update_default_payment_method",
                "update_default_card_billing_address",
                {%- endif %}
            ):
                return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.method == "DELETE":
            return MethodNotAllowed(request.method)

        if view.action == "retrieve" or view.action == "update" or view.action == "partial_update":
            # both admins and user can retirieve/update with the users can retrieve them selfs only
            if request.user == obj or (request.user.is_staff or request.user.is_superuser):
                return True
        {%- if cookiecutter.use_stripe == 'y' %}
        # if it is a sub-action and the user is who making the request (not thhe admin)
        if request.user == obj and view.action in (
            "get_payment_methods",
            "update_default_payment_method",
            "update_default_card_billing_address",
        ):
            return True
        {%- endif %}
        # other then that not authorized
        return False


class TaskViewSetPermissions(permissions.BasePermission):

    def has_permission(self, request, view):
        if bool(request.user and request.user.is_authenticated):
            return True
        
        return False

    def has_object_permission(self, request, view, obj):
        if request.user == obj.owner or (request.user.is_staff or request.user.is_superuser):
            return True

        # other then that not authorized
        return False

