from rest_framework.views import APIView
from rest_framework.response import Response
from ai.services import ai_reply
from payments.paypal import create_order

class WhatsAppWebhook(APIView):
 def post(self,req):
  msg=req.data['message']
  r=ai_reply(msg)
  if 'pagar' in msg.lower():
   order=create_order(10)
   link=order['links'][1]['href']
   return Response({'reply':f'Paga aquí: {link}'})
  return Response({'reply':r})
