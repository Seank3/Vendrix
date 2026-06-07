import importlib
import logging

from apps.events.models import DomainEvent, EventSubscription
from apps.events.types import EventType

logger = logging.getLogger('vendrix.events')


def dispatch_event(event: DomainEvent):
    """Route event to registered handlers and analytics aggregator."""
    handlers = _get_handlers(event.event_type)

    for handler_path in handlers:
        try:
            module_path, func_name = handler_path.rsplit('.', 1)
            module = importlib.import_module(module_path)
            handler = getattr(module, func_name)
            handler(event)
        except Exception:
            logger.exception('Handler failed: %s for event %s', handler_path, event.id)

    # Always feed analytics
    try:
        from apps.analytics.handlers import record_event_metrics

        record_event_metrics(event)
    except Exception:
        logger.exception('Analytics handler failed for event %s', event.id)

    DomainEvent.objects.filter(pk=event.pk).update(processed=True)


def _get_handlers(event_type: str) -> list[str]:
    subscribed = EventSubscription.objects.filter(
        event_type=event_type,
        is_active=True,
    ).values_list('handler_path', flat=True)

    built_in = {
        EventType.SYNC_FAILED.value: ['apps.integrations.handlers.on_sync_failed'],
        EventType.PRODUCT_CREATED.value: ['apps.integrations.handlers.on_product_created'],
        EventType.PRODUCT_UPDATED.value: ['apps.integrations.handlers.on_product_updated'],
        EventType.ORDER_RECEIVED.value: ['apps.orders.handlers.on_order_received'],
    }

    return list(subscribed) + built_in.get(event_type, [])
