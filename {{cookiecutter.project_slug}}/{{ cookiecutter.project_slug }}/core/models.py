from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache

from {{ cookiecutter.project_slug }}.common.models import AbstractBaseModel


class UserManager(BaseUserManager):
    """Custom User model manager, eliminating the 'username' field."""

    use_in_migrations = True

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
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create a superuser with the given email and password."""
        extra_fields["is_staff"] = True
        extra_fields["is_superuser"] = True
    
        return self._create_user(email, password, **extra_fields)

    class Meta:
        ordering = ("id",)




class User(AbstractUser, AbstractBaseModel):
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    username = None
    email = models.EmailField(unique=True)
    avatar = models.URLField(blank=True,null=True)
    is_owner = models.BooleanField(default=False)
    
    {%- if cookiecutter.client_app != 'None' %}
    # to save user user interface variables
    ui_options = models.JSONField(default=dict)
    {%- endif %}

    {%- if cookiecutter.use_stripe == 'y' %}
    stripe_customer_token = models.CharField(max_length=250,default=None,null=True,blank=True)
    {%- endif %}
    # if the user is archived/deleted
    date_archived = models.DateField(null=True,default=None)


    objects = UserManager()
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} <{self.email}>"

    class Meta:
        ordering = ["email"]

