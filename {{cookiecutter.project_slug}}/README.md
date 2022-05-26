[![Built with Cookiecutter](https://img.shields.io/badge/built%20with-Cookiecutter-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter)

# {{cookiecutter.project_name}}

## Setup

### Docker
If this is your first time...
1. [Install Docker](https://www.docker.com/)
1. Run `pipenv lock` to generate a Pipfile.lock
1. Run `npm install` so you have node_modules available outside of Docker
1. `make build`
1. View other available scripts/commands with `make commands`



Now you will only ever need one command:
`make run` or `docker compose up`


More info regarding docker...

**NB: uncomment the host from the .env file to the docker host**

**NB: An initial pipfile lock is required for the backend**

The docker configuration is managed using a docker-compose.yaml, to begin you will need to install docker and set up an account with docker hub
If you are starting the project from scratch make sure to install the python packages with pipenv to generate a pipfile.lock (any new installs will require a new build)
Additionally each user must run npm install prior to make run to use the local copy of node_modules
Why is the node modules mounted over?
1. The user does not have to sh into the container to install new packages
2. The node modules folder does not overwrite the local version 
3. Your editor can reference the node_modules for its needs (on your local)
   

For ease of use you can use the commands from the makefile to run the containers (server,client,database server and client can be ran individually) when you make changes to the original images you will need to rebuild them.
You can checkout all the commands in the [Makefile](./Makefile)

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



### Backend
If not using Docker...
See the [backend README](server/README.md)

### Frontend
If not using Docker...
See the [frontend README](client/README.md)

## Testing
1. `pipenv install --dev`
1. `pipenv run pytest server/{{cookiecutter.project_slug}}`

1. `npm run cypress`
