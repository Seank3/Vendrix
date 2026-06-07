from rest_framework.response import Response

from apps.core.permissions import IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.analytics.serializers import SyncFailureLogSerializer
from apps.analytics.services import AnalyticsService


class OverviewView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        service = AnalyticsService(resolve_organization_id(request))
        return Response(service.get_overview())


class OrderVolumeView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        service = AnalyticsService(resolve_organization_id(request))
        return Response(service.get_order_volume_by_channel(days=days))


class SyncFailuresView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        resolved = request.query_params.get('resolved')
        resolved_filter = None
        if resolved == 'true':
            resolved_filter = True
        elif resolved == 'false':
            resolved_filter = False

        service = AnalyticsService(resolve_organization_id(request))
        failures = service.get_sync_failures(resolved=resolved_filter)
        return Response(SyncFailureLogSerializer(failures, many=True).data)


class SkuPerformanceView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        days = int(request.query_params.get('days', 30))
        service = AnalyticsService(resolve_organization_id(request))
        return Response(service.get_sku_performance(days=days))
