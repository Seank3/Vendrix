from enum import Enum


class Platform(str, Enum):
    SHOPIFY = 'shopify'
    AMAZON = 'amazon'
    JUMIA = 'jumia'
    ETSY = 'etsy'
    TIKTOK_SHOP = 'tiktok_shop'
    WHATSAPP_CATALOG = 'whatsapp_catalog'
    ODOO = 'odoo'

    @classmethod
    def choices(cls):
        return [(p.value, p.name.replace('_', ' ').title()) for p in cls]
