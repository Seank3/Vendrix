# integrations/etsy_integration.py
import requests
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)

class EtsyIntegration(BaseIntegration):
    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "etsy"
        
    def authenticate(self, credentials: Dict[str, str]) -> bool:
        """Etsy authentication check - validates credentials are present"""
        access_token = credentials.get("access_token")
        api_key = credentials.get("api_key")
        shop_id = self.config_manager.get_setting("etsy_settings.shop_id")
        
        if not all([access_token, api_key, shop_id]):
            logger.error("Etsy: Missing required credentials or settings")
            return False
        return True
        
    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        """Fetch raw orders from Etsy API"""
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        
        if not self.authenticate(credentials):
            return []
            
        access_token = credentials.get("access_token")
        api_key = credentials.get("api_key")
        shop_id = self.config_manager.get_setting("etsy_settings.shop_id")
        api_url_base = self.config_manager.get_setting("etsy_settings.api_url")

        logger.info(f"Etsy: Fetching orders for shop {shop_id} from past {days_back} days.")
        
        start_timestamp = int((datetime.utcnow() - timedelta(days=days_back)).timestamp())
        headers = {
            'Authorization': f'Bearer {access_token}', 
            'x-api-key': api_key
        }
        params = {
            'min_created': start_timestamp, 
            'was_paid': 'true', 
            'was_shipped': 'false', 
            'limit': 25, 
            'offset': 0
        }
        
        all_receipts_raw = []
        current_url = f"{api_url_base}/application/shops/{shop_id}/receipts"

        while True:
            try:
                logger.debug(f"Etsy: Fetching from {current_url} with params: {params}")
                response = requests.get(current_url, headers=headers, params=params, timeout=20)
                
                if response.status_code == 401:
                    logger.error("Etsy API 401 Unauthorized. Access token may be expired/invalid.")
                    return []
                    
                response.raise_for_status()
                data = response.json()
                receipts_page = data.get('results', [])
                all_receipts_raw.extend(receipts_page)

                count = data.get('count', 0)
                current_offset = params['offset']
                current_limit = params['limit']

                if not receipts_page or (current_offset + len(receipts_page)) >= count:
                    break
                    
                params['offset'] += len(receipts_page)

            except requests.exceptions.RequestException as e:
                logger.error(f"Error fetching Etsy receipts: {e}")
                return []
            except json.JSONDecodeError:
                logger.error(f"Etsy fetch failed: Could not decode JSON")
                return []

        logger.info(f"Etsy: Retrieved {len(all_receipts_raw)} raw receipts.")
        return all_receipts_raw
        
    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform Etsy raw data into standardized format"""
        formatted_orders = []
        
        for receipt in raw_orders:
            full_name = receipt.get('name', 'N/A N/A').split(' ', 1)
            
            for transaction in receipt.get('transactions', []):
                sku = transaction.get('sku')
                
                # Fallback SKU generation if transaction SKU is missing
                if not sku:
                    sku = f"ETSY_L{transaction.get('listing_id')}_P{transaction.get('product_id', 'NP')}"
                    logger.debug(f"Etsy: Using placeholder SKU: {sku}")

                formatted_orders.append({
                    "platform": "Etsy",
                    "sku": sku, 
                    "quantity": transaction.get('quantity', 1),
                    "first_name": full_name[0],
                    "last_name": full_name[1] if len(full_name) > 1 else '',
                    "address_1": receipt.get('first_line', ''),
                    "address_2": receipt.get('second_line', ''),
                    "city": receipt.get('city', ''),
                    "province": receipt.get('state', ''),
                    "country": receipt.get('country_iso', ''),
                    "zip_code": receipt.get('zip', ''),
                    "phone": "",  # Etsy typically doesn't provide phone
                    "order_id": str(receipt.get('receipt_id')),
                    "order_date": datetime.fromtimestamp(
                        receipt.get('created_timestamp')
                    ).isoformat() if receipt.get('created_timestamp') else None
                })
                
        logger.info(f"Etsy: Formatted {len(formatted_orders)} orders.")
        return formatted_orders
        
    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        """Convenience method to fetch and format in one call"""
        raw_orders = self.fetch_orders(days_back)
        if raw_orders is None:
            return []
        return self.format_orders(raw_orders)