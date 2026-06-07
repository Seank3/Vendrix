import logging

from django.db import transaction

from apps.core.services import BaseService
from apps.events.bus import EventBus
from apps.events.types import EventType
from apps.products.models import ChannelPricing, Product, ProductMedia, ProductVariant

logger = logging.getLogger('vendrix.products')


class ProductService(BaseService):
    def __init__(self, organization_id):
        super().__init__(organization_id)
        self.event_bus = EventBus(organization_id)

    @transaction.atomic
    def create_product(self, data, actor_id=None):
        variants_data = data.pop('variants', [])
        media_data = data.pop('media', [])
        pricing_data = data.pop('channel_pricing', [])

        product = Product.objects.create(
            organization_id=self.organization_id,
            **data,
        )

        for variant in variants_data:
            ProductVariant.objects.create(
                organization_id=self.organization_id,
                product=product,
                **variant,
            )

        for media in media_data:
            ProductMedia.objects.create(
                organization_id=self.organization_id,
                product=product,
                **media,
            )

        for pricing in pricing_data:
            ChannelPricing.objects.create(
                organization_id=self.organization_id,
                product=product,
                **pricing,
            )

        self.event_bus.publish(
            EventType.PRODUCT_CREATED,
            resource_type='product',
            resource_id=str(product.id),
            payload={'sku': product.sku, 'name': product.name},
            actor_id=actor_id,
        )
        logger.info('Product created: %s org=%s', product.sku, self.organization_id)
        return product

    @transaction.atomic
    def update_product(self, product_id, data, actor_id=None):
        product = Product.objects.get(
            id=product_id,
            organization_id=self.organization_id,
        )

        for field in ['name', 'description', 'attributes', 'status', 'category', 'category_mapping']:
            if field in data:
                setattr(product, field, data[field])
        product.save()

        self.event_bus.publish(
            EventType.PRODUCT_UPDATED,
            resource_type='product',
            resource_id=str(product.id),
            payload={'sku': product.sku},
            actor_id=actor_id,
        )
        return product

    def get_product(self, product_id):
        return Product.objects.prefetch_related(
            'variants', 'media', 'channel_pricing',
        ).get(id=product_id, organization_id=self.organization_id)

    def list_products(self, status=None):
        qs = Product.objects.filter(organization_id=self.organization_id)
        if status:
            qs = qs.filter(status=status)
        return qs.prefetch_related('variants', 'media', 'channel_pricing')
