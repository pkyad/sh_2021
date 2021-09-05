from django.test import TestCase

# Create your tests here.
import requests

data = {
    'email' :  'pradgdsdsdfeepyada@cioc.in',
    'token' : '123456',
    'first_name' : 'Sagdmdaple',
    'last_name' : 'OdsK',
    'mobile' : '4234232344',
}
res = requests.post('http://localhost:8000/getToken/', data = data)

token = res.json()['token']
print token
