from django.urls import path, include
from django.contrib import admin
from django.conf import settings

urlpatterns = [
    path(r"admin/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
]
if settings.DEBUG:  # pragma: no cover
    urlpatterns += [path("api-auth/", include("rest_framework.urls"))]