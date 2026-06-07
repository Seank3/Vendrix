from django.db import models

from apps.core.models import TenantScopedModel


class MetricSnapshot(TenantScopedModel):
    """Aggregated metrics computed from domain events."""

    metric_type = models.CharField(max_length=100, db_index=True)
    dimension = models.CharField(max_length=100, blank=True, db_index=True)
    dimension_value = models.CharField(max_length=255, blank=True)
    period = models.CharField(max_length=20, default='daily')
    period_start = models.DateField(db_index=True)
    value = models.DecimalField(max_digits=16, decimal_places=4, default=0)
    count = models.PositiveIntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'metric_snapshots'
        indexes = [
            models.Index(fields=['organization_id', 'metric_type', 'period_start']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    'organization_id', 'metric_type', 'dimension',
                    'dimension_value', 'period', 'period_start',
                ],
                name='unique_metric_snapshot',
            ),
        ]


class SyncFailureLog(TenantScopedModel):
    """Dedicated log for sync failures — powers the Logs dashboard."""

    sync_job_id = models.UUIDField(db_index=True)
    integration_id = models.UUIDField(null=True, blank=True, db_index=True)
    platform = models.CharField(max_length=50)
    job_type = models.CharField(max_length=50)
    error_message = models.TextField()
    retry_count = models.PositiveIntegerField(default=0)
    resolved = models.BooleanField(default=False)

    class Meta:
        db_table = 'sync_failure_logs'
        ordering = ['-created_at']
