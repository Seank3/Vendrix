import logging

from celery import shared_task

logger = logging.getLogger('vendrix.events')


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def process_domain_event(self, event_id: str):
    from apps.events.handlers import dispatch_event
    from apps.events.models import DomainEvent

    try:
        event = DomainEvent.objects.get(id=event_id)
    except DomainEvent.DoesNotExist:
        logger.error('Domain event not found: %s', event_id)
        return

    try:
        dispatch_event(event)
    except Exception as exc:
        logger.exception('Event processing failed: %s', event_id)
        raise self.retry(exc=exc)
