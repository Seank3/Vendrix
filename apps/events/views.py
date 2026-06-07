from rest_framework.response import Response

from apps.core.permissions import IsViewer
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.events.models import DomainEvent
from apps.events.serializers import DomainEventSerializer


class EventListView(TenantAPIView):
    permission_classes = [IsViewer]

    def get(self, request):
        qs = DomainEvent.objects.filter(
            organization_id=resolve_organization_id(request),
        )
        event_type = request.query_params.get('event_type')
        if event_type:
            qs = qs.filter(event_type=event_type)

        resource_type = request.query_params.get('resource_type')
        if resource_type:
            qs = qs.filter(resource_type=resource_type)

        page_size = min(int(request.query_params.get('page_size', 50)), 100)
        events = qs[:page_size]
        return Response(DomainEventSerializer(events, many=True).data)
