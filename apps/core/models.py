import uuid

from django.db import models


class TimestampedModel(models.Model):
    """Abstract base with created/updated timestamps."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class TenantScopedModel(TimestampedModel):
    """
    Base model for all multi-tenant records.
    Every query MUST be scoped by organization_id.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization_id = models.UUIDField(db_index=True)

    class Meta:
        abstract = True

    @classmethod
    def for_organization(cls, organization_id):
        return cls.objects.filter(organization_id=organization_id)


class TenantManager(models.Manager):
    """Manager that enforces organization scoping when context is set."""

    def get_queryset(self):
        qs = super().get_queryset()
        from apps.core.context import get_current_organization_id

        org_id = get_current_organization_id()
        if org_id is not None:
            return qs.filter(organization_id=org_id)
        return qs
