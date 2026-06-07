from django.db import models

from apps.core.models import TenantManager, TenantScopedModel


class OrderStatus(models.TextChoices):
    RECEIVED = 'received', 'Received'
    PROCESSING = 'processing', 'Processing'
    FULFILLED = 'fulfilled', 'Fulfilled'
    CANCELLED = 'cancelled', 'Cancelled'


class Order(TenantScopedModel):
    """Normalized internal order schema — ingested from external platforms."""

    external_id = models.CharField(max_length=255, db_index=True)
    channel = models.CharField(max_length=50, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=OrderStatus.choices,
        default=OrderStatus.RECEIVED,
    )
    currency = models.CharField(max_length=3, default='USD')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    customer = models.JSONField(default=dict, blank=True)
    shipping_address = models.JSONField(default=dict, blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)
    integration_id = models.UUIDField(null=True, blank=True, db_index=True)

    objects = TenantManager()

    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'channel', 'external_id'],
                name='unique_order_per_channel',
            ),
        ]
        indexes = [
            models.Index(fields=['organization_id', 'status']),
            models.Index(fields=['organization_id', 'channel']),
        ]

    def __str__(self):
        return f'{self.channel}:{self.external_id}'


class OrderLineItem(TenantScopedModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='line_items')
    sku = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=500)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    variant_id = models.UUIDField(null=True, blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'order_line_items'
