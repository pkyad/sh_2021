from __future__ import unicode_literals

from django.contrib.auth.models import User
from django.db import models
from time import time



# Create your models here.
def getToolsFilePath(instance , filename ):
    return 'tools/fileChache/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getArchivedFilePath(instance , filename ):
    return 'tools/archive/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)


API_ACCOUNT_TYPES = (
    ('trial' , 'trial'),
    ('community' , 'community'),
    ('commercial', 'commercial')
)

class ApiKeyRegistration(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    email = models.EmailField(null = True , blank = True , unique=True)
    email_otp = models.CharField(max_length = 6 , null = True)
    verified = models.BooleanField(default=False)
    emailApiKey = models.CharField(max_length = 50 , null = True)

class ApiAccount(models.Model):
    user = models.ForeignKey(User , related_name='apiAccountsCreatedOrOwned' , null = False)
    created = models.DateTimeField(auto_now_add=True)
    accountType = models.CharField(max_length = 10 , choices = API_ACCOUNT_TYPES , default = 'trial')
    remaining = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default = False)
    apiKey = models.CharField(max_length = 100, null = False)
    email = models.EmailField(null=True,unique = True) # say this is an external user and to identify the owner this email can be used
    name = models.CharField(max_length = 100, null = True)

class ApiAccountLog(models.Model):
    updated = models.DateTimeField(auto_now_add=True)
    usageAdded = models.PositiveIntegerField(default=0)
    accActive = models.BooleanField(default = True)
    account = models.ForeignKey(ApiAccount, related_name='logs', null = False)
    actor = models.ForeignKey(User, null = False)
    refID = models.CharField(max_length = 50, null = True)


class FileCache(models.Model):
    user = models.ForeignKey(User , related_name='fileChaches' , null = True)
    created = models.DateTimeField(auto_now_add=True)
    expiresOn = models.DateField(null=False)
    attachment = models.FileField(upload_to = getToolsFilePath , null = False)
    fileID = models.CharField(max_length = 100, null = False)
    # this is a hashed indentifier for this file
    account = models.ForeignKey(ApiAccount , related_name='files', null = True)

class OcrModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    baseValue = models.TextField(null = True)
    ocrValue = models.TextField(null = True)
    userValue = models.TextField(null = True)
