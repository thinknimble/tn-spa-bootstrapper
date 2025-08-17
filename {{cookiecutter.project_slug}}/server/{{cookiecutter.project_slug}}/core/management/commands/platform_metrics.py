import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db.models import Count

from {{ cookiecutter.project_slug }}.utils.emails import send_html_email

logger = logging.getLogger(__name__)

User = get_user_model()


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
        # TODO: Add STAFF_EMAIL to settings or use a default
        staff_email = getattr(settings, 'STAFF_EMAIL', settings.DEFAULT_FROM_EMAIL)
        send_html_email(title, "core/metrics.html", settings.DEFAULT_FROM_EMAIL, [staff_email], context=context)

        logger.info(f"Finished management command {__name__}")
