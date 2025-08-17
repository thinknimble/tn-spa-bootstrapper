from decouple import config

from {{ cookiecutter.project_slug }}.settings import *  # noqa
from {{ cookiecutter.project_slug }}.settings import LOGGING

# Override staticfiles setting to avoid cache issues with whitenoise Manifest staticfiles storage
# See: https://stackoverflow.com/a/69123932
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

MEDIA_URL = "/media/"
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

if config("CI", False):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": config("TEST_DB_NAME"),
            "USER": config("TEST_DB_USER"),
            "PASSWORD": config("TEST_DB_PASS", default=""),
            "HOST": config("DB_HOST"),
            "CONN_MAX_AGE": 600,
        },
    }

# Normally propagate is disabled so we don't get duplicate logs in production
# Enabling it here so pytest caplog fixture can be used to inspect them
LOGGING["loggers"]["django"]["propagate"] = True
LOGGING["loggers"]["{{ cookiecutter.project_slug }}"]["propagate"] = True

# Disable email allowlist by default in tests unless explicitly testing it
USE_EMAIL_ALLOWLIST = False
