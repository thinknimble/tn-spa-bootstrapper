from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "{{ cookiecutter.project_name }} Admin"
admin.site.site_title = "{{ cookiecutter.project_name }}"

urlpatterns = [
    path(r"staff/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.common.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.common.urls")),
]
