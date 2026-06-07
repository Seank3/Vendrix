from vendrix.settings.base import *  # noqa: F401, F403

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', 'testserver']

# Process events synchronously in local dev (no Celery worker required)
VENDRIX_EVENT_BUS_BACKEND = 'sync'

# Stable dev encryption key (do not use in production)
CREDENTIALS_ENCRYPTION_KEY = 'aBLFWLImsTM52Bdv24kXRFJ_-QMrbZK9TtPeiVYv7Uk='

# Allow SQLite fallback for local dev without PostgreSQL
import os  # noqa: E402

if os.environ.get('USE_SQLITE', 'true').lower() == 'true':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',  # noqa: F405
        }
    }

    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        }
    }
