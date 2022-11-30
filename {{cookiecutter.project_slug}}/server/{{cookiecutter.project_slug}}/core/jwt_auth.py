from graphql_jwt.exceptions import JSONWebTokenError
from graphql_jwt.utils import get_payload, get_user_by_payload
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header


class JSONWebTokenAuthentication(BaseAuthentication):
    """Authentication class that enables us to use JWTs on Django Rest Framework endpoints.

    Usage Example:

        from rest_framework import permissions
        from rest_framework.decorators import api_view, authentication_classes, permission_classes
        from rest_framework.response import Response

        from my_project.core.jwt_auth import JSONWebTokenAuthentication

        @api_view(["get"])
        @permission_classes([permissions.IsAuthenticated])
        @authentication_classes([JSONWebTokenAuthentication])
        def my_amazing_view(request, *args, **kwargs):
            return Response("Hello World")
    """

    keyword = "JWT"

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != self.keyword.lower().encode():
            return None

        if len(auth) == 1:
            msg = "Invalid token header. No credentials provided."
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = "Invalid token header. Token string should not contain spaces."
            raise exceptions.AuthenticationFailed(msg)

        try:
            token = auth[1].decode()
        except UnicodeError:
            msg = "Invalid token header. Token string should not contain invalid characters."
            raise exceptions.AuthenticationFailed(msg)

        try:
            payload = get_payload(token)
            user = get_user_by_payload(payload)
        except JSONWebTokenError as e:
            raise exceptions.AuthenticationFailed(str(e))

        if user is None or not user.is_active:
            raise exceptions.AuthenticationFailed("User inactive or deleted.")

        return (user, None)

    def authenticate_header(self, request):
        return self.keyword
