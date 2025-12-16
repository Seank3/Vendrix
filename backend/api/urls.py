from django.urls import path
from . import views

urlpatterns = [
    path("auth/login", views.login_view),
    path("auth/me", views.me_view),
    path("config", views.config_view),
    path("integrations", views.integrations_view),
    path("credentials", views.credentials_view),
    path("orders", views.orders_view),
    path("logs", views.logs_view),
    path("dashboard/metrics", views.dashboard_metrics_view),
    path("analytics/overview", views.analytics_overview_view),
    path("users", views.users_view),
]

