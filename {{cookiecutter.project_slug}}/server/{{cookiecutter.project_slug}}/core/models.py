import logging

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.utils.timezone import now, timedelta

from {{ cookiecutter.project_slug }}.common.models import AbstractBaseModel
from {{ cookiecutter.project_slug }}.utils.sites import get_site_url

from .dispatchers import new_reset_password_code_created_ds

logger = logging.getLogger(__name__)


class UserQuerySet(models.QuerySet):
    def for_user(self, user):
        if not user or user.is_anonymous:
            return self.none()
        elif user.is_staff:
            return self.all()
        return self.filter(pk=user.pk)


class UserManager(BaseUserManager):
    """Custom User model manager, eliminating the 'username' field."""

    use_in_migrations = True

    def get_queryset(self):
        return UserQuerySet(self.model, using=self.db)

    def for_user(self, user):
        return self.get_queryset().for_user(user)

    def _create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.

        All emails are lowercased automatically.
        """
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        logger.info(f"New user: {email}")
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a superuser with the given email and password."""
        logger.warning(f"Creating superuser: {email}")
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["has_reset_password"] = True
        return self._create_user(email, password, **extra_fields)

    class Meta:
        ordering = ("id",)


class User(AbstractUser, AbstractBaseModel):
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(blank=True, max_length=255)
    last_name = models.CharField(blank=True, max_length=255)
    has_reset_password = models.BooleanField(default=False)
    objects = UserManager()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    def reset_password_context(self):
        return {
            "user": self,
            "site_url": get_site_url(),
            "support_email": settings.STAFF_EMAIL,
            "token": default_token_generator.make_token(self),
        }

    class Meta:
        ordering = ["email"]


class UserResetPasswordCodeMessagesQuerySet(models.QuerySet):
    def for_user(self, user) -> "models.QuerySet[UserResetPasswordCodeMessages]":
        if not user or user.is_anonymous:
            return self.none()
        elif user.is_staff or user.is_superuser:
            return self.all()
        else:
            return self.filter(user=user)


class UserResetPasswordCodeMessagesManager(models.Manager):
    use_in_migrations = True

    def get_queryset(self) -> "models.QuerySet[UserResetPasswordCodeMessages]":
        return UserResetPasswordCodeMessagesQuerySet(self.model, using=self.db)

    def for_user(self, user):
        return self.get_queryset().for_user(user)

    def create_code(self, user, code, **kwargs):
        hashed_code = make_password(str(code))
        obj = self.model(user=user, code=hashed_code)
        obj.save(using=self._db)
        new_reset_password_code_created_ds.send(sender="reset_passoword_code_generator", code=code, instance=obj, created=True)

        return obj


class UserResetPasswordCodeMessages(AbstractBaseModel):
    user = models.ForeignKey("core.User", related_name="reset_password_codes", on_delete=models.CASCADE)
    code = models.CharField(max_length=255)
    is_used = models.BooleanField(default=False)
    objects = UserResetPasswordCodeMessagesManager()

    def __str__(self):
        return f"reset password code for {self.user.email}"

    @property
    def is_valid(self):
        return not (self.is_used | (self.created > now() + timedelta(minutes=settings.RESET_PASSWORD_CODE_VALIDITY_MINUTES)))

    class Meta:
        ordering = ("-created",)
