import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)


class JumiaIntegration(BaseIntegration):
    """Jumia integration scaffold."""

    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "jumia"

    def authenticate(self, credentials: Dict[str, str]) -> bool:
        required = ["client_id", "client_secret"]
        missing = self.credential_manager.validate_required(self.platform_name, credentials, required)
        cfg_errors = self.config_manager.validate_platform_config(self.platform_name)
        if cfg_errors:
            logger.error(f"Jumia config errors: {cfg_errors}")
        return len(missing) == 0 and not cfg_errors

    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        # Placeholder: replace with real Jumia API once available.
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        if not self.authenticate(credentials):
            return []

        cutoff = datetime.utcnow() - timedelta(days=days_back)
        logger.info(f"Jumia: returning placeholder orders since {cutoff.isoformat()}Z")
        return [
            {
                "orderId": f"JUMIA-{int(datetime.utcnow().timestamp())}",
                "createdAt": cutoff.isoformat() + "Z",
                "customer": {"first_name": "Jumia", "last_name": "Buyer", "phone": "000"},
                "shipping": {
                    "address1": "Sample St",
                    "address2": "",
                    "city": "Lagos",
                    "state": "LA",
                    "country": "NG",
                    "zip": "100001",
                },
                "items": [{"sku": "JUMIA-SKU", "quantity": 1}],
            }
        ]

    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        formatted = []
        for order in raw_orders:
            addr = order.get("shipping", {}) or {}
            cust = order.get("customer", {}) or {}
            for item in order.get("items", []) or []:
                if not item.get("sku"):
                    continue
                formatted.append(
                    {
                        "platform": "Jumia",
                        "sku": item.get("sku"),
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
        logger.info(f"Jumia: formatted {len(formatted)} orders.")
        return formatted

    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        raw = self.fetch_orders(days_back)
        if not raw:
            return []
        return self.format_orders(raw)

