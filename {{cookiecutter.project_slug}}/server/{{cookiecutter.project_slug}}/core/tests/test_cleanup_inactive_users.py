"""
Tests for the cleanup_inactive_users functionality.
"""

from datetime import timedelta
from io import StringIO
from unittest.mock import patch

import pytest
from django.core.management import call_command
from django.utils import timezone
from {{ cookiecutter.project_slug }}.core.models import User


@pytest.mark.django_db
class TestUserManagerCleanupMethods:
    """Test the UserManager cleanup methods."""

    def test_get_inactive_users_returns_correct_users(self):
        """Test that get_inactive_users returns only the correct users."""
        # Create active user - should not be returned
        User.objects.create_user(email="active@example.com", password="password123")

        # Create recently deactivated user - should not be returned
        recent_inactive = User.objects.create_user(
            email="recent@example.com", password="password123"
        )
        recent_inactive.is_active = False
        recent_inactive.save()

        # Create old inactive user - should be returned
        old_inactive = User.objects.create_user(email="old@example.com", password="password123")
        old_inactive.is_active = False
        old_inactive.save()
        # Manually set last_edited to 31 days ago
        old_date = timezone.now() - timedelta(days=31)
        User.objects.filter(pk=old_inactive.pk).update(last_edited=old_date)

        # Get inactive users
        inactive_users = User.objects.get_inactive_users(days=30)

        # Check results
        assert inactive_users.count() == 1
        assert inactive_users.first().email == "old@example.com"

    def test_get_inactive_users_with_custom_days(self):
        """Test get_inactive_users with custom days parameter."""
        # Create user inactive for 15 days
        user_15_days = User.objects.create_user(
            email="inactive15@example.com", password="password123"
        )
        user_15_days.is_active = False
        user_15_days.save()
        old_date = timezone.now() - timedelta(days=15)
        User.objects.filter(pk=user_15_days.pk).update(last_edited=old_date)

        # Should not be returned with 30 days
        assert User.objects.get_inactive_users(days=30).count() == 0

        # Should be returned with 10 days
        assert User.objects.get_inactive_users(days=10).count() == 1

    def test_cleanup_inactive_users_deletes_correct_users(self):
        """Test that cleanup_inactive_users deletes only the correct users."""
        # Create active user - should not be deleted
        User.objects.create_user(email="active@example.com", password="password123")

        # Create old inactive users - should be deleted
        for i in range(3):
            user = User.objects.create_user(email=f"old{i}@example.com", password="password123")
            user.is_active = False
            user.save()
            old_date = timezone.now() - timedelta(days=31 + i)
            User.objects.filter(pk=user.pk).update(last_edited=old_date)

        # Run cleanup
        deleted, failed = User.objects.cleanup_inactive_users(days=30)

        # Check results
        assert len(deleted) == 3
        assert len(failed) == 0
        assert "old0@example.com" in deleted
        assert "old1@example.com" in deleted
        assert "old2@example.com" in deleted
        assert User.objects.filter(email="active@example.com").exists()
        assert not User.objects.filter(email__startswith="old").exists()

    def test_cleanup_inactive_users_handles_deletion_errors(self):
        """Test that cleanup_inactive_users handles deletion errors gracefully."""
        # Create two old inactive users
        user1 = User.objects.create_user(email="user1@example.com", password="password123")
        user1.is_active = False
        user1.save()

        user2 = User.objects.create_user(email="user2@example.com", password="password123")
        user2.is_active = False
        user2.save()

        old_date = timezone.now() - timedelta(days=31)
        User.objects.filter(email__in=["user1@example.com", "user2@example.com"]).update(
            last_edited=old_date
        )

        # Mock delete to fail for user1 but succeed for user2
        original_delete = User.delete
        def mock_delete(self):
            if self.email == "user1@example.com":
                raise Exception("Database error")
            return original_delete(self)

        with patch.object(User, "delete", mock_delete):
            deleted, failed = User.objects.cleanup_inactive_users(days=30)

        # Check results
        assert len(deleted) == 1
        assert "user2@example.com" in deleted
        assert len(failed) == 1
        assert failed[0][0] == "user1@example.com"
        assert "Database error" in failed[0][1]

        # user1 should still exist, user2 should be deleted
        assert User.objects.filter(email="user1@example.com").exists()
        assert not User.objects.filter(email="user2@example.com").exists()


@pytest.mark.django_db
class TestCleanupInactiveUsersCommand:
    """Smoke tests for the cleanup_inactive_users management command."""

    def test_command_runs_successfully(self):
        """Test that the command runs without errors."""
        # Create test data
        user = User.objects.create_user(email="old@example.com", password="password123")
        user.is_active = False
        user.save()
        old_date = timezone.now() - timedelta(days=31)
        User.objects.filter(pk=user.pk).update(last_edited=old_date)

        # Run the command
        out = StringIO()
        call_command("cleanup_inactive_users", stdout=out)

        # Check output and that user was deleted
        output = out.getvalue()
        assert "Successfully deleted 1 of 1 inactive user(s)" in output
        assert not User.objects.filter(email="old@example.com").exists()

    def test_command_dry_run_mode(self):
        """Test that dry run mode doesn't delete users."""
        # Create test data
        user = User.objects.create_user(email="dryrun@example.com", password="password123")
        user.is_active = False
        user.save()
        old_date = timezone.now() - timedelta(days=31)
        User.objects.filter(pk=user.pk).update(last_edited=old_date)

        # Run command in dry-run mode
        out = StringIO()
        call_command("cleanup_inactive_users", dry_run=True, stdout=out)

        # Check output and that user still exists
        output = out.getvalue()
        assert "DRY RUN" in output
        assert "dryrun@example.com" in output
        assert User.objects.filter(email="dryrun@example.com").exists()

    def test_command_with_custom_days(self):
        """Test command with custom days parameter."""
        # Create user inactive for 15 days
        user = User.objects.create_user(email="inactive15@example.com", password="password123")
        user.is_active = False
        user.save()
        old_date = timezone.now() - timedelta(days=15)
        User.objects.filter(pk=user.pk).update(last_edited=old_date)

        # Run with 10 days threshold
        out = StringIO()
        call_command("cleanup_inactive_users", days=10, stdout=out)

        # User should be deleted
        assert not User.objects.filter(email="inactive15@example.com").exists()
