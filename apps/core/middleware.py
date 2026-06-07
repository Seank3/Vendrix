import logging

from apps.core.context import clear_current_organization, set_current_organization_id

logger = logging.getLogger('vendrix.tenant')


class TenantMiddleware:
    """
    Resolves organization context from authenticated user or API key.
    All downstream queries must respect this scope.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        clear_current_organization()
        organization_id = self._resolve_organization(request)
        if organization_id:
            set_current_organization_id(organization_id)
            request.organization_id = organization_id
        else:
            request.organization_id = None

        response = self.get_response(request)
        clear_current_organization()
        return response

    def _resolve_organization(self, request):
        if hasattr(request, 'auth') and request.auth:
            org = getattr(request.auth, 'organization', None)
            if org:
                return org.id

        if request.user and request.user.is_authenticated:
            org_id = getattr(request.user, 'organization_id', None)
            if org_id:
                return org_id

        header_org = request.headers.get('X-Organization-ID')
        if header_org and request.user and request.user.is_authenticated:
            if str(request.user.organization_id) == header_org:
                return request.user.organization_id

        return None
