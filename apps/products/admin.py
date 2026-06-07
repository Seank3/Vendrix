from django.contrib import admin

from apps.products.models import ChannelPricing, Product, ProductMedia, ProductVariant


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['sku', 'name', 'status', 'organization_id', 'created_at']
    list_filter = ['status']
    search_fields = ['sku', 'name']
    inlines = [ProductVariantInline, ProductMediaInline]


@admin.register(ChannelPricing)
class ChannelPricingAdmin(admin.ModelAdmin):
    list_display = ['product', 'channel', 'price', 'currency']
