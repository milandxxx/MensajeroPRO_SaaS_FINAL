from django.urls import path
from payments.views import CreatePayPalPayment
from payments.webhooks import PayPalWebhook
from whatsapp.views import WhatsAppWebhook

urlpatterns = [
 path('api/payments/create/', CreatePayPalPayment.as_view()),
 path('api/payments/webhook/', PayPalWebhook.as_view()),
 path('api/whatsapp/', WhatsAppWebhook.as_view()),
]
