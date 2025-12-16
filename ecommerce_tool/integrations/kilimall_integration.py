import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)


class KilimallIntegration(BaseIntegration):
    """Kilimall (or Mall for Africa) integration scaffold."""

    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "kilimall"

    def authenticate(self, credentials: Dict[str, str]) -> bool:
        required = ["api_key"]
        missing = self.credential_manager.validate_required(self.platform_name, credentials, required)
        cfg_errors = self.config_manager.validate_platform_config(self.platform_name)
        if cfg_errors:
            logger.error(f"Kilimall config errors: {cfg_errors}")
        return len(missing) == 0 and not cfg_errors

    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        if not self.authenticate(credentials):
            return []

        cutoff = datetime.utcnow() - timedelta(days=days_back)
        logger.info(f"Kilimall: returning placeholder orders since {cutoff.isoformat()}Z")
        return [
            {
                "orderId": f"KILI-{int(datetime.utcnow().timestamp())}",
                "createdAt": cutoff.isoformat() + "Z",
                "buyer": {"first_name": "Kili", "last_name": "Buyer", "phone": "000"},
                "address": {
                    "address1": "Trade St",
                    "address2": "",
                    "city": "Nairobi",
                    "state": "NRB",
                    "country": "KE",
                    "zip": "00100",
                },
                "items": [{"sku": "KILI-SKU", "quantity": 1}],
            }
        ]

    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        formatted = []
        for order in raw_orders:
            addr = order.get("address", {}) or {}
            buyer = order.get("buyer", {}) or {}
            for item in order.get("items", []) or []:
                sku = item.get("sku")
                if not sku:
                    continue
                formatted.append(
                    {
                        "platform": "Kilimall",
                        "sku": sku,
                        "quantity": item.get("quantity", 1),
                        "first_name": buyer.get("first_name", ""),
                        "last_name": buyer.get("last_name", ""),
                        "address_1": addr.get("address1", ""),
                        "address_2": addr.get("address2", ""),
                        "city": addr.get("city", ""),
                        "province": addr.get("state", ""),
                        "country": addr.get("country", ""),
                        "zip_code": addr.get("zip", ""),
                        "phone": buyer.get("phone", ""),
                        "order_id": order.get("orderId"),
                        "order_date": order.get("createdAt"),
                    }
                )
        logger.info(f"Kilimall: formatted {len(formatted)} orders.")
        return formatted

    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        raw = self.fetch_orders(days_back)
        if not raw:
            return []
        return self.format_orders(raw)

