# integrations/ebay_integration.py
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)


class EbayIntegration(BaseIntegration):
    """Lightweight eBay integration stub.

    This implementation focuses on automation and credential validation. It
    returns sample data to allow the interactive tester and CLI flows to run
    end‑to‑end without making live API calls. Replace the stubbed sections with
    real eBay API calls when credentials and sandbox access are available.
    """

    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "ebay"

    def authenticate(self, credentials: Dict[str, str]) -> bool:
        """Validate required credentials are present."""
        required = ["app_id", "cert_id", "refresh_token"]
        missing = self.credential_manager.validate_required(self.platform_name, credentials, required)
        return len(missing) == 0

    def _get_env_host(self) -> str:
        env = (self.config_manager.get_setting("ebay_settings.environment") or "production").lower()
        return "api.sandbox.ebay.com" if env == "sandbox" else "api.ebay.com"

    def _exchange_refresh_token(self, credentials: Dict[str, str]) -> Optional[str]:
        """Exchange the long-lived refresh token for an access token."""
        token_url = f"https://{self._get_env_host()}/identity/v1/oauth2/token"
        try:
            resp = requests.post(
                token_url,
                headers={
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json",
                },
                auth=(credentials["app_id"], credentials["cert_id"]),
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": credentials["refresh_token"],
                    "scope": "https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly",
                },
                timeout=20,
            )
            resp.raise_for_status()
            token = resp.json().get("access_token")
            if not token:
                logger.error("eBay: access_token missing in token response")
            return token
        except requests.RequestException as exc:
            logger.error(f"eBay: token exchange failed: {exc}")
            return None

    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        """Fetch orders using the Sell Fulfillment API."""
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        if not self.authenticate(credentials):
            return []

        access_token = self._exchange_refresh_token(credentials)
        if not access_token:
            return []

        cutoff = datetime.utcnow() - timedelta(days=days_back)
        created_from = cutoff.isoformat(timespec="seconds") + "Z"
        host = self._get_env_host()
        url = f"https://{host}/sell/fulfillment/v1/order"
        params = {
            "filter": f"orderfulfillmentstatus:{'ALL'};creationdate:%5B{created_from}..%5D"
        }

        try:
            resp = requests.get(
                url,
                headers={"Authorization": f"Bearer {access_token}", "Accept": "application/json"},
                params=params,
                timeout=30,
            )
            if resp.status_code == 401:
                logger.error("eBay: unauthorized when fetching orders. Check refresh token.")
                return []
            resp.raise_for_status()
            data = resp.json()
            orders = data.get("orders", [])
            logger.info(f"eBay: Retrieved {len(orders)} orders since {created_from}")
            return orders
        except requests.RequestException as exc:
            logger.error(f"eBay: error fetching orders: {exc}")
            return []

    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Convert eBay raw orders into the unified order schema."""
        formatted: List[Dict[str, Any]] = []

        for order in raw_orders:
            address = order.get("shippingAddress", {}) or {}
            buyer = order.get("buyer", {}) or {}
            items = order.get("lineItems", []) or []

            for item in items:
                sku = item.get("sku")
                if not sku:
                    logger.debug("eBay: skipping line item due to missing SKU")
                    continue

                formatted.append(
                    {
                        "platform": "eBay",
                        "sku": sku,
                        "quantity": item.get("quantity", 1),
                        "first_name": buyer.get("firstName", ""),
                        "last_name": buyer.get("lastName", ""),
                        "address_1": address.get("address1", ""),
                        "address_2": address.get("address2", ""),
                        "city": address.get("city", ""),
                        "province": address.get("stateOrProvince", ""),
                        "country": address.get("countryCode", ""),
                        "zip_code": address.get("postalCode", ""),
                        "phone": buyer.get("phone", ""),
                        "order_id": order.get("orderId"),
                        "order_date": order.get("createdDate"),
                    }
                )

        logger.info(f"eBay: formatted {len(formatted)} orders.")
        return formatted

    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        """Convenience wrapper used by the tester/CLI."""
        raw_orders = self.fetch_orders(days_back)
        if not raw_orders:
            return []
        return self.format_orders(raw_orders)