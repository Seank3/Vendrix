from django.urls import path

from apps.identity.views import (
    APIKeyListCreateView,
    APIKeyRevokeView,
    LoginView,
    MeView,
    RegisterOrganizationView,
    UserListCreateView,
)

urlpatterns = [
    path('register/', RegisterOrganizationView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('api-keys/', APIKeyListCreateView.as_view(), name='api-keys'),
    path('api-keys/<uuid:key_id>/', APIKeyRevokeView.as_view(), name='api-key-revoke'),
    path('users/', UserListCreateView.as_view(), name='users'),
]
