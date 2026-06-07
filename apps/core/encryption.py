import base64
import json
import logging

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings

logger = logging.getLogger('vendrix.encryption')


def _get_fernet():
    key = settings.CREDENTIALS_ENCRYPTION_KEY
    if not key:
        # Dev fallback — NOT for production
        logger.warning('CREDENTIALS_ENCRYPTION_KEY not set; using ephemeral dev key')
        key = Fernet.generate_key().decode()
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_credentials(data: dict) -> str:
    payload = json.dumps(data).encode()
    return _get_fernet().encrypt(payload).decode()


def decrypt_credentials(token: str) -> dict:
    try:
        payload = _get_fernet().decrypt(token.encode())
        return json.loads(payload.decode())
    except (InvalidToken, json.JSONDecodeError) as exc:
        logger.error('Failed to decrypt credentials: %s', exc)
        raise ValueError('Invalid encrypted credentials') from exc
