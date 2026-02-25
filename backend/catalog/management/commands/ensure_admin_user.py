import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


def env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


class Command(BaseCommand):
    help = "Create or update an admin user from environment variables."

    def handle(self, *args, **options):
        username = (os.getenv("ADMIN_USERNAME") or "").strip()
        email = (os.getenv("ADMIN_EMAIL") or "").strip()
        password = (os.getenv("ADMIN_PASSWORD") or "").strip()
        force_password_reset = env_bool("ADMIN_FORCE_PASSWORD_RESET", False)

        if not password or (not username and not email):
            self.stdout.write(
                self.style.WARNING(
                    "Skipping admin bootstrap. Set ADMIN_PASSWORD and ADMIN_USERNAME or ADMIN_EMAIL.",
                ),
            )
            return

        User = get_user_model()
        lookup = {}
        if username:
            lookup[User.USERNAME_FIELD] = username
        else:
            lookup["email"] = email

        user, created = User.objects.get_or_create(defaults={}, **lookup)

        changed_fields = []
        if username and User.USERNAME_FIELD != "username":
            # For custom user models where USERNAME_FIELD is not username,
            # this is safely ignored.
            pass
        elif username and hasattr(user, "username") and user.username != username:
            user.username = username
            changed_fields.append("username")

        if email and hasattr(user, "email") and user.email != email:
            user.email = email
            changed_fields.append("email")

        if not user.is_staff:
            user.is_staff = True
            changed_fields.append("is_staff")
        if not user.is_superuser:
            user.is_superuser = True
            changed_fields.append("is_superuser")
        if not user.is_active:
            user.is_active = True
            changed_fields.append("is_active")

        if created or force_password_reset:
            user.set_password(password)
            changed_fields.append("password")

        if changed_fields:
            user.save()

        if created:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Created admin user: {getattr(user, User.USERNAME_FIELD)}",
                ),
            )
            return

        if changed_fields:
            self.stdout.write(
                self.style.SUCCESS(
                    "Updated admin user fields: " + ", ".join(changed_fields),
                ),
            )
            return

        self.stdout.write("Admin user already up-to-date.")
