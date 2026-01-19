import requests, os

CLIENT=os.getenv('PAYPAL_CLIENT')
SECRET=os.getenv('PAYPAL_SECRET')
BASE='https://api-m.sandbox.paypal.com'

def token():
 r=requests.post(f'{BASE}/v1/oauth2/token',
  auth=(CLIENT,SECRET),
  data={'grant_type':'client_credentials'})
 return r.json()['access_token']

def create_order(amount):
 t=token()
 h={'Authorization':f'Bearer {t}'}
 data={
  'intent':'CAPTURE',
  'purchase_units':[{'amount':{'currency_code':'USD','value':str(amount)}}]
 }
 r=requests.post(f'{BASE}/v2/checkout/orders',json=data,headers=h)
 return r.json()
