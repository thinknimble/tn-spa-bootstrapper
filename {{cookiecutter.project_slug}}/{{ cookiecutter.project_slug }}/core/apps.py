from django.core.cache import cache
from django.apps import AppConfig

class CommonConfig(AppConfig):
    name = "{{ cookiecutter.project_slug }}.core"

    # def ready(self):
    #     ApiVersioning = self.get_model('ApiVersioning')
    #     if ApiVersioning:
    #         for version in ApiVersioning.objects.all():
    #             cache.set(f'api_version_{str(version.user.id)}',version.api_version)