#!/usr/bin/env python3
"""
Creates (or resets) known dev logins for the Acme org — or for the org in
SEED_ORG_SLUG. Safe to run on an empty production database.

Usage:  python scripts/run_seed_admin.py
Env:    DJANGO_SETTINGS_MODULE=vendrix.settings.production   (default: development)
        SEED_ORG_SLUG=acme   (default)
"""
import os
import sys

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vendrix.settings.development")
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import django  # noqa: E402

django.setup()

from django.conf import settings  # noqa: E402

from apps.identity.models import Organization, Role, User  # noqa: E402

PASSWORD = os.environ.get("SEED_ADMIN_PASSWORD", "VendrixDemo!2026")
ORG_SLUG = os.environ.get("SEED_ORG_SLUG", "acme")
ORG_NAME = os.environ.get("SEED_ORG_NAME", "Acme")

print(f"Settings module : {settings.SETTINGS_MODULE}")
print(f"Database        : {settings.DATABASES['default']['ENGINE']}")

org, _ = Organization.objects.get_or_create(
    slug=ORG_SLUG,
    defaults={"name": ORG_NAME},
)
print(f"Organization    : {org.name} ({org.slug})")

for email in ("admin@vendrix.dev", "a@a.com"):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "organization": org,
            "role": Role.ADMIN,
            "first_name": "Vendrix",
            "last_name": "Admin",
        },
    )
    user.organization = org
    user.role = Role.ADMIN
    user.is_active = True
    user.set_password(PASSWORD)
    user.save()
    print(f"{'created' if created else 'reset '} {email} (role={user.role})")

print("\nLogin (any of):")
print(f"  a@a.com / {PASSWORD}")
print(f"  admin@vendrix.dev / {PASSWORD}")
