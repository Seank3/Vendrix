from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    path('overview/', views.analytics_overview, name='overview'),
    path('performance/', views.analytics_performance, name='performance'),
]
