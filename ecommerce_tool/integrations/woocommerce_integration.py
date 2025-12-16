# integrations/woocommerce_integration.py
import requests
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)

class WooCommerceIntegration(BaseIntegration):
    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "woocommerce"
        
    def authenticate(self, credentials: Dict[str, str]) -> bool:
        """WooCommerce authentication check"""
        consumer_key = credentials.get("consumer_key")
        consumer_secret = credentials.get("consumer_secret")
        site_url = self.config_manager.get_setting("woocommerce_settings.site_url")
        
        if not all([consumer_key, consumer_secret, site_url]):
            logger.error("WooCommerce: Missing credentials or site_url setting.")
            return False
        return True
        
    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        """Fetch raw orders from WooCommerce API"""
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        
        if not self.authenticate(credentials):
            return []
            
        consumer_key = credentials.get("consumer_key")
        consumer_secret = credentials.get("consumer_secret")
        site_url = self.config_manager.get_setting("woocommerce_settings.site_url")

        api_base_url = f"{site_url.rstrip('/')}/wp-json/wc/v3"
        logger.info(f"WooCommerce: Fetching orders from {site_url} for past {days_back} days.")
        
        start_date_str = (datetime.utcnow() - timedelta(days=days_back)).isoformat(timespec='seconds')
        params = {
            'after': start_date_str, 
            'status': 'processing', 
            'per_page': 50, 
            'page': 1
        }
        
        all_orders_raw = []

        while True:
            try:
                logger.debug(f"WooCommerce: Fetching page {params['page']}")
                response = requests.get(
                    f"{api_base_url}/orders", 
                    params=params,
                    auth=(consumer_key, consumer_secret), 
                    timeout=30
                )
                response.raise_for_status()
                orders_page = response.json()
                
                if not orders_page:
                    break
                    
                all_orders_raw.extend(orders_page)
                params['page'] += 1
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching WooCommerce orders: {e}")
                return []
            except json.JSONDecodeError:
                logger.error(f"WooCommerce fetch failed: Could not decode JSON")
                return []
                
        logger.info(f"WooCommerce: Retrieved {len(all_orders_raw)} raw orders.")
        return all_orders_raw
        
    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform WooCommerce raw data into standardized format"""
        formatted_orders = []
        
        for order in raw_orders:
            if order.get('status') != 'processing':
                continue
                
            shipping_info = order.get('shipping', {})
            billing_info = order.get('billing', {})

            for item in order.get('line_items', []):
                sku = item.get('sku')
                if not sku:
                    logger.debug(f"WooCommerce: Skipping line item in order {order.get('id')} due to missing SKU.")
                    continue

                formatted_orders.append({
                    "platform": "WooCommerce",
                    "sku": sku, 
                    "quantity": item.get('quantity', 1),
                    "first_name": shipping_info.get('first_name', billing_info.get('first_name', '')),
                    "last_name": shipping_info.get('last_name', billing_info.get('last_name', '')),
                    "address_1": shipping_info.get('address_1', billing_info.get('address_1', '')),
                    "address_2": shipping_info.get('address_2', billing_info.get('address_2', '')),
                    "city": shipping_info.get('city', billing_info.get('city', '')),
                    "province": shipping_info.get('state', billing_info.get('state', '')),
                    "country": shipping_info.get('country', billing_info.get('country', '')),
                    "zip_code": shipping_info.get('postcode', billing_info.get('postcode', '')),
                    "phone": billing_info.get('phone', ''),
                    "order_id": str(order.get('id')),
                    "order_date": order.get('date_created_gmt') + "Z" if order.get('date_created_gmt') else None
                })
                
        logger.info(f"WooCommerce: Formatted {len(formatted_orders)} orders.")
        return formatted_orders
        
    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        """Convenience method to fetch and format in one call"""
        raw_orders = self.fetch_orders(days_back)
        if raw_orders is None:
            return []
        return self.format_orders(raw_orders)