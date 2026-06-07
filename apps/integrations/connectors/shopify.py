"""
Shopify connector — mock implementation with Shopify-style payload mapping.

Real API integration will replace mock methods while preserving the interface.
"""
import logging
import uuid
from datetime import datetime, timezone

from apps.integrations.base import BaseConnector, ConnectorResult, NormalizedOrder

logger = logging.getLogger('vendrix.integrations.shopify')


class ShopifyConnector(BaseConnector):
    platform = 'shopify'

    def __init__(self, integration, credentials: dict, config: dict | None = None):
        super().__init__(integration, credentials, config)
        self.shop_url = credentials.get('shop_url', '')
        self.access_token = credentials.get('access_token', '')
        self.api_version = config.get('api_version', '2024-01') if config else '2024-01'

    def _api_base(self) -> str:
        shop = self.shop_url.replace('https://', '').replace('http://', '').rstrip('/')
        if not shop.endswith('.myshopify.com'):
            shop = f'{shop}.myshopify.com'
        return f'https://{shop}/admin/api/{self.api_version}'

    def authenticate(self) -> ConnectorResult:
        if not self.shop_url or not self.access_token:
            return ConnectorResult(
                success=False,
                error='Missing shop_url or access_token',
                retryable=False,
            )

        # Mock: simulate Shopify GET /shop.json
        logger.info('[shopify] Authenticating shop=%s', self.shop_url)
        return ConnectorResult(
            success=True,
            data={
                'shop': {
                    'name': self.shop_url,
                    'domain': self._api_base(),
                    'plan_name': 'enterprise',
                },
            },
        )

    def push_product(self, product_data: dict) -> ConnectorResult:
        shopify_payload = self._map_product_to_shopify(product_data)
        external_id = f'gid://shopify/Product/{uuid.uuid4().hex[:12]}'

        logger.info(
            '[shopify] Pushing product sku=%s to %s',
            product_data.get('sku'),
            self.shop_url,
        )

        # Mock response mimicking Shopify product create
        return ConnectorResult(
            success=True,
            external_id=external_id,
            data={
                'product': {
                    'id': external_id,
                    'title': shopify_payload['product']['title'],
                    'variants': shopify_payload['product']['variants'],
                    'status': 'active',
                    'created_at': datetime.now(timezone.utc).isoformat(),
                },
                'mapped_payload': shopify_payload,
            },
        )

    def sync_inventory(self, sku: str, quantity: int) -> ConnectorResult:
        inventory_item_id = f'gid://shopify/InventoryItem/{uuid.uuid4().hex[:10]}'
        location_id = self.config.get('location_id', 'gid://shopify/Location/1')

        logger.info('[shopify] Inventory sync sku=%s qty=%s location=%s', sku, quantity, location_id)

        return ConnectorResult(
            success=True,
            data={
                'inventory_level': {
                    'inventory_item_id': inventory_item_id,
                    'location_id': location_id,
                    'available': quantity,
                },
            },
        )

    def fetch_orders(self, since: str | None = None) -> ConnectorResult:
        # Mock: return sample Shopify-formatted orders
        mock_orders = [
            {
                'id': 1001,
                'name': '#1001',
                'created_at': datetime.now(timezone.utc).isoformat(),
                'currency': 'USD',
                'total_price': '59.98',
                'customer': {
                    'email': 'customer@example.com',
                    'first_name': 'Jane',
                    'last_name': 'Doe',
                },
                'shipping_address': {
                    'address1': '123 Main St',
                    'city': 'Nairobi',
                    'country': 'KE',
                },
                'line_items': [
                    {
                        'sku': 'DEMO-001',
                        'title': 'Demo Product',
                        'quantity': 2,
                        'price': '29.99',
                    },
                ],
            },
        ]

        logger.info('[shopify] Fetched %d orders since=%s', len(mock_orders), since)
        return ConnectorResult(success=True, data={'orders': mock_orders})

    def normalize_order(self, raw_order: dict) -> NormalizedOrder:
        line_items = [
            {
                'sku': item.get('sku') or f'SHOPIFY-{item.get("variant_id", "unknown")}',
                'name': item.get('title', ''),
                'quantity': item['quantity'],
                'unit_price': item.get('price', '0'),
            }
            for item in raw_order.get('line_items', [])
        ]

        return NormalizedOrder(
            external_id=str(raw_order.get('id', raw_order.get('name', ''))),
            line_items=line_items,
            customer={
                'email': raw_order.get('customer', {}).get('email', ''),
                'name': ' '.join(filter(None, [
                    raw_order.get('customer', {}).get('first_name', ''),
                    raw_order.get('customer', {}).get('last_name', ''),
                ])),
            },
            shipping_address=raw_order.get('shipping_address', {}),
            currency=raw_order.get('currency', 'USD'),
            raw_payload=raw_order,
        )

    def _map_product_to_shopify(self, product_data: dict) -> dict:
        """Map Vendrix master catalog schema to Shopify product format."""
        variants = product_data.get('variants') or [{
            'sku': product_data['sku'],
            'price': str(product_data.get('price', '0.00')),
        }]

        shopify_variants = []
        for v in variants:
            pricing = product_data.get('channel_pricing', [])
            channel_price = next(
                (p['price'] for p in pricing if p.get('channel') == 'shopify'),
                v.get('price', '0.00'),
            )
            shopify_variants.append({
                'sku': v.get('sku', product_data['sku']),
                'price': str(channel_price),
                'inventory_management': 'shopify',
                'inventory_policy': 'deny',
                'option1': v.get('name', 'Default'),
            })

        images = [
            {'src': m['url'], 'alt': m.get('alt_text', '')}
            for m in product_data.get('media', [])
        ]

        return {
            'product': {
                'title': product_data['name'],
                'body_html': product_data.get('description', ''),
                'vendor': product_data.get('attributes', {}).get('vendor', 'Vendrix'),
                'product_type': product_data.get('category', ''),
                'tags': product_data.get('attributes', {}).get('tags', []),
                'variants': shopify_variants,
                'images': images,
                'status': 'active' if product_data.get('status') == 'active' else 'draft',
            },
        }
