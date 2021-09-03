from django.apps import AppConfig

class CommonConfig(AppConfig):
    name = "{{ cookiecutter.project_slug }}.core"

    def ready(self):
        # run/import here any thing you need to bootstraped after the app is loaded eg: signals  
        pass