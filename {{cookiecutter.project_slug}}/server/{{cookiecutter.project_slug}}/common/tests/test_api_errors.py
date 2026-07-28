"""Tests for the JSON error responses on API paths.

See `common.api_errors`. Two failure classes used to answer HTML: an unknown API
path fell through to the SPA catch-all, and an unhandled exception rendered a
Django HTML error page.
"""

from unittest import mock

import pytest
from django.conf import settings as django_settings
from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.http import Http404, JsonResponse
from django.test import Client, override_settings
from django.test.client import RequestFactory
from django.urls import re_path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import exception_handler

from {{ cookiecutter.project_slug }}.common.api_errors import (
    NOT_FOUND_DETAIL,
    PERMISSION_DENIED_DETAIL,
    SERVER_ERROR_DETAIL,
    ApiJsonErrorMiddleware,
)
from {{ cookiecutter.project_slug }}.urls import urlpatterns as real_urlpatterns

JSON_CONTENT_TYPE = "application/json"
HTML_CONTENT_TYPE = "text/html"
ROLLBAR_MIDDLEWARE = "rollbar.contrib.django.middleware.RollbarNotifierMiddleware"
# Build the dotted path from the class, instead of a second copy of the string that
# `settings` holds. A copy could drift, and the test below compares this path with
# the `MIDDLEWARE` entry, which only tests something if the two come from
# different places.
API_JSON_ERROR_MIDDLEWARE = (
    f"{ApiJsonErrorMiddleware.__module__}.{ApiJsonErrorMiddleware.__qualname__}"
)
PROCESS_EXCEPTION = f"{API_JSON_ERROR_MIDDLEWARE}.process_exception"
CUSTOM_HANDLER_DETAIL = "handled by the custom handler"


# ---- Views that raise, for the urlconf below ----


def _raise_boom(request):
    raise RuntimeError("boom")


def _raise_not_found(request):
    raise Http404("no such thing")


def _raise_permission_denied(request):
    raise PermissionDenied("nope")


def _raise_suspicious(request):
    raise SuspiciousOperation("bad request")


@api_view(["GET"])
@permission_classes([AllowAny])
def _raise_drf_validation_error(request):
    raise ValidationError({"some_field": ["Must be a number."]})


@api_view(["GET"])
@permission_classes([AllowAny])
def _raise_runtime_error_in_a_drf_view(request):
    raise RuntimeError("boom")


@api_view(["GET"])
@permission_classes([AllowAny])
def _fail_during_render(request):
    # JSONRenderer runs after the view returns, which is outside DRF's dispatch,
    # so DRF cannot map this failure.
    return Response({"value": object()})


def _handler_that_answers_everything(exc, context):
    """A custom EXCEPTION_HANDLER that also answers for a non-DRF exception."""
    response = exception_handler(exc, context)
    if response is None:
        return Response({"detail": CUSTOM_HANDLER_DETAIL}, status=500)
    response.data["handled_by"] = "custom"
    return response


# A urlconf that adds the views above. `override_settings(ROOT_URLCONF=__name__)`
# points Django at this module, so the real routes stay available. The real routes come
# from the root urlconf, not from `common.urls` alone, so the probe runs against the
# same route order that a deploy uses. Each probe route must precede the `^api/` catch
# that the real routes end with, or the catch answers 404 and the probe never runs.
urlpatterns = [
    re_path(r"^api/probe-boom/$", _raise_boom),
    re_path(r"^api/probe-not-found/$", _raise_not_found),
    re_path(r"^api/probe-denied/$", _raise_permission_denied),
    re_path(r"^api/probe-suspicious/$", _raise_suspicious),
    re_path(r"^api/probe-drf-validation/$", _raise_drf_validation_error),
    re_path(r"^api/probe-drf-runtime/$", _raise_runtime_error_in_a_drf_view),
    re_path(r"^api/probe-render-failure/$", _fail_during_render),
    *real_urlpatterns,
]


# ---- An unknown API path ----


@pytest.mark.parametrize(
    "path",
    [
        pytest.param("/api/does-not-exist/", id="trailing-slash"),
        # Without the slashless pattern, CommonMiddleware appends a slash and
        # redirects the client into the SPA bundle.
        pytest.param("/api/does-not-exist", id="no-trailing-slash"),
        pytest.param("/api/deep/does/not/exist/", id="nested"),
    ],
)
def test_unknown_api_path_answers_json_404(client, path):
    response = client.get(path)

    assert response.status_code == 404
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"detail": NOT_FOUND_DETAIL}


def test_post_to_an_unknown_api_path_answers_json_404_with_csrf_enforced():
    """CsrfViewMiddleware runs before the view, so without the exemption a POST to an
    unknown API path answers 403 with an HTML body, the failure this module removes."""
    response = Client(enforce_csrf_checks=True).post("/api/does-not-exist/", data={"a": 1})

    assert response.status_code == 404
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"detail": NOT_FOUND_DETAIL}


def test_unknown_non_api_path_still_answers_the_spa(client):
    """The SPA keeps its client-side routing for a path outside /api/."""
    response = client.get("/some-frontend-route/")

    assert response["Content-Type"].startswith(HTML_CONTENT_TYPE)


# ---- A real API route keeps its own answer ----


@pytest.mark.parametrize(
    "path",
    [
        pytest.param("/api/schema/", id="schema"),
        pytest.param("/api/users/", id="router"),
        pytest.param("/api/login/", id="view"),
        # The root urlconf includes `common.urls` last, after `core.urls` and the
        # chat app, so the catch cannot shadow a route from another app either.
        pytest.param("/api/chat/system-prompt/", id="other-app"),
    ],
)
def test_a_real_api_route_is_not_swallowed_by_the_api_catch(client, path):
    """The catch sits after every real route, so a real route still resolves."""
    response = client.get(path)

    assert response.status_code != 404


# ---- An unhandled exception ----


@override_settings(ROOT_URLCONF=__name__)
@pytest.mark.parametrize("debug", [True, False])
def test_unhandled_exception_on_api_path_answers_json_500(client, settings, debug):
    """Django bypasses handler500 when DEBUG is true, so only middleware covers both."""
    settings.DEBUG = debug

    # The middleware handles the exception, so the test client must not re-raise.
    client.raise_request_exception = False
    response = client.get("/api/probe-boom/")

    assert response.status_code == 500
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json()["detail"] == SERVER_ERROR_DETAIL
    if debug:
        assert "boom" in response.json()["exception"]
    else:
        assert "exception" not in response.json()


# ---- An exception that carries its own meaning keeps its own status ----


@override_settings(ROOT_URLCONF=__name__)
def test_http404_in_an_api_view_answers_json_404(client):
    """Django calls process_exception before it maps Http404, so the middleware must
    map it. Without the map a missing object reports as a server fault."""
    client.raise_request_exception = False
    response = client.get("/api/probe-not-found/")

    assert response.status_code == 404
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"detail": NOT_FOUND_DETAIL}


@override_settings(ROOT_URLCONF=__name__)
def test_permission_denied_in_an_api_view_answers_json_403(client):
    """A denial must not report as a server fault."""
    client.raise_request_exception = False
    response = client.get("/api/probe-denied/")

    assert response.status_code == 403
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"detail": PERMISSION_DENIED_DETAIL}


@override_settings(ROOT_URLCONF=__name__)
def test_suspicious_operation_keeps_djangos_handling(client):
    """Django answers 400 and logs to django.security, so the middleware steps aside."""
    client.raise_request_exception = False
    response = client.get("/api/probe-suspicious/")

    assert response.status_code == 400


# ---- The layering between DRF and the middleware ----


@override_settings(ROOT_URLCONF=__name__)
def test_drf_exception_keeps_its_own_response(client):
    """DRF answers inside `dispatch`, so no exception reaches the middleware.

    Without this test the middleware could start to swallow a DRF error and report
    a client mistake as a server fault.
    """
    with mock.patch(
        PROCESS_EXCEPTION, autospec=True, side_effect=ApiJsonErrorMiddleware.process_exception
    ) as spy:
        response = client.get("/api/probe-drf-validation/")

    assert response.status_code == 400
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"some_field": ["Must be a number."]}
    assert not spy.called, "DRF handled the exception, so the middleware must stay out."


@override_settings(ROOT_URLCONF=__name__)
def test_drf_view_re_raises_a_real_fault_to_the_middleware(client, settings):
    """The other half of the layering: the default handler returns None for a fault.

    DRF then re-raises, and the middleware answers.
    """
    settings.DEBUG = False
    client.raise_request_exception = False

    with mock.patch(
        PROCESS_EXCEPTION, autospec=True, side_effect=ApiJsonErrorMiddleware.process_exception
    ) as spy:
        response = client.get("/api/probe-drf-runtime/")

    assert response.status_code == 500
    assert response.json() == {"detail": SERVER_ERROR_DETAIL}
    assert spy.called


@override_settings(ROOT_URLCONF=__name__)
def test_failure_during_response_render_answers_json_500(client, settings):
    """The renderer runs after `dispatch`, so only the middleware can answer here."""
    settings.DEBUG = False
    client.raise_request_exception = False

    response = client.get("/api/probe-render-failure/")

    assert response.status_code == 500
    assert response["Content-Type"].startswith(JSON_CONTENT_TYPE)
    assert response.json() == {"detail": SERVER_ERROR_DETAIL}


@override_settings(ROOT_URLCONF=__name__)
def test_custom_drf_exception_handler_keeps_priority(client, settings):
    """The middleware is a net below DRF, and it cannot mask a custom handler.

    A custom `EXCEPTION_HANDLER` that answers for a non-DRF exception stops the
    exception inside `dispatch`, so the middleware never runs.
    """
    settings.DEBUG = False
    settings.REST_FRAMEWORK = dict(
        settings.REST_FRAMEWORK,
        EXCEPTION_HANDLER=f"{__name__}._handler_that_answers_everything",
    )
    client.raise_request_exception = False

    with mock.patch(
        PROCESS_EXCEPTION, autospec=True, side_effect=ApiJsonErrorMiddleware.process_exception
    ) as spy:
        response = client.get("/api/probe-drf-runtime/")

    assert response.status_code == 500
    assert response.json() == {"detail": CUSTOM_HANDLER_DETAIL}
    assert not spy.called, "The custom handler answered, so the middleware must stay out."


# ---- The middleware in isolation ----


def test_middleware_ignores_a_non_api_path():
    """Django and the SPA keep their current error handling outside /api/."""
    middleware = ApiJsonErrorMiddleware(lambda request: None)
    request = RequestFactory().get("/some-frontend-route/")

    assert middleware.process_exception(request, RuntimeError("boom")) is None


def test_middleware_handles_an_api_path():
    middleware = ApiJsonErrorMiddleware(lambda request: None)
    request = RequestFactory().get("/api/anything/")

    response = middleware.process_exception(request, RuntimeError("boom"))

    assert isinstance(response, JsonResponse)
    assert response.status_code == 500


def test_middleware_runs_after_rollbar_reports():
    """Django calls process_exception from the bottom of MIDDLEWARE upwards.

    Rollbar must therefore sit below this middleware, so that it reports the
    exception before this middleware turns it into a response.

    `settings` appends the Rollbar middleware only when a Rollbar token is set, and
    the test settings hold none. So this test asserts against the list that
    `settings` builds, and reproduces the append. A conditional check would pass
    without an assertion during a normal test run.
    """
    assert API_JSON_ERROR_MIDDLEWARE in django_settings.MIDDLEWARE
    assert django_settings.MIDDLEWARE[-1] == API_JSON_ERROR_MIDDLEWARE, (
        "The middleware must stay last in the base list, because settings appends "
        "the Rollbar middleware after it."
    )

    with_rollbar = [*django_settings.MIDDLEWARE, ROLLBAR_MIDDLEWARE]
    assert with_rollbar.index(API_JSON_ERROR_MIDDLEWARE) < with_rollbar.index(ROLLBAR_MIDDLEWARE)
