# config/config_manager.py
import os
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

class ConfigManager:
    def __init__(self, config_dir: Optional[str] = None):
        # Minimal, robust ConfigManager used by tests.
        self.logger = logging.getLogger(self.__class__.__name__)
        # Determine config directory (default to this package folder)
        base_dir = Path(config_dir) if config_dir else Path(__file__).resolve().parent
        base_dir.mkdir(parents=True, exist_ok=True)
        self.config_path = base_dir / "config.json"

        # Default settings
        self._data: Dict[str, Any] = {
            "output_directory": str(base_dir / "output"),
            "days_back_to_fetch": 1,
            "enabled_platforms": {
                "etsy": False,
                "woocommerce": False,
                "ebay": False,
                "amazon": False,
                "jumia": False,
                "jiji": False,
                "kikuu": False,
                "kilimall": False,
                "shopify": False,
            },
            "etsy_settings": {"shop_id": None, "api_url": None},
            "woocommerce_settings": {"site_url": None},
            "ebay_settings": {"environment": "production", "marketplace_id": None},
            "jumia_settings": {"api_base_url": None, "shop_id": None},
            "jiji_settings": {"api_base_url": None, "store_id": None},
            "kikuu_settings": {"api_base_url": None, "store_id": None},
            "kilimall_settings": {"api_base_url": None, "store_id": None},
            "shopify_settings": {"store_url": None, "api_version": "2023-10"},
        }

        # Load existing config if present
        if self.config_path.exists():
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._data.update(data)
            except Exception as e:
                self.logger.warning(f"Failed to load config file: {e}")

    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a setting using dot notation for nested keys."""
        parts = key.split('.') if key else []
        cur = self._data
        for p in parts:
            if isinstance(cur, dict) and p in cur:
                cur = cur[p]
            else:
                return default
        return cur

    def get_platform_status(self, platform_name: str) -> bool:
        return bool(self._data.get("enabled_platforms", {}).get(platform_name, False))

    def set_platform_status(self, platform_name: str, status: bool) -> None:
        self._data.setdefault("enabled_platforms", {})[platform_name] = bool(status)
        try:
            self._save()
        except Exception:
            # Non-fatal for tests
            pass

    def _save(self) -> None:
        try:
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2, default=str)
        except Exception as e:
            self.logger.warning(f"Failed to save config file: {e}")

    def validate_platform_config(self, platform_name: str) -> Dict[str, str]:
        """Return validation errors for platform-specific required settings."""
        errors: Dict[str, str] = {}
        get = self.get_setting

        def require(key: str, message: str):
            if not get(key):
                errors[key] = message

        if platform_name == "woocommerce":
            require("woocommerce_settings.site_url", "WooCommerce site_url is required")
        elif platform_name == "etsy":
            require("etsy_settings.shop_id", "Etsy shop_id is required")
            require("etsy_settings.api_url", "Etsy api_url is required")
        elif platform_name == "ebay":
            require("ebay_settings.marketplace_id", "eBay marketplace_id is required")
        elif platform_name == "jumia":
            require("jumia_settings.api_base_url", "Jumia api_base_url is required")
            require("jumia_settings.shop_id", "Jumia shop_id is required")
        elif platform_name == "jiji":
            require("jiji_settings.api_base_url", "Jiji api_base_url is required")
            require("jiji_settings.store_id", "Jiji store_id is required")
        elif platform_name == "kikuu":
            require("kikuu_settings.api_base_url", "Kikuu api_base_url is required")
            require("kikuu_settings.store_id", "Kikuu store_id is required")
        elif platform_name == "kilimall":
            require("kilimall_settings.api_base_url", "Kilimall api_base_url is required")
            require("kilimall_settings.store_id", "Kilimall store_id is required")
        elif platform_name == "shopify":
            require("shopify_settings.store_url", "Shopify store_url is required")

        return errors