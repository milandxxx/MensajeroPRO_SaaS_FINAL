from django.db import models
from django.contrib.auth.models import User

class Payment(models.Model):
 user=models.ForeignKey(User,on_delete=models.CASCADE)
 paypal_order_id=models.CharField(max_length=100)
 amount=models.FloatField()
 status=models.CharField(max_length=20,default='PENDING')
