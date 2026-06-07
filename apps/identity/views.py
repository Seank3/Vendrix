from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.core.permissions import IsAdmin, IsOrganizationMember
from apps.core.views import TenantAPIView, resolve_organization_id
from apps.identity.models import APIKey
from apps.identity.serializers import (
    APIKeyCreateResponseSerializer,
    APIKeyCreateSerializer,
    APIKeySerializer,
    CustomTokenObtainPairSerializer,
    InviteUserSerializer,
    RegisterOrganizationSerializer,
    UserSerializer,
)
from apps.identity.services import APIKeyService, OrganizationService

User = get_user_model()


class RegisterOrganizationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterOrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        service = OrganizationService(organization_id=None)
        org, user = service.create_organization(
            name=data['organization_name'],
            slug=data['organization_slug'],
            admin_email=data['admin_email'],
            admin_password=data['admin_password'],
            admin_first_name=data.get('admin_first_name', ''),
        )

        return Response(
            {
                'organization': {
                    'id': str(org.id),
                    'name': org.name,
                    'slug': org.slug,
                },
                'user': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class MeView(TenantAPIView):
    permission_classes = [IsOrganizationMember]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class APIKeyListCreateView(TenantAPIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        keys = APIKey.objects.filter(
            organization_id=resolve_organization_id(request),
            is_active=True,
        )
        return Response(APIKeySerializer(keys, many=True).data)

    def post(self, request):
        serializer = APIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = APIKeyService(resolve_organization_id(request))
        api_key, raw_key = service.create_api_key(
            name=serializer.validated_data['name'],
            scopes=serializer.validated_data.get('scopes', []),
        )

        return Response(
            {
                'api_key': APIKeySerializer(api_key).data,
                'raw_key': raw_key,
            },
            status=status.HTTP_201_CREATED,
        )


class APIKeyRevokeView(TenantAPIView):
    permission_classes = [IsAdmin]

    def delete(self, request, key_id):
        service = APIKeyService(resolve_organization_id(request))
        if service.revoke_api_key(key_id):
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.filter(organization_id=resolve_organization_id(self.request))

    def create(self, request, *args, **kwargs):
        serializer = InviteUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if User.objects.filter(email=data['email']).exists():
            return Response(
                {'email': ['User already exists']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            organization_id=resolve_organization_id(request),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=data.get('role'),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
