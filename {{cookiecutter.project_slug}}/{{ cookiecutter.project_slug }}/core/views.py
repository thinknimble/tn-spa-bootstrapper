{%- if cookiecutter.use_stripe == 'y' %}
from {{ cookiecutter.project_slug }}.core.third_party_apis import  StripeApi, get_formatted_user_payment_methods
{%- endif %}
from django.shortcuts import redirect, render
from django.contrib.auth import authenticate

from django.template.exceptions import TemplateDoesNotExist
from django.core.mail import send_mail


from rest_framework import viewsets, generics, status,mixins
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from {{ cookiecutter.project_slug }}.core.models import  User
from {{ cookiecutter.project_slug }}.core.serializers import (
    ErrorResponseSerializer,
    UserSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
)
from {{ cookiecutter.project_slug }}.core.permissions import (
    UserViewSetPermissions,
)



def index(request):
    {% if cookiecutter.client_app == 'None' %}
        {%- if cookiecutter.use_swagger == 'y' %}
    return redirect(to="/docs/swagger/")
        {%- else %}
    from django.http import HttpResponse
    return HttpResponse("<html><body><h1>Hello,{{ cookiecutter.auther_name }}, this is {{ cookiecutter.project_name }}</h1></body></html>")
        {% endif -%}
    {% else %}
    return render(request,'index.html')   
    {% endif %}
    

class GenericViewSetNoDestroy(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    mixins.UpdateModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    # we performe soft delete for all the models
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        obj.is_removed = True
        obj.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserLoginView(generics.CreateAPIView):
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
            return Response(
                data=ErrorResponseSerializer(
                    data={
                        "code": "BAD_REQUEST",
                        "title": "BAD REQUEST",
                        "errors": [{"detail": "Incorrect email and password combination. Please try again."}],
                    }
                ).initial_data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_data = UserLoginSerializer.login(user, request)
        return Response(response_data)


class UserViewSet(GenericViewSetNoDestroy):
    queryset = User.objects.filter(is_removed=False)
    serializer_class = UserSerializer
    permission_classes = (UserViewSetPermissions,)

    def get_serializer_class(self, *args, **kwargs):
        if self.request.method == "POST":
            return UserRegistrationSerializer
        else:
            return UserSerializer
    

    # No auth required to create user
    # Auth required for all other actions
    # permission_classes = (permissions.IsAuthenticated | CreateOnlyPermissions,)

    @action(methods=["GET"], detail=False, url_path="me")
    def me(self, request):
        user = UserSerializer(request.user).data
        return Response(user, status=status.HTTP_200_OK)

    @action(methods=["GET"], detail=False, url_path="check-email")
    def check_email(self, request):
        email = request.GET.get("email", None)
        if email is None:
            return Response(
                data=ErrorResponseSerializer(
                    data={"code": "BAD_REQUEST", "title": "BAD REQUEST", "errors": [{"email": "Email field is required"}]}
                ).initial_data,
                status=status.HTTP_400_BAD_REQUEST,
            )
        else:
            if User.objects.filter(email=email).exists():
                return Response(
                    data=ResponseSerializer(data={"status": "EMAIL_USED", "title": "This email is used", "data": request.GET}).initial_data,
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    data=ResponseSerializer(
                        data={"status": "EMAIL_NOT_USED", "title": "This email is not used", "data": request.GET}
                    ).initial_data,
                    status=status.HTTP_200_OK,
                )
{%- if cookiecutter.use_stripe == 'y' %}
    @action(
        detail=False,
        methods=["get"],
        url_path="get-payment-methods",
    )
    def get_payment_methods(self, request, pk=None):
        """## Endpoint to get the payment method for the user from stripe"""
        user = request.user
        formatted_data = get_formatted_user_payment_methods(user)
        return Response({"payment_methods": formatted_data}, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="update-default-payment-method",
    )
    def update_default_payment_method(self, request, pk=None):
        """## Endpoint to get the payment method for the user from stripe"""
        user = request.user
        try:
            token = request.data["token"]
        except KeyError:
            return Response(
                data=ErrorResponseSerializer(
                    data={"code": "BAD_REQUEST", "title": "BAD REQUEST", "errors": [{"detail": "Stripe Card Token required"}]}
                ).initial_data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            customer = StripeApi.update_customer_payment_method(user.stripe_customer_token, token)
        except ValidationError as e:
            return Response(
                data=ErrorResponseSerializer(
                    data={"code": "BAD_REQUEST", "title": "BAD REQUEST", "errors": [{"detail": e.detail}]}
                ).initial_data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"stripe_customer": customer}, status=status.HTTP_200_OK)  # pragma: no cover third-party

    @action(
        detail=False,
        methods=["post"],
        url_path="update-billing-address",
    )
    def update_default_card_billing_address(self, request, pk=None):
        """
        ## Endpoint to update the billing information on the user's default card
        ### Can optionally accept a "card_id" to update
        ### Otherwise will update their default payment method
        """
        user = request.user
        try:
            address = request.data["address"]
        except KeyError:
            raise ValidationError(detail="Address information required")

        try:
            card_id = request.data["card_id"]
        except KeyError:
            try:
                card_id = StripeApi.get_user_payment_methods(user)[0]["id"]
            except KeyError:
                return Response(
                    data=ErrorResponseSerializer(
                        data={"code": "BAD_REQUEST", "title": "BAD REQUEST", "errors": [{"detail": "User does not have a payment method"}]}
                    ).initial_data,
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Format data as Stripe expects it
        data = {
            "billing_details": {
                "address": {
                    "city": request.data["address"].get("city"),
                    "country": "US",
                    "line1": request.data["address"].get("address1"),
                    "line2": request.data["address"].get("address2"),
                    "state": request.data["address"].get("province"),
                    "postal_code": request.data["address"].get("zipcode"),
                }
            }
        }

        try:
            StripeApi.update_card_billing_details(card_id, data)
        except ValidationError as e:
            return Response(
                data=ErrorResponseSerializer(
                    data={"code": "BAD_REQUEST", "title": "BAD REQUEST", "errors": [{"detail": e.detail}]}
                ).initial_data,
                status=status.HTTP_400_BAD_REQUEST,
            )

        formatted_data = get_formatted_user_payment_methods(user)
        return Response({"payment_methods": formatted_data}, status=status.HTTP_200_OK)

{%- endif %}