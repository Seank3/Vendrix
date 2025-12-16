import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)


class KikuuIntegration(BaseIntegration):
    """Kikuu integration scaffold."""

    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "kikuu"

    def authenticate(self, credentials: Dict[str, str]) -> bool:
        required = ["api_key"]
        missing = self.credential_manager.validate_required(self.platform_name, credentials, required)
        cfg_errors = self.config_manager.validate_platform_config(self.platform_name)
        if cfg_errors:
            logger.error(f"Kikuu config errors: {cfg_errors}")
        return len(missing) == 0 and not cfg_errors

    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        if not self.authenticate(credentials):
            return []

        cutoff = datetime.utcnow() - timedelta(days=days_back)
        logger.info(f"Kikuu: returning placeholder orders since {cutoff.isoformat()}Z")
        return [
            {
                "orderId": f"KIKUU-{int(datetime.utcnow().timestamp())}",
                "createdAt": cutoff.isoformat() + "Z",
                "customer": {"first_name": "Kikuu", "last_name": "Buyer", "phone": "000"},
                "address": {
                    "address1": "Market Rd",
                    "address2": "",
                    "city": "Accra",
                    "state": "GA",
                    "country": "GH",
                    "zip": "00233",
                },
                "items": [{"sku": "KIKUU-SKU", "quantity": 1}],
            }
        ]

    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        formatted = []
        for order in raw_orders:
            addr = order.get("address", {}) or {}
            cust = order.get("customer", {}) or {}
            for item in order.get("items", []) or []:
                sku = item.get("sku")
                if not sku:
                    continue
                formatted.append(
                    {
                        "platform": "Kikuu",
                        "sku": sku,
                        "quantity": item.get("quantity", 1),
                        "first_name": cust.get("first_name", ""),
                        "last_name": cust.get("last_name", ""),
                        "address_1": addr.get("address1", ""),
                        "address_2": addr.get("address2", ""),
                        "city": addr.get("city", ""),
                        "province": addr.get("state", ""),
                        "country": addr.get("country", ""),
                        "zip_code": addr.get("zip", ""),
                        "phone": cust.get("phone", ""),
                        "order_id": order.get("orderId"),
                        "order_date": order.get("createdAt"),
                    }
                )
        logger.info(f"Kikuu: formatted {len(formatted)} orders.")
        return formatted

    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        raw = self.fetch_orders(days_back)
        if not raw:
            return []
        return self.format_orders(raw)

