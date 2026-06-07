import logging
from decimal import Decimal

from django.db import transaction

from apps.core.services import BaseService
from apps.events.bus import EventBus
from apps.events.types import EventType
from apps.inventory.services import InventoryService
from apps.orders.models import Order, OrderLineItem, OrderStatus

logger = logging.getLogger('vendrix.orders')


class OrderService(BaseService):
    def __init__(self, organization_id):
        super().__init__(organization_id)
        self.event_bus = EventBus(organization_id)
        self.inventory_service = InventoryService(organization_id)

    @transaction.atomic
    def ingest_order(self, channel, external_id, line_items, customer=None,
                     shipping_address=None, currency='USD', raw_payload=None,
                     integration_id=None, actor_id=None):
        if Order.objects.filter(
            organization_id=self.organization_id,
            channel=channel,
            external_id=external_id,
        ).exists():
            logger.warning('Duplicate order ingestion: %s:%s', channel, external_id)
            return Order.objects.get(
                organization_id=self.organization_id,
                channel=channel,
                external_id=external_id,
            )

        subtotal = sum(
            Decimal(str(item['quantity'])) * Decimal(str(item['unit_price']))
            for item in line_items
        )

        order = Order.objects.create(
            organization_id=self.organization_id,
            external_id=external_id,
            channel=channel,
            status=OrderStatus.RECEIVED,
            currency=currency,
            subtotal=subtotal,
            total=subtotal,
            customer=customer or {},
            shipping_address=shipping_address or {},
            raw_payload=raw_payload or {},
            integration_id=integration_id,
        )

        for item in line_items:
            qty = item['quantity']
            unit_price = Decimal(str(item['unit_price']))
            OrderLineItem.objects.create(
                organization_id=self.organization_id,
                order=order,
                sku=item['sku'],
                name=item.get('name', item['sku']),
                quantity=qty,
                unit_price=unit_price,
                total_price=unit_price * qty,
                variant_id=item.get('variant_id'),
            )

            try:
                self.inventory_service.reserve_stock(
                    sku=item['sku'],
                    quantity=qty,
                    reference_type='order',
                    reference_id=str(order.id),
                    channel=channel,
                    actor_id=actor_id,
                )
            except Exception as exc:
                logger.warning('Stock reservation failed for order %s sku=%s: %s', order.id, item['sku'], exc)

        self.event_bus.publish(
            EventType.ORDER_RECEIVED,
            resource_type='order',
            resource_id=str(order.id),
            payload={
                'external_id': external_id,
                'channel': channel,
                'total': str(order.total),
                'line_item_count': len(line_items),
            },
            actor_id=actor_id,
        )

        logger.info('Order ingested: %s:%s org=%s', channel, external_id, self.organization_id)
        return order

    @transaction.atomic
    def transition_status(self, order_id, new_status, actor_id=None):
        order = Order.objects.get(id=order_id, organization_id=self.organization_id)
        old_status = order.status
        order.status = new_status
        order.save()

        event_map = {
            OrderStatus.PROCESSING: EventType.ORDER_PROCESSING,
            OrderStatus.FULFILLED: EventType.ORDER_FULFILLED,
            OrderStatus.CANCELLED: EventType.ORDER_CANCELLED,
        }

        if new_status in event_map:
            self.event_bus.publish(
                event_map[new_status],
                resource_type='order',
                resource_id=str(order.id),
                payload={'old_status': old_status, 'new_status': new_status},
                actor_id=actor_id,
            )

        return order

    def get_order(self, order_id):
        return Order.objects.prefetch_related('line_items').get(
            id=order_id,
            organization_id=self.organization_id,
        )

    def list_orders(self, status=None, channel=None):
        qs = Order.objects.filter(organization_id=self.organization_id)
        if status:
            qs = qs.filter(status=status)
        if channel:
            qs = qs.filter(channel=channel)
        return qs.prefetch_related('line_items')
