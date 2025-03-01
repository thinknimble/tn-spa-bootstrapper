from unittest import mock

import pytest
from pytest_factoryboy import register
from rest_framework.test import APIClient

from {{ cookiecutter.project_slug }}.core.factories import UserFactory
from {{ cookiecutter.project_slug }}.core.models import User

JSON_RQST_HEADERS = dict(
    content_type="application/json",
    HTTP_ACCEPT="application/json",
)


register(UserFactory)


@pytest.fixture
def json_headers():
    return JSON_RQST_HEADERS


@pytest.fixture(autouse=True)
def mock_requests(request):
    """
    This fixture will trigger an error if you try to call the requests library.
    In the rare instance that you need to disable this fixture, add this decorator:
    @pytest.mark.use_requests
    """
    if "use_requests" not in request.keywords:
        exception = Exception("Do not call the internet from a unit test")
        with (
            mock.patch("requests.get", side_effect=exception),
            mock.patch("requests.post", side_effect=exception),
        ):
            yield
    else:
        yield


@pytest.fixture
def user(db):
    return User.objects.create(
        email="user@example.com", password="1234", first_name="test", last_name="user"
    )


@pytest.fixture
def api_client():
    # Use this as a replacement for the Django test client fixture it contains the force_authenticate method
    return APIClient()


@pytest.fixture
def sample_user(user_factory):
    user = user_factory()
    user.save()
    return user
