import uuid  # noqa

from django.db import models
from django.conf import settings
from django.contrib.auth.models import PermissionsMixin, BaseUserManager
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string


from {{ cookiecutter.project_slug }}.utils import sites as site_utils
from {{ cookiecutter.project_slug }}.common.models import AbstractBaseModel


class UserManager(BaseUserManager):
    """Custom User model manager, eliminating the 'username' field."""

    use_in_migrations = True

    def create_user(self, email, password, **extra_fields):
        normalized_email = self.normalize_email(email).lower()
        user = self.model(email=normalized_email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
        extra_fields["has_reset_password"] = True
        return self.create_user(email, password, **extra_fields)

    class Meta:
        ordering = ("id",)


class User(AbstractBaseUser, PermissionsMixin, AbstractBaseModel):
    # `password` is inherited from `AbstractBaseUser`
    # `is_superuser` is inerited from `PermissionsMixin`
    email = models.EmailField(unique=True, error_messages={"unique": "A user with that email already exists"})
    first_name = models.CharField(blank=True, max_length=255)
    last_name = models.CharField(blank=True, max_length=255)
    has_reset_password = models.BooleanField(default=False)
    is_staff = models.BooleanField("staff", default=False, help_text="Designates whether the user can log into Django Admin.")

    # use the `email` field as the user's username
    USERNAME_FIELD = "email"

    # What fields, if any, are prmpted for via `createsuperuser` command
    # It will always ask for a username (email). 
    # Note what fields will also be set autmatically from the `create_superuser` UserManager method.
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    def reset_password_context(self):
        return dict(
            domain=site_utils.get_site_url(),
            uid=str(self.id),
            token=default_token_generator.make_token(self),
            user=self,
        )

    class Meta:
        ordering = ["email"]
