#!/bin/bash

{% if cookiecutter.async.lower() == "async" %}
gunicorn {{ cookiecutter.project_slug }}.asgi:application -k uvicorn.workers.UvicornWorker
{% elif cookiecutter.async.lower() == "django channels" %}
daphne -p 8080 {{ cookiecutter.project_slug }}.asgi:application
{% else  %}
gunicorn {{ cookiecutter.project_slug }}.wsgi --log-file -
{% endif %}