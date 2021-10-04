#!/bin/bash

printf "\033[0;32mServer is running on port $CURRENT_PORT \033[0mhttp://$CURRENT_DOMAIN:$CURRENT_PORT \n"
{% if cookiecutter.use_celery.lower() == "y" %}
gnome-terminal -t "{{ cookiecutter.project_slug }} Celery" -- pipenv run celery worker --app={{ cookiecutter.project_slug }}.celery_app --loglevel=info
{% endif %}
{% if cookiecutter.async.lower() == "async" %}
gunicorn -b $CURRENT_DOMAIN:$CURRENT_PORT {{ cookiecutter.project_slug }}.asgi:application -k uvicorn.workers.UvicornWorker
{% elif cookiecutter.async.lower() == "django channels" %}
daphne -b $CURRENT_DOMAIN -p $CURRENT_PORT {{ cookiecutter.project_slug }}.asgi:application
{% else  %}
gunicorn -b $CURRENT_DOMAIN:$CURRENT_PORT {{ cookiecutter.project_slug }}.wsgi --log-file -
{% endif %}