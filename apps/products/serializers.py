from rest_framework import serializers

from apps.products.models import ChannelPricing, Product, ProductMedia, ProductVariant


class ProductMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMedia
        fields = ['id', 'url', 'alt_text', 'position', 'media_type']
        read_only_fields = ['id']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = [
            'id', 'sku', 'name', 'attributes', 'barcode',
            'weight_grams', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ChannelPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChannelPricing
        fields = [
            'id', 'channel', 'currency', 'price', 'compare_at_price',
            'variant', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    media = ProductMediaSerializer(many=True, read_only=True)
    channel_pricing = ChannelPricingSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name', 'description', 'attributes', 'status',
            'category', 'category_mapping', 'variants', 'media',
            'channel_pricing', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.Serializer):
    sku = serializers.CharField(max_length=100)
    name = serializers.CharField(max_length=500)
    description = serializers.CharField(required=False, default='')
    attributes = serializers.JSONField(required=False, default=dict)
    status = serializers.ChoiceField(
        choices=['draft', 'active', 'archived'],
        required=False,
        default='draft',
    )
    category = serializers.CharField(required=False, default='')
    category_mapping = serializers.JSONField(required=False, default=dict)
    variants = serializers.ListField(required=False, default=list)
    media = serializers.ListField(required=False, default=list)
    channel_pricing = serializers.ListField(required=False, default=list)
