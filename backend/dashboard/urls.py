from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """Root API endpoint showing available endpoints"""
    return JsonResponse({
        "name": "Ecommerce Tool API",
        "version": "1.0.0",
        "description": "Django REST API for Ecommerce Dashboard",
        "frontend": "http://localhost:5173",
        "endpoints": {
            "auth": {
                "login": "/api/auth/login/",
                "me": "/api/auth/me/"
            },
            "dashboard": {
                "metrics": "/api/dashboard/metrics/",
                "overview": "/api/dashboard/overview/"
            },
            "analytics": {
                "overview": "/api/analytics/overview/"
            },
            "projects": {
                "list": "/api/projects/"
            },
            "users": {
                "list": "/api/users/"
            },
            "admin": "/admin/"
        },
        "status": "running"
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/dashboard/', include('dashboard.urls_app')),
    path('api/analytics/', include('analytics.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/', include('api.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)