from rest_framework import serializers

from apps.analytics.models import MetricSnapshot, SyncFailureLog


class SyncFailureLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncFailureLog
        fields = [
            'id', 'sync_job_id', 'integration_id', 'platform', 'job_type',
            'error_message', 'retry_count', 'resolved', 'created_at',
        ]
        read_only_fields = fields


class MetricSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = MetricSnapshot
        fields = [
            'id', 'metric_type', 'dimension', 'dimension_value',
            'period', 'period_start', 'value', 'count', 'metadata',
        ]
        read_only_fields = fields
