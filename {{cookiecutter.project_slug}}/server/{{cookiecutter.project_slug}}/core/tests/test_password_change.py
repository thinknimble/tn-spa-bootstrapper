"""
Tests for the password-change endpoint.
"""

import pytest
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from {{ cookiecutter.project_slug }}.core.models import User

URL = "/api/password/change/"
CURRENT_PASSWORD = "current-password-1234"
NEW_PASSWORD = "new-password-9876"


@pytest.fixture
def client_for_user(db):
    user = User.objects.create_user(email="member@example.com", password=CURRENT_PASSWORD)
    token, _ = Token.objects.get_or_create(user=user)
    client = APIClient()
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client, user


@pytest.mark.django_db
class TestPasswordChange:
    def test_change_requires_the_current_password(self, client_for_user):
        """The old-password field is enforced.

        dj-rest-auth reads OLD_PASSWORD_FIELD_ENABLED from the REST_AUTH dict
        and defaults it to False. Set outside that dict it has no effect, and
        an authenticated caller can set a new password without knowing the
        current one.
        """
        client, _ = client_for_user

        response = client.post(URL, {"new_password1": NEW_PASSWORD, "new_password2": NEW_PASSWORD})

        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_change_succeeds_with_the_current_password(self, client_for_user):
        client, user = client_for_user

        response = client.post(
            URL,
            {
                "old_password": CURRENT_PASSWORD,
                "new_password1": NEW_PASSWORD,
                "new_password2": NEW_PASSWORD,
            },
        )

        assert response.status_code == status.HTTP_200_OK
        user.refresh_from_db()
        assert user.check_password(NEW_PASSWORD)

    def test_change_is_refused_with_the_wrong_current_password(self, client_for_user):
        client, user = client_for_user

        response = client.post(
            URL,
            {
                "old_password": "not-the-current-password",
                "new_password1": NEW_PASSWORD,
                "new_password2": NEW_PASSWORD,
            },
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        user.refresh_from_db()
        assert user.check_password(CURRENT_PASSWORD)
