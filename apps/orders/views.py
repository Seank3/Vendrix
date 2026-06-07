from rest_framework import status
from rest_framework.response import Response

from apps.core.permissions import IsOperator, IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.orders.serializers import (
    OrderIngestSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)
from apps.orders.services import OrderService


class OrderListCreateView(TenantAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOperator()]
        return [IsViewer()]

    def get(self, request):
        service = OrderService(resolve_organization_id(request))
        orders = service.list_orders(
            status=request.query_params.get('status'),
            channel=request.query_params.get('channel'),
        )
        return Response(OrderSerializer(orders, many=True).data)

    def post(self, request):
        serializer = OrderIngestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = OrderService(resolve_organization_id(request))
        order = service.ingest_order(
            channel=data['channel'],
            external_id=data['external_id'],
            line_items=data['line_items'],
            customer=data.get('customer'),
            shipping_address=data.get('shipping_address'),
            currency=data.get('currency', 'USD'),
            raw_payload=data.get('raw_payload'),
            integration_id=data.get('integration_id'),
            actor_id=str(getattr(request.user, 'id', '')),
        )
        order = service.get_order(order.id)
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request, order_id):
        service = OrderService(resolve_organization_id(request))
        try:
            order = service.get_order(order_id)
        except Exception:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)


class OrderStatusView(TenantAPIView):
    permission_classes = [IsOperator]

    def patch(self, request, order_id):
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = OrderService(resolve_organization_id(request))
        try:
            order = service.transition_status(
                order_id,
                serializer.validated_data['status'],
                actor_id=str(getattr(request.user, 'id', '')),
            )
            order = service.get_order(order.id)
        except Exception:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data)
