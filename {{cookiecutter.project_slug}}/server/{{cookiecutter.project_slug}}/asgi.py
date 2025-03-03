import os

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "{{ cookiecutter.project_slug }}.settings")
django_asgi_app = get_asgi_application()

from {{ cookiecutter.project_slug }}.chat.middleware import TokenAuthMiddleware  # noqa
from {{ cookiecutter.project_slug }}.routing import websocket_urlpatterns  # noqa

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": TokenAuthMiddleware(
            AllowedHostsOriginValidator(URLRouter(websocket_urlpatterns))
        ),
    }
)
