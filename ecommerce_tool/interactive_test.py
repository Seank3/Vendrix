# interactive_test.py
import os
import sys
from colorama import Fore, Style, init
from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager
from integrations.etsy_integration import EtsyIntegration
from integrations.woocommerce_integration import WooCommerceIntegration
from integrations.ebay_integration import EbayIntegration

init(autoreset=True)

class InteractiveTester:
    def __init__(self):
        self.config_manager = ConfigManager()
        self.credential_manager = CredentialManager()
        self.platform_order = ['etsy', 'woocommerce', 'ebay']
        self.integrations = {
            'etsy': EtsyIntegration(self.config_manager, self.credential_manager),
            'woocommerce': WooCommerceIntegration(self.config_manager, self.credential_manager),
            'ebay': EbayIntegration(self.config_manager, self.credential_manager),
        }
    
    def print_header(self, title):
        print(f"\n{Fore.CYAN}{'='*50}")
        print(f"{title}")
        print(f"{'='*50}{Style.RESET_ALL}")

    def _prompt_days_back(self) -> int:
        default_days = self.config_manager.get_setting("days_back_to_fetch", 1) or 1
        try:
            user_value = input(f"Days back to fetch (default {default_days}): ").strip()
            return int(user_value) if user_value else int(default_days)
        except ValueError:
            print(f"{Fore.YELLOW}Invalid input. Using default of {default_days} days.")
            return int(default_days)

    def _print_status_overview(self):
        print(f"\n{Fore.CYAN}Platform status overview{Style.RESET_ALL}")
        for platform in self.platform_order:
            enabled = self.config_manager.get_platform_status(platform)
            credentials = self.credential_manager.get_platform_credentials(platform)
            cred_status = f"{Fore.GREEN}credentials found" if credentials else f"{Fore.RED}credentials missing"
            enable_status = f"{Fore.GREEN}enabled" if enabled else f"{Fore.YELLOW}disabled"
            print(f" - {platform.capitalize():12} {enable_status}{Style.RESET_ALL} | {cred_status}{Style.RESET_ALL}")
        print()

    def _show_order_sample(self, orders):
        print(f"\n{Fore.CYAN}First order sample:{Style.RESET_ALL}")
        for key, value in list(orders[0].items())[:8]:
            print(f"  {key}: {value}")

    def test_single_platform(self, platform_name, prompt_user: bool = True):
        self.print_header(f"Testing {platform_name.upper()}")
        
        integration = self.integrations.get(platform_name)
        if not integration:
            print(f"{Fore.RED}Integration not found for {platform_name}")
            return
        
        # Check if enabled
        if not self.config_manager.get_platform_status(platform_name):
            print(f"{Fore.YELLOW}Platform is disabled in configuration")
            if prompt_user:
                enable = input(f"Enable {platform_name}? (y/n): ").lower().strip()
                if enable == 'y':
                    self.config_manager.set_platform_status(platform_name, True)
                    print(f"{Fore.GREEN}Platform enabled")
            else:
                print(f"{Fore.YELLOW}Skipping {platform_name} because it is disabled.")
                return False
        
        # Check credentials
        credentials = self.credential_manager.get_platform_credentials(platform_name)
        if not credentials:
            print(f"{Fore.RED}No credentials found for {platform_name}")
            print(f"{Fore.YELLOW}Please configure credentials first")
            return False
        
        print(f"{Fore.GREEN}Found credentials: {list(credentials.keys())}")

        # Authentication check
        authed = True
        if hasattr(integration, 'authenticate'):
            try:
                authed = bool(integration.authenticate(credentials))
            except Exception as e:
                authed = False
                print(f"{Fore.RED}Authentication error: {e}")
        if not authed:
            print(f"{Fore.RED}Authentication failed for {platform_name}")
            return False
        print(f"{Fore.GREEN}Authentication succeeded")
        
        # Test days back
        days_back = self._prompt_days_back() if prompt_user else (self.config_manager.get_setting("days_back_to_fetch", 1) or 1)
        
        # Run test
        print(f"{Fore.YELLOW}Fetching orders from last {days_back} day(s)...")
        try:
            orders = integration.fetch_and_process(days_back)
            
            if orders:
                print(f"{Fore.GREEN}✅ Success! Found {len(orders)} orders")
                self._show_order_sample(orders)
            else:
                print(f"{Fore.YELLOW}⚠️  No orders found (this might be normal if no new orders)")
                
        except Exception as e:
            print(f"{Fore.RED}❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False

        return True
    
    def show_menu(self):
        while True:
            self.print_header("E-COMMERCE INTEGRATION TESTER")
            self._print_status_overview()
            
            print("Select platform to test:")
            print(f"{Fore.CYAN}1. Etsy")
            print(f"{Fore.CYAN}2. WooCommerce") 
            print(f"{Fore.CYAN}3. eBay")
            print(f"{Fore.CYAN}4. Test All Platforms")
            print(f"{Fore.RED}5. Exit{Style.RESET_ALL}")
            
            choice = input(f"\n{Fore.GREEN}Enter your choice (1-5): {Style.RESET_ALL}")
            
            if choice == '1':
                self.test_single_platform('etsy')
            elif choice == '2':
                self.test_single_platform('woocommerce')
            elif choice == '3':
                self.test_single_platform('ebay')
            elif choice == '4':
                results = {}
                for platform in self.platform_order:
                    results[platform] = self.test_single_platform(platform, prompt_user=False)
                print(f"\n{Fore.CYAN}Batch test summary{Style.RESET_ALL}")
                for platform, success in results.items():
                    status = f"{Fore.GREEN}PASS" if success else f"{Fore.RED}FAIL"
                    print(f" - {platform.capitalize():12}{status}{Style.RESET_ALL}")
            elif choice == '5':
                print(f"{Fore.GREEN}Goodbye!")
                break
            else:
                print(f"{Fore.RED}Invalid choice!")
            
            input(f"\n{Fore.YELLOW}Press Enter to continue...")

if __name__ == "__main__":
    tester = InteractiveTester()
    tester.show_menu()