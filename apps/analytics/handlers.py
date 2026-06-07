import logging
from datetime import date
from decimal import Decimal

from django.db.models import F

from apps.analytics.models import MetricSnapshot, SyncFailureLog
from apps.events.types import EventType

logger = logging.getLogger('vendrix.analytics')


def record_event_metrics(event):
    """Aggregate domain events into metric snapshots."""
    today = date.today()
    event_type = event.event_type

    _increment_metric(
        organization_id=event.organization_id,
        metric_type='events.total',
        dimension='event_type',
        dimension_value=event_type,
        period_start=today,
    )

    if event_type == EventType.ORDER_RECEIVED.value:
        channel = event.payload.get('channel', 'unknown')
        _increment_metric(
            organization_id=event.organization_id,
            metric_type='orders.received',
            dimension='channel',
            dimension_value=channel,
            period_start=today,
        )

    if event_type == EventType.SYNC_FAILED.value:
        SyncFailureLog.objects.create(
            organization_id=event.organization_id,
            sync_job_id=event.resource_id,
            integration_id=event.payload.get('integration_id') or '',
            platform=event.payload.get('platform', ''),
            job_type=event.payload.get('job_type', ''),
            error_message=event.payload.get('error', ''),
            retry_count=event.payload.get('retry_count', 0),
        )
        _increment_metric(
            organization_id=event.organization_id,
            metric_type='sync.failures',
            dimension='job_type',
            dimension_value=event.payload.get('job_type', 'unknown'),
            period_start=today,
        )

    if event_type == EventType.INVENTORY_DISCREPANCY.value:
        _increment_metric(
            organization_id=event.organization_id,
            metric_type='inventory.discrepancies',
            dimension='sku',
            dimension_value=event.payload.get('sku', 'unknown'),
            period_start=today,
        )


def _increment_metric(organization_id, metric_type, dimension, dimension_value, period_start):
    snapshot, created = MetricSnapshot.objects.get_or_create(
        organization_id=organization_id,
        metric_type=metric_type,
        dimension=dimension,
        dimension_value=dimension_value,
        period='daily',
        period_start=period_start,
        defaults={'value': Decimal('0'), 'count': 0},
    )
    if not created:
        MetricSnapshot.objects.filter(pk=snapshot.pk).update(count=F('count') + 1)
