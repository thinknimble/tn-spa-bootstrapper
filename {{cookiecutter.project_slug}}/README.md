[![Built with Cookiecutter](https://img.shields.io/badge/built%20with-Cookiecutter-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter)

# {{cookiecutter.project_name}}

## Setup

### Django App
1. Install Postgres (OSX - `brew install postgresql`; Linux - `apt-get`)
1. Copy .env.example to new file .env 
1. Run `./init-db.sh` from the `scripts` directory (or view and manually create the database)

Once db credentials are set:
1. run `pipenv install` to install dependencies 
1. run `pipenv shell` to activate the pipenv shell
1. run `python manage.py migrate` to migrate database
1. run `python manage.py runserver` to run the Django API (default - localhost:8000/admin)


### Frontend
See the [frontend README](client/README.md)


### Favicon Setup


The Django app is already configured to serve favorite icons for all browsers and platforms (include, for example, apple-icons and android-icons at various sizes). By default, this icon is the vue/react logo.

***Note your image must be a square otherwise a white bg will appear because the file is cropped if it is not a square go to [iloveimg.com](https://www.iloveimg.com/resize-image) and resize it.*** 
Visit [realfavicongenerator.net](https://realfavicongenerator.net/) and upload a high resolution, square version of the image you would like to use as the favicon for this app.

Download the ZIP file of icons that the site generates for you and paste them in the `client/public/static/favicons/` directory.

When we run collectstatic the public folder is copied as is and enables serving of the favicons

## Local developmnet with Docker ##

Docker has been added to this app for local development. Using docker can be a replacement during local development as it will run irrespective of your current configurations 

**NOTE: uncomment the host from the .env file to the docker host**
**NOTE: An initial pipfile lock is required for the backend**

The docker configuration is managed using a docker-compose.yaml, to begin you will need to install docker and set up an account with docker hub

For ease of use you can use the commands from the makefile to run the containers (server,client,database server and client can be ran individually) when you make changes to the original images you will need to rebuild them.
You can checkout all the commands in the Makefile

**Print all available commands**
- make commands

**Run Server-Client-DB (-d for detached mode)**
- make run 
- make run-d 

**Run Client (-d for detached mode)**
- make run-client
- make run-client-d

**Run Server-DB (-d for detached mode)**
***The DB will always run with the server because it is a dependency***
- make run-server
- make run-server-d

