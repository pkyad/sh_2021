from django.test import TestCase
from django.conf import settings as globalSettings

# Create your tests here.

import mysql.connector

if True:
    HOST = '127.0.0.1'
    USER = 'root'
    PASSWORD = 'cioc'
    NAME = 'api_epsilonai'
else:
    HOST = globalSettings.DATABASES['default']['HOST']
    USER = globalSettings.DATABASES['default']['USER']
    PASSWORD = globalSettings.DATABASES['default']['PASSWORD']
    NAME = globalSettings.DATABASES['default']['NAME']

mydb = mysql.connector.connect(
  host= HOST ,
  user= USER,
  passwd= PASSWORD,
  database= NAME
)

print(mydb)
