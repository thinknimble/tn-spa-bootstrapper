from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from {{ cookiecutter.project_slug }}.consumers import ChatConsumer
from django.conf.urls import url

class TokenAuthMiddleware:
    """
    Token authorization middleware for Django Channels 2
    """

    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        headers = dict(scope['headers'])
        if b'authorization' in headers:
            try:
                token_name, token_key = headers[b'authorization'].decode().split()
                if token_name == 'Token':
                    token = Token.objects.get(key=token_key)
                    scope['user'] = token.user
            except Token.DoesNotExist:
                scope['user'] = AnonymousUser()
        return self.inner(scope)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))

websocket_urlpatterns = [
    url(r'chat/stream/', ChatConsumer),
]
application = ProtocolTypeRouter({
    # (http->django views is added by default)
    'websocket': TokenAuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})




