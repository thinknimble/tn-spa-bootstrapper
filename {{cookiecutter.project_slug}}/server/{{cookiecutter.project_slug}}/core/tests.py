from unittest import mock

import pytest
from django.contrib.auth import authenticate
from django.test import override_settings
from django.test.client import RequestFactory
from rest_framework import status
from rest_framework.response import Response

from .models import User
from .serializers import UserLoginSerializer
from .views import PreviewTemplateView, request_reset_code


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
def test_create_user_api(api_client):
    data = {"email": "example@example.com", "password": "password", "first_name": "Test", "last_name": "User"}
    res = api_client.post("/api/users/", data, format="json")
    assert res.status_code == status.HTTP_201_CREATED, res.data


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
    assert res.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_wrong_email(api_client, sample_user):
    res = api_client.post("/api/login/", {"email": "wrong@example.com", "password": "password"}, format="json")
    assert res.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_wrong_password(api_client, sample_user):
    res = api_client.post("/api/login/", {"email": sample_user.email, "password": "wrong"}, format="json")
    assert res.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_get_user(api_client, sample_user):
    api_client.force_authenticate(sample_user)
    res = api_client.get(f"/api/users/{sample_user.pk}/")
    assert res.status_code == status.HTTP_200_OK
    assert res.data["email"] == sample_user.email


@pytest.mark.django_db
def test_get_other_user(api_client, sample_user, user_factory):
    api_client.force_authenticate(sample_user)
    other_user = user_factory()
    other_user.save()
    res = api_client.get(f"/api/users/{other_user.pk}/")
    assert res.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
def test_update_user(api_client, sample_user):
    existing_email = sample_user.email
    api_client.force_authenticate(sample_user)
    data = {"email": "example@example.com", "password": "password", "first_name": "Test", "last_name": "User"}
    res = api_client.put(f"/api/users/{sample_user.pk}/", data, format="json")
    assert res.status_code == status.HTTP_200_OK
    sample_user.refresh_from_db()
    # Email should NOT have changed
    assert sample_user.email == existing_email
    assert sample_user.first_name == data["first_name"] == res.data["first_name"]
    assert sample_user.last_name == data["last_name"] == res.data["last_name"]


@pytest.mark.django_db
def test_delete_user(api_client, sample_user):
    api_client.force_authenticate(sample_user)
    res = api_client.delete(f"/api/users/{sample_user.pk}/")
    assert res.status_code == status.HTTP_204_NO_CONTENT
    sample_user.refresh_from_db()
    assert sample_user.is_active is False


@pytest.mark.use_requests
@pytest.mark.django_db
def test_password_reset(caplog, api_client, sample_user):
    # fake our API call to the view that generates an email for the user to reset their password
    rf = RequestFactory()
    post_request = rf.post("api/password/reset/", {"email": sample_user.email})
    request_reset_code(post_request)

    code = caplog.text.split()[-1].replace('"', "")
    password_reset_url = f"/api/password/reset/confirm/{sample_user.email}/"

    # Verify the link works for reseting the password
    response = api_client.post(password_reset_url, data={"password": "new_password", "code": code}, format="json")
    assert response.status_code == status.HTTP_200_OK

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
        assert response.status_code == status.HTTP_404_NOT_FOUND

    @override_settings(DEBUG=True)
    def test_enabled_if_debug(self, client):
        with mock.patch("{{ cookiecutter.project_slug }}.core.views.render", return_value=Response()) as mocked_render:
            client.get(f"{self.url}?template=core/index-placeholder.html")
        assert mocked_render.call_count == 1

    @override_settings(DEBUG=True)
    def test_no_template_provided(self, client):
        response = client.post(self.url, data={"_send_to": "someone@example.com"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert any("You must provide a template name" in e for e in response.json())

    @override_settings(DEBUG=True)
    def test_invalid_template_provided(self, client):
        response = client.post(f"{self.url}?template=SOME_TEMPLATE/WHICH_DOES_NOT/EXIST", data={"_send_to": "someone@example.com"})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert any("Invalid template name" in e for e in response.json())

    @override_settings(DEBUG=True)
    def test_missing_send_to(self, client):
        response = client.post(f"{self.url}?template=SOME_TEMPLATE/WHICH_DOES_NOT/EXIST")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "This field is required." in response.json()["_send_to"]

    def test_parse_value_without_model(self):
        assert PreviewTemplateView.parse_value("some_key", "value") == ("some_key", "value")
        # This is expected behaviour since the nested keys are handled previously by the fill_context_from_params method
        assert PreviewTemplateView.parse_value("some__key", "value") == ("some__key", "value")

    def test_parse_value_with_model(self):
        with mock.patch("{{ cookiecutter.project_slug }}.core.views.apps") as mock_apps:
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
