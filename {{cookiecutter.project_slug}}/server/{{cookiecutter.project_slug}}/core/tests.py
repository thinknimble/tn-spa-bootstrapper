from unittest import mock

import pytest
from django.contrib.auth import authenticate
from django.test import override_settings
from django.test.client import RequestFactory
from rest_framework import status
from rest_framework.response import Response

from .factories import GroupFactory, UserFactory
from .models import User
from .serializers import UserLoginSerializer, UserRegistrationSerializer
from .views import PreviewTemplateView, request_reset_link, verify_email


@pytest.mark.django_db
def test_create_user():
    user = User.objects.create_user(
        email="test@example.com",
        password="password",
        first_name="Leslie",
        last_name="Burke",
    )

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
    data = {
        "email": "example@example.com",
        "password": "password",
        "first_name": "Test",
        "last_name": "User",
    }
    res = api_client.post("/api/users/", data, format="json")
    assert res.status_code == status.HTTP_201_CREATED, res.data


@pytest.mark.django_db
def test_create_superuser():
    superuser = User.objects.create_superuser(
        email="test@example.com",
        password="password",
        first_name="Leslie",
        last_name="Burke",
    )

    assert superuser.is_superuser
    assert superuser.last_name == "Burke"


@pytest.mark.django_db
def test_create_user_from_factory(sample_user):
    assert sample_user.email


@pytest.mark.django_db
def test_user_can_login(api_client, sample_user):
    res = api_client.post(
        "/api/login/",
        {"email": sample_user.email, "password": "password"},
        format="json",
    )
    assert res.status_code == status.HTTP_200_OK


@pytest.mark.django_db
def test_wrong_email(api_client, sample_user):
    res = api_client.post(
        "/api/login/",
        {"email": "wrong@example.com", "password": "password"},
        format="json",
    )
    assert res.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.django_db
def test_wrong_password(api_client, sample_user):
    res = api_client.post(
        "/api/login/", {"email": sample_user.email, "password": "wrong"}, format="json"
    )
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
    data = {
        "email": "example@example.com",
        "password": "password",
        "first_name": "Test",
        "last_name": "User",
    }
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
    # fake our API call to the view that generates an email for the user to reset
    # their password
    rf = RequestFactory()
    post_request = rf.post("api/password/reset/", {"email": sample_user.email})
    request_reset_link(post_request)

    # Grab from the logs the actual URL link we would send to the user
    password_reset_creds = caplog.text.split("password/reset/confirm/")[1].split('"')[0]
    password_reset_url = f"/api/password/reset/confirm/{password_reset_creds}/"

    # Verify the link works for reseting the password
    response = api_client.post(password_reset_url, data={"password": "new_password"}, format="json")
    assert response.status_code == status.HTTP_200_OK

    # New Password should now work for authentication
    serializer = UserLoginSerializer(data={"email": sample_user.email, "password": "new_password"})
    serializer.is_valid()
    assert authenticate(**serializer.validated_data)


@pytest.mark.django_db
def test_user_token_gets_created_from_signal(sample_user):
    assert sample_user.auth_token


@pytest.mark.django_db
class TestEmailValidation:
    """Test email validation and allowlist functionality"""

    def test_email_validation_basic(self):
        """Test basic email validation"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "valid@example.com",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        assert serializer.is_valid()

    def test_email_validation_invalid_format(self):
        """Test email validation with invalid format"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "invalidemail",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    @override_settings(USE_EMAIL_ALLOWLIST=True, EMAIL_ALLOWLIST=["allowed@example.com"])
    def test_email_allowlist_allowed(self):
        """Test email allowlist with allowed email"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "allowed@example.com",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        assert serializer.is_valid()

    @override_settings(USE_EMAIL_ALLOWLIST=True, EMAIL_ALLOWLIST=["allowed@example.com"])
    def test_email_allowlist_blocked(self):
        """Test email allowlist with blocked email"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "notallowed@example.com",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        assert not serializer.is_valid()
        assert "email" in serializer.errors

    @override_settings(USE_EMAIL_ALLOWLIST=False)
    def test_email_allowlist_disabled(self):
        """Test that allowlist is properly disabled when USE_EMAIL_ALLOWLIST is False"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "any@example.com",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        assert serializer.is_valid()

    @mock.patch("{{ cookiecutter.project_slug }}.core.serializers.logger")
    @mock.patch("{{ cookiecutter.project_slug }}.core.serializers.rollbar")
    def test_suspicious_email_warning(self, mock_rollbar, mock_logger):
        """Test that suspicious emails trigger warnings"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "test@suspicious.xyz",
                "password": "strongpassword123",
                "first_name": "Test",
                "last_name": "User",
            }
        )
        serializer.is_valid()
        mock_logger.warning.assert_called_once()
        assert "Potentially risky email" in str(mock_logger.warning.call_args)

    @mock.patch("{{ cookiecutter.project_slug }}.core.serializers.logger")
    @mock.patch("{{ cookiecutter.project_slug }}.core.serializers.rollbar")
    def test_name_validation_warning(self, mock_rollbar, mock_logger):
        """Test that non-alphabetic names trigger warnings"""
        serializer = UserRegistrationSerializer(
            data={
                "email": "test@example.com",
                "password": "strongpassword123",
                "first_name": "Test123",
                "last_name": "User!@#",
            }
        )
        serializer.is_valid()
        # Should be called twice - once for first_name, once for last_name
        assert mock_logger.warning.call_count == 2
        assert "non-alphabetic characters" in str(mock_logger.warning.call_args_list[0])


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
        response = client.post(
            f"{self.url}?template=SOME_TEMPLATE/WHICH_DOES_NOT/EXIST",
            data={"_send_to": "someone@example.com"},
        )
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
            context,
            {
                "key": 0,
                "parent__child": 1,
                "parent__other_child": 2,
                "parent__multi_nested__child": 3,
                "parent_field": 4,
            },
        )
        assert context["key"] == 0
        assert context["parent"] == {"child": 1, "other_child": 2, "multi_nested": {"child": 3}}
        assert context["parent_field"] == 4


@pytest.mark.django_db
class TestUserViewSetGroupFiltering:
    """Test the UserViewSet group filtering functionality."""

    def test_staff_can_list_all_users(self, api_client):
        """Test that staff users can list all users."""
        # Create a staff user
        staff_user = UserFactory.create_staff_user()

        # Create some regular users
        UserFactory()
        UserFactory()

        api_client.force_authenticate(staff_user)
        response = api_client.get("/api/users/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 3  # staff_user + 2 regular users

    def test_regular_user_cannot_list_users(self, api_client):
        """Test that regular users cannot list users."""
        regular_user = UserFactory()
        UserFactory()  # Another user

        api_client.force_authenticate(regular_user)
        response = api_client.get("/api/users/")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_filter_users_by_single_group(self, api_client):
        """Test filtering users by a single group."""
        # Create groups
        group1 = GroupFactory(name="Editors")
        group2 = GroupFactory(name="Viewers")

        # Create users with different groups
        user1 = UserFactory(groups=[group1])
        user2 = UserFactory(groups=[group2])
        user3 = UserFactory(groups=[group1, group2])
        user4 = UserFactory()  # No groups

        staff_user = UserFactory.create_staff_user()
        api_client.force_authenticate(staff_user)

        # Filter by group1
        response = api_client.get(f"/api/users/?groups={group1.id}")

        assert response.status_code == status.HTTP_200_OK
        user_ids = [str(user["id"]) for user in response.data["results"]]
        assert str(user1.id) in user_ids
        assert str(user3.id) in user_ids
        assert str(user2.id) not in user_ids
        assert str(user4.id) not in user_ids

    def test_filter_users_by_multiple_groups(self, api_client):
        """Test filtering users by multiple groups."""
        # Create groups
        group1 = GroupFactory(name="Editors")
        group2 = GroupFactory(name="Viewers")
        group3 = GroupFactory(name="Admins")

        # Create users with different groups
        user1 = UserFactory(groups=[group1])
        user2 = UserFactory(groups=[group2])
        user3 = UserFactory(groups=[group1, group2])
        user4 = UserFactory(groups=[group3])
        user5 = UserFactory()  # No groups

        staff_user = UserFactory.create_staff_user()
        api_client.force_authenticate(staff_user)

        # Filter by group1 and group2
        response = api_client.get(f"/api/users/?groups={group1.id},{group2.id}")

        assert response.status_code == status.HTTP_200_OK
        user_ids = [str(user["id"]) for user in response.data["results"]]
        assert str(user1.id) in user_ids
        assert str(user2.id) in user_ids
        assert str(user3.id) in user_ids
        assert str(user4.id) not in user_ids
        assert str(user5.id) not in user_ids

    def test_filter_users_by_nonexistent_group(self, api_client):
        """Test filtering users by a nonexistent group."""
        staff_user = UserFactory.create_staff_user()
        UserFactory()  # Create a user

        api_client.force_authenticate(staff_user)
        response = api_client.get("/api/users/?groups=99999")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 0

    def test_filter_users_by_empty_groups(self, api_client):
        """Test filtering users with empty groups parameter."""
        staff_user = UserFactory.create_staff_user()
        UserFactory()

        api_client.force_authenticate(staff_user)
        response = api_client.get("/api/users/?groups=")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data["results"]) == 2  # staff_user + created user

    def test_regular_user_can_still_access_own_data(self, api_client):
        """Test that regular users can still access their own data."""
        regular_user = UserFactory()

        api_client.force_authenticate(regular_user)
        response = api_client.get(f"/api/users/{regular_user.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == regular_user.email

    def test_regular_user_cannot_access_other_user_data(self, api_client):
        """Test that regular users cannot access other users' data."""
        regular_user = UserFactory()
        other_user = UserFactory()

        api_client.force_authenticate(regular_user)
        response = api_client.get(f"/api/users/{other_user.id}/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_staff_can_access_any_user_data(self, api_client):
        """Test that staff users can access any user's data."""
        staff_user = UserFactory.create_staff_user()
        other_user = UserFactory()

        api_client.force_authenticate(staff_user)
        response = api_client.get(f"/api/users/{other_user.id}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == other_user.email

    def test_filter_prevents_duplicates_with_multiple_group_matches(self, api_client):
        """Test that filtering doesn't return duplicate users when they match multiple filter criteria.

        This test specifically validates that the distinct() clause in MultiValueModelFilter
        prevents duplicate results when a user belongs to multiple groups being filtered.
        """
        # Create groups
        group1 = GroupFactory(name="Editors")
        group2 = GroupFactory(name="Viewers")
        group3 = GroupFactory(name="Admins")

        # Create a user that belongs to all three groups
        user_with_multiple_groups = UserFactory(groups=[group1, group2, group3])

        # Create a staff user to make the request
        staff_user = UserFactory.create_staff_user()
        api_client.force_authenticate(staff_user)

        # Filter by multiple groups that the same user belongs to
        # Without distinct(), this could potentially return the user multiple times
        response = api_client.get(f"/api/users/?groups={group1.id},{group2.id},{group3.id}")

        assert response.status_code == status.HTTP_200_OK

        # Count how many times our user appears in the results
        user_ids = [str(user["id"]) for user in response.data["results"]]
        occurrences = user_ids.count(str(user_with_multiple_groups.id))

        # The user should appear exactly once, not multiple times
        assert occurrences == 1, f"User appeared {occurrences} times, expected 1"
        assert len(response.data["results"]) == 1


@pytest.mark.django_db
class TestEmailVerification:
    """Test email verification functionality"""

    def test_user_created_with_unverified_email(self):
        """Test that newly created users have unverified email by default"""
        user = User.objects.create_user(
            email="test@example.com",
            password="password",
            first_name="Test",
            last_name="User",
        )
        assert user.email_verified is False

    @mock.patch("{{ cookiecutter.project_slug }}.core.views.send_html_email")
    def test_verification_email_sent_on_signup(self, mock_send_email, api_client):
        """Test that verification email is sent when user signs up"""
        data = {
            "email": "test@example.com",
            "password": "strongpassword123",
            "first_name": "Test",
            "last_name": "User",
        }
        res = api_client.post("/api/users/", data, format="json")
        assert res.status_code == status.HTTP_201_CREATED
        assert mock_send_email.call_count == 1
        assert "Verify your email address" in mock_send_email.call_args[0][0]

    def test_email_verification_token_creation(self, sample_user):
        """Test that email verification context is created correctly"""
        context = sample_user.email_verification_context()
        assert "token" in context
        assert "user" in context
        assert context["user"] == sample_user
        assert context["token"]  # Token should be non-empty

    @pytest.mark.use_requests
    def test_verify_email_success(self, caplog, api_client, sample_user):
        """Test successful email verification"""
        # Create verification token
        context = sample_user.email_verification_context()
        verification_url = f"/api/verify-email/{sample_user.id}/{context['token']}/"

        # Verify email
        response = api_client.post(verification_url)
        assert response.status_code == status.HTTP_200_OK
        assert "successfully verified" in response.json()["message"]

        # Check that user is now verified
        sample_user.refresh_from_db()
        assert sample_user.email_verified is True

    def test_verify_email_invalid_token(self, api_client, sample_user):
        """Test email verification with invalid token"""
        verification_url = f"/api/verify-email/{sample_user.id}/invalid-token/"
        response = api_client.post(verification_url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST

        # User should still be unverified
        sample_user.refresh_from_db()
        assert sample_user.email_verified is False

    def test_verify_email_already_verified(self, api_client, sample_user):
        """Test email verification when user is already verified"""
        # Mark user as verified
        sample_user.email_verified = True
        sample_user.save()

        # Try to verify again
        context = sample_user.email_verification_context()
        verification_url = f"/api/verify-email/{sample_user.id}/{context['token']}/"
        response = api_client.post(verification_url)
        assert response.status_code == status.HTTP_200_OK
        assert "already verified" in response.json()["message"]

    @mock.patch("{{ cookiecutter.project_slug }}.core.views.send_html_email")
    def test_resend_verification_email(self, mock_send_email, api_client, sample_user):
        """Test resending verification email"""
        api_client.force_authenticate(sample_user)
        response = api_client.post("/api/resend-verification-email/")
        assert response.status_code == status.HTTP_200_OK
        assert "Verification email sent" in response.json()["message"]
        assert mock_send_email.call_count == 1

    def test_resend_verification_email_already_verified(self, api_client, sample_user):
        """Test that resending verification email fails if already verified"""
        sample_user.email_verified = True
        sample_user.save()

        api_client.force_authenticate(sample_user)
        response = api_client.post("/api/resend-verification-email/")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_resend_verification_email_unauthenticated(self, api_client):
        """Test that unauthenticated users cannot resend verification email"""
        response = api_client.post("/api/resend-verification-email/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_user_serializer_includes_email_verified(self, api_client, sample_user):
        """Test that UserSerializer includes email_verified field"""
        api_client.force_authenticate(sample_user)
        response = api_client.get(f"/api/users/{sample_user.pk}/")
        assert response.status_code == status.HTTP_200_OK
        assert "email_verified" in response.data
        assert response.data["email_verified"] is False

    @override_settings(REQUIRE_EMAIL_VERIFICATION=False)
    def test_email_verification_disabled(self, api_client, sample_user):
        """Test that email verification requirement can be disabled"""
        # When REQUIRE_EMAIL_VERIFICATION is False, unverified users should have full access
        api_client.force_authenticate(sample_user)
        response = api_client.get(f"/api/users/{sample_user.pk}/")
        assert response.status_code == status.HTTP_200_OK
