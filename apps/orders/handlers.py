import logging

logger = logging.getLogger('vendrix.orders')


def on_order_received(event):
    """Post-order-ingestion hook — extensible for fulfillment routing."""
    logger.info(
        'Order received handler: order=%s channel=%s',
        event.resource_id,
        event.payload.get('channel'),
    )
