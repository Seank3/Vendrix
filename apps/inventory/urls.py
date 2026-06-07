from django.urls import path

from apps.inventory.views import (
    ChannelBufferView,
    InventoryLevelDetailView,
    InventoryLevelListView,
    StockAdjustView,
    StockLedgerListView,
)

urlpatterns = [
    path('', InventoryLevelListView.as_view(), name='inventory-list'),
    path('adjust/', StockAdjustView.as_view(), name='inventory-adjust'),
    path('ledger/', StockLedgerListView.as_view(), name='inventory-ledger'),
    path('buffers/', ChannelBufferView.as_view(), name='channel-buffer'),
    path('<str:sku>/', InventoryLevelDetailView.as_view(), name='inventory-detail'),
]
