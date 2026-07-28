"""JSON error responses for API paths.

The SPA catch-all in `common.urls` renders the built `index.html` for any
unmatched path that ends with a slash. Without the route and the middleware in
this module, an API path answers with HTML:

- An unknown API path matches the catch-all and answers 200 with the SPA bundle.
  A client sees success for a route that does not exist.
- An unhandled exception in an API view answers with Django's HTML error page.

Both bodies are useless to an API client, which expects JSON. The route and the
middleware here answer with the same JSON shape that
`rest_framework.views.exception_handler` uses, so a client needs no special case.

The middleware sits below DRF, and it does not compete with DRF. DRF catches an
exception inside `dispatch`, gives it to `EXCEPTION_HANDLER`, and returns a
`Response`. No exception leaves such a view, so Django never calls
`process_exception` for it. The middleware sees only the exceptions that DRF
re-raises, which are the ones that `exception_handler` returns `None` for. A
custom `EXCEPTION_HANDLER` therefore keeps priority, and the middleware cannot
mask it.
"""

import logging

from django.conf import settings
from django.core.exceptions import PermissionDenied, SuspiciousOperation
from django.http import Http404, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework import exceptions as drf_exceptions

# Django writes its own request errors to this logger, whose parent `django` logger
# `LOGGING` configures. This module logs an exception that Django would otherwise log
# there, so it uses the same name to keep one channel for request failures.
logger = logging.getLogger("django.request")

API_PATH_PREFIX = "/api/"

# Take each message from DRF, because DRF answers almost every error on an API path.
# A copy of the text here can drift away from DRF at the next upgrade. `str` resolves
# the lazy translation once, at import, so a response body and a test compare equal.
NOT_FOUND_DETAIL = str(drf_exceptions.NotFound.default_detail)
PERMISSION_DENIED_DETAIL = str(drf_exceptions.PermissionDenied.default_detail)
SERVER_ERROR_DETAIL = str(drf_exceptions.APIException.default_detail)


def _is_api_path(request):
    return request.path_info.startswith(API_PATH_PREFIX)


@csrf_exempt
def api_not_found(request, *args, **kwargs):
    """Answer 404 with a JSON body for an unmatched API path.

    This view is the last API route. Every real API route is declared before it,
    so a request that arrives here asks for a path that does not exist.

    The view is CSRF exempt because `CsrfViewMiddleware` runs before it. Without
    the exemption, a POST to an unknown API path answers 403 with an HTML body,
    which is the failure this module removes. The view changes no state, so the
    exemption adds no risk.
    """
    return JsonResponse({"detail": NOT_FOUND_DETAIL}, status=404)


class ApiJsonErrorMiddleware:
    """Turn an unhandled exception on an API path into a JSON 500.

    Keep this middleware in the base `MIDDLEWARE` list, above the Rollbar
    middleware that `settings` appends. Django calls `process_exception` from the
    bottom of the list upwards, so Rollbar reports the exception before this
    middleware builds the response.

    Django logs an unhandled exception to `django.request` only when the
    exception leaves the middleware chain. This middleware returns a response, so
    it must log the traceback itself.

    A `handler500` function is not enough: Django bypasses `handler500` when
    `DEBUG` is true, so a local run and a review app would keep the HTML page.

    Django calls `process_exception` before it turns `Http404` and
    `PermissionDenied` into their own responses, so this middleware must map those
    two itself. Without the map, a missing object and a denial both answer 500,
    which reports a client error as a server fault. DRF maps both inside
    `dispatch`, so the map guards a plain Django view under `/api/`.
    """

    # Status and body for an exception that carries its own meaning. Any other
    # exception is a real fault and answers 500.
    _MAPPED_EXCEPTIONS = (
        (Http404, 404, NOT_FOUND_DETAIL),
        (PermissionDenied, 403, PERMISSION_DENIED_DETAIL),
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        if not _is_api_path(request):
            # Let Django and the SPA keep their current behaviour.
            return None

        for exception_type, status, detail in self._MAPPED_EXCEPTIONS:
            if isinstance(exception, exception_type):
                return JsonResponse({"detail": detail}, status=status)

        # SuspiciousOperation and its subclasses keep Django's own handling, which
        # answers 400 and logs to django.security.
        if isinstance(exception, SuspiciousOperation):
            return None

        logger.error(
            "Unhandled exception in API view: %s %s",
            request.method,
            request.path_info,
            exc_info=exception,
        )

        body = {"detail": SERVER_ERROR_DETAIL}
        if settings.DEBUG:
            # Keep the error visible to a developer, who no longer gets the
            # Django technical error page for an API call.
            body["exception"] = repr(exception)
        return JsonResponse(body, status=500)
