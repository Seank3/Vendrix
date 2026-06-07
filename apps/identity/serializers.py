from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.identity.models import APIKey, Organization, Role, User


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug', 'is_active', 'settings', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'role',
            'organization', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'organization', 'created_at']


class RegisterOrganizationSerializer(serializers.Serializer):
    organization_name = serializers.CharField(max_length=255)
    organization_slug = serializers.SlugField(max_length=100)
    admin_email = serializers.EmailField()
    admin_password = serializers.CharField(write_only=True, min_length=8)
    admin_first_name = serializers.CharField(max_length=150, required=False, default='')

    def validate_admin_password(self, value):
        validate_password(value)
        return value

    def validate_organization_slug(self, value):
        if Organization.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Organization slug already exists')
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['organization_id'] = str(user.organization_id)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'prefix', 'is_active', 'scopes',
            'last_used_at', 'expires_at', 'created_at',
        ]
        read_only_fields = fields


class APIKeyCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    scopes = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=list,
    )


class APIKeyCreateResponseSerializer(serializers.Serializer):
    api_key = APIKeySerializer()
    raw_key = serializers.CharField()


class InviteUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(required=False, default='')
    last_name = serializers.CharField(required=False, default='')
    role = serializers.ChoiceField(choices=Role.choices, default=Role.VIEWER)
