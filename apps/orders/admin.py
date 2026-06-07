from django.contrib import admin

from apps.orders.models import Order, OrderLineItem


class OrderLineItemInline(admin.TabularInline):
    model = OrderLineItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['external_id', 'channel', 'status', 'total', 'organization_id', 'created_at']
    list_filter = ['status', 'channel']
    inlines = [OrderLineItemInline]
