# integrations/amazon_integration.py
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from .base_integration import BaseIntegration

logger = logging.getLogger(__name__)

class AmazonIntegration(BaseIntegration):
    def __init__(self, config_manager, credential_manager):
        self.config_manager = config_manager
        self.credential_manager = credential_manager
        self.platform_name = "amazon"
        
    def authenticate(self, credentials: Dict[str, str]) -> bool:
        """Amazon authentication check - validates required credentials"""
        required_creds = [
            "refresh_token", "lwa_client_id", "lwa_client_secret",
            "aws_access_key", "aws_secret_key", "role_arn", "seller_id"
        ]
        
        missing_creds = [cred for cred in required_creds if not credentials.get(cred)]
        if missing_creds:
            logger.error(f"Amazon: Missing required credentials: {', '.join(missing_creds)}")
            return False
            
        # Check if SP-API library is available
        try:
            from sp_api.api import Orders
            from sp_api.auth import SellingPartnerCredentials
            from sp_api.base import Marketplaces
            return True
        except ImportError:
            logger.error("Amazon SP-API library (python-amazon-sp-api) not installed.")
            return False
            
    def fetch_orders(self, days_back: int) -> List[Dict[str, Any]]:
        """Fetch raw orders from Amazon SP-API"""
        logger.warning("Amazon integration is conceptual and requires python-amazon-sp-api setup.")
        
        credentials = self.credential_manager.get_platform_credentials(self.platform_name)
        
        if not self.authenticate(credentials):
            return []
            
        try:
            from sp_api.api import Orders
            from sp_api.auth import SellingPartnerCredentials
            from sp_api.base import Marketplaces

            # Setup Selling Partner credentials
            sp_creds = SellingPartnerCredentials(
                refresh_token=credentials.get("refresh_token"),
                lwa_app_id=credentials.get("lwa_client_id"),
                lwa_client_secret=credentials.get("lwa_client_secret"),
                aws_access_key=credentials.get("aws_access_key"),
                aws_secret_key=credentials.get("aws_secret_key"),
                role_arn=credentials.get("role_arn")
            )
            
            marketplace_str = self.config_manager.get_setting("amazon_settings.sp_api_region_code")
            marketplace_id_str = self.config_manager.get_setting("amazon_settings.marketplace_id")
            
            # Map region code to Marketplaces enum
            marketplace_mapping = {
                'NA': Marketplaces.US,  # North America - US marketplace
                'US': Marketplaces.US,
                'CA': Marketplaces.CA,
                'UK': Marketplaces.UK,
                'DE': Marketplaces.DE,
                'EU': Marketplaces.UK,  # Default EU to UK
                'FE': Marketplaces.JP   # Far East - Japan
            }
            
            sp_marketplace = marketplace_mapping.get(marketplace_str.upper())
            if not sp_marketplace:
                logger.error(f"Invalid Amazon region code: {marketplace_str}")
                return []
                
            # Create orders client
            orders_client = Orders(credentials=sp_creds, marketplace=sp_marketplace)
            start_date = (datetime.utcnow() - timedelta(days=days_back)).isoformat()

            all_orders_raw = []
            next_token = None
            
            while True:
                # Fetch orders from Amazon SP-API
                res = orders_client.get_orders(
                    CreatedAfter=start_date,
                    MarketplaceIds=[marketplace_id_str],
                    OrderStatuses=['Unshipped', 'PartiallyShipped'],
                    NextToken=next_token
                )
                
                amazon_orders_page = res.payload.get('Orders', [])
                if not amazon_orders_page:
                    break
                    
                all_orders_raw.extend(amazon_orders_page)
                next_token = res.payload.get('NextToken')
                if not next_token:
                    break
                    
            logger.info(f"Amazon: Retrieved {len(all_orders_raw)} raw orders.")
            return all_orders_raw
            
        except ImportError:
            logger.error("Amazon SP-API library not available. Install with: pip install python-amazon-sp-api")
            return []
        except Exception as e:
            logger.error(f"Amazon SP-API error: {e}")
            return []
            
    def format_orders(self, raw_orders: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Transform Amazon raw data into standardized format"""
        formatted_orders = []
        
        try:
            from sp_api.api import Orders
            credentials = self.credential_manager.get_platform_credentials(self.platform_name)
            
            for order in raw_orders:
                # Get order items for SKUs
                orders_client = order.get('_client')  # This would need proper client handling
                items_res = orders_client.get_order_items(order['AmazonOrderId'])
                shipping_address = order.get('ShippingAddress', {})
                full_name = shipping_address.get('Name', 'N/A N/A').split(' ', 1)

                for item in items_res.payload.get('OrderItems', []):
                    formatted_orders.append({
                        "platform": "Amazon",
                        "sku": item.get('SellerSKU'),
                        "quantity": item.get('QuantityOrdered'),
                        "first_name": full_name[0],
                        "last_name": full_name[1] if len(full_name) > 1 else '',
                        "address_1": shipping_address.get('AddressLine1', ''),
                        "address_2": shipping_address.get('AddressLine2', ''),
                        "city": shipping_address.get('City', ''),
                        "province": shipping_address.get('StateOrRegion', ''),
                        "country": shipping_address.get('CountryCode', ''),
                        "zip_code": shipping_address.get('PostalCode', ''),
                        "phone": shipping_address.get('Phone', ''),
                        "order_id": order.get('AmazonOrderId'),
                        "order_date": order.get('PurchaseDate')
                    })
                    
            logger.info(f"Amazon: Formatted {len(formatted_orders)} orders.")
            return formatted_orders
            
        except Exception as e:
            logger.error(f"Error formatting Amazon orders: {e}")
            return []
            
    def fetch_and_process(self, days_back: int) -> List[Dict[str, Any]]:
        """Convenience method to fetch and format in one call"""
        raw_orders = self.fetch_orders(days_back)
        if raw_orders is None:
            return []
        return self.format_orders(raw_orders)
        
    def _get_marketplace_enum(self, region_code: str):
        """Helper method to map region codes to Marketplaces enum"""
        try:
            from sp_api.base import Marketplaces
            
            mapping = {
                'US': Marketplaces.US,
                'CA': Marketplaces.CA,
                'UK': Marketplaces.UK,
                'DE': Marketplaces.DE,
                'FR': Marketplaces.FR,
                'IT': Marketplaces.IT,
                'ES': Marketplaces.ES,
                'JP': Marketplaces.JP,
                'AU': Marketplaces.AU,
                'AE': Marketplaces.AE,
                'IN': Marketplaces.IN,
                'MX': Marketplaces.MX,
                'BR': Marketplaces.BR,
            }
            return mapping.get(region_code.upper())
        except ImportError:
            return None