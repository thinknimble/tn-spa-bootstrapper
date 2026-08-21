"""Logout has to end the credential the API actually accepts."""

import pytest
from django.urls import reverse
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

LOGOUT_URL = "/api/logout/"
FACTORY_PASSWORD = "password"


def log_in(user):
    client = APIClient()
    response = client.post(
        "/api/login/",
        {"email": user.email, "password": FACTORY_PASSWORD},
        format="json",
    )
    assert response.status_code == 200, response.data
    token = response.data["token"]
    authenticated = APIClient()
    authenticated.credentials(HTTP_AUTHORIZATION=f"Token {token}")
    return authenticated, token


@pytest.mark.django_db
class TestLogoutRevokesTheToken:
    def test_the_token_stops_working_after_logout(self, user_factory):
        user = user_factory()
        client, _ = log_in(user)
        detail = reverse("user-detail", args=[user.pk])
        assert client.get(detail).status_code == 200

        assert client.post(LOGOUT_URL).status_code == 200

        assert client.get(detail).status_code == 401

    def test_logging_out_ends_a_session_opened_on_another_device(self, user_factory):
        """One `Token` row per user, so revocation is account-wide by design."""
        user = user_factory()
        first_device, _ = log_in(user)
        second_device = APIClient()
        second_device.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.get(user=user).key}")
        detail = reverse("user-detail", args=[user.pk])
        assert second_device.get(detail).status_code == 200

        first_device.post(LOGOUT_URL)

        assert second_device.get(detail).status_code == 401

    def test_one_account_logging_out_leaves_every_other_account_signed_in(self, user_factory):
        caller = user_factory()
        bystander = user_factory()
        caller_client, _ = log_in(caller)
        bystander_client, bystander_token = log_in(bystander)

        assert caller_client.post(LOGOUT_URL).status_code == 200

        assert bystander_client.get(reverse("user-detail", args=[bystander.pk])).status_code == 200
        assert Token.objects.filter(key=bystander_token).exists()

    def test_logging_out_without_credentials_is_a_no_op_rather_than_an_error(self, user_factory):
        signed_in = user_factory()
        log_in(signed_in)

        response = APIClient().post(LOGOUT_URL)

        assert response.status_code == 200
        assert Token.objects.filter(user=signed_in).exists()

    def test_logging_back_in_after_logout_mints_a_working_token(self, user_factory):
        user = user_factory()
        client, first_token = log_in(user)
        client.post(LOGOUT_URL)

        reissued_client, second_token = log_in(user)

        assert second_token != first_token
        assert reissued_client.get(reverse("user-detail", args=[user.pk])).status_code == 200
