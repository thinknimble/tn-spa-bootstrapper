from dj_rest_auth import views as rest_auth_views
from django.conf import settings
from django.urls import include, path
from rest_framework_nested import routers

from {{ cookiecutter.project_slug }}.core import views as core_views

router = routers.SimpleRouter()
if settings.DEBUG:
    router = routers.DefaultRouter()

router.register("users", core_views.UserViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
    path("api/login/", core_views.UserLoginView.as_view()),
    path(r"api/logout/", rest_auth_views.LogoutView.as_view()),
    path(
        r"api/password/reset/confirm/<str:uid>/<str:token>/",
        core_views.reset_password,
        name="password_reset_confirm",
    ),
    path(r"api/password/reset/", core_views.request_reset_link),
    path(r"api/password/change/", rest_auth_views.PasswordChangeView.as_view()),
    path(
        r"api/verify-email/<str:uid>/<str:token>/",
        core_views.verify_email,
        name="verify_email",
    ),
    path(
        r"api/resend-verification-email/",
        core_views.resend_verification_email,
        name="resend_verification_email",
    ),
    path(r"api/template_preview/", core_views.PreviewTemplateView.as_view()),
]
