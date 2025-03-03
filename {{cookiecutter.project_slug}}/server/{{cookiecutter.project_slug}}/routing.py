from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path

from {{ cookiecutter.project_slug }}.chat.consumers import ChatConsumer

websocket_urlpatterns = [
    path("ws/chat/", ChatConsumer.as_asgi()),
]

application = ProtocolTypeRouter(
    {
        "websocket": URLRouter(websocket_urlpatterns),
    }
)
