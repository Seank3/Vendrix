from django.urls import path

from apps.events.views import EventListView

urlpatterns = [
    path('', EventListView.as_view(), name='event-list'),
]
