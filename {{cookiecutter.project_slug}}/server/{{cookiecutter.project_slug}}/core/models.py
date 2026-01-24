import logging
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.tokens import default_token_generator
from django.db import models
from django.utils import timezone

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

    def cleanup_inactive_users(self, days=30):
        """
        Delete users who have been inactive for more than the specified number of days.

        Args:
            days: Number of days a user must be inactive before deletion (default: 30)

        Returns:
            tuple: (deleted_users, failed_deletions)
                - deleted_users: List of email addresses successfully deleted
                - failed_deletions: List of tuples (email, error_message) for failed deletions
        """
        cutoff_date = timezone.now() - timedelta(days=days)

        # Find inactive users who were marked inactive more than X days ago
        inactive_users = self.filter(is_active=False, last_edited__lt=cutoff_date)

        deleted_users = []
        failed_deletions = []

        for user in inactive_users:
            email = user.email
            try:
                user.delete()
                deleted_users.append(email)
                logger.info(f"Permanently deleted inactive user: {email}")
            except Exception as e:
                error_msg = str(e)
                failed_deletions.append((email, error_msg))
                logger.error(f"Failed to delete inactive user {email}: {error_msg}")

        return deleted_users, failed_deletions

    def get_inactive_users(self, days=30):
        """
        Get users who have been inactive for more than the specified number of days.

        Args:
            days: Number of days a user must be inactive before being considered for deletion

        Returns:
            QuerySet of inactive users
        """
        cutoff_date = timezone.now() - timedelta(days=days)
        return self.filter(is_active=False, last_edited__lt=cutoff_date)

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
    email_verified = models.BooleanField(default=False)
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

    def email_verification_context(self):
        """Generate context for email verification email."""
        token = EmailVerificationToken.objects.create(user=self)
        return {
            "user": self,
            "site_url": get_site_url(),
            "support_email": settings.STAFF_EMAIL,
            "token": token.token,
        }

    class Meta:
        ordering = ["email"]


class EmailVerificationToken(AbstractBaseModel):
    """Token for email verification."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="verification_tokens")
    token = models.CharField(max_length=64, unique=True, db_index=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        if not self.expires_at:
            # Token expires in 24 hours
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        """Check if token is still valid (not expired and not used)."""
        return not self.used and timezone.now() < self.expires_at

    def mark_as_used(self):
        """Mark token as used."""
        self.used = True
        self.save()

    def __str__(self):
        return f"EmailVerificationToken for {self.user.email}"

    class Meta:
        ordering = ["-created"]
