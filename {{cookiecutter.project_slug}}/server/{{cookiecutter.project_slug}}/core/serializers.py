import logging

import rollbar
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError

from .models import User

logger = logging.getLogger(__name__)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
        )
        read_only_fields = ["email"]


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(allow_blank=False, required=True)
    password = serializers.CharField(allow_blank=False, required=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
        )

    def validate_email(self, value):
        """Emails are always stored and compared in lowercase."""
        return value.lower()

    @staticmethod
    def login(user, request):
        """
        Log-in user and append authentication token to serialized response.
        """
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        auth_token, token_created = Token.objects.get_or_create(user=user)
        serializer = UserSerializer(user, context={"request": request})
        response_data = serializer.data
        response_data["token"] = auth_token.key
        return response_data


class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "password",
        )
        extra_kwargs = {
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def _validate_name(self, value):
        """
        There are MANY unique names out there, so let users input whatever they want.
        BUT...alert the devs if we see something odd.
        """
        if not "".join(value.split()).isalpha():
            message = f"User signup with non-alphabetic characters in their name: {value}"
            logger.warning(message)
            if settings.ROLLBAR_ACCESS_TOKEN:
                rollbar.report_message(message, "warning")

    def validate_first_name(self, value):
        self._validate_name(value)
        return value

    def validate_last_name(self, value):
        self._validate_name(value)
        return value

    def validate_email(self, value):
        # Normalize the email to lowercase
        email = value.lower()

        # Check allowlist if enabled
        if settings.USE_EMAIL_ALLOWLIST and email not in settings.EMAIL_ALLOWLIST:
            raise ValidationError("Invalid email")

        # Basic validation - ensure @ and . in domain part
        if "@" not in email or "." not in email.split("@")[-1]:
            raise ValidationError("Invalid email format")

        # Warn about suspicious domains but don't block
        if not any(email.endswith(c) for c in [".com", ".net", ".org", ".co.uk"]):
            message = f"Potentially risky email: {email}"
            logger.warning(message)
            if settings.ROLLBAR_ACCESS_TOKEN:
                rollbar.report_message(message, "warning")

        return email

    def validate(self, data):
        password = data.get("password")
        validate_password(password)
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
