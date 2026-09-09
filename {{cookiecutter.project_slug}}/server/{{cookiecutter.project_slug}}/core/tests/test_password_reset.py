import pytest
from django.contrib.auth.tokens import default_token_generator
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

ORIGINAL_PASSWORD = "DTdoZspHzGE2GV-F3"
NEW_PASSWORD = "orchid-lantern-42"


def reset_url(user):
    return reverse(
        "password_reset_confirm", args=[user.pk, default_token_generator.make_token(user)]
    )


@pytest.mark.django_db
class TestPasswordResetStrength:
    """Password policy on the reset-confirm path."""

    def test_a_password_on_djangos_common_list_is_refused(self, user_factory):
        user = user_factory(email="rosalind.franklin@example.test")

        response = APIClient().post(reset_url(user), {"password": "qwerty123"}, format="json")

        assert response.status_code == 400
        assert any("too common" in message for message in response.data["password"]), response.data
        user.refresh_from_db()
        assert user.check_password(ORIGINAL_PASSWORD)

    def test_a_password_derived_from_the_users_own_email_is_refused(self, user_factory):
        email = "rosalind.franklin@example.test"
        user = user_factory(email=email)

        response = APIClient().post(reset_url(user), {"password": email}, format="json")

        assert response.status_code == 400
        assert any("too similar" in message for message in response.data["password"]), response.data
        user.refresh_from_db()
        assert user.check_password(ORIGINAL_PASSWORD)

    def test_a_request_with_no_password_leaves_the_account_alone(self, user_factory):
        user = user_factory()

        response = APIClient().post(reset_url(user), {}, format="json")

        assert response.status_code == 400
        assert "token" not in response.data
        user.refresh_from_db()
        assert user.has_usable_password()
        assert user.check_password(ORIGINAL_PASSWORD)

    def test_a_strong_password_completes_the_reset_and_returns_a_session(self, user_factory):
        user = user_factory()

        response = APIClient().post(reset_url(user), {"password": NEW_PASSWORD}, format="json")

        assert response.status_code == 200
        assert response.data["token"]
        user.refresh_from_db()
        assert user.check_password(NEW_PASSWORD)

    def test_a_stale_authorization_header_does_not_block_the_reset(self, user_factory):
        user = user_factory()
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION="Token deadbeefdeadbeefdeadbeefdeadbeef")

        response = client.post(reset_url(user), {"password": NEW_PASSWORD}, format="json")

        assert response.status_code == 200
        user.refresh_from_db()
        assert user.check_password(NEW_PASSWORD)

    def test_the_reset_revokes_the_accounts_existing_api_token(self, user_factory):
        user = user_factory()
        stolen = Token.objects.get(user=user).key

        response = APIClient().post(reset_url(user), {"password": NEW_PASSWORD}, format="json")

        assert response.status_code == 200
        assert not Token.objects.filter(key=stolen).exists()
        assert response.data["token"] != stolen

        stale = APIClient()
        stale.credentials(HTTP_AUTHORIZATION=f"Token {stolen}")
        assert stale.get(reverse("user-list")).status_code == 401

    def test_a_password_over_the_length_ceiling_is_refused(self, user_factory):
        user = user_factory()

        response = APIClient().post(reset_url(user), {"password": "a" * 129}, format="json")

        assert response.status_code == 400
        user.refresh_from_db()
        assert user.check_password(ORIGINAL_PASSWORD)

    def test_an_invalid_token_is_refused_before_the_password_is_read(self, user_factory):
        user = user_factory()

        response = APIClient().post(
            reverse("password_reset_confirm", args=[user.pk, "not-a-token"]),
            {"password": NEW_PASSWORD},
            format="json",
        )

        assert response.status_code == 400
        user.refresh_from_db()
        assert user.check_password(ORIGINAL_PASSWORD)
