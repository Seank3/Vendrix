from django.contrib import admin

from apps.inventory.models import ChannelBuffer, InventoryLevel, StockLedger, StockReservation


@admin.register(InventoryLevel)
class InventoryLevelAdmin(admin.ModelAdmin):
    list_display = ['sku', 'quantity_on_hand', 'quantity_reserved', 'quantity_available', 'organization_id']


@admin.register(StockLedger)
class StockLedgerAdmin(admin.ModelAdmin):
    list_display = ['sku', 'entry_type', 'quantity_delta', 'quantity_after', 'channel', 'created_at']
    list_filter = ['entry_type']


@admin.register(ChannelBuffer)
class ChannelBufferAdmin(admin.ModelAdmin):
    list_display = ['sku', 'channel', 'buffer_quantity', 'is_active']


@admin.register(StockReservation)
class StockReservationAdmin(admin.ModelAdmin):
    list_display = ['sku', 'quantity', 'reference_type', 'reference_id', 'is_active']
