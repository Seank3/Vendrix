import hashlib
import logging

from django.db import transaction

from apps.core.services import BaseService
from apps.identity.models import APIKey, AuditLog, Organization, Role, User

logger = logging.getLogger('vendrix.identity')


class OrganizationService(BaseService):
    @transaction.atomic
    def create_organization(self, name, slug, admin_email, admin_password, admin_first_name=''):
        org = Organization.objects.create(name=name, slug=slug)
        user = User.objects.create_user(
            email=admin_email,
            password=admin_password,
            organization=org,
            role=Role.ADMIN,
            first_name=admin_first_name,
        )
        AuditLog.objects.create(
            organization_id=org.id,
            action='organization.created',
            resource_type='organization',
            resource_id=str(org.id),
            metadata={'name': name},
        )
        logger.info('Organization created: %s (%s)', org.name, org.id)
        return org, user


class APIKeyService(BaseService):
    @transaction.atomic
    def create_api_key(self, name, scopes=None):
        raw_key, prefix = APIKey.generate_key_pair()
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()
        org = Organization.objects.get(id=self.organization_id)

        api_key = APIKey.objects.create(
            organization=org,
            name=name,
            prefix=prefix,
            hashed_key=hashed,
            scopes=scopes or [],
        )
        self._audit('api_key.created', 'api_key', str(api_key.id), {'name': name})
        return api_key, raw_key

    def revoke_api_key(self, api_key_id):
        updated = APIKey.objects.filter(
            id=api_key_id,
            organization_id=self.organization_id,
        ).update(is_active=False)
        if updated:
            self._audit('api_key.revoked', 'api_key', str(api_key_id))
        return updated > 0

    def _audit(self, action, resource_type, resource_id, metadata=None):
        AuditLog.objects.create(
            organization_id=self.organization_id,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata or {},
        )


class AuditService(BaseService):
    def log(self, action, resource_type, resource_id='', metadata=None, actor_id=None, actor_type='user'):
        return AuditLog.objects.create(
            organization_id=self.organization_id,
            actor_id=actor_id,
            actor_type=actor_type,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata=metadata or {},
        )
