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


## Environment Variables

### Email Allowlist Configuration

The application supports restricting user signups to specific email addresses through an allowlist feature:

- `USE_EMAIL_ALLOWLIST` (boolean, default: `False`): Enable/disable email allowlist feature
  - When `True`, only emails in the allowlist can register
  - When `False`, any valid email can register

- `EMAIL_ALLOWLIST` (JSON array, default: `[]`): List of allowed email addresses
  - Format: `'["email1@example.com", "email2@example.com"]'`
  - Example: `EMAIL_ALLOWLIST='["admin@thinknimble.com", "user@thinknimble.com"]'`
  - Must be a valid JSON array string

#### Example Configuration

```bash
# Enable email allowlist
USE_EMAIL_ALLOWLIST=True
EMAIL_ALLOWLIST='["admin@thinknimble.com", "developer@thinknimble.com"]'
```

#### Deployment Notes

- For Heroku deployments, these values are configured in `app.json`
- The EMAIL_ALLOWLIST must be provided as a JSON string in environment variables
- When disabled, the system logs warnings for potentially risky email domains

## Linting
[WIP]

`ruff format`

`ruff check --fix`
