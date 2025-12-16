from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.db.models.functions import TruncMonth, TruncDay
from django.utils import timezone
from datetime import timedelta
from projects.models import Project


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """Get analytics overview with charts and metrics"""

    user = request.user

    # Time range filter
    range_param = request.GET.get('range', '30d')
    if range_param == '7d':
        days = 7
    elif range_param == '30d':
        days = 30
    elif range_param == '90d':
        days = 90
    elif range_param == '1y':
        days = 365
    else:
        days = 30

    start_date = timezone.now() - timedelta(days=days)

    # Base queryset
    projects_queryset = Project.objects.filter(created_at__gte=start_date)
    if not user.is_admin:
        projects_queryset = projects_queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Time series data (daily or monthly based on range)
    if days <= 90:
        # Daily data for shorter ranges
        time_data = projects_queryset.annotate(
            period=TruncDay('created_at')
        ).values('period').annotate(
            projects=Count('id'),
            revenue=Sum('total_amount'),
            completed=Count('id', filter=Q(status='completed'))
        ).order_by('period')

        labels = [item['period'].strftime('%b %d') for item in time_data]
    else:
        # Monthly data for longer ranges
        time_data = projects_queryset.annotate(
            period=TruncMonth('created_at')
        ).values('period').annotate(
            projects=Count('id'),
            revenue=Sum('total_amount'),
            completed=Count('id', filter=Q(status='completed'))
        ).order_by('period')

        labels = [item['period'].strftime('%b %Y') for item in time_data]

    projects_values = [item['projects'] for item in time_data]
    revenue_values = [float(item['revenue'] or 0) for item in time_data]
    completion_values = [item['completed'] for item in time_data]

    # Platform breakdown
    platform_data = projects_queryset.values('platform').annotate(
        count=Count('id'),
        revenue=Sum('total_amount')
    ).order_by('-count')

    platforms = {}
    platform_revenue = {}
    for item in platform_data:
        platforms[item['platform']] = item['count']
        platform_revenue[item['platform']] = float(item['revenue'] or 0)

    # Status distribution
    status_data = projects_queryset.values('status').annotate(
        count=Count('id')
    ).order_by('status')

    statuses = {item['status']: item['count'] for item in status_data}

    # Performance metrics
    total_projects = projects_queryset.count()
    completed_projects = projects_queryset.filter(status='completed').count()
    total_revenue = projects_queryset.filter(status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    conversion_rate = (completed_projects / total_projects * 100) if total_projects > 0 else 0
    avg_order_value = total_revenue / completed_projects if completed_projects > 0 else 0

    # Growth metrics (compare with previous period)
    prev_start_date = start_date - timedelta(days=days)
    prev_queryset = Project.objects.filter(
        created_at__gte=prev_start_date,
        created_at__lt=start_date
    )
    if not user.is_admin:
        prev_queryset = prev_queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    prev_total = prev_queryset.count()
    prev_completed = prev_queryset.filter(status='completed').count()
    prev_revenue = prev_queryset.filter(status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    growth_metrics = {
        'projects_growth': ((total_projects - prev_total) / prev_total * 100) if prev_total > 0 else 0,
        'revenue_growth': ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0,
        'completion_growth': ((completed_projects - prev_completed) / prev_completed * 100) if prev_completed > 0 else 0,
    }

    return Response({
        'labels': labels,
        'datasets': {
            'projects': projects_values,
            'revenue': revenue_values,
            'completed': completion_values,
        },
        'platforms': platforms,
        'platform_revenue': platform_revenue,
        'statuses': statuses,
        'metrics': {
            'total_projects': total_projects,
            'completed_projects': completed_projects,
            'total_revenue': float(total_revenue),
            'conversion_rate': round(conversion_rate, 1),
            'average_order_value': round(float(avg_order_value), 2),
        },
        'growth': {
            'projects': round(growth_metrics['projects_growth'], 1),
            'revenue': round(growth_metrics['revenue_growth'], 1),
            'completion': round(growth_metrics['completion_growth'], 1),
        },
        'top_products': [
            {'name': 'Product A', 'sales': 245, 'revenue': 24500},
            {'name': 'Product B', 'sales': 189, 'revenue': 18900},
            {'name': 'Product C', 'sales': 156, 'revenue': 15600},
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_performance(request):
    """Get detailed performance analytics"""

    user = request.user

    # Get date range
    days = int(request.GET.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)

    projects_queryset = Project.objects.filter(created_at__gte=start_date)
    if not user.is_admin:
        projects_queryset = projects_queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Response time analytics (time from creation to completion)
    completed_projects = projects_queryset.filter(
        status='completed',
        completed_at__isnull=False
    ).extra(
        select={'response_time': 'EXTRACT(EPOCH FROM (completed_at - created_at))/86400'}
    ).values('response_time', 'platform', 'priority')

    # Average response time by platform
    platform_response_times = {}
    for project in completed_projects:
        platform = project['platform']
        if platform not in platform_response_times:
            platform_response_times[platform] = []
        platform_response_times[platform].append(project['response_time'])

    avg_response_times = {}
    for platform, times in platform_response_times.items():
        avg_response_times[platform] = sum(times) / len(times) if times else 0

    # Customer satisfaction (mock data - would come from customer feedback)
    satisfaction_scores = {
        'etsy': 4.2,
        'shopify': 4.5,
        'woocommerce': 4.1,
        'ebay': 3.8,
        'jumia': 4.0,
        'jiji': 3.9,
    }

    # Quality metrics
    quality_metrics = {
        'on_time_delivery': 94.2,
        'customer_satisfaction': 4.3,
        'return_rate': 2.1,
        'issue_resolution_time': 1.8,  # days
    }

    return Response({
        'response_times': avg_response_times,
        'satisfaction_scores': satisfaction_scores,
        'quality_metrics': quality_metrics,
        'period': f'{days} days'
    })
