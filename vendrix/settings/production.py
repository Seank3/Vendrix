"""
Vendrix production settings — env-driven, safe for Render / Railway / Fly etc.

Every value comes from the environment; the module fails fast with a clear
message if a mandatory secret is missing or malformed.
"""
from cryptography.fernet import Fernet
from decouple import config
from django.core.exceptions import ImproperlyConfigured

from vendrix.settings.base import *  # noqa: F401, F403

DEBUG = False

# ── Hosts & secrets ──────────────────────────────────────────────
ALLOWED_HOSTS = [h.strip() for h in config('ALLOWED_HOSTS', default='').split(',') if h.strip()]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured('ALLOWED_HOSTS is required in production (comma-separated).')

SECRET_KEY = config('SECRET_KEY', default='')
if not SECRET_KEY:
    raise ImproperlyConfigured('SECRET_KEY is required in production.')

# Fernet key for integration credentials — MUST be stable across restarts,
# otherwise previously encrypted credentials become undecryptable.
CREDENTIALS_ENCRYPTION_KEY = config('CREDENTIALS_ENCRYPTION_KEY', default='')
if not CREDENTIALS_ENCRYPTION_KEY:
    raise ImproperlyConfigured(
        'CREDENTIALS_ENCRYPTION_KEY is required. Generate one with:\n'
        '  python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"'
    )
try:
    Fernet(CREDENTIALS_ENCRYPTION_KEY.encode())
except Exception as exc:  # noqa: BLE001
    raise ImproperlyConfigured(
        'CREDENTIALS_ENCRYPTION_KEY is not a valid Fernet key (see DEPLOYMENT.md).'
    ) from exc

# ── HTTPS / proxy (Render, Railway and Fly all terminate TLS upstream) ──
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

CSRF_TRUSTED_ORIGINS = [
    o.strip() for o in config('CSRF_TRUSTED_ORIGINS', default='').split(',') if o.strip()
]

# ── Event bus / async ─────────────────────────────────────────────
# Sync jobs and domain events run through Celery in production.
VENDRIX_EVENT_BUS_BACKEND = config('VENDRIX_EVENT_BUS_BACKEND', default='celery')

# ── Static files (admin/assets) — serve via Whitenoise, no web server needed ──
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')  # right after SecurityMiddleware

STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}
