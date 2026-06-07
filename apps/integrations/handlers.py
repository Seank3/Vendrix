import logging

logger = logging.getLogger('vendrix.integrations')


def on_sync_failed(event):
    logger.error(
        'Sync failed: job=%s error=%s',
        event.resource_id,
        event.payload.get('error'),
    )


def on_product_created(event):
    """Auto-queue product push to connected integrations (extensible)."""
    logger.info('Product created — sync hook: product=%s', event.resource_id)


def on_product_updated(event):
    logger.info('Product updated — sync hook: product=%s', event.resource_id)
