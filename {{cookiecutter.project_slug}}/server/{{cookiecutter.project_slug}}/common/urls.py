from django.conf import settings
from django.conf.urls.static import static
from django.contrib.staticfiles.storage import staticfiles_storage
from django.urls import include, path, re_path
from django.views.generic.base import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework import permissions
from rest_framework_nested import routers

from {{ cookiecutter.project_slug }}.common import views as common_views

router = routers.SimpleRouter()
if settings.DEBUG:
    router = routers.DefaultRouter()


SpectacularAPIView.permission_classes = (permissions.IsAuthenticated,)
SpectacularSwaggerView.permission_classes = (permissions.IsAuthenticated,)
SpectacularRedocView.permission_classes = (permissions.IsAuthenticated,)

urlpatterns = [
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    # Optional UI:
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger",
    ),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger"),
    path("api/redoc/", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]
if settings.DEBUG:  # pragma: no cover
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += [path("api-auth/", include("rest_framework.urls"))]

if settings.IN_REVIEW:
    urlpatterns += [
        path(
            r".well-known/example.txt",
            RedirectView.as_view(
                url=staticfiles_storage.url("well-known-example/example.txt"),
                permanent=False,
            ),
            name="well-known-example",
        ),
    ]

urlpatterns += [
    path("", common_views.index),
    re_path(r".*/$", common_views.index),
]
