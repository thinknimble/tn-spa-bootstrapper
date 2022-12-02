from {{ cookiecutter.project_slug }}.settings import *  # noqa

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(BASE_DIR, "test_db.sqlite3"),  # noqa
    }
}

MEDIA_URL = "/media/"
DEFAULT_FILE_STORAGE = STATICFILES_STORAGE
