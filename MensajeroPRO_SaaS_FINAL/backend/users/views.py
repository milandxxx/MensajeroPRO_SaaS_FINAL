import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Business
from .serializers import BusinessSerializer
from .permissions import CanCreateBusiness

logger = logging.getLogger(__name__)


class BusinessListCreateView(APIView):
    """List and create businesses."""
    
    permission_classes = [IsAuthenticated, CanCreateBusiness]
    
    def get(self, request):
        """Get all businesses for current user."""
        businesses = Business.objects.filter(owner=request.user)
        serializer = BusinessSerializer(businesses, many=True)
        
        return Response({
            'businesses': serializer.data,
            'total': businesses.count(),
            'limit': request.user.get_business_limit(),
            'can_create_more': request.user.can_create_business
        })
    
    def post(self, request):
        """Create new business."""
        # Verificar si puede crear más negocios
        if not request.user.can_create_business:
            # Si no es superadmin y llegó al límite
            if not request.user.is_superadmin:
                return Response({
                    'error': 'Has alcanzado el límite de negocios',
                    'message': 'Actualiza tu plan para crear más negocios',
                    'current_limit': request.user.max_businesses,
                    'upgrade_required': True
                }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = BusinessSerializer(data=request.data)
        
        if serializer.is_valid():
            business = serializer.save(owner=request.user)
            
            logger.info(f"Business created: {business.name} by {request.user.username}")
            
            return Response({
                'business': BusinessSerializer(business).data,
                'message': 'Negocio creado exitosamente'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BusinessDetailView(APIView):
    """Retrieve, update, delete business."""
    
    permission_classes = [IsAuthenticated]
    
    def get_object(self, request, business_id):
        """Get business ensuring ownership."""
        business = get_object_or_404(Business, id=business_id)
        
        # Verificar ownership (superadmin puede ver todos)
        if not request.user.is_superadmin and business.owner != request.user:
            return None
        
        return business
    
    def get(self, request, business_id):
        """Get business details."""
        business = self.get_object(request, business_id)
        
        if not business:
            return Response(
                {'error': 'Negocio no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = BusinessSerializer(business)
        return Response(serializer.data)
    
    def put(self, request, business_id):
        """Update business."""
        business = self.get_object(request, business_id)
        
        if not business:
            return Response(
                {'error': 'Negocio no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = BusinessSerializer(business, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"Business updated: {business.name} by {request.user.username}")
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, business_id):
        """Delete business."""
        business = self.get_object(request, business_id)
        
        if not business:
            return Response(
                {'error': 'Negocio no encontrado o sin acceso'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        business_name = business.name
        business.delete()
        
        logger.info(f"Business deleted: {business_name} by {request.user.username}")
        
        return Response({
            'message': f'Negocio "{business_name}" eliminado exitosamente'
        })


class UserDashboardView(APIView):
    """User dashboard with stats and limits."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user dashboard data."""
        user = request.user
        
        # Business stats
        businesses = Business.objects.filter(owner=user)
        active_businesses = businesses.filter(is_active=True).count()
        
        # Subscription info
        has_subscription = user.has_active_subscription
        
        dashboard_data = {
            'user': {
                'username': user.username,
                'email': user.email,
                'role': user.get_role_display(),
                'is_superadmin': user.is_superadmin,
            },
            'businesses': {
                'total': businesses.count(),
                'active': active_businesses,
                'limit': user.get_business_limit(),
                'can_create_more': user.can_create_business,
            },
            'subscription': {
                'active': has_subscription,
                'needs_upgrade': not user.is_superadmin and not user.can_create_business,
            },
            'permissions': {
                'unlimited_access': user.is_superadmin,
                'requires_payment': not user.is_superadmin and not has_subscription,
            }
        }
        
        return Response(dashboard_data)