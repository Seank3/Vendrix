from rest_framework import serializers

from apps.events.models import DomainEvent


class DomainEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = DomainEvent
        fields = [
            'id', 'event_type', 'resource_type', 'resource_id',
            'payload', 'actor_id', 'correlation_id', 'processed', 'created_at',
        ]
        read_only_fields = fields
