from django.urls import path
from . import views

app_name = 'projects'

urlpatterns = [
    # Project CRUD
    path('', views.ProjectListCreateView.as_view(), name='project-list'),
    path('<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('<int:pk>/history/', views.ProjectHistoryView.as_view(), name='project-history'),

    # Analytics and stats
    path('stats/', views.project_stats, name='project-stats'),
    path('analytics/', views.project_analytics, name='project-analytics'),
]
