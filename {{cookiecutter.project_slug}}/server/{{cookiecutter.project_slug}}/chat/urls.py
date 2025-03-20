from django.urls import path

from . import views as chat_views

urlpatterns = [path("system-prompt/", chat_views.get_current_system_prompt, name="system-prompt")]
