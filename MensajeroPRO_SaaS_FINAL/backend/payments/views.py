from rest_framework.views import APIView
from rest_framework.response import Response
from .paypal import create_order
from .models import Payment

class CreatePayPalPayment(APIView):
 def post(self,req):
  order=create_order(10)
  Payment.objects.create(
   user=req.user,
   paypal_order_id=order['id'],
   amount=10
  )
  return Response(order)
