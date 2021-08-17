
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import login
from drf_writable_nested.serializers import WritableNestedModelSerializer

from rest_framework import  serializers
from rest_framework.authtoken.models import Token
from {{ cookiecutter.project_slug }}.core.models import User





class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(allow_blank=False, required=True)
    password = serializers.CharField(allow_blank=False, required=True)

    class Meta:
        model = User
        fields = ("email", "password")

    # def validate_email(self, value):
    #     """Emails are always stored and compared in lowercase."""
    #     return value.lower()

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


class UserRegistrationSerializer(WritableNestedModelSerializer):

    class Meta:
        model = User
        fields = ("first_name", "last_name", "email", "password",)
        extra_kwargs = {
            "first_name": {"required": True}, "last_name": {"required": True}, "password": {"write_only": True},
        }
    def validate_password(self, password):
        validate_password(password)
        return password

    def create(self, validated_data):
        user = User.objects.create_user( **validated_data)
        return user







class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        exclude = (
            "password",
            "user_permissions",
            "groups",
        )
        extra_kwargs = {
            "is_removed": {"read_only": True},
            "invited_by": {"read_only": True},
            "is_superuser": {"read_only": True},
            "is_staff": {"read_only": True},
            "is_active": {"read_only": True},
            "date_joined": {"read_only": True},
            "last_login": {"read_only": True},
            "created_by": {"read_only": True},
            "is_owner": {"read_only": True},
            "date_archived": {"read_only": True},
        }


# Helper ser


class ResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    title = serializers.CharField()
    data = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    meta = serializers.CharField(required=False)
    code = serializers.CharField()  # code to identifiy the response
    title = serializers.CharField()  # human readable resonse status
    errors = serializers.JSONField()
