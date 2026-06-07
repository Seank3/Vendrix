from django.db import models

from apps.core.models import TenantManager, TenantScopedModel


class ProductStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    ACTIVE = 'active', 'Active'
    ARCHIVED = 'archived', 'Archived'


class Product(TenantScopedModel):
    """
    Master catalog — single source of truth for all external platforms.
    """

    sku = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProductStatus.choices,
        default=ProductStatus.DRAFT,
    )
    category = models.CharField(max_length=255, blank=True)
    category_mapping = models.JSONField(default=dict, blank=True)

    objects = TenantManager()

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'sku'],
                name='unique_product_sku_per_org',
            ),
        ]
        indexes = [
            models.Index(fields=['organization_id', 'status']),
            models.Index(fields=['organization_id', 'sku']),
        ]

    def __str__(self):
        return f'{self.sku} — {self.name}'


class ProductVariant(TenantScopedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='variants',
    )
    sku = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=500)
    attributes = models.JSONField(default=dict, blank=True)
    barcode = models.CharField(max_length=100, blank=True)
    weight_grams = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    objects = TenantManager()

    class Meta:
        db_table = 'product_variants'
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'sku'],
                name='unique_variant_sku_per_org',
            ),
        ]

    def __str__(self):
        return self.sku


class ProductMedia(TenantScopedModel):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='media',
    )
    url = models.URLField(max_length=2048)
    alt_text = models.CharField(max_length=255, blank=True)
    position = models.PositiveIntegerField(default=0)
    media_type = models.CharField(max_length=50, default='image')

    objects = TenantManager()

    class Meta:
        db_table = 'product_media'
        ordering = ['position']


class ChannelPricing(TenantScopedModel):
    """Per-channel pricing overrides."""

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='channel_pricing',
    )
    variant = models.ForeignKey(
        ProductVariant,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='channel_pricing',
    )
    channel = models.CharField(max_length=50, db_index=True)
    currency = models.CharField(max_length=3, default='USD')
    price = models.DecimalField(max_digits=12, decimal_places=2)
    compare_at_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    objects = TenantManager()

    class Meta:
        db_table = 'channel_pricing'
        constraints = [
            models.UniqueConstraint(
                fields=['organization_id', 'product', 'variant', 'channel'],
                name='unique_channel_pricing',
            ),
        ]
