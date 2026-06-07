from django.urls import include, path

urlpatterns = [
    path('auth/', include('apps.identity.urls')),
    path('products/', include('apps.products.urls')),
    path('inventory/', include('apps.inventory.urls')),
    path('orders/', include('apps.orders.urls')),
    path('integrations/', include('apps.integrations.urls')),
    path('analytics/', include('apps.analytics.urls')),
    path('events/', include('apps.events.urls')),
]
