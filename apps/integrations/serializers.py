from rest_framework import serializers

from apps.integrations.models import ExternalProductMapping, PlatformIntegration, SyncJob
from apps.integrations.platforms import Platform


class PlatformIntegrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformIntegration
        fields = [
            'id', 'platform', 'name', 'status', 'config',
            'last_sync_at', 'last_error', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'status', 'last_sync_at', 'last_error', 'created_at', 'updated_at',
        ]


class IntegrationCreateSerializer(serializers.Serializer):
    platform = serializers.ChoiceField(choices=Platform.choices())
    name = serializers.CharField(max_length=255)
    credentials = serializers.JSONField()
    config = serializers.JSONField(required=False, default=dict)


class SyncJobSerializer(serializers.ModelSerializer):
    integration_name = serializers.CharField(source='integration.name', read_only=True)
    platform = serializers.CharField(source='integration.platform', read_only=True)

    class Meta:
        model = SyncJob
        fields = [
            'id', 'integration', 'integration_name', 'platform', 'job_type',
            'status', 'resource_type', 'resource_id', 'result', 'error_message',
            'retry_count', 'started_at', 'completed_at', 'created_at',
        ]
        read_only_fields = fields


class ProductPushSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()


class OrderFetchSerializer(serializers.Serializer):
    since = serializers.CharField(required=False, allow_null=True)


class ExternalProductMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalProductMapping
        fields = [
            'id', 'integration', 'product_id', 'sku', 'external_id',
            'external_url', 'last_synced_at', 'sync_status',
        ]
        read_only_fields = fields
