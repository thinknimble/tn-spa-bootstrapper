[![Built with Cookiecutter](https://img.shields.io/badge/built%20with-Cookiecutter-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter)

# taillwind-test

## Setup

### Docker
If this is your first time...
1. [Install Docker](https://www.docker.com/)
1. Run `pipenv lock` to generate a Pipfile.lock
1. Run `cd client && npm install` so you have node_modules available outside of Docker
1. Back in the root directory, run `make build`
1. View other available scripts/commands with `make commands`

Now you will only ever need one command:
`make run` or `docker compose up`

### Backend
If not using Docker...
See the [backend README](server/README.md)

### Frontend
If not using Docker...
See the [frontend README](client/README.md)


## Testing
1. `pipenv install --dev`
1. `pipenv run pytest server/taillwind_test`

1. `npm run cypress`