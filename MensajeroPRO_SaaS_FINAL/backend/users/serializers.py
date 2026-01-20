from rest_framework import serializers
from .models import User, Business


class UserSerializer(serializers.ModelSerializer):
    """User serializer."""
    
    is_superadmin = serializers.ReadOnlyField()
    can_create_business = serializers.ReadOnlyField()
    business_limit = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'is_superadmin',
            'can_create_business',
            'business_limit',
            'max_businesses',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'role']
    
    def get_business_limit(self, obj):
        return obj.get_business_limit()


class BusinessSerializer(serializers.ModelSerializer):
    """Business serializer."""
    
    owner = UserSerializer(read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    
    class Meta:
        model = Business
        fields = [
            'id',
            'owner',
            'owner_username',
            'name',
            'description',
            'whatsapp_number',
            'whatsapp_token',
            'ai_context',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']
        extra_kwargs = {
            'whatsapp_token': {'write_only': True},  # No exponer en GET
        }
    
    def validate_name(self, value):
        """Validate business name."""
        if len(value) < 3:
            raise serializers.ValidationError("El nombre debe tener al menos 3 caracteres")
        return value