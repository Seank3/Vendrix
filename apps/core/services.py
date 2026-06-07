"""Base service layer patterns for Vendrix modules."""


class BaseService:
    """All domain services inherit from this."""

    def __init__(self, organization_id):
        self.organization_id = organization_id

    def _scoped(self, model):
        return model.for_organization(self.organization_id)
