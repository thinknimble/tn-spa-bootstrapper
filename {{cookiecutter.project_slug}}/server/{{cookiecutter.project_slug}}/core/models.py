import logging

from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.tokens import default_token_generator
from django.db import models

from {{ cookiecutter.project_slug }}.common.models import AbstractBaseModel
from {{ cookiecutter.project_slug }}.utils.sites import get_site_url

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
