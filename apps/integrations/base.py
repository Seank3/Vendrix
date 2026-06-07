"""
Connector framework — all platform integrations inherit from BaseConnector.

Each connector is isolated and implements:
- Auth management
- Product push
- Inventory sync
- Order ingestion
- Error handling + retry semantics
"""
import logging
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any

logger = logging.getLogger('vendrix.integrations')


@dataclass
class ConnectorResult:
    success: bool
    data: dict = field(default_factory=dict)
    error: str = ''
    external_id: str = ''
    retryable: bool = True


@dataclass
class NormalizedOrder:
    external_id: str
    line_items: list[dict]
    customer: dict = field(default_factory=dict)
    shipping_address: dict = field(default_factory=dict)
    currency: str = 'USD'
    raw_payload: dict = field(default_factory=dict)


class BaseConnector(ABC):
    """Abstract base for all platform connectors."""

    platform: str = ''

    def __init__(self, integration, credentials: dict, config: dict | None = None):
        self.integration = integration
        self.credentials = credentials
        self.config = config or {}
        self.organization_id = integration.organization_id

    @abstractmethod
    def authenticate(self) -> ConnectorResult:
        """Validate credentials and establish connection."""

    @abstractmethod
    def push_product(self, product_data: dict) -> ConnectorResult:
        """Push product to external platform."""

    @abstractmethod
    def sync_inventory(self, sku: str, quantity: int) -> ConnectorResult:
        """Sync inventory level to external platform."""

    @abstractmethod
    def fetch_orders(self, since: str | None = None) -> ConnectorResult:
        """Fetch orders from external platform."""

    @abstractmethod
    def normalize_order(self, raw_order: dict) -> NormalizedOrder:
        """Transform platform-specific order to internal schema."""

    def health_check(self) -> ConnectorResult:
        return self.authenticate()
