import logging

from decouple import config
from django.contrib.auth import get_user_model
from django.conf import settings
from django.core.management.base import BaseCommand

from {{ cookiecutter.project_slug }}.utils.emails import send_html_email

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Alert the team on potentially important platform metrics"

    def handle(self, *args, **kwargs):
        logger.info(f"Starting management command {__name__}")
        email_content = ""

        recent_user_signups = User.objects.values("created__date").annotate(count=Count("created__date")).order_by("-created__date").values_list("created__date", "count")[0:7]
        for date, count in recent_user_signups:
            email_content += f"{date}: {count}</br>"

        title = "{{ cookiecutter.project_name }} Platform Metrics"
        context = {
            "content": email_content
        }
        send_html_email(title, "core/metrics.html", settings.DEFAULT_FROM_EMAIL, [settings.STAFF_EMAIL], context=context)

        logger.info(f"Finished management command {__name__}")
