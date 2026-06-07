import logging

from django.db import transaction
from django.utils import timezone

from apps.core.encryption import decrypt_credentials, encrypt_credentials
from apps.core.services import BaseService
from apps.events.bus import EventBus
from apps.events.types import EventType
from apps.identity.services import AuditService
from apps.integrations.models import (
    ExternalProductMapping,
    IntegrationStatus,
    PlatformIntegration,
    SyncJob,
    SyncJobStatus,
)
from apps.integrations.registry import get_connector
from apps.products.models import Product
from apps.products.services import ProductService

logger = logging.getLogger('vendrix.integrations')


class IntegrationService(BaseService):
    def __init__(self, organization_id):
        super().__init__(organization_id)
        self.event_bus = EventBus(organization_id)
        self.audit = AuditService(organization_id)

    @transaction.atomic
    def create_integration(self, platform, name, credentials, config=None, actor_id=None):
        encrypted = encrypt_credentials(credentials)
        integration = PlatformIntegration.objects.create(
            organization_id=self.organization_id,
            platform=platform,
            name=name,
            credentials_encrypted=encrypted,
            config=config or {},
            status=IntegrationStatus.PENDING,
        )

        connector = get_connector(integration, credentials)
        auth_result = connector.authenticate()

        if auth_result.success:
            integration.status = IntegrationStatus.CONNECTED
            integration.save()
            self.event_bus.publish(
                EventType.INTEGRATION_CONNECTED,
                resource_type='integration',
                resource_id=str(integration.id),
                payload={'platform': platform, 'name': name},
                actor_id=actor_id,
            )
        else:
            integration.status = IntegrationStatus.ERROR
            integration.last_error = auth_result.error
            integration.save()

        self.audit.log(
            'integration.created',
            'integration',
            str(integration.id),
            {'platform': platform, 'status': integration.status},
            actor_id=actor_id,
        )
        return integration

    def get_connector_for_integration(self, integration_id):
        integration = PlatformIntegration.objects.get(
            id=integration_id,
            organization_id=self.organization_id,
        )
        credentials = decrypt_credentials(integration.credentials_encrypted)
        return get_connector(integration, credentials), integration

    def list_integrations(self):
        return PlatformIntegration.objects.filter(organization_id=self.organization_id)


class SyncService(BaseService):
    def __init__(self, organization_id):
        super().__init__(organization_id)
        self.event_bus = EventBus(organization_id)
        self.integration_service = IntegrationService(organization_id)

    @transaction.atomic
    def create_sync_job(self, integration_id, job_type, resource_type='', resource_id='', payload=None):
        integration = PlatformIntegration.objects.get(
            id=integration_id,
            organization_id=self.organization_id,
        )
        job = SyncJob.objects.create(
            organization_id=self.organization_id,
            integration=integration,
            job_type=job_type,
            resource_type=resource_type,
            resource_id=resource_id,
            payload=payload or {},
        )
        return job

    def execute_sync_job(self, job_id, actor_id=None):
        job = SyncJob.objects.select_related('integration').get(
            id=job_id,
            organization_id=self.organization_id,
        )

        job.status = SyncJobStatus.RUNNING
        job.started_at = timezone.now()
        job.save()

        self.event_bus.publish(
            EventType.SYNC_STARTED,
            resource_type='sync_job',
            resource_id=str(job.id),
            payload={'job_type': job.job_type, 'integration_id': str(job.integration_id)},
            actor_id=actor_id,
        )

        try:
            connector, integration = self.integration_service.get_connector_for_integration(
                job.integration_id,
            )
            result = self._execute_job(connector, job)

            if result.success:
                job.status = SyncJobStatus.COMPLETED
                job.result = result.data
                job.completed_at = timezone.now()
                job.save()

                integration.last_sync_at = timezone.now()
                integration.last_error = ''
                integration.save()

                self.event_bus.publish(
                    EventType.SYNC_COMPLETED,
                    resource_type='sync_job',
                    resource_id=str(job.id),
                    payload={'job_type': job.job_type, 'external_id': result.external_id},
                    actor_id=actor_id,
                )
            else:
                self._handle_failure(job, integration, result.error, result.retryable, actor_id)

        except Exception as exc:
            logger.exception('Sync job failed: %s', job_id)
            self._handle_failure(job, job.integration, str(exc), True, actor_id)

        return job

    def _execute_job(self, connector, job: SyncJob):
        if job.job_type == 'product_push':
            product_service = ProductService(self.organization_id)
            product = product_service.get_product(job.resource_id)
            product_data = self._serialize_product(product)
            result = connector.push_product(product_data)
            if result.success and result.external_id:
                ExternalProductMapping.objects.update_or_create(
                    organization_id=self.organization_id,
                    integration=job.integration,
                    sku=product.sku,
                    defaults={
                        'product_id': product.id,
                        'external_id': result.external_id,
                        'last_synced_at': timezone.now(),
                        'sync_status': 'synced',
                    },
                )
            return result

        if job.job_type == 'inventory_sync':
            return connector.sync_inventory(
                job.payload.get('sku', ''),
                job.payload.get('quantity', 0),
            )

        if job.job_type == 'order_fetch':
            result = connector.fetch_orders(since=job.payload.get('since'))
            if result.success:
                from apps.orders.services import OrderService

                order_service = OrderService(self.organization_id)
                for raw_order in result.data.get('orders', []):
                    normalized = connector.normalize_order(raw_order)
                    order_service.ingest_order(
                        channel=job.integration.platform,
                        external_id=normalized.external_id,
                        line_items=normalized.line_items,
                        customer=normalized.customer,
                        shipping_address=normalized.shipping_address,
                        currency=normalized.currency,
                        raw_payload=normalized.raw_payload,
                        integration_id=job.integration_id,
                    )
            return result

        return connector.health_check()

    def _handle_failure(self, job, integration, error, retryable, actor_id):
        job.error_message = error
        job.retry_count += 1

        if retryable and job.retry_count < job.max_retries:
            job.status = SyncJobStatus.RETRYING
            job.save()
            if self._should_run_async():
                from apps.integrations.tasks import retry_sync_job

                retry_sync_job.apply_async(
                    args=[str(job.id), str(self.organization_id)],
                    countdown=30 * job.retry_count,
                )
            else:
                self.execute_sync_job(job.id, actor_id=actor_id)
        else:
            job.status = SyncJobStatus.FAILED
            job.completed_at = timezone.now()
            job.save()

            integration.last_error = error
            integration.save()

            self.event_bus.publish(
                EventType.SYNC_FAILED,
                resource_type='sync_job',
                resource_id=str(job.id),
                payload={
                    'job_type': job.job_type,
                    'error': error,
                    'retry_count': job.retry_count,
                    'integration_id': str(job.integration_id),
                    'platform': job.integration.platform,
                },
                actor_id=actor_id,
            )

    def _serialize_product(self, product: Product) -> dict:
        return {
            'id': str(product.id),
            'sku': product.sku,
            'name': product.name,
            'description': product.description,
            'attributes': product.attributes,
            'status': product.status,
            'category': product.category,
            'variants': [
                {'sku': v.sku, 'name': v.name, 'attributes': v.attributes}
                for v in product.variants.all()
            ],
            'media': [
                {'url': m.url, 'alt_text': m.alt_text}
                for m in product.media.all()
            ],
            'channel_pricing': [
                {
                    'channel': p.channel,
                    'price': str(p.price),
                    'currency': p.currency,
                }
                for p in product.channel_pricing.all()
            ],
        }

    def push_product_to_integration(self, integration_id, product_id, actor_id=None):
        job = self.create_sync_job(
            integration_id=integration_id,
            job_type='product_push',
            resource_type='product',
            resource_id=product_id,
        )

        if self._should_run_async():
            from apps.integrations.tasks import execute_sync_job

            execute_sync_job.delay(str(job.id), str(self.organization_id), actor_id)
        else:
            self.execute_sync_job(job.id, actor_id=actor_id)
            job.refresh_from_db()

        return job

    def fetch_orders(self, integration_id, since=None, actor_id=None):
        job = self.create_sync_job(
            integration_id=integration_id,
            job_type='order_fetch',
            payload={'since': since},
        )

        if self._should_run_async():
            from apps.integrations.tasks import execute_sync_job

            execute_sync_job.delay(str(job.id), str(self.organization_id), actor_id)
        else:
            self.execute_sync_job(job.id, actor_id=actor_id)
            job.refresh_from_db()

        return job

    def _should_run_async(self):
        from django.conf import settings

        return settings.VENDRIX_EVENT_BUS_BACKEND == 'celery'
