[![Built with Cookiecutter](https://img.shields.io/badge/built%20with-Cookiecutter-ff69b4.svg?logo=cookiecutter)](https://github.com/cookiecutter/cookiecutter)

# {{cookiecutter.project_name}}

## Setup

### Github & Heroku
1. [Generate an auth token for Heroku](https://devcenter.heroku.com/articles/heroku-cli-commands#heroku-authorizations-create) and add it to the [repo secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) as `HEROKU_API_KEY` so Github Actions can reach Heroku. `heroku authorizations:create -d "Github Actions" -s write-protected`
1. [Generate an auth token for Github](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github#authenticating-with-the-api) and add it as [an environment variable](https://devcenter.heroku.com/articles/config-vars) as `GITHUB_TOKEN` so Heroku can trigger Github Actions

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
1. `pipenv run pytest server/{{cookiecutter.project_slug}}`

1. `npm run cypress`
