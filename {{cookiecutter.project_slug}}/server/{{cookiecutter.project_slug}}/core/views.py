import logging
from typing import Any

from django.apps import apps
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.db import transaction
from django.http import Http404
from django.shortcuts import render
from django.template import TemplateDoesNotExist
from rest_framework import generics, mixins, permissions, status, views, viewsets
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from {{ cookiecutter.project_slug }}.utils.emails import send_html_email

from .forms import PreviewTemplateForm
from .models import User
from .permissions import HasUserPermissions
from .serializers import UserLoginSerializer, UserRegistrationSerializer, UserSerializer

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


class UserViewSet(viewsets.GenericViewSet, mixins.RetrieveModelMixin):
    queryset = User.objects
    serializer_class = UserSerializer

    # No auth required to create user
    # Auth required for all other actions
    permission_classes = (HasUserPermissions,)

    def get_queryset(self):
        """
        Users should only find themselves by default
        """
        return super().get_queryset().for_user(self.request.user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Log-in user and re-serialize response
        response_data = UserLoginSerializer.login(user, request)
        return Response(response_data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data, instance=self.get_object(), partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        """
        When deleting a user's account, just disable their account first
        The user may have a regret and try to get their account back
        A background job should then properly delete the data after X days
        """
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
    user = User.objects.filter(pk=user_id).first()
    if not user or not token:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    is_valid = default_token_generator.check_token(user, token)
    if not is_valid:
        raise ValidationError(detail={"non-field-error": "Invalid or expired token"})
    logger.info(f"Resetting password for user {user_id}")
    user.set_password(request.data.get("password"))
    user.save()
    # COMMENT THIS WHEN USING THE PASSWORD RESET FLOW ON WEB ONLY FOR MOBILE - PARI BAKER
    response_data = UserLoginSerializer.login(user, request)
    return Response(response_data, status=status.HTTP_200_OK)


class PreviewTemplateView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        return self.preview_template_view(request, form=PreviewTemplateForm())

    def post(self, request):
        return self.preview_template_view(request, form=PreviewTemplateForm(data=request.data))

    def preview_template_view(self, request, form: PreviewTemplateForm):
        if not settings.DEBUG:
            raise Http404
        context = {}
        self.fill_context_from_params(context, request.query_params)
        self.fill_context_from_params(context, request.data)
        try:
            if form.is_bound:
                if not form.is_valid():
                    raise ValidationError(form.errors)
                send_html_email(
                    "Template Preview", context["template"], settings.DEFAULT_FROM_EMAIL, form.cleaned_data["_send_to"], context=context
                )
                return Response(status=204)
            context["email_form"] = form
            return render(request, "core/preview.html", context=context)
        except (TypeError, TemplateDoesNotExist):
            raise ValidationError(detail=f"Invalid template name: {context['template']}")
        except KeyError as ex:
            if "template" in ex.args:
                raise ValidationError(detail="You must provide a template name.")

    def fill_context_from_params(self, context: dict, args: dict):
        """
        Provide support for nested dicts using Django's __ notation and also to parse models from IDs.
        i.e.:
            - ?param=val&parent__child=5 -> {"param": "val", "parent": {'child': 5}}
            - JSON Body: {"param": val, "parent__child": 5} -> {"param": val, "parent": {"child": 5}}
            - ?user:from_model=core.User:USER_ID -> {"user": User.objects.get(pk=USER_ID)}
        """
        for argument, value in args.items():
            obj_to_fill = context
            nested_keys = argument.split("__")
            last_key = nested_keys.pop()
            for subkey in nested_keys:
                # This loop is the magic to support nested keys.
                # It makes each key a dict inside its parent (starting from context's root)
                obj_to_fill[subkey] = obj_to_fill.get(subkey, {})
                obj_to_fill = obj_to_fill[subkey]
            key, actual_value = self.parse_value(last_key, value)
            obj_to_fill[key] = actual_value

    @staticmethod
    def parse_value(key: str, value: Any) -> Any:
        """
        Provides support for model fields.
        Model fields should be provided as: app_label.model_name:instance_pk
        """
        if key.endswith(":from_model"):
            key = key.split(":")[0]
            model, pk = value.split(":")
            value = apps.get_model(model).objects.get(pk=pk)
        return key, value
