from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import login
from drf_writable_nested.serializers import WritableNestedModelSerializer

from rest_framework import serializers
from rest_framework.authtoken.models import Token
from {{ cookiecutter.project_slug }}.core.models import User,Task


class UserLoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(allow_blank=False, required=True)
    password = serializers.CharField(allow_blank=False, required=True)

    class Meta:
        model = User
        fields = ("email", "password")

    @staticmethod
    def login(user, request):
        """
            Log-in user and append authentication token to serialized response.
        """
        login(request, user, backend="django.contrib.auth.backends.ModelBackend")
        auth_token, _ = Token.objects.get_or_create(user=user)
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


class TaskSerializer(WritableNestedModelSerializer):
    class Meta:
        model = Task

