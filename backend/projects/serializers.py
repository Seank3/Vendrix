from rest_framework import serializers
from django.utils import timezone
from .models import Project, ProjectHistory


class ProjectSerializer(serializers.ModelSerializer):
    """Project/Order serializer"""

    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_until_due = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'platform', 'order_id', 'sku',
            'quantity', 'unit_price', 'total_amount', 'customer_name',
            'customer_email', 'customer_phone', 'status', 'priority',
            'order_date', 'due_date', 'completed_at', 'assigned_to',
            'assigned_to_name', 'created_by', 'created_by_name',
            'tags', 'notes', 'metadata', 'is_overdue', 'days_until_due',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by', 'is_overdue', 'days_until_due']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Create history entry for status changes
        if 'status' in validated_data and instance.status != validated_data['status']:
            ProjectHistory.objects.create(
                project=instance,
                user=self.context['request'].user,
                action='status_changed',
                field='status',
                old_value=instance.status,
                new_value=validated_data['status']
            )

        # Create history entry for assignment changes
        if 'assigned_to' in validated_data and instance.assigned_to != validated_data['assigned_to']:
            ProjectHistory.objects.create(
                project=instance,
                user=self.context['request'].user,
                action='assigned',
                field='assigned_to',
                old_value=str(instance.assigned_to) if instance.assigned_to else '',
                new_value=str(validated_data['assigned_to']) if validated_data['assigned_to'] else ''
            )

        return super().update(instance, validated_data)


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating projects"""

    class Meta:
        model = Project
        fields = [
            'title', 'description', 'platform', 'order_id', 'sku',
            'quantity', 'unit_price', 'customer_name', 'customer_email',
            'customer_phone', 'status', 'priority', 'order_date',
            'due_date', 'assigned_to', 'tags', 'notes'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ProjectHistorySerializer(serializers.ModelSerializer):
    """Project history serializer"""

    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = ProjectHistory
        fields = [
            'id', 'action', 'field', 'old_value', 'new_value',
            'notes', 'user_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProjectStatsSerializer(serializers.Serializer):
    """Project statistics serializer"""

    total_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    pending_projects = serializers.IntegerField()
    in_progress_projects = serializers.IntegerField()
    overdue_projects = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
