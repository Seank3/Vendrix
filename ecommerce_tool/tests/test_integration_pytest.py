from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager
from integrations.etsy_integration import EtsyIntegration
from integrations.woocommerce_integration import WooCommerceIntegration
from integrations.ebay_integration import EbayIntegration


def test_integration_classes_instantiate():
    cfg = ConfigManager()
    creds = CredentialManager()
    etsy = EtsyIntegration(cfg, creds)
    woo = WooCommerceIntegration(cfg, creds)
    ebay = EbayIntegration(cfg, creds)
    assert etsy is not None and woo is not None and ebay is not None


def test_etsy_auth_fails_without_credentials():
    cfg = ConfigManager()
    creds = CredentialManager()
    etsy = EtsyIntegration(cfg, creds)
    # Authenticate expects certain fields; with empty creds it should fail
    assert etsy.authenticate({}) is False
