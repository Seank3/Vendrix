import logging
import uuid

from django.conf import settings

from apps.events.models import DomainEvent
from apps.events.types import EventType

logger = logging.getLogger('vendrix.events')


class EventBus:
    """
    Lightweight event bus abstraction.
    Persists events then dispatches via Celery (or sync in dev).
    """

    def __init__(self, organization_id):
        self.organization_id = organization_id

    def publish(
        self,
        event_type: EventType | str,
        resource_type: str,
        resource_id: str,
        payload: dict | None = None,
        actor_id: str | None = None,
        correlation_id: str | None = None,
    ) -> DomainEvent:
        event_type_str = str(event_type)

        event = DomainEvent.objects.create(
            organization_id=self.organization_id,
            event_type=event_type_str,
            resource_type=resource_type,
            resource_id=resource_id,
            payload=payload or {},
            actor_id=actor_id or '',
            correlation_id=correlation_id or str(uuid.uuid4()),
        )

        logger.info(
            'Event published: %s org=%s resource=%s/%s',
            event_type_str,
            self.organization_id,
            resource_type,
            resource_id,
        )

        self._dispatch(event)
        return event

    def _dispatch(self, event: DomainEvent):
        backend = settings.VENDRIX_EVENT_BUS_BACKEND
        if backend == 'celery':
            from apps.events.tasks import process_domain_event

            process_domain_event.delay(str(event.id))
        elif backend == 'sync':
            from apps.events.handlers import dispatch_event

            dispatch_event(event)
        else:
            logger.warning('Unknown event bus backend: %s', backend)
