from django.contrib import admin

from apps.events.models import DomainEvent, EventSubscription


@admin.register(DomainEvent)
class DomainEventAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'resource_type', 'resource_id', 'organization_id', 'processed', 'created_at']
    list_filter = ['event_type', 'processed']
    readonly_fields = [
        'organization_id', 'event_type', 'resource_type', 'resource_id',
        'payload', 'correlation_id', 'created_at',
    ]


@admin.register(EventSubscription)
class EventSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['event_type', 'handler_path', 'is_active']
