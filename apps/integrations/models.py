from django.db import models

from apps.core.models import TenantManager, TenantScopedModel
from apps.integrations.platforms import Platform


class IntegrationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONNECTED = 'connected', 'Connected'
    DISCONNECTED = 'disconnected', 'Disconnected'
    ERROR = 'error', 'Error'


class PlatformIntegration(TenantScopedModel):
    """Connection instance to an external ecommerce platform."""

    platform = models.CharField(max_length=50, choices=Platform.choices())
    name = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=IntegrationStatus.choices,
        default=IntegrationStatus.PENDING,
    )
    credentials_encrypted = models.TextField(blank=True)
    config = models.JSONField(default=dict, blank=True)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    last_error = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'platform_integrations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization_id', 'platform']),
            models.Index(fields=['organization_id', 'status']),
        ]

    def __str__(self):
        return f'{self.name} ({self.platform})'


class SyncJobStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    RUNNING = 'running', 'Running'
    COMPLETED = 'completed', 'Completed'
    FAILED = 'failed', 'Failed'
    RETRYING = 'retrying', 'Retrying'


class SyncJob(TenantScopedModel):
    """Tracks sync operations with full audit trail."""

    integration = models.ForeignKey(
        PlatformIntegration,
        on_delete=models.CASCADE,
        related_name='sync_jobs',
    )
    job_type = models.CharField(max_length=50, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=SyncJobStatus.choices,
        default=SyncJobStatus.PENDING,
    )
    resource_type = models.CharField(max_length=100, blank=True)
    resource_id = models.CharField(max_length=100, blank=True)
    payload = models.JSONField(default=dict, blank=True)
    result = models.JSONField(default=dict, blank=True)
    error_message = models.TextField(blank=True)
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'sync_jobs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization_id', 'status']),
            models.Index(fields=['organization_id', 'job_type']),
        ]


class ExternalProductMapping(TenantScopedModel):
    """Maps internal product SKUs to external platform IDs."""

    integration = models.ForeignKey(
        PlatformIntegration,
        on_delete=models.CASCADE,
        related_name='product_mappings',
    )
    product_id = models.UUIDField(db_index=True)
    sku = models.CharField(max_length=100, db_index=True)
    external_id = models.CharField(max_length=255)
    external_url = models.URLField(blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=50, default='synced')

    objects = TenantManager()

    class Meta:
        db_table = 'external_product_mappings'
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'integration', 'sku'],
                name='unique_external_mapping_per_integration',
            ),
        ]
