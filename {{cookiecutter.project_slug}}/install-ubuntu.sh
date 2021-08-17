#!/bin/bash

# INSTALL {{cookiecutter.project_slug.upper()}} SYSTEM REQUIREMENTS
#
# REQUIRED SYSTEM: UBUNTU 16.04 LTS
#
# This script is a shortcut to install the {{cookiecutter.project_slug}} sytem requirements
# on Ubuntu 16.04 linux systems. It also sets up the Python virtualenv.
#
# Activate the virtual env after installation:
#
#    source ~/.bashrc
#    workon {{cookiecutter.project_slug}}
#
# This script is designed to be idempotent--running it multiple times
# should not be a problem.
#

# Configuration Variables
db_user='{{cookiecutter.project_slug}}'
db_pass='!!!SET POSTGRES_PASSWORD!!!'
db_name='{{cookiecutter.project_slug}}_db'

# DO NOT EDIT BEYOND THIS POINT

# Install system requirements
sudo apt-get update
sudo apt-get install gcc -y
{% if cookiecutter.use_redis == "y" %}
sudo apt-get install redis-server -y
{% endif %}
# Install PostgreSQL and configure database and user

# Set up apt repository for Ubuntu 16.04
sudo add-apt-repository 'deb http://apt.postgresql.org/pub/repos/apt/ xenial-pgdg main'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
# End repo set-up for 16.04

# Install Postgres, create database, and grant privs
sudo apt-get install curl gcc postgresql postgresql-server-dev-10 libpq-dev -y
sudo -u postgres createdb $db_name
sudo -u postgres psql -c "CREATE USER $db_user WITH PASSWORD '$db_pass';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $db_name to $db_user;"
