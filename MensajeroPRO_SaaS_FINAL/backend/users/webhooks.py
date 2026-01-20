import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from datetime import timedelta
from django.utils import timezone
from .models import Payment, Subscription
from .paypal import paypal_service

logger = logging.getLogger(__name__)

# Plan limits
PLAN_LIMITS = {
    'basic': {
        'max_businesses': 1,
        'monthly_messages': 1000,
        'price': 10.00,
    },
    'pro': {
        'max_businesses': 5,
        'monthly_messages': 10000,
        'price': 50.00,
    },
    'enterprise': {
        'max_businesses': 50,
        'monthly_messages': 100000,
        'price': 200.00,
    },
}


class PayPalWebhookView(APIView):
    """Handle PayPal webhook events."""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Get raw body for signature verification
            raw_body = request.body.decode('utf-8')
            
            # Verify webhook signature
            is_valid = paypal_service.verify_webhook_signature(
                headers=request.headers,
                body=raw_body
            )
            
            if not is_valid:
                logger.warning("Invalid webhook signature received")
                return Response(
                    {'error': 'Invalid signature'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Process event
            event_type = request.data.get('event_type')
            resource = request.data.get('resource', {})
            
            logger.info(f"Processing PayPal webhook event: {event_type}")
            
            # Handle different event types
            if event_type == 'CHECKOUT.ORDER.APPROVED':
                self._handle_order_approved(resource)
                
            elif event_type == 'PAYMENT.CAPTURE.COMPLETED':
                self._handle_payment_completed(resource)
                
            elif event_type == 'PAYMENT.CAPTURE.DENIED':
                self._handle_payment_denied(resource)
                
            elif event_type == 'PAYMENT.CAPTURE.REFUNDED':
                self._handle_payment_refunded(resource)
                
            else:
                logger.info(f"Unhandled event type: {event_type}")
            
            return Response({'status': 'success'}, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error processing webhook: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _handle_order_approved(self, resource):
        """Handle order approval event."""
        try:
            order_id = resource.get('id')
            
            payment = Payment.objects.filter(
                paypal_order_id=order_id
            ).first()
            
            if payment:
                payment.status = 'APPROVED'
                payment.save()
                logger.info(f"Order approved: {order_id}")
                
        except Exception as e:
            logger.error(f"Error handling order approval: {str(e)}")
    
    def _handle_payment_completed(self, resource):
        """Handle payment completion event."""
        try:
            # Get order ID from resource
            order_id = None
            if 'supplementary_data' in resource:
                related_ids = resource['supplementary_data'].get('related_ids', {})
                order_id = related_ids.get('order_id')
            
            if not order_id:
                logger.warning("No order_id found in payment completion event")
                return
            
            payment = Payment.objects.filter(
                paypal_order_id=order_id
            ).first()
            
            if not payment:
                logger.warning(f"Payment not found for order: {order_id}")
                return
            
            # Update payment status
            payment.status = 'COMPLETED'
            payment.completed_at = timezone.now()
            payment.save()
            
            # Create or update subscription WITH business limits
            self._create_subscription_with_limits(payment)
            
            # Send confirmation email
            self._send_payment_confirmation_email(payment)
            
            logger.info(f"Payment completed: {payment.id}")
            
        except Exception as e:
            logger.error(f"Error handling payment completion: {str(e)}", exc_info=True)
    
    def _handle_payment_denied(self, resource):
        """Handle payment denial event."""
        try:
            order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
            
            if order_id:
                Payment.objects.filter(paypal_order_id=order_id).update(
                    status='DENIED'
                )
                logger.info(f"Payment denied: {order_id}")
                
        except Exception as e:
            logger.error(f"Error handling payment denial: {str(e)}")
    
    def _handle_payment_refunded(self, resource):
        """Handle payment refund event."""
        try:
            order_id = resource.get('supplementary_data', {}).get('related_ids', {}).get('order_id')
            
            if order_id:
                payment = Payment.objects.filter(paypal_order_id=order_id).first()
                if payment:
                    payment.status = 'REFUNDED'
                    payment.save()
                    
                    # Deactivate subscription and reset limits
                    user = payment.user
                    Subscription.objects.filter(
                        user=user,
                        is_active=True
                    ).update(is_active=False)
                    
                    # Reset business limit to 0
                    user.max_businesses = 0
                    user.save()
                    
                    logger.info(f"Payment refunded and limits reset: {order_id}")
                    
        except Exception as e:
            logger.error(f"Error handling payment refund: {str(e)}")
    
    def _create_subscription_with_limits(self, payment):
        """Create or extend subscription with business limits based on plan."""
        try:
            plan_type = payment.plan_type
            plan_limits = PLAN_LIMITS.get(plan_type, PLAN_LIMITS['basic'])
            
            # Get or create subscription
            subscription, created = Subscription.objects.get_or_create(
                user=payment.user,
                defaults={
                    'plan_type': plan_type,
                    'is_active': True,
                    'start_date': timezone.now(),
                    'end_date': timezone.now() + timedelta(days=30),
                    'monthly_message_limit': plan_limits['monthly_messages']
                }
            )
            
            if not created:
                # Extend existing subscription
                if subscription.end_date < timezone.now():
                    subscription.start_date = timezone.now()
                    subscription.end_date = timezone.now() + timedelta(days=30)
                else:
                    subscription.end_date += timedelta(days=30)
                
                subscription.plan_type = plan_type
                subscription.is_active = True
                subscription.monthly_message_limit = plan_limits['monthly_messages']
                subscription.save()
            
            # UPDATE USER BUSINESS LIMITS
            payment.user.max_businesses = plan_limits['max_businesses']
            payment.user.role = 'admin'  # Upgrade to admin role
            payment.user.save()
            
            logger.info(
                f"Subscription {'created' if created else 'extended'} for user {payment.user.id} "
                f"with {plan_limits['max_businesses']} business limit"
            )
            
        except Exception as e:
            logger.error(f"Error creating subscription: {str(e)}")
    
    def _send_payment_confirmation_email(self, payment):
        """Send payment confirmation email to user."""
        try:
            plan_limits = PLAN_LIMITS.get(payment.plan_type, PLAN_LIMITS['basic'])
            
            subject = 'Pago Confirmado - MensajeroPRO'
            message = f"""
Hola {payment.user.username},

Tu pago ha sido procesado exitosamente.

Detalles:
- Monto: ${payment.amount} USD
- Plan: {payment.plan_type.capitalize()}
- Límite de negocios: {plan_limits['max_businesses']}
- Mensajes/mes: {plan_limits['monthly_messages']:,}
- ID de Transacción: {payment.paypal_order_id}

¡Ya puedes crear hasta {plan_limits['max_businesses']} negocios!

Equipo MensajeroPRO
            """
            
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [payment.user.email],
                fail_silently=True,
            )
            
            logger.info(f"Confirmation email sent to {payment.user.email}")
            
        except Exception as e:
            logger.warning(f"Failed to send confirmation email: {str(e)}")