from django.urls import path

from apps.products.views import ProductDetailView, ProductListCreateView

urlpatterns = [
    path('', ProductListCreateView.as_view(), name='product-list'),
    path('<uuid:product_id>/', ProductDetailView.as_view(), name='product-detail'),
]
