from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path, path, include
from django.views.generic.base import TemplateView

from rest_framework import routers
from rest_auth import views as rest_auth_views

from {{ cookiecutter.project_slug }}.core import views as core_views



router = routers.DefaultRouter()
router.register("users", core_views.UserViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/login/", core_views.UserLoginView.as_view()),
    path("api/users/password/reset/confirm/<str:id>/<str:token>/", core_views.reset_password),
    path("api/users/password/reset/link/<str:email>/", core_views.request_reset_link),
    re_path(r"^$", core_views.index, name="index"),
    re_path(r"^.*/$", core_views.index, name="index"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
