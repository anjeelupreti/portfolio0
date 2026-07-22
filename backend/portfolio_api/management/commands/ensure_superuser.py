import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    """
    `manage.py ensure_superuser`: creates a superuser from
    DJANGO_SUPERUSER_USERNAME / DJANGO_SUPERUSER_EMAIL / DJANGO_SUPERUSER_PASSWORD
    env vars if one with that username doesn't already exist. Safe to run on
    every deploy (e.g. as part of Render's build command) since it's a no-op
    once the account exists — needed because free-tier Render has no shell
    access to run `createsuperuser` interactively.
    """

    help = "Create a superuser from env vars if it doesn't already exist (idempotent, for shell-less deploys)."

    def handle(self, *args, **options):
        """Read the three env vars; skip quietly if any are unset or the user already exists."""
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

        if not username or not password:
            self.stdout.write("DJANGO_SUPERUSER_USERNAME/PASSWORD not set — skipping.")
            return

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            self.stdout.write(f"Superuser '{username}' already exists — skipping.")
            return

        User.objects.create_superuser(username=username, email=email, password=password)
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created."))
