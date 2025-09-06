"""
Django management command to permanently delete users who have been
marked inactive for more than 30 days.

This command should be scheduled to run periodically (e.g., daily) via
Heroku Scheduler or similar cron-like service.
"""

import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from {{ cookiecutter.project_slug }}.core.models import User

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Permanently delete users who have been inactive for more than 30 days"

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=30,
            help="Number of days a user must be inactive before deletion (default: 30)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run the command without actually deleting users (for testing)",
        )

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]

        if dry_run:
            # Get inactive users for dry run
            inactive_users = User.objects.get_inactive_users(days=days)
            user_count = inactive_users.count()

            if user_count == 0:
                self.stdout.write(self.style.SUCCESS("No inactive users found for deletion."))
                return

            self.stdout.write(
                self.style.WARNING(f"DRY RUN: Would delete {user_count} inactive user(s):")
            )
            for user in inactive_users:
                days_inactive = (timezone.now() - user.last_edited).days
                self.stdout.write(f"  - {user.email} (inactive for {days_inactive} days)")
        else:
            # Perform actual cleanup
            deleted_users, failed_deletions = User.objects.cleanup_inactive_users(days=days)

            total_count = len(deleted_users) + len(failed_deletions)

            if total_count == 0:
                self.stdout.write(self.style.SUCCESS("No inactive users found for deletion."))
                return

            self.stdout.write(self.style.WARNING(f"Processing {total_count} inactive user(s)..."))

            # Report successful deletions
            for email in deleted_users:
                self.stdout.write(self.style.SUCCESS(f"  Deleted {email}"))

            # Report failed deletions
            for email, error in failed_deletions:
                self.stdout.write(self.style.ERROR(f"  Failed to delete {email}: {error}"))

            # Summary
            self.stdout.write(
                self.style.SUCCESS(
                    f"\nSuccessfully deleted {len(deleted_users)} of {total_count} inactive user(s)."
                )
            )
