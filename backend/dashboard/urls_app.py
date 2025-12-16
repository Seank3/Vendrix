from django.urls import path
from . import views

app_name = 'dashboard'

urlpatterns = [
    path('metrics/', views.dashboard_metrics, name='metrics'),
    path('overview/', views.dashboard_overview, name='overview'),
]
