from django.urls import path

from apps.analytics.views import (
    OrderVolumeView,
    OverviewView,
    SkuPerformanceView,
    SyncFailuresView,
)

urlpatterns = [
    path('overview/', OverviewView.as_view(), name='analytics-overview'),
    path('orders-by-channel/', OrderVolumeView.as_view(), name='analytics-orders'),
    path('sync-failures/', SyncFailuresView.as_view(), name='analytics-sync-failures'),
    path('sku-performance/', SkuPerformanceView.as_view(), name='analytics-sku'),
]
