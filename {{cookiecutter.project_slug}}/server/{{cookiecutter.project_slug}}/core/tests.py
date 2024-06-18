from unittest import mock

import pytest
from django.contrib.auth import authenticate
from django.test import override_settings
from django.test.client import RequestFactory
from rest_framework.response import Response

from .models import User
from .serializers import UserLoginSerializer
from .views import PreviewTemplateView, request_reset_link


@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(email="test@example.com", password="password", first_name="Leslie", last_name="Burke")

    assert user.email == "test@example.com"
    assert user.password
    assert user.password != "password", "Password is stored as plain text"
    assert user.first_name == "Leslie"
    assert user.last_name == "Burke"

    # Validate default permissions
    assert user.is_active

    # AbstractBaseModel
    assert user.id
    assert user.created
    assert user.last_edited

    # PermissionsMixin
    assert hasattr(user, "is_superuser")
    assert not user.is_superuser


@pytest.mark.django_db
def test_create_superuser():
    superuser = User.objects.create_superuser(email="test@example.com", password="password", first_name="Leslie", last_name="Burke")

    assert superuser.is_superuser
    assert superuser.last_name == "Burke"


@pytest.mark.django_db
def test_create_user_from_factory(sample_user):
    assert sample_user.email


@pytest.mark.django_db
def test_user_can_login(api_client, sample_user):
    res = api_client.post("/api/login/", {"email": sample_user.email, "password": "password"}, format="json")
    assert res.status_code == 200


@pytest.mark.use_requests
@pytest.mark.django_db
def test_password_reset(caplog, api_client, sample_user):
    # fake our API call to the view that generates an email for the user to reset their password
    rf = RequestFactory()
    post_request = rf.post("api/password/reset/", {"email": sample_user.email})
    request_reset_link(post_request)

    # Grab from the logs the actual URL link we would send to the user
    password_reset_creds = caplog.text.split("password/reset/confirm/")[1].split('"')[0]
    password_reset_url = f"/api/password/reset/confirm/{password_reset_creds}/"

    # Verify the link works for reseting the password
    response = api_client.post(password_reset_url, data={"password": "new_password"}, format="json")
    assert response.status_code == 200

    # New Password should now work for authentication
    serializer = UserLoginSerializer(data={"email": sample_user.email, "password": "new_password"})
    serializer.is_valid()
    assert authenticate(**serializer.validated_data)


@pytest.mark.django_db
def test_user_token_gets_created_from_signal(sample_user):
    assert sample_user.auth_token


@pytest.mark.django_db
class TestPreviewTemplateView:
    url = "/api/template_preview/"

    @override_settings(DEBUG=False)
    def test_disabled_if_not_debug(self, client):
        response = client.post(self.url)
        assert response.status_code == 404

    @override_settings(DEBUG=True)
    def test_enabled_if_debug(self, client):
        with mock.patch("marks_home.core.views.render", return_value=Response()) as mocked_render:
            client.get(f"{self.url}?template=core/index-placeholder.html")
        assert mocked_render.call_count == 1

    @override_settings(DEBUG=True)
    def test_no_template_provided(self, client):
        response = client.post(self.url, data={"_send_to": "someone@example.com"})
        assert response.status_code == 400
        assert any("You must provide a template name" in e for e in response.json())

    @override_settings(DEBUG=True)
    def test_invalid_template_provided(self, client):
        response = client.post(f"{self.url}?template=SOME_TEMPLATE/WHICH_DOES_NOT/EXIST", data={"_send_to": "someone@example.com"})
        assert response.status_code == 400
        assert any("Invalid template name" in e for e in response.json())

    @override_settings(DEBUG=True)
    def test_missing_send_to(self, client):
        response = client.post(f"{self.url}?template=SOME_TEMPLATE/WHICH_DOES_NOT/EXIST")
        assert response.status_code == 400
        assert "This field is required." in response.json()["_send_to"]

    def test_parse_value_without_model(self):
        assert PreviewTemplateView.parse_value("some_key", "value") == ("some_key", "value")
        # This is expected behaviour since the nested keys are handled previously by the fill_context_from_params method
        assert PreviewTemplateView.parse_value("some__key", "value") == ("some__key", "value")

    def test_parse_value_with_model(self):
        with mock.patch("marks_home.core.views.apps") as mock_apps:
            PreviewTemplateView.parse_value("some_key:from_model", "core.User:PK")
            assert mock_apps.get_model.call_count == 1
            assert mock_apps.get_model.call_args[0][0] == "core.User"
            assert mock_apps.get_model().objects.get.call_count == 1
            assert mock_apps.get_model().objects.get.call_args.kwargs["pk"] == "PK"

    def test_fill_context_from_params(self):
        context = {}
        PreviewTemplateView().fill_context_from_params(
            context, {"key": 0, "parent__child": 1, "parent__other_child": 2, "parent__multi_nested__child": 3, "parent_field": 4}
        )
        assert context["key"] == 0
        assert context["parent"] == {"child": 1, "other_child": 2, "multi_nested": {"child": 3}}
        assert context["parent_field"] == 4
