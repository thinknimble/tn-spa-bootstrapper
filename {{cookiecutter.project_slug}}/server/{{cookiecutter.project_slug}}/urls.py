from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path(r"staff/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.common.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.common.urls")),
]
