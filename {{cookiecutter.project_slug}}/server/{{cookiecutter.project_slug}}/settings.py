import os
{% if cookiecutter.use_graphql == 'y' -%}
from datetime import timedelta

{%- endif %}
import dj_database_url
from decouple import config

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENVIRONMENT = config("ENVIRONMENT", default="development")
IN_DEV = ENVIRONMENT == "development"
IN_STAGING = ENVIRONMENT == "staging"
IN_PROD = ENVIRONMENT == "production"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=False, cast=bool)

if IN_DEV:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} Development <noreply-dev@{{ cookiecutter.project_slug }}.com>"
elif IN_STAGING:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} Staging <noreply-staging@{{ cookiecutter.project_slug }}.com>"
else:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} <noreply@{{ cookiecutter.project_slug }}.com>"

DEFAULT_FROM_EMAIL = SERVER_EMAIL

# Email address of the staff who should receive certain emails
STAFF_EMAIL = config("STAFF_EMAIL", default="no-reply@thinknimble.com")

#
# Domain Configuration
#
CURRENT_DOMAIN = config("CURRENT_DOMAIN")
CURRENT_PORT = config("CURRENT_PORT")
HEROKU_APP_NAME = config("HEROKU_APP_NAME", default=None)
ALLOWED_HOSTS = []
ALLOWED_HOSTS += config("ALLOWED_HOSTS", cast=lambda v: [s.strip() for s in v.split(",")])
if CURRENT_DOMAIN not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(CURRENT_DOMAIN)

# Application definition

INSTALLED_APPS = [
    # Local
    "{{ cookiecutter.project_slug }}.common",
    "{{ cookiecutter.project_slug }}.core",
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    {% if cookiecutter.client_app == "React" -%}
    "whitenoise.runserver_nostatic",
    {%- endif -%}
    "django.contrib.staticfiles",
    # Third Party
    "corsheaders",
    "drf_yasg",
    "django_nose",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "django_extensions",
    {%- if cookiecutter.use_graphql == 'y' -%}
    "graphene_django",
    {%- endif %}
]

{%- if cookiecutter.use_graphql == 'y' -%}
GRAPHENE = {
    "SCHEMA": "{{ cookiecutter.project_slug }}.core.schema.schema",
    "MIDDLEWARE": [
        "graphql_jwt.middleware.JSONWebTokenMiddleware",
    ],
}

GRAPHQL_JWT = {
    "JWT_VERIFY_EXPIRATION": True,
    "JWT_EXPIRATION_DELTA": timedelta(minutes=5),
    "JWT_REFRESH_EXPIRATION_DELTA": timedelta(days=7),
}

AUTHENTICATION_BACKENDS = [
    "graphql_jwt.backends.JSONWebTokenBackend",
    "django.contrib.auth.backends.ModelBackend",
]
{%- endif %}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django_currentuser.middleware.ThreadLocalUserMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

OLD_PASSWORD_FIELD_ENABLED = True
LOGIN_URL = "rest_framework:login"
LOGOUT_URL = "rest_framework:logout"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

ROOT_URLCONF = "{{ cookiecutter.project_slug }}.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        {% if cookiecutter.client_app != "React" -%}
        "APP_DIRS": True,
        "DIRS": [
            os.path.join(BASE_DIR, "../client/dist/"),
        ],
        {% else -%}
        "DIRS": [
            os.path.join(BASE_DIR, "..", "client", "build"),
        ],
        "APP_DIRS": True,  # this setting must come after "DIRS"!
        {% endif -%}
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "{{ cookiecutter.project_slug }}.wsgi.application"

# Database
"""There are two ways to specifiy the database connection

1. Heroku - we use dj_database_url to interpret Heroku's DATABASE_URL env variable.
2. Specify DB_NAME, DB_USER, DB_PASS, and DB_HOST Directly in the env file.
"""
# Update database configuration with dj_database_url
heroku_default_db = dj_database_url.config()
if bool(heroku_default_db):
    DATABASES = {"default": heroku_default_db}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql_psycopg2",
            "NAME": config("DB_NAME"),
            "USER": config("DB_USER"),
            "PASSWORD": config("DB_PASS", default=""),
            "HOST": config("DB_HOST"),
            "CONN_MAX_AGE": 600,
        },
    }
#
# User Configuration and Password Validation
#
AUTH_USER_MODEL = "core.User"
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

#
# Internationalization & Localization Settings
#
LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

#
# Django Rest Framework Configuration
#
REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.AcceptHeaderVersioning",
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_PAGINATION_CLASS": "{{ cookiecutter.project_slug }}.core.pagination.PageNumberPagination",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "ALLOWED_VERSIONS": [
        "1.0",
    ],
    "DEFAULT_VERSION": "1.0",
    "EXCEPTION_HANDLER": "rest_framework.views.exception_handler",
}
if DEBUG:  # for testing
    REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"].append("rest_framework.authentication.SessionAuthentication")
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append("rest_framework.renderers.BrowsableAPIRenderer")
#
# Static files (CSS, JavaScript, Images)
#
# Django will create directories for STATIC_ROOT and MEDIA_ROOT.
# Static files are things like JS, CSS, and images. Media files are
# user-uploaded files. By default, media files are stored on the local
# file system when uploaded. This is fine for development, but but when
# on Heroku, you must use an external system like AWS S3, because the
# Heroku file system is destroyed during each deployment.
#

# Static files will be collected into 'static' when `manage.py collectstatic` is run
STATIC_ROOT = os.path.join(BASE_DIR, "..", "static")
MEDIA_ROOT = os.path.join(BASE_DIR, "..", "media-files")

# Static and media files will be served from under these paths.
STATIC_URL = "/static/"
MEDIA_URL = "/media/"

{%- if cookiecutter.client_app != 'None' %}
{%- if cookiecutter.client_app == 'Vue3' %}
# Django will look for client-side build files in this directory
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "../client/dist/static"),
]
{% elif cookiecutter.client_app == 'React' %}
# Django will look for client-side build files in this directory
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "..", "client", "build"),
    os.path.join(BASE_DIR, "..", "client", "build", "static"),
]
{% endif -%}
{% endif -%}


STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# Anymail
# ------------------------------------------------------------------------------
# https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
INSTALLED_APPS += ["anymail"]  # noqa F405
if not IN_DEV:
    {%- if cookiecutter.mail_service == 'Mailgun' %}
    # https://anymail.readthedocs.io/en/stable/esps/mailgun/

    EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"
    ANYMAIL = {
        "MAILGUN_API_KEY": config("MAILGUN_API_KEY"),
        "MAILGUN_SENDER_DOMAIN": config("MAILGUN_DOMAIN"),
        "MAILGUN_API_URL": config("MAILGUN_API_URL", default="https://api.mailgun.net/v3"),
    }
    {%- elif cookiecutter.mail_service == 'Amazon SES' %}
    # https://anymail.readthedocs.io/en/stable/esps/amazon_ses/
    EMAIL_BACKEND = "anymail.backends.amazon_ses.EmailBackend"
    ANYMAIL = {}
    {%- elif cookiecutter.mail_service == 'Custom SMTP' %}

    #
    # Custom SMTP settings
    #
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
    ANYMAIL = {}
    EMAIL_HOST = config("SMTP_HOST")
    EMAIL_PORT = config("SMTP_PORT", default=587, cast=int)
    EMAIL_HOST_USER = config("SMTP_USER")
    EMAIL_HOST_PASSWORD = config("SMTP_PASSWORD")
    EMAIL_ALLOWED_DOMAINS = config("SMTP_VALID_TESTING_DOMAINS")
    EMAIL_USE_TLS = True
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    {% endif %}

# STORAGES
# ----------------------------------------------------------------------------

PRIVATE_MEDIAFILES_LOCATION = ""
# Django Storages configuration
if config("USE_AWS_STORAGE", cast=bool, default=False):
    AWS_ACCESS_KEY_ID = config("AWS_ACCESS_KEY_ID")
    AWS_STORAGE_BUCKET_NAME = config("AWS_STORAGE_BUCKET_NAME")
    AWS_SECRET_ACCESS_KEY = config("AWS_SECRET_ACCESS_KEY")
    AWS_S3_CUSTOM_DOMAIN = AWS_STORAGE_BUCKET_NAME + ".s3.amazonaws.com"
    AWS_LOCATION = config("AWS_LOCATION", default="")
    AWS_S3_REGION_NAME = config("AWS_S3_REGION_NAME")

    aws_s3_domain = AWS_S3_CUSTOM_DOMAIN or f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
    # Default file storage is private
    PRIVATE_MEDIAFILES_LOCATION = AWS_LOCATION + "/media"
    DEFAULT_FILE_STORAGE = "{{ cookiecutter.project_slug }}.utils.storages.PrivateMediaStorage"
    STATICFILES_STORAGE = "{{ cookiecutter.project_slug }}.utils.storages.StaticRootS3Boto3Storage"
    COLLECTFAST_STRATEGY = "collectfast.strategies.boto3.Boto3Strategy"
    STATIC_URL = f"https://{aws_s3_domain}/static/"
    MEDIA_URL = f"https://{aws_s3_domain}/media/"

#
# STATIC
# ------------------------
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# Maximum size, in bytes, of a request before it will be streamed to the
# file system instead of into memory.
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440  # i.e. 2.5 MB

# Maximum size in bytes of request data (excluding file uploads) that will be
# read before a SuspiciousOperation (RequestDataTooBig) is raised.
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # i.e. 100 MB

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
ADMIN_URL = "staff/"
# https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = [("ThinkNimble", "support@thinknimble.com")]
# https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS
#
# HTTPS Everywhere outside the dev environment
#
if not IN_DEV:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    MIDDLEWARE += ["django.middleware.security.SecurityMiddleware"]

#
# Custom logging configuration
#
LOGGING = {
    "version": 1,
    "disable_existing_loggers": True,
    "filters": {
        "require_debug_false": {"()": "django.utils.log.RequireDebugFalse"},
        "require_debug_true": {"()": "django.utils.log.RequireDebugTrue"},
    },
    "formatters": {
        "verbose": {
            "format": "[%(asctime)s] %(levelname)s [%(name)s:%(lineno)s] %(message)s",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
        "simple": {
            "format": "[%(asctime)s] %(levelname)s %(message)s",
            "datefmt": "%d/%b/%Y %H:%M:%S",
        },
    },
    "handlers": {
        "console": {
            "level": "INFO",
            "filters": ["require_debug_true"],
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "django": {
            "handlers": [
                "console",
            ],
            "level": "INFO",
        },
        # The logger name matters -- it MUST match the name of the app
        "{{ cookiecutter.project_slug }}": {
            "handlers": [
                "console",
            ],
            "level": "DEBUG",
            "propagate": True,
        },
        "{{ cookiecutter.project_slug }}.request": {"handlers": [], "level": "INFO", "propagate": True},
        "{{ cookiecutter.project_slug }}.tasks": {"handlers": [], "level": "INFO", "propagate": True},
    },
}

#
# Rollbar logging config
#
ROLLBAR_ACCESS_TOKEN = config("ROLLBAR_ACCESS_TOKEN", default="")

if IN_PROD or ROLLBAR_ACCESS_TOKEN:
    MIDDLEWARE += ["rollbar.contrib.django.middleware.RollbarNotifierMiddleware"]
    ROLLBAR = {
        "access_token": ROLLBAR_ACCESS_TOKEN,
        "environment": ENVIRONMENT,
        "root": BASE_DIR,
    }
    LOGGING["handlers"].update(
        {
            "rollbar": {
                "level": "WARNING",
                "filters": ["require_debug_false"],
                "access_token": ROLLBAR_ACCESS_TOKEN,
                "environment": ENVIRONMENT,
                "class": "rollbar.logger.RollbarHandler",
            }
        }
    )
    LOGGING["loggers"]["django"]["handlers"].append("rollbar")
    LOGGING["loggers"]["{{ cookiecutter.project_slug }}"]["handlers"].append("rollbar")

# Popular testing framework that allows logging to stdout while running unit tests
TEST_RUNNER = "django_nose.NoseTestSuiteRunner"

CORS_ALLOWED_ORIGINS = ["https://{{ cookiecutter.project_slug }}-staging.herokuapp.com", "https://{{ cookiecutter.project_slug }}.herokuapp.com"]
{% if cookiecutter.client_app.lower() != 'none' -%}
CORS_ALLOWED_ORIGINS.append("http://localhost:8089")
{% endif -%}
{% if cookiecutter.use_graphql == 'y' -%}
CORS_ALLOWED_ORIGINS.append("http://localhost:3000")
{%- endif -%}

{% if cookiecutter.use_graphql == 'y' %}
CORS_ALLOW_CREDENTIALS = True
{% endif -%}
