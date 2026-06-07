from rest_framework import serializers

from apps.orders.models import Order, OrderLineItem, OrderStatus


class OrderLineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderLineItem
        fields = ['id', 'sku', 'name', 'quantity', 'unit_price', 'total_price', 'variant_id']
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    line_items = OrderLineItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'external_id', 'channel', 'status', 'currency',
            'subtotal', 'tax', 'shipping', 'total', 'customer',
            'shipping_address', 'line_items', 'integration_id',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderIngestSerializer(serializers.Serializer):
    external_id = serializers.CharField(max_length=255)
    channel = serializers.CharField(max_length=50)
    currency = serializers.CharField(max_length=3, required=False, default='USD')
    customer = serializers.JSONField(required=False, default=dict)
    shipping_address = serializers.JSONField(required=False, default=dict)
    line_items = serializers.ListField()
    raw_payload = serializers.JSONField(required=False, default=dict)
    integration_id = serializers.UUIDField(required=False, allow_null=True)


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices)
