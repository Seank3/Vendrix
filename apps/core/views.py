from rest_framework.views import APIView

from django.http import JsonResponse

from apps.core.context import resolve_organization_id, set_current_organization_id

__all__ = ['TenantAPIView', 'resolve_organization_id', 'health_check']


def health_check(request):
    """Unauthenticated liveness probe for load balancers / host health checks."""
    return JsonResponse({'status': 'ok', 'service': 'vendrix-api'})



class TenantAPIView(APIView):
    """Sets tenant context after DRF authentication completes."""

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        org_id = resolve_organization_id(request)
        if org_id:
            set_current_organization_id(org_id)
            request.organization_id = org_id
