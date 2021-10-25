"""
ASGI config for {{ cookiecutter.project_name }} project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/dev/howto/deployment/asgi/

"""

import os
import sys
from pathlib import Path

from django.core.asgi import get_asgi_application

# This allows easy placement of apps within the interior
# {{ cookiecutter.project_slug }} directory.
ROOT_DIR = Path(__file__).resolve(strict=True).parent.parent
sys.path.append(str(ROOT_DIR))

# If DJANGO_SETTINGS_MODULE is unset, default to the local settings
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "{{ cookiecutter.project_slug }}.settings")

# This application object is used by any ASGI server configured to use this file.
django_application = get_asgi_application()



{%- if cookiecutter.async.lower() == 'async' %}

from .websocket import websocket_application  # noqa isort:skip
async def application(scope, receive, send):
    if scope["type"] == "http":
        await django_application(scope, receive, send)
    elif scope["type"] == "websocket":
        await websocket_application(scope, receive, send)
    else:
        raise NotImplementedError(f"Unknown scope type {scope['type']}")
        
{%- elif cookiecutter.async.lower() == 'django channels' %}

from .routing import application as asgi_application
application = asgi_application

 {%- endif %}