from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *


class themeSerializer(serializers.ModelSerializer):
    class Meta:
        model = theme
        fields = ( 'pk' , 'main' , 'highlight' , 'background' , 'backgroundImg')

class settingsSerializer(serializers.ModelSerializer):
    theme = themeSerializer(many = False , read_only = True)
    class Meta:
        model = settings
        fields = ('pk' , 'user', 'theme', 'presence')
