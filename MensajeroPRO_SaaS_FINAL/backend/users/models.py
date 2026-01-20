from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Extended user model with roles and business access."""
    
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),  # Tú - acceso total gratis
        ('admin', 'Admin'),              # Usuarios con plan pagado
        ('user', 'User'),                # Usuarios normales (deben pagar)
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='user'
    )
    
    # Límites de negocios según rol
    max_businesses = models.IntegerField(default=0)
    
    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_superadmin(self):
        """Check if user is superadmin (acceso total gratis)."""
        return self.role == 'superadmin' or self.is_superuser
    
    @property
    def can_create_business(self):
        """Check if user can create more businesses."""
        # Superadmin = ilimitado gratis
        if self.is_superadmin:
            return True
        
        # Contar negocios actuales
        current_count = self.businesses.count()
        
        # Verificar límite
        return current_count < self.max_businesses
    
    @property
    def has_active_subscription(self):
        """Check if user has active paid subscription."""
        try:
            return self.subscription.is_active and not self.subscription.is_expired
        except:
            return False
    
    def get_business_limit(self):
        """Get current business limit for user."""
        if self.is_superadmin:
            return "Ilimitado"
        return self.max_businesses


class Business(models.Model):
    """Business/Negocio model."""
    
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='businesses'
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # WhatsApp configuration
    whatsapp_number = models.CharField(max_length=20, blank=True)
    whatsapp_token = models.CharField(max_length=500, blank=True)
    
    # AI configuration
    ai_context = models.TextField(
        blank=True,
        help_text="Contexto/personalidad para respuestas IA"
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Businesses'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} (Owner: {self.owner.username})"