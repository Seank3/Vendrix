from rest_framework import status
from rest_framework.response import Response

from apps.core.permissions import IsOperator, IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.inventory.models import StockLedger
from apps.inventory.serializers import (
    ChannelBufferSerializer,
    InventoryLevelSerializer,
    StockAdjustmentSerializer,
    StockLedgerSerializer,
)
from apps.inventory.services import InventoryService


class InventoryLevelListView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        service = InventoryService(resolve_organization_id(request))
        levels = service.list_levels()
        return Response(InventoryLevelSerializer(levels, many=True).data)


class InventoryLevelDetailView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request, sku):
        service = InventoryService(resolve_organization_id(request))
        level = service.get_level(sku)
        if not level:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InventoryLevelSerializer(level).data)


class StockAdjustView(TenantAPIView):
    permission_classes = [IsOperator]

    def post(self, request):
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = InventoryService(resolve_organization_id(request))
        try:
            level, ledger = service.adjust_stock(
                sku=data['sku'],
                quantity_delta=data['quantity_delta'],
                notes=data.get('notes', ''),
                channel=data.get('channel', ''),
                variant_id=data.get('variant_id'),
                actor_id=str(getattr(request.user, 'id', '')),
            )
        except ValueError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'level': InventoryLevelSerializer(level).data,
            'ledger_entry': StockLedgerSerializer(ledger).data,
        })


class StockLedgerListView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        qs = StockLedger.objects.filter(organization_id=resolve_organization_id(request))
        sku = request.query_params.get('sku')
        if sku:
            qs = qs.filter(sku=sku)
        entries = qs[:100]
        return Response(StockLedgerSerializer(entries, many=True).data)


class ChannelBufferView(TenantAPIView):
    permission_classes = [IsOperator]

    def post(self, request):
        serializer = ChannelBufferSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = InventoryService(resolve_organization_id(request))
        buffer = service.set_channel_buffer(
            sku=serializer.validated_data['sku'],
            channel=serializer.validated_data['channel'],
            buffer_quantity=serializer.validated_data['buffer_quantity'],
        )
        return Response(ChannelBufferSerializer(buffer).data, status=status.HTTP_201_CREATED)
