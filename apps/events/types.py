from enum import Enum


class EventType(str, Enum):
    PRODUCT_CREATED = 'product.created'
    PRODUCT_UPDATED = 'product.updated'
    PRODUCT_DELETED = 'product.deleted'

    INVENTORY_UPDATED = 'inventory.updated'
    INVENTORY_RESERVED = 'inventory.reserved'
    INVENTORY_RELEASED = 'inventory.released'
    INVENTORY_DISCREPANCY = 'inventory.discrepancy'

    ORDER_RECEIVED = 'order.received'
    ORDER_PROCESSING = 'order.processing'
    ORDER_FULFILLED = 'order.fulfilled'
    ORDER_CANCELLED = 'order.cancelled'

    SYNC_STARTED = 'sync.started'
    SYNC_COMPLETED = 'sync.completed'
    SYNC_FAILED = 'sync.failed'

    INTEGRATION_CONNECTED = 'integration.connected'
    INTEGRATION_DISCONNECTED = 'integration.disconnected'

    def __str__(self):
        return self.value
