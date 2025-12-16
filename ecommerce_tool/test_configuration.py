# test_configuration.py
import os
import sys
from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager

def test_configuration():
    print("🔧 Testing Configuration Setup")
    print("=" * 40)
    
    # Test ConfigManager
    try:
        config = ConfigManager()
        print("✅ ConfigManager initialized successfully")
        
        # Check key settings
        settings_to_check = [
            'output_directory',
            'days_back_to_fetch', 
            'enabled_platforms',
            'etsy_settings.shop_id',
            'woocommerce_settings.site_url'
        ]
        
        for setting in settings_to_check:
            value = config.get_setting(setting)
            print(f"  {setting}: {value}")
            
    except Exception as e:
        print(f"❌ ConfigManager error: {e}")
        return False
    
    # Test CredentialManager
    try:
        creds = CredentialManager()
        print("✅ CredentialManager initialized successfully")
        
        # Check what credentials are stored
        platforms = ['etsy', 'woocommerce', 'ebay', 'amazon']
        for platform in platforms:
            platform_creds = creds.get_platform_credentials(platform)
            if platform_creds:
                print(f"  {platform}: {len(platform_creds)} credential(s) stored")
            else:
                print(f"  {platform}: No credentials stored")
                
    except Exception as e:
        print(f"❌ CredentialManager error: {e}")
        return False
        
    return True

if __name__ == "__main__":
    test_configuration()