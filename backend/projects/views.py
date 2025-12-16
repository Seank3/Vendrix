from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Sum, Avg, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from .models import Project
from .serializers import (
    ProjectSerializer, ProjectCreateSerializer,
    ProjectHistorySerializer, ProjectStatsSerializer
)


class ProjectListCreateView(generics.ListCreateAPIView):
    """Projects list and creation endpoint"""

    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'priority', 'platform', 'assigned_to']
    search_fields = ['title', 'description', 'order_id', 'sku', 'customer_name', 'customer_email']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'order_date', 'total_amount']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProjectCreateSerializer
        return ProjectSerializer

    def get_queryset(self):
        queryset = Project.objects.select_related('assigned_to', 'created_by')

        # Filter by user's role
        user = self.request.user
        if not user.is_admin:
            # Non-admins can only see projects they created or are assigned to
            queryset = queryset.filter(
                Q(created_by=user) | Q(assigned_to=user)
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Project detail, update, delete endpoint"""

    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Project.objects.select_related('assigned_to', 'created_by')

        # Filter by user's role
        user = self.request.user
        if not user.is_admin:
            queryset = queryset.filter(
                Q(created_by=user) | Q(assigned_to=user)
            )

        return queryset


class ProjectHistoryView(generics.ListAPIView):
    """Project history endpoint"""

    serializer_class = ProjectHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        project_id = self.kwargs['pk']
        return Project.objects.get(pk=project_id).history.all()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_stats(request):
    """Get project statistics"""

    # Base queryset with role filtering
    user = request.user
    queryset = Project.objects.all()
    if not user.is_admin:
        queryset = queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Calculate stats
    total_projects = queryset.count()
    completed_projects = queryset.filter(status='completed').count()
    pending_projects = queryset.filter(status='pending').count()
    in_progress_projects = queryset.filter(status='in_progress').count()

    # Overdue projects (past due date and not completed/cancelled)
    overdue_projects = queryset.filter(
        due_date__lt=timezone.now()
    ).exclude(
        status__in=['completed', 'cancelled']
    ).count()

    # Financial stats
    total_revenue = queryset.filter(status='completed').aggregate(
        total=Sum('total_amount')
    )['total'] or 0

    avg_order_value = queryset.filter(status='completed').aggregate(
        avg=Avg('total_amount')
    )['avg'] or 0

    stats = {
        'total_projects': total_projects,
        'completed_projects': completed_projects,
        'pending_projects': pending_projects,
        'in_progress_projects': in_progress_projects,
        'overdue_projects': overdue_projects,
        'total_revenue': total_revenue,
        'average_order_value': avg_order_value,
    }

    serializer = ProjectStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def project_analytics(request):
    """Get project analytics data"""

    # Time range filter
    range_param = request.GET.get('range', '30d')
    if range_param == '7d':
        days = 7
    elif range_param == '30d':
        days = 30
    elif range_param == '90d':
        days = 90
    else:
        days = 30

    start_date = timezone.now() - timedelta(days=days)

    # Base queryset
    user = request.user
    queryset = Project.objects.filter(created_at__gte=start_date)
    if not user.is_admin:
        queryset = queryset.filter(
            Q(created_by=user) | Q(assigned_to=user)
        )

    # Monthly project creation data
    monthly_data = queryset.annotate(
        month=TruncMonth('created_at')
    ).values('month').annotate(
        count=Count('id')
    ).order_by('month')

    labels = []
    values = []

    for item in monthly_data:
        labels.append(item['month'].strftime('%b %Y'))
        values.append(item['count'])

    # Platform distribution
    platform_data = queryset.values('platform').annotate(
        count=Count('id')
    ).order_by('-count')

    platforms = {item['platform']: item['count'] for item in platform_data}

    # Status distribution
    status_data = queryset.values('status').annotate(
        count=Count('id')
    ).order_by('status')

    statuses = {item['status']: item['count'] for item in status_data}

    return Response({
        'labels': labels,
        'values': values,
        'platforms': platforms,
        'statuses': statuses,
        'summary': {
            'total_projects': queryset.count(),
            'completed_projects': queryset.filter(status='completed').count(),
            'total_revenue': queryset.filter(status='completed').aggregate(
                total=Sum('total_amount')
            )['total'] or 0,
        }
    })
