from django.contrib import admin

from apps.integrations.models import ExternalProductMapping, PlatformIntegration, SyncJob


@admin.register(PlatformIntegration)
class PlatformIntegrationAdmin(admin.ModelAdmin):
    list_display = ['name', 'platform', 'status', 'organization_id', 'last_sync_at']
    list_filter = ['platform', 'status']


@admin.register(SyncJob)
class SyncJobAdmin(admin.ModelAdmin):
    list_display = ['job_type', 'status', 'integration', 'retry_count', 'created_at']
    list_filter = ['status', 'job_type']


@admin.register(ExternalProductMapping)
class ExternalProductMappingAdmin(admin.ModelAdmin):
    list_display = ['sku', 'external_id', 'integration', 'sync_status']
