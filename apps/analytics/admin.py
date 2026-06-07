from django.contrib import admin

from apps.analytics.models import MetricSnapshot, SyncFailureLog


@admin.register(MetricSnapshot)
class MetricSnapshotAdmin(admin.ModelAdmin):
    list_display = ['metric_type', 'dimension_value', 'count', 'period_start', 'organization_id']
    list_filter = ['metric_type']


@admin.register(SyncFailureLog)
class SyncFailureLogAdmin(admin.ModelAdmin):
    list_display = ['platform', 'job_type', 'resolved', 'created_at', 'organization_id']
    list_filter = ['platform', 'resolved']
