import pytest

from .models import User


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
    assert user.datetime_created
    assert user.last_edited

    # PermissionsMixin
    assert hasattr(user, "is_superuser")
    assert not user.is_superuser


@pytest.mark.django_db
def test_create_superuser():
    superuser = User.objects.create_superuser(email="test@example.com", password="password", first_name="Leslie", last_name="Burke")

    assert superuser.is_superuser
    assert superuser.last_name == "Burke"
