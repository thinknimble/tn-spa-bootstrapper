from django.contrib.auth import login
from django.contrib.auth.hashers import check_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.authtoken.models import Token
from rest_framework.validators import ValidationError

from .models import User


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

    def validate(self, data):
        password = data.get("password")
        validate_password(password)

        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class CodeResetPasswordSerializer(serializers.Serializer):
    code = serializers.CharField(allow_blank=False, required=True)
    password = serializers.CharField(allow_blank=False, required=True)

    def validate_code(self, value):
        code_from_db = self.context.get("user").reset_password_codes.filter(is_deactivated=False).first()
        if not code_from_db or not code_from_db.is_valid or not check_password(str(value), code_from_db.code):
            raise ValidationError(detail=["Invalid/Expired code"])
        self.context["code_from_db"] = code_from_db
        return value

    def validate(self, data):
        password = data.get("password")
        validate_password(password)
        return data
