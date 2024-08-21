import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from django.conf import settings

from {{ cookiecutter.project_slug }}.core.models import User
from {{ cookiecutter.project_slug }}.utils.emails import send_html_email

from .dispatchers import new_reset_password_code_created_ds

# Logger
logger = logging.getLogger(__name__)


@receiver(post_save, sender=User)
def create_auth_token_add_permissions(sender, instance, created, **kwargs):
    if created:
        Token.objects.create(user=instance)


@receiver(new_reset_password_code_created_ds)
def generate_reset_password_code(sender, code=None, instance=None, created=None, **kwargs):
    if created:
        try:
            reset_context = {"code": code, "user": instance.user}
            send_html_email(
                "Password reset for {{ cookiecutter.project_name }}",
                "registration/password_reset_code.html",
                settings.DEFAULT_FROM_EMAIL,
                [instance.user.email],
                context=reset_context,
            )
        except Exception as e:
            logger.error(f"Failed to send message to user with id {str(instance.user.id)}, due to {e}")
