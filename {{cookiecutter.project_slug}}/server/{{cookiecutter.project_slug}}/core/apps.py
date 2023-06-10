from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "{{ cookiecutter.project_slug }}.core"

    def ready(self) -> None:
        # this import is required to register signals after the app is initialized
        # https://docs.djangoproject.com/en/4.1/topics/signals/
        import from {{ cookiecutter.project_slug }}.core.signals import create_auth_token_add_permissions  # noqa

        return super().ready()
