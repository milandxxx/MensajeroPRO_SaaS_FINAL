from rest_framework import permissions


class CanCreateBusiness(permissions.BasePermission):
    """
    Permission para crear negocios.
    - Superadmin: siempre puede (ilimitado gratis)
    - Usuarios normales: solo si tienen suscripción activa y no han llegado al límite
    """
    
    message = "Necesitas una suscripción activa para crear negocios"
    
    def has_permission(self, request, view):
        # Solo aplica a POST (creación)
        if request.method != 'POST':
            return True
        
        user = request.user
        
        # Superadmin = acceso total gratis
        if user.is_superadmin:
            return True
        
        # Usuario normal debe tener suscripción activa
        if not user.has_active_subscription:
            self.message = "Necesitas una suscripción activa para crear negocios. ¡Actualiza tu plan!"
            return False
        
        # Verificar límite de negocios
        if not user.can_create_business:
            self.message = f"Has alcanzado el límite de {user.max_businesses} negocios. ¡Actualiza tu plan para crear más!"
            return False
        
        return True


class IsSuperAdminOrOwner(permissions.BasePermission):
    """
    Permission para editar/eliminar negocios.
    - Superadmin: puede editar cualquier negocio
    - Usuario normal: solo puede editar sus propios negocios
    """
    
    def has_object_permission(self, request, view, obj):
        # Superadmin puede todo
        if request.user.is_superadmin:
            return True
        
        # Owner puede editar su propio negocio
        return obj.owner == request.user