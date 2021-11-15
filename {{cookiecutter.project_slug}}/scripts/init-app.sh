#!/bin/bash

# {{cookiecutter.project_name}} Intialization  
#

# Applying the migrations
{%- if cookiecutter.client_app.lower() != "none" %}
# Generating client app
npm install --prefix client && npm run build --prefix client
{%- endif %}
pipenv install
pipenv run python server/manage.py makemigrations && pipenv run python server/manage.py migrate 
pipenv shell "server/runserver.sh"

