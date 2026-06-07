from django.urls import path

from apps.orders.views import OrderDetailView, OrderListCreateView, OrderStatusView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list'),
    path('<uuid:order_id>/', OrderDetailView.as_view(), name='order-detail'),
    path('<uuid:order_id>/status/', OrderStatusView.as_view(), name='order-status'),
]
