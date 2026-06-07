from rest_framework import status
from rest_framework.response import Response

from apps.core.permissions import IsOperator, IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.products.serializers import ProductCreateSerializer, ProductSerializer
from apps.products.services import ProductService


class ProductListCreateView(TenantAPIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsOperator()]
        return [IsViewer()]

    def get(self, request):
        service = ProductService(resolve_organization_id(request))
        status_filter = request.query_params.get('status')
        products = service.list_products(status=status_filter)
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request):
        serializer = ProductCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = ProductService(resolve_organization_id(request))
        product = service.create_product(
            serializer.validated_data,
            actor_id=str(getattr(request.user, 'id', '')),
        )
        product = service.get_product(product.id)
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)


class ProductDetailView(TenantAPIView):
    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH'):
            return [IsOperator()]
        return [IsViewer()]

    def get(self, request, product_id):
        service = ProductService(resolve_organization_id(request))
        try:
            product = service.get_product(product_id)
        except Exception:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data)

    def patch(self, request, product_id):
        service = ProductService(resolve_organization_id(request))
        try:
            product = service.update_product(
                product_id,
                request.data,
                actor_id=str(getattr(request.user, 'id', '')),
            )
            product = service.get_product(product.id)
        except Exception:
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(product).data)
