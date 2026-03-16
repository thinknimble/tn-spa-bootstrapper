from django.contrib import admin
from django.urls import include, path
from {{ cookiecutter.project_slug }}.common.views import health_check

admin.site.site_header = "{{ cookiecutter.project_name }} Admin"
admin.site.site_title = "{{ cookiecutter.project_name }}"

urlpatterns = [
    path(r"health/", health_check, name="health_check"),
    path(r"staff/", admin.site.urls),
    path(r"api/chat/", include("{{ cookiecutter.project_slug }}.chat.urls")),
    # order matters
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.common.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.common.urls")),
]
