from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path(r"admin/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.core.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
]
