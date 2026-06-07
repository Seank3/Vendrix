from django.urls import path

from apps.integrations.views import (
    IntegrationDetailView,
    IntegrationListCreateView,
    OrderFetchView,
    PlatformListView,
    ProductPushView,
    SyncJobDetailView,
    SyncJobListView,
)

urlpatterns = [
    path('platforms/', PlatformListView.as_view(), name='platform-list'),
    path('', IntegrationListCreateView.as_view(), name='integration-list'),
    path('<uuid:integration_id>/', IntegrationDetailView.as_view(), name='integration-detail'),
    path('<uuid:integration_id>/push-product/', ProductPushView.as_view(), name='product-push'),
    path('<uuid:integration_id>/fetch-orders/', OrderFetchView.as_view(), name='order-fetch'),
    path('sync-jobs/', SyncJobListView.as_view(), name='sync-job-list'),
    path('sync-jobs/<uuid:job_id>/', SyncJobDetailView.as_view(), name='sync-job-detail'),
]
