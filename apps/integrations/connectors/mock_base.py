"""
Shared mock connector behavior for platforms not yet fully implemented.
"""
import logging
import uuid
from datetime import datetime, timezone

from apps.integrations.base import BaseConnector, ConnectorResult, NormalizedOrder

logger = logging.getLogger('vendrix.integrations.mock')


class MockConnector(BaseConnector):
    """Placeholder connector that simulates platform API responses."""

    def authenticate(self) -> ConnectorResult:
        shop = self.credentials.get('shop_url') or self.credentials.get('store_id', 'mock-store')
        logger.info('[%s] Mock auth for %s', self.platform, shop)
        return ConnectorResult(success=True, data={'shop': shop, 'authenticated': True})

    def push_product(self, product_data: dict) -> ConnectorResult:
        external_id = f'mock-{self.platform}-{product_data.get("sku", uuid.uuid4().hex[:8])}'
        logger.info('[%s] Mock product push: %s -> %s', self.platform, product_data.get('sku'), external_id)
        return ConnectorResult(
            success=True,
            external_id=external_id,
            data={'external_id': external_id, 'status': 'published'},
        )

    def sync_inventory(self, sku: str, quantity: int) -> ConnectorResult:
        logger.info('[%s] Mock inventory sync: %s=%s', self.platform, sku, quantity)
        return ConnectorResult(success=True, data={'sku': sku, 'quantity': quantity})

    def fetch_orders(self, since: str | None = None) -> ConnectorResult:
        logger.info('[%s] Mock order fetch since=%s', self.platform, since)
        return ConnectorResult(success=True, data={'orders': []})

    def normalize_order(self, raw_order: dict) -> NormalizedOrder:
        return NormalizedOrder(
            external_id=raw_order.get('id', str(uuid.uuid4())),
            line_items=raw_order.get('line_items', []),
            customer=raw_order.get('customer', {}),
            shipping_address=raw_order.get('shipping_address', {}),
            currency=raw_order.get('currency', 'USD'),
            raw_payload=raw_order,
        )
