#!/bin/bash

# INSTALL {{cookiecutter.project_slug.upper()}} DB
#
#
# Activate the virtual env after installation:
#
#    workon {{cookiecutter.project_slug}}
#
# This script is designed to be idempotent--running it multiple times
# should not be a problem.
#

# DB Configuration Variables
db_user='{{cookiecutter.project_slug}}'
db_pass='!!!SET POSTGRES_PASSWORD!!!'
db_name='{{cookiecutter.project_slug}}_db'


if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux 
    # Install system requirements
    sudo apt-get update
    {% if cookiecutter.use_redis == "y" %}
    which redis-cli
    if [ "$?" ]; then
        echo "Redis is already installed"
    else
        sudo apt-get install redis-server -y
    fi
    {% endif %}

    # Install PostgreSQL
    which psql
    if [ "$?" ]; then
        echo "Postgres is already installed"
    else
        sudo apt install postgresql postgresql-contrib -y
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX 
    # WIP 
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
    brew update
    brew install postgresql
elif [[ "$OSTYPE" == "win32" ]]; then
    # Windows
    # WIP
    echo "WIP"
else
    echo "Unknown Operating System!"
fi


# Install Postgres, create database, and grant privs
sudo -u postgres createdb $db_name
sudo -u postgres psql -c "CREATE USER $db_user WITH PASSWORD '$db_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name to $db_user;"
