import pytest

from {{ cookiecutter.project_slug }}.core.models import User


@pytest.fixture
def user(db):
    return User.objects.create(email="user@example.com", password="1234", first_name="test", last_name="user")
