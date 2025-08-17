# Django

## Initial Setup for non-Docker local

1. Install Postgres (OSX - `brew install postgresql`; Linux - `apt-get`)
1. Copy .env.example to new file .env
1. Run `./init-db.sh` from the `scripts` directory (or view and manually create the database)

Once db credentials are set:

1. `uv sync` to install dependencies
1. `source .venv/bin/activate` to activate the virtualenv shell
1. `cd server`
1. `python manage.py migrate` to migrate database
1. `python manage.py runserver` to run the Django API (default - localhost:8000/admin)


## Linting
[WIP]

`ruff format`

`ruff check --fix`
