from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.db.models.functions import TruncDay
from django.utils import timezone
from datetime import timedelta
from users.models import User
from projects.models import Project


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_metrics(request):
    """Get dashboard metrics and KPIs"""

    user = request.user

    # Base queryset for projects (filtered by user role)
    projects_queryset = Project.objects.all()
    if not user.is_admin:
        projects_queryset = projects_queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Revenue metrics
    total_revenue = projects_queryset.filter(status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    # Monthly revenue growth (compare current month vs previous month)
    now = timezone.now()
    current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    previous_month_start = (current_month_start - timedelta(days=1)).replace(day=1)

    current_month_revenue = projects_queryset.filter(
        status='completed',
        completed_at__gte=current_month_start
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    previous_month_revenue = projects_queryset.filter(
        status='completed',
        completed_at__gte=previous_month_start,
        completed_at__lt=current_month_start
    ).aggregate(total=Sum('total_amount'))['total'] or 0

    revenue_growth = 0
    if previous_month_revenue > 0:
        revenue_growth = ((current_month_revenue - previous_month_revenue) / previous_month_revenue) * 100

    # Orders/Projects metrics
    total_orders = projects_queryset.count()
    completed_orders = projects_queryset.filter(status='completed').count()
    pending_orders = projects_queryset.filter(status='pending').count()
    in_progress_orders = projects_queryset.filter(status='in_progress').count()

    # Daily orders for the last 7 days
    daily_orders = []
    for i in range(6, -1, -1):
        date = (now - timedelta(days=i)).date()
        count = projects_queryset.filter(
            created_at__date=date
        ).count()
        daily_orders.append(count)

    # User metrics (only for admins)
    total_users = 0
    active_users = 0
    if user.is_admin:
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()

    # Recent activity (last 5 projects)
    recent_projects = projects_queryset.select_related('assigned_to', 'created_by')[:5]

    recent_activity = []
    for project in recent_projects:
        recent_activity.append({
            'id': project.id,
            'title': project.title,
            'status': project.status,
            'created_at': project.created_at,
            'assigned_to': project.assigned_to.get_full_name() if project.assigned_to else None,
        })

    # Platform distribution
    platform_stats = projects_queryset.values('platform').annotate(
        count=Count('id')
    ).order_by('-count')

    platforms = {}
    for stat in platform_stats:
        platforms[stat['platform']] = stat['count']

    return Response({
        'revenue': float(total_revenue),
        'revenue_growth': round(float(revenue_growth), 1),
        'orders': total_orders,
        'completed_orders': completed_orders,
        'pending_orders': pending_orders,
        'in_progress_orders': in_progress_orders,
        'daily_orders': daily_orders,
        'users': total_users if user.is_admin else 0,
        'active_users': active_users if user.is_admin else 0,
        'recent_activity': recent_activity,
        'platforms': platforms,
        'success_rate': round((completed_orders / total_orders * 100) if total_orders > 0 else 0, 1)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_overview(request):
    """Get dashboard overview data"""

    user = request.user

    # Base queryset
    projects_queryset = Project.objects.all()
    if not user.is_admin:
        projects_queryset = projects_queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Summary metrics
    summary = {
        'total_projects': projects_queryset.count(),
        'completed_projects': projects_queryset.filter(status='completed').count(),
        'pending_projects': projects_queryset.filter(status='pending').count(),
        'total_revenue': projects_queryset.filter(status='completed').aggregate(
            total=Sum('total_amount')
        )['total'] or 0,
        'average_order_value': projects_queryset.filter(status='completed').aggregate(
            avg=Avg('total_amount')
        )['avg'] or 0,
    }

    # Monthly data for charts
    monthly_data = projects_queryset.annotate(
        month=TruncDay('created_at')
    ).values('month').annotate(
        count=Count('id'),
        revenue=Sum('total_amount')
    ).order_by('month')[:30]  # Last 30 days

    labels = []
    project_counts = []
    revenue_values = []

    for item in monthly_data:
        labels.append(item['month'].strftime('%b %d'))
        project_counts.append(item['count'])
        revenue_values.append(float(item['revenue'] or 0))

    return Response({
        'summary': summary,
        'labels': labels,
        'projects': project_counts,
        'revenue': revenue_values,
    })
