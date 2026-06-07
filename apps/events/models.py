from django.db import models

from apps.core.models import TenantScopedModel
from apps.events.types import EventType


class DomainEvent(TenantScopedModel):
    """
    Persistent event log — Kafka-like discipline for traceability.
    Every state change emits a domain event.
    """

    event_type = models.CharField(max_length=100, db_index=True)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100)
    payload = models.JSONField(default=dict)
    actor_id = models.CharField(max_length=100, blank=True)
    correlation_id = models.CharField(max_length=100, blank=True, db_index=True)
    processed = models.BooleanField(default=False)

    class Meta:
        db_table = 'domain_events'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization_id', 'event_type']),
            models.Index(fields=['organization_id', 'created_at']),
            models.Index(fields=['organization_id', 'processed']),
        ]

    def __str__(self):
        return f'{self.event_type} [{self.resource_id}]'


class EventSubscription(models.Model):
    """Registry of event handlers for the event bus."""

    event_type = models.CharField(max_length=100, db_index=True)
    handler_path = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'event_subscriptions'
        unique_together = [['event_type', 'handler_path']]
