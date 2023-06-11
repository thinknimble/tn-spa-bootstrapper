import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from {{cookiecutter.project_slug}}.utils.emails import send_html_email
from {{cookiecutter.project_slug}}.utils.misc import random_pin_generator

from .models import User, UserResetPasswordCode
from .permissions import CreateOnlyPermissions
from .serializers import (
    CodeResetPasswordSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


class UserLoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    authentication_classes = ()
    permission_classes = ()

    def post(self, request, *args, **kwargs):
        """
        Validate user credentials, login, and return serialized user + auth token.
        """
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        # If the serializer is valid, then the email/password combo is valid.
        # Get the user entity, from which we can get (or create) the auth token
        user = authenticate(**serializer.validated_data)
        if user is None:
            raise ValidationError(detail="Incorrect email and password combination. Please try again.")

        response_data = UserLoginSerializer.login(user, request)
        return Response(response_data)


class UserViewSet(
    viewsets.GenericViewSet,
    mixins.RetrieveModelMixin,
    mixins.ListModelMixin,
    mixins.UpdateModelMixin,
):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    # No auth required to create user
    # Auth required for all other actions
    permission_classes = (permissions.IsAuthenticated | CreateOnlyPermissions,)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Endpoint to create/register a new user.
        """
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()  # This calls .create() on serializer
        user = serializer.instance

        # Log-in user and re-serialize response
        response_data = UserLoginSerializer.login(user, request)
        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """
        Endpoint to create/register a new user.
        """
        serializer = UserSerializer(data=request.data, instance=self.get_object(), partial=True)

        serializer.is_valid(raise_exception=True)
        serializer.save()
        user = serializer.data

        return Response(user, status=status.HTTP_200_OK)


@api_view(["post"])
@permission_classes([])
@authentication_classes([])
def request_reset_link(request, *args, **kwargs):
    email = request.data.get("email")
    user = User.objects.filter(email=email).first()
    if not user:
        return Response(status=status.HTTP_204_NO_CONTENT)
    reset_context = user.reset_password_context()

    send_html_email(
        "Password reset for {{ cookiecutter.project_name }}",
        "registration/password_reset.html",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        context=reset_context,
    )

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["post"])
@permission_classes([permissions.AllowAny])
def reset_password(request, *args, **kwargs):
    user_id = kwargs.get("uid")
    token = kwargs.get("token")
    user = User.objects.filter(id=user_id).first()
    if not user or not token:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    is_valid = default_token_generator.check_token(user, token)
    if not is_valid:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    logger.info(f"Resetting password for user {user_id}")
    user.set_password(request.data.get("password"))
    user.save()
    response_data = UserLoginSerializer.login(user, request)
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(["get"])
@permission_classes([permissions.AllowAny])
def request_reset_code(request, *args, **kwargs):
    email = kwargs.get("email")
    user = User.objects.filter(email=email).first()
    if not user:
        raise ValidationError(detail={"non_field_errors": ["User not found with that email"]})
    UserResetPasswordCode.objects.create_code(user=user, code=random_pin_generator(count=5))
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["post"])
@permission_classes([permissions.AllowAny])
def reset_password_with_code(request, *args, **kwargs):
    email = kwargs.get("email")
    user = User.objects.filter(email=email).first()
    if not user:
        raise ValidationError(detail={"non_field_errors": ["User not found with that email"]})
    serializer = CodeResetPasswordSerializer(data=request.data, context={"user": user})
    serializer.is_valid(raise_exception=True)

    code_from_db = serializer.context.get("code_from_db")
    code_from_db.is_used = True
    code_from_db.save()

    user.set_password(request.data.get("password"))
    user.save()

    u = UserLoginSerializer.login(user, request)
    return Response(status=status.HTTP_200_OK, data=u)
