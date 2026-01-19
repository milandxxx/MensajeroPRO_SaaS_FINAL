from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Payment

class PayPalWebhook(APIView):
 def post(self,req):
  data=req.data
  if data.get('event_type')=='CHECKOUT.ORDER.APPROVED':
   oid=data['resource']['id']
   Payment.objects.filter(paypal_order_id=oid).update(status='PAID')
  return Response({'ok':True})
