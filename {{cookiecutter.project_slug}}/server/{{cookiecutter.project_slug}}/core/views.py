from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
{% if cookiecutter.client_app == "Vue3" -%}
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
{% endif -%}
from django.template.loader import render_to_string
{% if cookiecutter.use_graphql == 'y' -%}
from django.template.response import TemplateResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie
{% endif -%}
from rest_framework import generics, mixins, permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from {{cookiecutter.project_slug}}.utils.emails import send_html_email

from .models import User
from .permissions import CreateOnlyPermissions
from .serializers import UserLoginSerializer, UserRegistrationSerializer, UserSerializer

{% if cookiecutter.use_graphql == 'y' %}
# Serve React frontend
@ensure_csrf_cookie
@never_cache
def index(request):
    return TemplateResponse(request, ["index.html", "core/index-placeholder.html"])
{% elif cookiecutter.client_app.lower() == 'None' %}
def index(request):
    return redirect(to="/docs/swagger/")
{% else %}
def index(request):
    try:
        return render(request, "index.html")
    except TemplateDoesNotExist:
        return render(request, "core/index-placeholder.html")
{% endif %}

class UserLoginView(generics.GenericAPIView):
    swagger_schema = None
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
    swagger_schema = None
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


@api_view(["get"])
@permission_classes([permissions.AllowAny])
def request_reset_link(request, *args, **kwargs):
    email = kwargs.get("email")
    user = User.objects.filter(email=email).first()
    if not user:
        return Response(status=status.HTTP_204_NO_CONTENT)
    reset_context = user.reset_password_context()

    # send email
    subject = render_to_string("registration/forgot_password_subject.txt")
    send_html_email(
        subject,
        "registration/forgot_password_email.html",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        context=reset_context,
    )

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["post"])
@permission_classes([permissions.AllowAny])
def reset_password(request, *args, **kwargs):
    id = kwargs.get("id")
    token = kwargs.get("token")
    user = User.objects.filter(id=id).first()
    if not user or not token:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    is_valid = default_token_generator.check_token(user, token)
    if not is_valid:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    user.set_password(request.data.get("password"))
    u = UserLoginSerializer.login(user, request)
    return Response(status=status.HTTP_200_OK, data=u)
