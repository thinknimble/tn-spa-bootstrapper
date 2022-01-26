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


### Frontend (TODO)
```bash
npm install --prefix client
npm run build --prefix client
```
