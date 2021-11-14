#!/bin/bash

# Deploy {{cookiecutter.project_name}} To heroku
# NOTE: This script is intended to deploy the app for the first time to heroku
# if you run it again make and the app is aleady created on heroku make sure to comment lines 6:29 
APP_NAME={{ cookiecutter.project_slug }}-staging.herokuapp.com
heroku login --interactive
heroku create $APP_NAME --buildpack heroku/python
heroku addons:create heroku-postgresql:hobby-dev --app $APP_NAME
{%- if cookiecutter.client_app.lower() != "none" %}
heroku buildpacks:add --index 1 heroku/nodejs --app $APP_NAME
if [ -z "${NPM_PRIVATE_TOKEN}" ]; then
    echo "Please fill in your NPM_PRIVATE_TOKEN"
    read -p 'NPM_PRIVATE_TOKEN: ' NPM_PRIVATE_TOKEN
    heroku config:set NPM_PRIVATE_TOKEN=$NPM_PRIVATE_TOKEN --app $APP_NAME
else
    NPM_PRIVATE_TOKEN = "${NPM_PRIVATE_TOKEN}"
    heroku config:set NPM_PRIVATE_TOKEN=$NPM_PRIVATE_TOKEN --app $APP_NAME
fi
{%- endif %}
heroku config:set SECRET_KEY="$(openssl rand -base64 64)" --app $APP_NAME
heroku config:set DEBUG="True" --app $APP_NAME
heroku config:set CURRENT_DOMAIN="$APP_NAME.herokuapp.com" --app $APP_NAME
heroku config:set ALLOWED_HOSTS="$APP_NAME.herokuapp.com,localhost" --app $APP_NAME
heroku config:set NPM_CONFIG_PRODUCTION=false --app $APP_NAME
git init 
heroku git:remote --app $APP_NAME
git branch -M main
git add . 
git commit -m "Initial heroku commit"
git push heroku main
heroku open --app $APP_NAME
