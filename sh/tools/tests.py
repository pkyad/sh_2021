from django.test import TestCase

# Create your tests here.

import requests

# res = requests.post('https://api.epsilonai.com/nlp/' , data = {"sent" : "hi there how are you Pradeep", "apiKey" : "30000$SzI2kwiSIfZP$8BxB/BAD2B7quXS532/vmbIhh9zmIvpg9bt8Q2fGM4="})
# print res.text



res = requests.post('http://localhost:8000/nlpCorrelation/' , data = {"sent1" : "hi there how are you Pradeep", "sent2" : "hello there how are you Pradeep", "apiKey" : "30000$SzI2kwiSIfZP$8BxB/BAD2B7quXS532/vmbIhh9zmIvpg9bt8Q2fGM4="})
print res.text
