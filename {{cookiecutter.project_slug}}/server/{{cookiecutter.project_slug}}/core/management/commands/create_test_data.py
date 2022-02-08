import os

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = "Create test data to seed database in dev and staging environments"

    def handle(self, *args, **kwargs):

        superuser_password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
        superuser = get_user_model().objects.create_superuser(
            email="admin@thinknimble.com",
            password=superuser_password,
            first_name="Admin",
            last_name="ThinkNimble")
