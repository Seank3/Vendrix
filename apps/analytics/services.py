from datetime import date, timedelta

from django.db.models import Sum

from apps.analytics.models import MetricSnapshot, SyncFailureLog
from apps.core.services import BaseService
from apps.orders.models import Order


class AnalyticsService(BaseService):
    def get_overview(self):
        today = date.today()
        week_ago = today - timedelta(days=7)

        orders_today = Order.objects.filter(
            organization_id=self.organization_id,
            created_at__date=today,
        ).count()

        orders_week = Order.objects.filter(
            organization_id=self.organization_id,
            created_at__date__gte=week_ago,
        ).count()

        sync_failures = SyncFailureLog.objects.filter(
            organization_id=self.organization_id,
            resolved=False,
        ).count()

        events_today = MetricSnapshot.objects.filter(
            organization_id=self.organization_id,
            metric_type='events.total',
            period_start=today,
        ).values_list('count', flat=True)

        return {
            'orders_today': orders_today,
            'orders_week': orders_week,
            'sync_failures_unresolved': sync_failures,
            'events_today': sum(events_today),
        }

    def get_order_volume_by_channel(self, days=30):
        since = date.today() - timedelta(days=days)
        snapshots = MetricSnapshot.objects.filter(
            organization_id=self.organization_id,
            metric_type='orders.received',
            period_start__gte=since,
        )
        return [
            {
                'channel': s.dimension_value,
                'count': s.count,
                'period_start': s.period_start.isoformat(),
            }
            for s in snapshots
        ]

    def get_sync_failures(self, resolved=None, limit=50):
        qs = SyncFailureLog.objects.filter(organization_id=self.organization_id)
        if resolved is not None:
            qs = qs.filter(resolved=resolved)
        return qs[:limit]

    def get_sku_performance(self, days=30):
        since = date.today() - timedelta(days=days)
        from apps.orders.models import OrderLineItem

        line_items = OrderLineItem.objects.filter(
            organization_id=self.organization_id,
            created_at__date__gte=since,
        ).values('sku').annotate(
            total_qty=Sum('quantity'),
        )
        return list(line_items)
