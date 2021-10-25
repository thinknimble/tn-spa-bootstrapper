import os
import dj_database_url

{% if cookiecutter.use_sentry == 'y' %}
import logging
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.logging import LoggingIntegration
{% if cookiecutter.use_celery == 'y' %}
from sentry_sdk.integrations.celery import CeleryIntegration
{% endif %}
from sentry_sdk.integrations.redis import RedisIntegration
{% endif %}


def _env_get_required(setting_name):
    """Get the value of an environment variable and assert that it is set."""
    setting = os.environ.get(setting_name)
    assert setting not in {None, ""}, "{0} must be defined as an environment variable.".format(setting_name)
    return setting


# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")
IN_DEV = ENVIRONMENT == "development"
IN_STAGING = ENVIRONMENT == "staging"
IN_PROD = ENVIRONMENT == "production"

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = _env_get_required("SECRET_KEY")


# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = _env_get_required("DEBUG") == "True"

if IN_DEV:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} Development <noreply-dev@{{ cookiecutter.project_slug }}.com>"
elif IN_STAGING:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} Staging <noreply-staging@{{ cookiecutter.project_slug }}.com>"
else:
    SERVER_EMAIL = "{{ cookiecutter.project_name }} <noreply@{{ cookiecutter.project_slug }}.com>"

DEFAULT_FROM_EMAIL = SERVER_EMAIL

# Email address of the staff who should receive certain emails
STAFF_EMAIL = os.environ.get("STAFF_EMAIL", "no-reply@thinknimble.com")

#
# Domain Configuration
#
CURRENT_DOMAIN = _env_get_required("CURRENT_DOMAIN")
CURRENT_PORT = os.environ.get("CURRENT_PORT")
ALLOWED_HOSTS = []
ALLOWED_HOSTS += _env_get_required("ALLOWED_HOSTS").split(",")
if CURRENT_DOMAIN not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(CURRENT_DOMAIN)

# Application definition

INSTALLED_APPS = [
    # Local
    "{{ cookiecutter.project_slug }}.common",
    "{{ cookiecutter.project_slug }}.core",
     {% if cookiecutter.async.lower() == 'django channels' %}
    "channels",
    {% endif %}

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third Party
    "corsheaders",
    {% if cookiecutter.use_swagger == 'y' %}
    "drf_yasg",
    {% endif %}
    "django_nose",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "django_extensions",
    {% if cookiecutter.use_celery == 'y' %}
    "django_celery_beat",
    {% endif %}
]

{% if cookiecutter.async.lower() == 'django channels' %}
{% if cookiecutter.use_redis == 'y' %}
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [os.environ.get('REDIS_URL'),],
        },
    },
}
{% else %}
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
{% endif %}
{% endif %}

{% if cookiecutter.use_whitenoise == 'n' %}
# Collectfast
# ------------------------------------------------------------------------------
# https://github.com/antonagestam/collectfast#installation
INSTALLED_APPS = ["collectfast"] + INSTALLED_APPS  # noqa F405
{% endif %}

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    {% if cookiecutter.use_whitenoise == 'y' %}
    "whitenoise.middleware.WhiteNoiseMiddleware",
    {% endif %}
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
        "APP_DIRS": True,
        "DIRS": [
            os.path.join(BASE_DIR, "client/dist/"),
        ],
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
ASGI_APPLICATION = "{{ cookiecutter.project_slug }}.asgi.application"


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
            "NAME": _env_get_required("DB_NAME"),
            "USER": _env_get_required("DB_USER"),
            "PASSWORD": os.environ.get("DB_PASS", ""),
            "HOST": _env_get_required("DB_HOST"),
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
if DEBUG:
    # for testing
    REST_FRAMEWORK["DEFAULT_AUTHENTICATION_CLASSES"].append("rest_framework.authentication.SessionAuthentication")
    REST_FRAMEWORK["DEFAULT_RENDERER_CLASSES"].append("rest_framework.renderers.BrowsableAPIRenderer")
#
# Static files (CSS, JavaScript, Images)
#
STATIC_ROOT = os.path.join(BASE_DIR, "static")
MEDIA_ROOT = os.path.join(BASE_DIR, "media-files")

STATIC_URL = "/static/"
MEDIA_URL = "/media/"

{% if cookiecutter.client_app != 'None' %}
{% if cookiecutter.client_app == 'Vue3' %}
STATICFILES_DIRS = [os.path.join(BASE_DIR, "..client/dist/static"),]
{% elif cookiecutter.client_app == 'React' %}
STATICFILES_DIRS = [os.path.join(BASE_DIR, "..client/build/static"),]
{% endif %}
{% endif %}

STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

{% if cookiecutter.use_mailhog == 'y'%}
if IN_DEV:
    # https://docs.djangoproject.com/en/dev/ref/settings/#email-host
    EMAIL_HOST = "localhost"
    # https://docs.djangoproject.com/en/dev/ref/settings/#email-port
    EMAIL_PORT = 1025
{% endif %}

if os.environ.get("USE_ANYMAIL") == "True":
    {% if cookiecutter.mail_service == 'Mailgun' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/mailgun/
    EMAIL_BACKEND = "anymail.backends.mailgun.EmailBackend"
    ANYMAIL = {
        "MAILGUN_API_KEY": _env_get_required("MAILGUN_API_KEY"),
        "MAILGUN_SENDER_DOMAIN": _env_get_required("MAILGUN_DOMAIN"),
        "MAILGUN_API_URL": os.environ.get("MAILGUN_API_URL","https://api.mailgun.net/v3"),
    }
    {% elif cookiecutter.mail_service == 'Amazon SES' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/amazon_ses/
    EMAIL_BACKEND = "anymail.backends.amazon_ses.EmailBackend"
    ANYMAIL = {}
    {% elif cookiecutter.mail_service == 'Mailjet' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/mailjet/
    EMAIL_BACKEND = "anymail.backends.mailjet.EmailBackend"
    ANYMAIL = {
        "MAILJET_API_KEY": _env_get_required("MAILJET_API_KEY"),
        "MAILJET_SECRET_KEY": _env_get_required("MAILJET_SECRET_KEY"),
        "MAILJET_API_URL": _env_get_required("MAILJET_API_URL", default="https://api.mailjet.com/v3"),
    }
    {% elif cookiecutter.mail_service == 'Mandrill' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/mandrill/
    EMAIL_BACKEND = "anymail.backends.mandrill.EmailBackend"
    ANYMAIL = {
        "MANDRILL_API_KEY": _env_get_required("MANDRILL_API_KEY"),
        "MANDRILL_API_URL": _env_get_required(
            "MANDRILL_API_URL", default="https://mandrillapp.com/api/1.0"
        ),
    }
    {% elif cookiecutter.mail_service == 'Postmark' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/postmark/
    EMAIL_BACKEND = "anymail.backends.postmark.EmailBackend"
    ANYMAIL = {
        "POSTMARK_SERVER_TOKEN": _env_get_required("POSTMARK_SERVER_TOKEN"),
        "POSTMARK_API_URL": _env_get_required("POSTMARK_API_URL", default="https://api.postmarkapp.com/"),
    }
    {% elif cookiecutter.mail_service == 'Sendgrid' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/sendgrid/
    EMAIL_BACKEND = "anymail.backends.sendgrid.EmailBackend"
    ANYMAIL = {
        "SENDGRID_API_KEY": _env_get_required("SENDGRID_API_KEY"),
        "SENDGRID_GENERATE_MESSAGE_ID": _env_get_required("SENDGRID_GENERATE_MESSAGE_ID"),
        "SENDGRID_MERGE_FIELD_FORMAT": _env_get_required("SENDGRID_MERGE_FIELD_FORMAT"),
        "SENDGRID_API_URL": _env_get_required("SENDGRID_API_URL", default="https://api.sendgrid.com/v3/"),
    }
    {% elif cookiecutter.mail_service == 'SendinBlue' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/sendinblue/
    EMAIL_BACKEND = "anymail.backends.sendinblue.EmailBackend"
    ANYMAIL = {
        "SENDINBLUE_API_KEY": _env_get_required("SENDINBLUE_API_KEY"),
        "SENDINBLUE_API_URL": _env_get_required(
            "SENDINBLUE_API_URL", default="https://api.sendinblue.com/v3/"
        ),
    }
    {% elif cookiecutter.mail_service == 'SparkPost' %}
    # Anymail
    # ------------------------------------------------------------------------------
    # https://anymail.readthedocs.io/en/stable/installation/#installing-anymail
    INSTALLED_APPS += ["anymail"]  # noqa F405

    # https://anymail.readthedocs.io/en/stable/esps/sparkpost/
    EMAIL_BACKEND = "anymail.backends.sparkpost.EmailBackend"
    ANYMAIL = {
        "SPARKPOST_API_KEY": _env_get_required("SPARKPOST_API_KEY"),
        "SPARKPOST_API_URL": _env_get_required(
            "SPARKPOST_API_URL", default="https://api.sparkpost.com/api/v1"
        ),
    }
    {% elif cookiecutter.mail_service == 'Custom SMTP' %}

    {% endif %}

#
# SMTP settings
#
if os.environ.get("USE_CUSTOM_SMTP") == "True":
    EMAIL_HOST = _env_get_required("SMTP_HOST")
    EMAIL_PORT = os.environ.get("SMTP_PORT", 587)
    EMAIL_HOST_USER = _env_get_required("SMTP_USER")
    EMAIL_HOST_PASSWORD = _env_get_required("SMTP_PASSWORD")
    EMAIL_ALLOWED_DOMAINS = _env_get_required("SMTP_VALID_TESTING_DOMAINS")
    EMAIL_USE_TLS = True
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


{% if cookiecutter.use_redis == 'y' %}
# REDIS
# ------------------------------------------------------------------------------
REDIS_URL = _env_get_required('REDIS_URL')
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

{% endif %}

{% if cookiecutter.use_celery == 'y' %}
#
# Celery
# ------------------------------------------------------------------------------
if USE_TZ:
    # http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-timezone
    CELERY_TIMEZONE = TIME_ZONE
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-broker_url
if REDIS_URL:
    CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL',REDIS_URL)
else:
    CELERY_BROKER_URL = _env_get_required('CELERY_BROKER_URL')
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-result_backend
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-accept_content
CELERY_ACCEPT_CONTENT = ["json"]
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-task_serializer
CELERY_TASK_SERIALIZER = "json"
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-result_serializer
CELERY_RESULT_SERIALIZER = "json"
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#task-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_TIME_LIMIT = 5 * 60
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#task-soft-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_SOFT_TIME_LIMIT = 60
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#beat-scheduler
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

{% endif %}





# STORAGES
# ----------------------------------------------------------------------------

PRIVATE_MEDIAFILES_LOCATION = ""
{% if cookiecutter.cloud_provider != 'None' %}
#
# STORAGES
# ------------------------------------------------------------------------------
# https://django-storages.readthedocs.io/en/latest/#installation
INSTALLED_APPS += ["storages"]  # noqa F405
{% endif %}

{% if cookiecutter.cloud_provider == 'AWS' %}
# Django Storages configuration
if os.environ.get("USE_AWS_STORAGE","False") == "True":
    AWS_ACCESS_KEY_ID = _env_get_required("AWS_ACCESS_KEY_ID")
    AWS_STORAGE_BUCKET_NAME = _env_get_required("AWS_STORAGE_BUCKET_NAME")
    AWS_SECRET_ACCESS_KEY = _env_get_required("AWS_SECRET_ACCESS_KEY")
    AWS_S3_CUSTOM_DOMAIN = AWS_STORAGE_BUCKET_NAME + ".s3.amazonaws.com"
    AWS_LOCATION = os.environ.get("AWS_LOCATION", "")
    AWS_S3_REGION_NAME = _env_get_required("AWS_S3_REGION_NAME")
    
    aws_s3_domain = AWS_S3_CUSTOM_DOMAIN or f"{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com"
    # Default file storage is private
    PRIVATE_MEDIAFILES_LOCATION = AWS_LOCATION + "/media"
    DEFAULT_FILE_STORAGE = "{{ cookiecutter.project_slug }}.utils.storages.PrivateMediaStorage"
    STATICFILES_STORAGE = "{{cookiecutter.project_slug}}.utils.storages.StaticRootS3Boto3Storage"
    COLLECTFAST_STRATEGY = "collectfast.strategies.boto3.Boto3Strategy"
    STATIC_URL = f"https://{aws_s3_domain}/static/"
    MEDIA_URL = f"https://{aws_s3_domain}/media/"

    

{% elif cookiecutter.cloud_provider == 'GCP' %}
GS_BUCKET_NAME = _env_get_required("DJANGO_GCP_STORAGE_BUCKET_NAME")
GS_DEFAULT_ACL = "publicRead"
{% endif %}

#
# STATIC
# ------------------------

{% if cookiecutter.use_whitenoise == 'y' %}
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
{% elif cookiecutter.cloud_provider == 'GCP' %}
STATICFILES_STORAGE = "{{cookiecutter.project_slug}}.utils.storages.StaticRootGoogleCloudStorage"
COLLECTFAST_STRATEGY = "collectfast.strategies.gcloud.GoogleCloudStrategy"
STATIC_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/static/"
{% endif %}

{% if cookiecutter.cloud_provider == 'GCP' %}
DEFAULT_FILE_STORAGE = "{{cookiecutter.project_slug}}.utils.storages.MediaRootGoogleCloudStorage"
MEDIA_URL = f"https://storage.googleapis.com/{GS_BUCKET_NAME}/media/"
{% endif %}

# Maximum size, in bytes, of a request before it will be streamed to the
# file system instead of into memory.
FILE_UPLOAD_MAX_MEMORY_SIZE = 2621440  # i.e. 2.5 MB

# Maximum size in bytes of request data (excluding file uploads) that will be
# read before a SuspiciousOperation (RequestDataTooBig) is raised.
DATA_UPLOAD_MAX_MEMORY_SIZE = 104857600  # i.e. 100 MB



# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
ADMIN_URL = "admin/"
# https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = [("""{{cookiecutter.author_name}}""", "{{cookiecutter.email}}")]
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
        "mail_admins": {
            "level": "WARNING",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
    },
    "loggers": {
        "django": {"handlers": ["console", "mail_admins"], "level": "INFO"},
        # The logger name matters -- it MUST match the name of the app
        "{{ cookiecutter.project_slug }}": {"handlers": ["console", "mail_admins"], "level": "DEBUG", "propagate": True},
        "{{ cookiecutter.project_slug }}.request": {"handlers": [], "level": "INFO", "propagate": True},
        "{{ cookiecutter.project_slug }}.tasks": {"handlers": [], "level": "INFO", "propagate": True},
    },
}

# Popular testing framework that allows logging to stdout while running unit tests
TEST_RUNNER = "django_nose.NoseTestSuiteRunner"

{% if cookiecutter.use_rollbar == 'y' %}
#
# Rollbar
# ------------------------------------------------------------------------------
# Rollbar error logging
if os.environ.get("USE_ROLLBAR") == "True":
    MIDDLEWARE += ["rollbar.contrib.django.middleware.RollbarNotifierMiddleware"]
    ROLLBAR = {
        "access_token": _env_get_required("ROLLBAR_ACCESS_TOKEN"),
        "environment": ENVIRONMENT,
        "branch": "master",
        "root": BASE_DIR,
    }
    LOGGING["handlers"].update(
        {
            # Rollbar exception logging handler
            "rollbar": {
                "level": "WARNING",
                "filters": ["require_debug_false"],
                "access_token": _env_get_required("ROLLBAR_ACCESS_TOKEN"),
                "environment": ENVIRONMENT,
                "class": "rollbar.logger.RollbarHandler",
            }
        }
    )
    LOGGING["loggers"]["django"]["handlers"].remove("mail_admins")
    LOGGING["loggers"]["django"]["handlers"].append("rollbar")
    LOGGING["loggers"]["{{ cookiecutter.project_slug }}"]["handlers"].remove("mail_admins")
    LOGGING["loggers"]["{{ cookiecutter.project_slug }}"]["handlers"].append("rollbar")
 {% endif %}

{% if cookiecutter.use_sentry == 'y' %}
# Sentry
# ------------------------------------------------------------------------------
if os.environ.get("USE_SENTRY") == "True":
    SENTRY_DSN = _env_get_required("SENTRY_DSN")
    SENTRY_LOG_LEVEL = _env_get_required("DJANGO_SENTRY_LOG_LEVEL", logging.INFO)

    sentry_logging = LoggingIntegration(
        level=SENTRY_LOG_LEVEL,  # Capture info and above as breadcrumbs
        event_level=logging.ERROR,  # Send errors as events
    )

    {% if cookiecutter.use_celery == 'y' %}
    integrations = [
        sentry_logging,
        DjangoIntegration(),
        CeleryIntegration(),
        RedisIntegration(),
    ]
    {% else %}
    integrations = [sentry_logging, DjangoIntegration(), RedisIntegration()]
    {% endif %}

    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=integrations,
        environment=_env_get_required("SENTRY_ENVIRONMENT", default="production"),
        traces_sample_rate=_env_get_required("SENTRY_TRACES_SAMPLE_RATE", default=0.0),
    )
{% endif %}


CORS_ALLOWED_ORIGINS = [
    {% if cookiecutter.client_app.lower() != 'none' %}
    "http://localhost:8089",
    {% endif %}
    "https://{{ cookiecutter.production_url }}",
    "https://{{ cookiecutter.staging_url }}"
]
