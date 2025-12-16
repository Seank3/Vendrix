"""A lightweight wrapper that selects and delegates to a concrete platform integration.

This shim prevents ImportError from `cli/interface.py` and keeps imports safe
at module load time (no network calls during import).
"""
from typing import Optional, Dict, Any
import logging
from . import EtsyIntegration, WooCommerceIntegration, EbayIntegration, AmazonIntegration

logger = logging.getLogger(__name__)


class EcommerceIntegration:
    def __init__(self, config_manager, credential_manager, preferred_platform: Optional[str] = None):
        self.config = config_manager
        self.creds = credential_manager
        self.platform_name = None
        self.integration = None

        # Determine platform to use
        if preferred_platform:
            self._select_platform(preferred_platform)
        else:
            # pick first enabled platform from config, else default to etsy if available
            for p in ('etsy', 'woocommerce', 'ebay', 'amazon'):
                try:
                    if self.config.get_platform_status(p):
                        self._select_platform(p)
                        break
                except Exception:
                    # defensive: if config doesn't expose that API, ignore
                    pass

        if not self.integration:
            # fallback: prefer Etsy, then WooCommerce, then eBay, then Amazon
            for p in ('etsy', 'woocommerce', 'ebay', 'amazon'):
                try:
                    self._select_platform(p)
                    break
                except Exception:
                    continue

    def _select_platform(self, platform_name: str) -> None:
        pname = platform_name.lower()
        if pname == 'etsy':
            self.integration = EtsyIntegration(self.config, self.creds)
        elif pname in ('woocommerce', 'woo', 'wp'):
            self.integration = WooCommerceIntegration(self.config, self.creds)
        elif pname == 'ebay':
            self.integration = EbayIntegration(self.config, self.creds)
        elif pname == 'amazon':
            # AmazonIntegration may be a placeholder in this repo; try to instantiate
            self.integration = AmazonIntegration(self.config, self.creds)
        else:
            raise ValueError(f"Unknown platform: {platform_name}")

        self.platform_name = pname
        logger.info(f"EcommerceIntegration: selected platform {self.platform_name}")

    def authenticate(self, credentials: Optional[Dict[str, str]] = None) -> bool:
        """Delegate authentication to the selected integration.

        If credentials are not provided, the integration should read them from
        the `CredentialManager` instance passed at construction.
        """
        if not self.integration:
            logger.warning("No integration selected for authentication")
            return False

        try:
            creds = credentials if credentials is not None else self.creds.get_platform_credentials(self.platform_name)
            if hasattr(self.integration, 'authenticate'):
                return bool(self.integration.authenticate(creds))
        except Exception as e:
            logger.exception(f"Authentication failed: {e}")
        return False

    def fetch_and_process(self, days_back: int):
        """Delegate fetch+format to the selected integration.

        Returns the integration's output (often a list of formatted orders) or an
        empty list on failure.
        """
        if not self.integration:
            logger.warning("No integration selected for fetch")
            return []

        try:
            if hasattr(self.integration, 'fetch_and_process'):
                return self.integration.fetch_and_process(days_back)
            # fallback to separate fetch/format API
            raw = []
            if hasattr(self.integration, 'fetch_orders'):
                raw = self.integration.fetch_orders(days_back)
            if hasattr(self.integration, 'format_orders'):
                return self.integration.format_orders(raw)
            return raw
        except Exception:
            logger.exception("Error during fetch_and_process")
            return []
