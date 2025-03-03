from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework.authtoken.models import Token


@database_sync_to_async
def get_user(token_key):
    try:
        token = Token.objects.get(key=token_key)
        return token.user
    except Token.DoesNotExist:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_params = parse_qs(scope["query_string"].decode())
        token_key = query_params.get("token", [None])[0]

        if token_key:
            scope["user"] = await get_user(token_key)
        else:
            scope["user"] = AnonymousUser()

        if isinstance(scope["user"], AnonymousUser):
            await send({"type": "websocket.close", "code": 4003, "text": "Authentication failed"})
            return

        return await super().__call__(scope, receive, send)
