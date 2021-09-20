from {{ cookiecutter.project_slug }}.common.serializers import ErrorResponseSerializer

from storages.backends.s3boto3 import S3Boto3Storage
from rest_framework.views import exception_handler





def isErrorInstance(data):
    print(data)
    if data.get("code", None) and data.get("title", None):
        return True
    return False


def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first,
    # to get the standard error response.
    response = exception_handler(exc, context)

    # Now add the HTTP status code to the response.
    if response is not None:
        errors = response.data
        code, title = getCodeString(response.status_code)
        if code and not isErrorInstance(response.data):
            response.data = ErrorResponseSerializer(data={"code": code, "title": title, "errors": errors}).initial_data

    return response


def getCodeString(status_code):
    errors = {
        "400": "BAD_REQUEST",
        "401": "UNAUTHORIZED",
        "402": "PAYMENT_REQUIRED",
        "403": "FORBIDDEN",
        "404": "NOT_FOUND",
        "405": "METHOD_NOT_ALLOWED",
        "406": "NOT_ACCEPTABLE",
        "407": "PROXY_AUTHENTICATION_REQUIRED",
        "408": "REQUEST_TIMEOUT",
        "409": "CONFLICT",
        "410": "GONE",
        "411": "LENGTH_REQUIRED",
        "412": "PRECONDITION_FAILED",
        "413": "REQUEST_ENTITY_TOO_LARGE",
        "414": "REQUEST_URI_TOO_LONG",
        "415": "UNSUPPORTED_MEDIA_TYPE",
        "416": "REQUESTED_RANGE_NOT_SATISFIABLE",
        "417": "EXPECTATION_FAILED",
        "422": "UNPROCESSABLE_ENTITY",
        "423": "LOCKED",
        "424": "FAILED_DEPENDENCY",
        "428": "PRECONDITION_REQUIRED",
        "429": "TOO_MANY_REQUESTS",
        "431": "REQUEST_HEADER_FIELDS_TOO_LARGE",
        "451": "UNAVAILABLE_FOR_LEGAL_REASON",
    }
    code = errors.get(str(status_code))
    title = " ".join(code.split("_")) if code else None
    return code, title
