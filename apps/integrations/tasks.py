import logging

from celery import shared_task

logger = logging.getLogger('vendrix.integrations')


@shared_task(bind=True, max_retries=3)
def execute_sync_job(self, job_id: str, organization_id: str, actor_id: str | None = None):
    from apps.integrations.services import SyncService

    try:
        service = SyncService(organization_id)
        service.execute_sync_job(job_id, actor_id=actor_id)
    except Exception as exc:
        logger.exception('Sync job task failed: %s', job_id)
        raise self.retry(exc=exc, countdown=60)


@shared_task
def retry_sync_job(job_id: str, organization_id: str, actor_id: str | None = None):
    from apps.integrations.services import SyncService

    service = SyncService(organization_id)
    service.execute_sync_job(job_id, actor_id=actor_id)
