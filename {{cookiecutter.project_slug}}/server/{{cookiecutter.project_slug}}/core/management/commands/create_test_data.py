import logging

from decouple import config
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Create test data to seed database in dev and staging environments"

    def handle(self, *args, **kwargs):
        logger.info(f"Starting management command {__name__}")
        call_command("loaddata", "fingerprints.json")
        call_command("loaddata", "prompt_templates.json")
        superuser_password = config("DJANGO_SUPERUSER_PASSWORD")
        playwright_password = config("PLAYWRIGHT_TEST_USER_PASS")
        get_user_model().objects.create_superuser(
            email="admin@thinknimble.com",
            password=superuser_password,
            first_name="Admin",
            last_name="ThinkNimble",
        )
        get_user_model().objects.create_user(
            email="playwright@thinknimble.com",
            password=playwright_password,
            first_name="Playwright",
            last_name="E2E_test",
        )
        logger.info(f"Finished management command {__name__}")
