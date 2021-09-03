#!/bin/bash

# {{cookiecutter.project_name}} Intialization  
#

# Applying the migrations
{%- if cookiecutter.client_app.lower() != "none" %}
# Generating client app
npm install --prefix client && npm run build --prefix client
{%- endif %}
pipenv install
pipenv run python manage.py makemigrations && pipenv run python manage.py migrate 
pipenv shell "./runserver.sh"

