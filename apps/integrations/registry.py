from apps.integrations.platforms import Platform

CONNECTOR_REGISTRY: dict[str, str] = {
    Platform.SHOPIFY.value: 'apps.integrations.connectors.shopify.ShopifyConnector',
    Platform.AMAZON.value: 'apps.integrations.connectors.amazon.AmazonConnector',
    Platform.JUMIA.value: 'apps.integrations.connectors.jumia.JumiaConnector',
    Platform.ETSY.value: 'apps.integrations.connectors.etsy.EtsyConnector',
    Platform.TIKTOK_SHOP.value: 'apps.integrations.connectors.tiktok.TikTokShopConnector',
    Platform.WHATSAPP_CATALOG.value: 'apps.integrations.connectors.whatsapp.WhatsAppCatalogConnector',
    Platform.ODOO.value: 'apps.integrations.connectors.odoo.OdooConnector',
}


def get_connector_class(platform: str):
    import importlib

    path = CONNECTOR_REGISTRY.get(platform)
    if not path:
        raise ValueError(f'No connector registered for platform: {platform}')

    module_path, class_name = path.rsplit('.', 1)
    module = importlib.import_module(module_path)
    return getattr(module, class_name)


def get_connector(integration, credentials: dict):
    connector_cls = get_connector_class(integration.platform)
    return connector_cls(integration, credentials, integration.config)
