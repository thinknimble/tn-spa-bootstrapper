from decouple import config

from {{ cookiecutter.project_slug }}.settings import *
from {{ cookiecutter.project_slug }}.settings import LOGGING, STORAGES

# Override staticfiles setting to avoid cache issues with whitenoise Manifest staticfiles storage
# See: https://stackoverflow.com/a/69123932
STORAGES["staticfiles"] = {
    "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
}

MEDIA_URL = "/media/"
STORAGES["default"] = {
    "BACKEND": "django.core.files.storage.FileSystemStorage",
}

if config("CI", False):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": config("TEST_DB_NAME"),
            "USER": config("TEST_DB_USER"),
            "PASSWORD": config("TEST_DB_PASS", default=""),
            "HOST": config("DB_HOST"),
            # 0 so connections close after each use. A test suite must not
            # reuse connections: `database_sync_to_async` runs every async
            # database call on one process-wide executor thread, and
            # `channels.db` calls close_old_connections() around each call to
            # clean up after it -- but that helper only closes once
            # CONN_MAX_AGE has elapsed, so a large value made it a no-op for
            # the whole run and leaked connections across tests.
            "CONN_MAX_AGE": 0,
        },
    }

# Normally propagate is disabled so we don't get duplicate logs in production
# Enabling it here so pytest caplog fixture can be used to inspect them
LOGGING["loggers"]["django"]["propagate"] = True
LOGGING["loggers"]["{{ cookiecutter.project_slug }}"]["propagate"] = True

# Disable email allowlist by default in tests unless explicitly testing it
USE_EMAIL_ALLOWLIST = False
