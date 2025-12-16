# test_integration.py
import os
import sys
import logging
from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager
from integrations.etsy_integration import EtsyIntegration
from integrations.woocommerce_integration import WooCommerceIntegration
from integrations.ebay_integration import EbayIntegration

# Setup basic logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def test_platform_integration(platform_name, integration_class):
    """Test a specific platform integration"""
    print(f"\n{'='*50}")
    print(f"Testing {platform_name} Integration")
    print(f"{'='*50}")
    
    try:
        config_manager = ConfigManager()
        credential_manager = CredentialManager()
        
        # Create integration instance
        integration = integration_class(config_manager, credential_manager)
        
        # Check if platform is enabled and has credentials
        if not config_manager.get_platform_status(platform_name):
            print(f"❌ {platform_name} is disabled in config")
            return False
            
        credentials = credential_manager.get_platform_credentials(platform_name)
        if not credentials:
            print(f"❌ No credentials found for {platform_name}")
            return False
            
        print(f"✅ {platform_name} credentials found: {list(credentials.keys())}")
        
        # Test authentication
        if hasattr(integration, 'authenticate'):
            auth_result = integration.authenticate(credentials)
            print(f"🔐 Authentication: {'✅ Success' if auth_result else '❌ Failed'}")
        
        # Test fetching orders (small time window to avoid too much data)
        print("📦 Fetching orders from last 1 day...")
        orders = integration.fetch_and_process(1)
        
        if orders:
            print(f"✅ Successfully fetched {len(orders)} orders")
            if orders:
                print("Sample order:")
                for key, value in orders[0].items():
                    print(f"  {key}: {value}")
        else:
            print("❌ No orders fetched or error occurred")
            
        return bool(orders)
        
    except Exception as e:
        print(f"❌ Error testing {platform_name}: {e}")
        logging.exception(f"Error testing {platform_name}")
        return False

def test_all_platforms():
    """Test all available platforms"""
    platforms_to_test = {
        'etsy': EtsyIntegration,
        'woocommerce': WooCommerceIntegration,
        'ebay': EbayIntegration,
        # 'amazon': AmazonIntegration,  # Skip Amazon for now as it's placeholder
    }
    
    results = {}
    
    for platform_name, integration_class in platforms_to_test.items():
        results[platform_name] = test_platform_integration(platform_name, integration_class)
    
    print(f"\n{'='*50}")
    print("TEST SUMMARY")
    print(f"{'='*50}")
    for platform, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{platform.capitalize()}: {status}")

if __name__ == "__main__":
    test_all_platforms()