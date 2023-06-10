import pytest
from django.contrib.auth import authenticate
from django.test import Client
from pytest_factoryboy import register

from .factories import UserFactory
from .models import User, UserResetPasswordCode
from .serializers import UserLoginSerializer

JSON_RQST_HEADERS = dict(
    content_type="application/json",
    HTTP_ACCEPT="application/json",
)

register(UserFactory)


@pytest.fixture
def test_user():
    user = UserFactory()
    user.save()
    user.set_password("testing123")
    user.save()
    return user


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


@pytest.mark.django_db
def test_create_user_from_factory(test_user):
    assert test_user.email


@pytest.mark.django_db
def test_user_can_login(test_user):
    test_user.set_password("testing123")
    test_user.save()
    client = Client()
    res = client.post("/api/login/", {"email": test_user.email, "password": "testing123"}, **JSON_RQST_HEADERS)
    assert res.status_code == 200


@pytest.mark.django_db
def test_password_reset(test_user, client):
    test_user.set_password("testing123")
    test_user.save()
    context = test_user.reset_password_context()
    password_reset_url = f"/api/password/reset/confirm/{ context['user'].id }/{ context['token'] }/"
    response = client.post(password_reset_url, data={"password": "new_password"}, format="json")
    assert response.status_code == 200

    # New Password should now work for authentication
    serializer = UserLoginSerializer(data={"email": test_user.email, "password": "new_password"})
    serializer.is_valid()
    assert authenticate(**serializer.validated_data)


@pytest.mark.django_db
def test_user_token_gets_created_from_signal(test_user):
    assert test_user.auth_token


@pytest.mark.django_db
def test_user_password_reset_request(test_user):
    client = Client()
    res = client.get(f"/api/password/reset/{test_user.email}/", **JSON_RQST_HEADERS)
    assert res.status_code == 204
    assert UserResetPasswordCode.objects.count()


@pytest.mark.django_db
def test_user_can_change_password_with_code(test_user):
    client = Client()
    res = client.post("/api/login/", {"email": test_user.email, "password": "testing123"}, **JSON_RQST_HEADERS)
    assert res.status_code == 200
    assert res.json()
    res = client.get(f"/api/password/reset/code/{test_user.email}/", **JSON_RQST_HEADERS)
    assert res.status_code == 204
    assert UserResetPasswordCode.objects.count()
    code = 12345
    UserResetPasswordCode.objects.create_code(user=test_user, code=12345)
    res = client.post(f"/api/password/reset/code/confirm/{test_user.email}/", {"code": code, "password": "testing12345"},
                      **JSON_RQST_HEADERS)
    assert res.status_code == 200
    assert res.json()
    res = client.post("/api/login/", {"email": test_user.email, "password": "testing12345"}, **JSON_RQST_HEADERS)
    assert res.status_code == 200
    assert res.json()
