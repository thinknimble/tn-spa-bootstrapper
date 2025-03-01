#!/bin/bash

# {{cookiecutter.project_name}} Intialization  
#

# Applying the migrations
{%- if cookiecutter.client_app.lower() != "none" %}
# Generating client app
npm install --prefix client && npm run build --prefix client
{%- endif %}
uv sync
uv run python server/manage.py makemigrations && uv run python server/manage.py migrate
source .venv/bin/activate && ./server/runserver.sh
