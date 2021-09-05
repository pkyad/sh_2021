from rest_framework import viewsets , permissions , serializers
from django.shortcuts import render
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from models import *
import json

class settingsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, isOwner, )
    queryset = settings.objects.all()
    serializer_class = settingsSerializer

class themeViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticatedOrReadOnly, )
    queryset = theme.objects.all()
    serializer_class = themeSerializer
