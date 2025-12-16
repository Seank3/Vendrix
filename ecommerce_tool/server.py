from fastapi import FastAPI, HTTPException
from config.config_manager import ConfigManager
from config.credential_manager import CredentialManager
from integrations.etsy_integration import EtsyIntegration
from integrations.woocommerce_integration import WooCommerceIntegration
from integrations.ebay_integration import EbayIntegration

app = FastAPI()

config = ConfigManager()
creds = CredentialManager()

integrations = {
    "etsy": EtsyIntegration(config, creds),
    "woocommerce": WooCommerceIntegration(config, creds),
    "ebay": EbayIntegration(config, creds)
}

@app.get("/")
def root():
    return {"status": "Ecommerce Tool Backend Running"}

@app.get("/platforms")
def get_platforms():
    return config.get_all_platforms()

@app.get("/orders/{platform}")
def fetch_orders(platform: str, days: int = 1):
    if platform not in integrations:
        raise HTTPException(status_code=404, detail="Unknown platform")

    integration = integrations[platform]
    orders = integration.fetch_and_process(days)
    return {"platform": platform, "orders": orders}
