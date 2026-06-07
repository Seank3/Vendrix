import hashlib
import logging

from django.utils import timezone
from rest_framework import authentication, exceptions

from apps.identity.models import APIKey

logger = logging.getLogger('vendrix.auth')


class OrganizationAPIKeyAuthentication(authentication.BaseAuthentication):
    """
    API key auth: Authorization: Api-Key vx_<token>
    Resolves to organization context for integration clients.
    """

    keyword = 'Api-Key'

    def authenticate(self, request):
        auth_header = authentication.get_authorization_header(request).decode()
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        raw_key = parts[1]
        if not raw_key.startswith('vx_'):
            raise exceptions.AuthenticationFailed('Invalid API key format')

        prefix = raw_key[:8]
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()

        try:
            api_key = APIKey.objects.select_related('organization').get(
                prefix=prefix,
                hashed_key=hashed,
                is_active=True,
            )
        except APIKey.DoesNotExist:
            logger.warning('API key auth failed for prefix=%s', prefix)
            raise exceptions.AuthenticationFailed('Invalid API key')

        if api_key.expires_at and api_key.expires_at < timezone.now():
            raise exceptions.AuthenticationFailed('API key expired')

        APIKey.objects.filter(pk=api_key.pk).update(last_used_at=timezone.now())

        return (None, api_key)
