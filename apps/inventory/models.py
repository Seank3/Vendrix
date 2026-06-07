from django.db import models

from apps.core.models import TenantManager, TenantScopedModel


class StockLedgerEntryType(models.TextChoices):
    ADJUSTMENT = 'adjustment', 'Adjustment'
    RESERVATION = 'reservation', 'Reservation'
    RELEASE = 'release', 'Release'
    SYNC = 'sync', 'Channel Sync'
    ORDER_FULFILLMENT = 'order_fulfillment', 'Order Fulfillment'
    INITIAL = 'initial', 'Initial Stock'


class StockLedger(TenantScopedModel):
    """
    Central stock ledger — immutable append-only record of all stock changes.
    """

    sku = models.CharField(max_length=100, db_index=True)
    variant_id = models.UUIDField(null=True, blank=True, db_index=True)
    entry_type = models.CharField(max_length=30, choices=StockLedgerEntryType.choices)
    quantity_delta = models.IntegerField()
    quantity_after = models.IntegerField()
    channel = models.CharField(max_length=50, blank=True)
    reference_type = models.CharField(max_length=100, blank=True)
    reference_id = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'stock_ledger'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['organization_id', 'sku']),
            models.Index(fields=['organization_id', 'created_at']),
        ]


class InventoryLevel(TenantScopedModel):
    """Current stock position per SKU (materialized from ledger)."""

    sku = models.CharField(max_length=100, db_index=True)
    variant_id = models.UUIDField(null=True, blank=True)
    quantity_on_hand = models.IntegerField(default=0)
    quantity_reserved = models.IntegerField(default=0)
    quantity_available = models.IntegerField(default=0)

    objects = TenantManager()

    class Meta:
        db_table = 'inventory_levels'
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'sku'],
                name='unique_inventory_level_per_sku',
            ),
        ]


class ChannelBuffer(TenantScopedModel):
    """
    Channel-specific stock buffers to prevent overselling.
    Available for channel = on_hand - reserved - buffer
    """

    sku = models.CharField(max_length=100, db_index=True)
    channel = models.CharField(max_length=50, db_index=True)
    buffer_quantity = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = 'channel_buffers'
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'sku', 'channel'],
                name='unique_channel_buffer',
            ),
        ]


class StockReservation(TenantScopedModel):
    """Active stock reservations tied to orders or sync operations."""

    sku = models.CharField(max_length=100, db_index=True)
    quantity = models.PositiveIntegerField()
    channel = models.CharField(max_length=50, blank=True)
    reference_type = models.CharField(max_length=100)
    reference_id = models.CharField(max_length=100)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = 'stock_reservations'
        indexes = [
            models.Index(fields=['organization_id', 'reference_type', 'reference_id']),
        ]
