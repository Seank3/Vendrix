import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
import requests
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)


class ShopifyIntegration(BaseIntegration):
    """Shopify integration scaffold using Admin API."""

    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "shopify"

    def authenticate(self, credentials: Dict[str, str]) -> bool:
        required = ["access_token"]
        missing = self.credential_manager.validate_required(self.platform_name, credentials, required)
        cfg_errors = self.config_manager.validate_platform_config(self.platform_name)
        if cfg_errors:
            logger.error(f"Shopify config errors: {cfg_errors}")
        return len(missing) == 0 and not cfg_errors

    def _base_url(self) -> str:
        store_url = self.config_manager.get_setting("shopify_settings.store_url")
        api_version = self.config_manager.get_setting("shopify_settings.api_version", "2023-10")
        if not store_url:
            return ""
        return f"https://{store_url}/admin/api/{api_version}"

    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        if not self.authenticate(credentials):
            return []

        base_url = self._base_url()
        if not base_url:
            logger.error("Shopify: store_url not configured")
            return []

        cutoff = datetime.utcnow() - timedelta(days=days_back)
        params = {
            "status": "any",
            "created_at_min": cutoff.isoformat(timespec="seconds") + "Z",
            "limit": 50,
        }
        headers = {"X-Shopify-Access-Token": credentials["access_token"], "Accept": "application/json"}

        try:
            resp = requests.get(f"{base_url}/orders.json", params=params, headers=headers, timeout=25)
            resp.raise_for_status()
            orders = resp.json().get("orders", [])
            logger.info(f"Shopify: Retrieved {len(orders)} orders since {cutoff.isoformat()}Z")
            return orders
        except requests.RequestException as exc:
            logger.error(f"Shopify: error fetching orders: {exc}")
            return []

    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        formatted = []
        for order in raw_orders:
            shipping = (order.get("shipping_address") or {}) if order.get("shipping_address") else {}
            customer = order.get("customer") or {}
            for item in order.get("line_items", []) or []:
                sku = item.get("sku")
                if not sku:
                    continue
                formatted.append(
                    {
                        "platform": "Shopify",
                        "sku": sku,
                        "quantity": item.get("quantity", 1),
                        "first_name": shipping.get("first_name", customer.get("first_name", "")),
                        "last_name": shipping.get("last_name", customer.get("last_name", "")),
                        "address_1": shipping.get("address1", ""),
                        "address_2": shipping.get("address2", ""),
                        "city": shipping.get("city", ""),
                        "province": shipping.get("province", ""),
                        "country": shipping.get("country_code", ""),
                        "zip_code": shipping.get("zip", ""),
                        "phone": shipping.get("phone", customer.get("phone", "")),
                        "order_id": str(order.get("id")),
                        "order_date": order.get("created_at"),
                    }
                )
        logger.info(f"Shopify: formatted {len(formatted)} orders.")
        return formatted

    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        raw = self.fetch_orders(days_back)
        if not raw:
            return []
        return self.format_orders(raw)

