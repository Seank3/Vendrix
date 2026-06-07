from rest_framework import serializers

from apps.inventory.models import ChannelBuffer, InventoryLevel, StockLedger, StockReservation


class InventoryLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLevel
        fields = [
            'id', 'sku', 'variant_id', 'quantity_on_hand',
            'quantity_reserved', 'quantity_available', 'updated_at',
        ]
        read_only_fields = fields


class StockLedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockLedger
        fields = [
            'id', 'sku', 'entry_type', 'quantity_delta', 'quantity_after',
            'channel', 'reference_type', 'reference_id', 'notes', 'created_at',
        ]
        read_only_fields = fields


class StockAdjustmentSerializer(serializers.Serializer):
    sku = serializers.CharField(max_length=100)
    quantity_delta = serializers.IntegerField()
    notes = serializers.CharField(required=False, default='')
    channel = serializers.CharField(required=False, default='')
    variant_id = serializers.UUIDField(required=False, allow_null=True)


class ChannelBufferSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelBuffer
        fields = ['id', 'sku', 'channel', 'buffer_quantity', 'is_active']
        read_only_fields = ['id']


class StockReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockReservation
        fields = [
            'id', 'sku', 'quantity', 'channel', 'reference_type',
            'reference_id', 'is_active', 'created_at',
        ]
        read_only_fields = fields
