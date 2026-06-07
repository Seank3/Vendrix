"""Thread-local tenant context for request-scoped organization isolation."""
import threading

_local = threading.local()


def set_current_organization_id(organization_id):
    _local.organization_id = organization_id


def get_current_organization_id():
    return getattr(_local, 'organization_id', None)


def clear_current_organization():
    if hasattr(_local, 'organization_id'):
        del _local.organization_id


def resolve_organization_id(request):
    """Resolve tenant organization from JWT user or API key auth."""
    if request.user and request.user.is_authenticated:
        return request.user.organization_id
    auth = getattr(request, 'auth', None)
    if auth and hasattr(auth, 'organization'):
        return auth.organization.id
    return getattr(request, 'organization_id', None)
