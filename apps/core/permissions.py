from rest_framework.permissions import BasePermission

from apps.core.context import resolve_organization_id
from apps.identity.models import Role


class IsOrganizationMember(BasePermission):
    """Ensures authenticated principal belongs to an organization."""

    def has_permission(self, request, view):
        return resolve_organization_id(request) is not None


class HasRole(BasePermission):
    """RBAC permission — requires user role in allowed_roles."""

    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return getattr(request.user, 'role', None) in self.allowed_roles


class IsAdmin(HasRole):
    allowed_roles = [Role.ADMIN]


class IsOperator(HasRole):
    allowed_roles = [Role.ADMIN, Role.OPERATOR]


class IsViewer(HasRole):
    allowed_roles = [Role.ADMIN, Role.OPERATOR, Role.VIEWER]
