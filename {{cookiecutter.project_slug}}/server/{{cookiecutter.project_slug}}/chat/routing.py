from django.urls import path

from .consumers import AgentConsumer

websocket_urlpatterns = [
    path("ws/chat/", AgentConsumer.as_asgi()),
]
