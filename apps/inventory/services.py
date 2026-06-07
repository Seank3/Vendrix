import logging

from django.db import transaction
from django.db.models import F
from django.utils import timezone

from apps.core.services import BaseService
from apps.events.bus import EventBus
from apps.events.types import EventType
from apps.inventory.models import (
    ChannelBuffer,
    InventoryLevel,
    StockLedger,
    StockLedgerEntryType,
    StockReservation,
)

logger = logging.getLogger('vendrix.inventory')


class InventoryService(BaseService):
    def __init__(self, organization_id):
        super().__init__(organization_id)
        self.event_bus = EventBus(organization_id)

    def get_level(self, sku):
        return InventoryLevel.objects.filter(
            organization_id=self.organization_id,
            sku=sku,
        ).first()

    def list_levels(self):
        return InventoryLevel.objects.filter(organization_id=self.organization_id)

    def get_channel_available(self, sku, channel):
        level = self.get_level(sku)
        if not level:
            return 0

        buffer = ChannelBuffer.objects.filter(
            organization_id=self.organization_id,
            sku=sku,
            channel=channel,
            is_active=True,
        ).first()

        buffer_qty = buffer.buffer_quantity if buffer else 0
        return max(0, level.quantity_available - buffer_qty)

    @transaction.atomic
    def adjust_stock(
        self,
        sku,
        quantity_delta,
        entry_type=StockLedgerEntryType.ADJUSTMENT,
        channel='',
        reference_type='',
        reference_id='',
        notes='',
        actor_id=None,
        variant_id=None,
    ):
        level, _ = InventoryLevel.objects.select_for_update().get_or_create(
            organization_id=self.organization_id,
            sku=sku,
            defaults={
                'variant_id': variant_id,
                'quantity_on_hand': 0,
                'quantity_reserved': 0,
                'quantity_available': 0,
            },
        )

        new_on_hand = level.quantity_on_hand + quantity_delta
        if new_on_hand < 0:
            raise ValueError(f'Insufficient stock for SKU {sku}: would result in {new_on_hand}')

        level.quantity_on_hand = new_on_hand
        level.quantity_available = new_on_hand - level.quantity_reserved
        level.save()

        ledger = StockLedger.objects.create(
            organization_id=self.organization_id,
            sku=sku,
            variant_id=variant_id,
            entry_type=entry_type,
            quantity_delta=quantity_delta,
            quantity_after=new_on_hand,
            channel=channel,
            reference_type=reference_type,
            reference_id=reference_id,
            notes=notes,
        )

        self.event_bus.publish(
            EventType.INVENTORY_UPDATED,
            resource_type='inventory',
            resource_id=sku,
            payload={
                'sku': sku,
                'quantity_delta': quantity_delta,
                'quantity_on_hand': new_on_hand,
                'quantity_available': level.quantity_available,
                'entry_type': entry_type,
                'channel': channel,
            },
            actor_id=actor_id,
        )

        logger.info(
            'Stock adjusted: sku=%s delta=%s on_hand=%s org=%s',
            sku, quantity_delta, new_on_hand, self.organization_id,
        )
        return level, ledger

    @transaction.atomic
    def reserve_stock(self, sku, quantity, reference_type, reference_id, channel='', actor_id=None):
        level = InventoryLevel.objects.select_for_update().get(
            organization_id=self.organization_id,
            sku=sku,
        )

        if level.quantity_available < quantity:
            raise ValueError(f'Cannot reserve {quantity} of {sku}: only {level.quantity_available} available')

        level.quantity_reserved = F('quantity_reserved') + quantity
        level.quantity_available = F('quantity_available') - quantity
        level.save()
        level.refresh_from_db()

        reservation = StockReservation.objects.create(
            organization_id=self.organization_id,
            sku=sku,
            quantity=quantity,
            channel=channel,
            reference_type=reference_type,
            reference_id=reference_id,
        )

        StockLedger.objects.create(
            organization_id=self.organization_id,
            sku=sku,
            entry_type=StockLedgerEntryType.RESERVATION,
            quantity_delta=-quantity,
            quantity_after=level.quantity_on_hand,
            channel=channel,
            reference_type=reference_type,
            reference_id=reference_id,
        )

        self.event_bus.publish(
            EventType.INVENTORY_RESERVED,
            resource_type='inventory',
            resource_id=sku,
            payload={
                'sku': sku,
                'quantity': quantity,
                'reference_type': reference_type,
                'reference_id': reference_id,
            },
            actor_id=actor_id,
        )
        return reservation

    @transaction.atomic
    def release_reservation(self, reservation_id, actor_id=None):
        reservation = StockReservation.objects.select_for_update().get(
            id=reservation_id,
            organization_id=self.organization_id,
            is_active=True,
        )

        level = InventoryLevel.objects.select_for_update().get(
            organization_id=self.organization_id,
            sku=reservation.sku,
        )

        level.quantity_reserved = F('quantity_reserved') - reservation.quantity
        level.quantity_available = F('quantity_available') + reservation.quantity
        level.save()

        reservation.is_active = False
        reservation.save()

        self.event_bus.publish(
            EventType.INVENTORY_RELEASED,
            resource_type='inventory',
            resource_id=reservation.sku,
            payload={'reservation_id': str(reservation_id), 'quantity': reservation.quantity},
            actor_id=actor_id,
        )
        return reservation

    @transaction.atomic
    def set_channel_buffer(self, sku, channel, buffer_quantity):
        buffer, _ = ChannelBuffer.objects.update_or_create(
            organization_id=self.organization_id,
            sku=sku,
            channel=channel,
            defaults={'buffer_quantity': buffer_quantity, 'is_active': True},
        )
        return buffer
