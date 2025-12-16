from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

# Bridge to existing config/credential managers - temporarily disabled
# try:
#     from ecommerce_tool.config.config_manager import ConfigManager
#     from ecommerce_tool.config.credential_manager import CredentialManager
# except Exception:
#     from config.config_manager import ConfigManager  # fallback for local package name
#     from config.credential_manager import CredentialManager

# Mock managers for development
class ConfigManager:
    def __init__(self):
        self._data = {"enabled_platforms": ["etsy", "shopify"]}

    def get_setting(self, key, default=None):
        return self._data.get(key, default)

class CredentialManager:
    def get_platform_credentials(self, platform):
        return {"api_key": "mock_key", "secret": "mock_secret"}

    def store_platform_credentials(self, platform, data):
        pass


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    # Placeholder login; integrate real auth later
    return Response({"token": "dev-placeholder-token", "user": {"username": "demo"}}, status=status.HTTP_200_OK)


@api_view(["GET"])
def me_view(request):
    return Response({"user": {"username": "demo", "is_admin": True}})


@api_view(["GET", "PUT"])
def config_view(request):
    cfg = ConfigManager()
    if request.method == "GET":
        return Response(cfg._data)  # expose raw config for now
    cfg._data.update(request.data or {})
    cfg._save()
    return Response(cfg._data)


@api_view(["GET"])
def integrations_view(request):
    cfg = ConfigManager()
    enabled = cfg.get_setting("enabled_platforms", {})
    return Response({"enabled_platforms": enabled})


@api_view(["GET", "POST"])
def credentials_view(request):
    creds = CredentialManager()
    if request.method == "GET":
        platform = request.query_params.get("platform")
        if not platform:
            return Response({"error": "platform required"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"platform": platform, "credentials": creds.get_platform_credentials(platform)})

    platform = request.data.get("platform")
    data = request.data.get("credentials") or {}
    if not platform:
        return Response({"error": "platform required"}, status=status.HTTP_400_BAD_REQUEST)
    creds.store_platform_credentials(platform, data)
    return Response({"platform": platform, "stored": True})


@api_view(["GET"])
def orders_view(request):
    # Placeholder list; wire to persistence later
    sample = [
        {"platform": "etsy", "order_id": "SAMPLE-1", "sku": "SKU-1", "quantity": 1, "order_date": "2024-01-01T00:00:00Z"}
    ]
    return Response({"results": sample})


@api_view(["GET"])
def logs_view(request):
    # Placeholder logs endpoint
    return Response({"logs": ["log line 1", "log line 2"]})


@api_view(["GET"])
def dashboard_metrics_view(request):
    # Mock dashboard metrics
    return Response({
        "revenue": {"value": "$45,231", "change": "+20.1%", "trend": "up"},
        "orders": {"value": "234", "change": "+12.5%", "trend": "up"},
        "integrations": {"value": "8", "change": "2 pending", "trend": "neutral"},
        "successRate": {"value": "98.5%", "change": "-0.2%", "trend": "down"}
    })


@api_view(["GET"])
def analytics_overview_view(request):
    period = request.query_params.get('period', '30d')

    # Mock analytics data based on period
    period_data = {
        '7d': {
            'summary': {
                'totalRevenue': '$12,430',
                'totalOrders': '234',
                'averageOrderValue': '$53.12',
                'conversionRate': '2.8%'
            },
            'topProducts': [
                {'name': 'Product A', 'sales': 45, 'revenue': '$4,500'},
                {'name': 'Product B', 'sales': 38, 'revenue': '$3,800'},
                {'name': 'Product C', 'sales': 29, 'revenue': '$2,900'}
            ]
        },
        '30d': {
            'summary': {
                'totalRevenue': '$45,231',
                'totalOrders': '856',
                'averageOrderValue': '$52.84',
                'conversionRate': '3.2%'
            },
            'topProducts': [
                {'name': 'Product A', 'sales': 156, 'revenue': '$15,600'},
                {'name': 'Product B', 'sales': 134, 'revenue': '$13,400'},
                {'name': 'Product C', 'sales': 98, 'revenue': '$9,800'}
            ]
        },
        '90d': {
            'summary': {
                'totalRevenue': '$125,430',
                'totalOrders': '2,347',
                'averageOrderValue': '$53.42',
                'conversionRate': '3.1%'
            },
            'topProducts': [
                {'name': 'Product A', 'sales': 456, 'revenue': '$45,600'},
                {'name': 'Product B', 'sales': 389, 'revenue': '$38,900'},
                {'name': 'Product C', 'sales': 298, 'revenue': '$29,800'}
            ]
        }
    }

    return Response(period_data.get(period, period_data['30d']))


@api_view(["GET"])
def users_view(request):
    # Mock users data
    mock_users = [
        {
            'id': 1,
            'name': 'John Doe',
            'email': 'john@example.com',
            'role': 'admin',
            'status': 'active',
            'lastLogin': '2024-01-15T10:30:00Z'
        },
        {
            'id': 2,
            'name': 'Jane Smith',
            'email': 'jane@example.com',
            'role': 'user',
            'status': 'active',
            'lastLogin': '2024-01-14T15:45:00Z'
        },
        {
            'id': 3,
            'name': 'Bob Johnson',
            'email': 'bob@example.com',
            'role': 'moderator',
            'status': 'inactive',
            'lastLogin': '2024-01-10T09:15:00Z'
        },
        {
            'id': 4,
            'name': 'Alice Wilson',
            'email': 'alice@example.com',
            'role': 'user',
            'status': 'active',
            'lastLogin': '2024-01-13T14:20:00Z'
        }
    ]

    return Response({"results": mock_users})

