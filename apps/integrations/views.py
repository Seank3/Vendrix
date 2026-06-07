from rest_framework import status
from rest_framework.response import Response

from apps.core.permissions import IsOperator, IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.integrations.models import PlatformIntegration, SyncJob
from apps.integrations.platforms import Platform
from apps.integrations.serializers import (
    IntegrationCreateSerializer,
    OrderFetchSerializer,
    PlatformIntegrationSerializer,
    ProductPushSerializer,
    SyncJobSerializer,
)
from apps.integrations.services import IntegrationService, SyncService


class PlatformListView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        platforms = [
            {'id': p.value, 'name': p.name.replace('_', ' ').title()}
            for p in Platform
        ]
        return Response(platforms)


class IntegrationListCreateView(TenantAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOperator()]
        return [IsViewer()]

    def get(self, request):
        service = IntegrationService(resolve_organization_id(request))
        integrations = service.list_integrations()
        return Response(PlatformIntegrationSerializer(integrations, many=True).data)

    def post(self, request):
        serializer = IntegrationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = IntegrationService(resolve_organization_id(request))
        integration = service.create_integration(
            platform=data['platform'],
            name=data['name'],
            credentials=data['credentials'],
            config=data.get('config', {}),
            actor_id=str(getattr(request.user, 'id', '')),
        )
        return Response(
            PlatformIntegrationSerializer(integration).data,
            status=status.HTTP_201_CREATED,
        )


class IntegrationDetailView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request, integration_id):
        try:
            integration = PlatformIntegration.objects.get(
                id=integration_id,
                organization_id=resolve_organization_id(request),
            )
        except PlatformIntegration.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PlatformIntegrationSerializer(integration).data)


class ProductPushView(TenantAPIView):
    permission_classes = [IsOperator]

    def post(self, request, integration_id):
        serializer = ProductPushSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = SyncService(resolve_organization_id(request))
        try:
            job = service.push_product_to_integration(
                integration_id=integration_id,
                product_id=str(serializer.validated_data['product_id']),
                actor_id=str(getattr(request.user, 'id', '')),
            )
        except PlatformIntegration.DoesNotExist:
            return Response({'detail': 'Integration not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(SyncJobSerializer(job).data, status=status.HTTP_202_ACCEPTED)


class OrderFetchView(TenantAPIView):
    permission_classes = [IsOperator]

    def post(self, request, integration_id):
        serializer = OrderFetchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = SyncService(resolve_organization_id(request))
        try:
            job = service.fetch_orders(
                integration_id=integration_id,
                since=serializer.validated_data.get('since'),
                actor_id=str(getattr(request.user, 'id', '')),
            )
        except PlatformIntegration.DoesNotExist:
            return Response({'detail': 'Integration not found'}, status=status.HTTP_404_NOT_FOUND)

        return Response(SyncJobSerializer(job).data, status=status.HTTP_202_ACCEPTED)


class SyncJobListView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        qs = SyncJob.objects.filter(
            organization_id=resolve_organization_id(request),
        ).select_related('integration')

        status_filter = request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        failed_only = request.query_params.get('failed')
        if failed_only == 'true':
            qs = qs.filter(status='failed')

        jobs = qs[:50]
        return Response(SyncJobSerializer(jobs, many=True).data)


class SyncJobDetailView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request, job_id):
        try:
            job = SyncJob.objects.select_related('integration').get(
                id=job_id,
                organization_id=resolve_organization_id(request),
            )
        except SyncJob.DoesNotExist:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(SyncJobSerializer(job).data)
