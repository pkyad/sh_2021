from django.db import models
from django.contrib.auth.models import User, Group
from time import time
from django.utils import timezone
import datetime
from allauth.socialaccount.signals import social_account_added
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.contrib import admin
# from organization.models import *

def getAnnouncementFilePath(instance , filename):
    return 'HR/doc/announcements/%s_%s__%s' % (str(time()).replace('.', '_'), instance.createdUser.username, filename)
def getSignaturesPath(instance , filename):
    return 'HR/images/Sign/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getDisplayPicturePath(instance , filename):
    return 'HR/images/DP/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getIDPhotoPath(instance , filename ):
    return 'HR/images/ID/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getTNCandBondPath(instance , filename ):
    return 'HR/doc/TNCBond/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getResumePath(instance , filename ):
    return 'HR/doc/Resume/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getCertificatesPath(instance , filename ):
    return 'HR/doc/Cert/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getTranscriptsPath(instance , filename ):
    return 'HR/doc/Transcripts/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getOtherDocsPath(instance , filename ):
    return 'HR/doc/Others/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)
def getResignationDocsPath(instance , filename):
    return 'HR/doc/resignation/%s_%s' % (str(time()).replace('.', '_'), filename)
def getVehicleRegDocsPath(instance , filename):
    return 'HR/doc/vehicleRegistration/%s_%s' % (str(time()).replace('.', '_'), filename)
def getAppointmentAcceptanceDocsPath(instance , filename):
    return 'HR/doc/appointmentAcceptance/%s_%s' % (str(time()).replace('.', '_'), filename)
def getPANDocsPath(instance , filename):
    return 'HR/doc/pan/%s_%s' % (str(time()).replace('.', '_'), filename)
def getDrivingLicenseDocsPath(instance , filename):
    return 'HR/doc/drivingLicense/%s_%s' % (str(time()).replace('.', '_'), filename)
def getChequeDocsPath(instance , filename):
    return 'HR/doc/cheque/%s_%s' % (str(time()).replace('.', '_'), filename)
def getPassbookDocsPath(instance , filename):
    return 'HR/doc/passbook/%s_%s' % (str(time()).replace('.', '_'), filename)


class Document(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    issuedBy = models.ForeignKey(User , related_name='certificatesIssued')
    description = models.CharField(max_length=400, blank=False)
    issuedTo = models.CharField(max_length=400, blank=False)
    passKey = models.CharField(max_length = 4, blank = False)
    email = models.CharField(max_length = 35, blank = False)
    docID = models.CharField(max_length = 10 , blank = True)
    app = models.CharField(max_length = 20 , blank = True)

    def __str__(self):
        return "%s : %s" %(self.issuedTo , self.description)

admin.site.register(Document)

KEY_CHOICES = (
    ('hashed', 'hashed'),
    ('otp', 'otp')
)

class accountsKey(models.Model):
    user = models.ForeignKey(User , related_name='accountKey')
    activation_key = models.CharField(max_length=40, blank=True)
    key_expires = models.DateTimeField(default=timezone.now)
    keyType = models.CharField(max_length = 6 , default = 'hashed' , choices = KEY_CHOICES)

class SalaryGrade(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    title = models.CharField(max_length = 20 , null= True , blank=True)
    target = models.CharField(max_length = 20 , null= True , blank=True)

class profile(models.Model):
    user = models.OneToOneField(User)
    PREFIX_CHOICES = (
        ('NA' , 'NA'),
        ('Kumar' , 'Kumar'),
        ('Kumari' , 'Kumari'),
        ('Smt' , 'Smt'),
        ('Shri' ,'Shri'),
        ('Dr' ,'Dr'),
    )
    GENDER_CHOICES = (
        ('M' , 'Male'),
        ('F' , 'Female'),
        ('O' , 'Other'),
    )
    EMPLOYEE_TYPE_CHOICES = (
        ('full time' , 'full time'),
        ('part time' , 'part time'),
    )
    empID = models.PositiveIntegerField(unique = True , null = True)
    empType = models.CharField(choices = EMPLOYEE_TYPE_CHOICES , default = 'full time' , max_length = 40)
    displayPicture = models.ImageField(upload_to = getDisplayPicturePath)
    dateOfBirth = models.DateField( null= True )
    anivarsary = models.DateField( null= True )
    married = models.BooleanField(default = False)
    permanentAddressStreet = models.TextField(max_length = 100 , null= True , blank=True)
    permanentAddressCity = models.CharField(max_length = 15 , null= True , blank=True)
    permanentAddressPin = models.IntegerField(null= True ,  blank=True)
    permanentAddressState = models.CharField(max_length = 20 , null= True , blank=True)
    permanentAddressCountry = models.CharField(max_length = 20 , null= True , blank=True)
    sameAsLocal = models.BooleanField(default = False)
    localAddressStreet = models.TextField(max_length = 100 , null= True )
    localAddressCity = models.CharField(max_length = 15 , null= True )
    localAddressPin = models.IntegerField(null= True )
    localAddressState = models.CharField(max_length = 20 , null= True )
    localAddressCountry = models.CharField(max_length = 20 , null= True )
    prefix = models.CharField(choices = PREFIX_CHOICES , default = 'NA' , max_length = 4)
    gender = models.CharField(choices = GENDER_CHOICES , default = 'M' , max_length = 6)
    email = models.EmailField(max_length = 50)
    mobile = models.CharField(null = True , max_length = 14)
    emergency = models.CharField(null = True , max_length = 100) # supposed to be a "name:number" format
    website = models.URLField(max_length = 100 , null = True , blank = True)
    sign = models.FileField(upload_to = getSignaturesPath ,  null = True)
    IDPhoto = models.FileField(upload_to = getDisplayPicturePath ,  null = True) # aadhar
    TNCandBond = models.FileField(upload_to = getTNCandBondPath ,  null = True)
    resume = models.FileField(upload_to = getResumePath ,  null = True)
    certificates = models.FileField(upload_to = getCertificatesPath ,  null = True)
    transcripts = models.FileField(upload_to = getTranscriptsPath ,  null = True)
    otherDocs = models.FileField(upload_to = getOtherDocsPath ,  null = True , blank = True)
    resignation = models.FileField(upload_to = getResignationDocsPath ,  null = True , blank = True)
    vehicleRegistration = models.FileField(upload_to = getVehicleRegDocsPath ,  null = True , blank = True)
    appointmentAcceptance = models.FileField(upload_to = getAppointmentAcceptanceDocsPath ,  null = True , blank = True)
    pan = models.FileField(upload_to = getPANDocsPath ,  null = True , blank = True)
    drivingLicense = models.FileField(upload_to = getDrivingLicenseDocsPath ,  null = True , blank = True)
    cheque = models.FileField(upload_to = getChequeDocsPath ,  null = True , blank = True)
    passbook = models.FileField(upload_to = getPassbookDocsPath ,  null = True , blank = True)
    bloodGroup = models.CharField(max_length = 20 , null = True)
    almaMater = models.CharField(max_length = 100 , null = True)
    pgUniversity = models.CharField(max_length = 100 , null = True , blank = True)
    docUniversity = models.CharField(max_length = 100 , null = True , blank = True)
    fathersName = models.CharField(max_length = 100 , null = True)
    mothersName = models.CharField(max_length = 100 , null = True)
    wifesName = models.CharField(max_length = 100 , null = True , blank = True)
    childCSV = models.CharField(max_length = 100 , null = True , blank = True)
    note1 = models.TextField(max_length = 500 , null = True , blank = True)
    note2 = models.TextField(max_length = 500 , null = True , blank = True)
    note3 = models.TextField(max_length = 500 , null = True , blank = True)
    needPwdReset = models.BooleanField(default = False)
    loginFailureAttempt = models.IntegerField(default = 0)

User.profile = property(lambda u : profile.objects.get_or_create(user = u)[0])


class Team(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    manager = models.ForeignKey(User , related_name = "teamManager", null=True)
    title =  models.CharField(max_length = 100)

class designation(models.Model):

    user = models.OneToOneField(User)
    hrApprover = models.ForeignKey(User , related_name = "hrTo" , null=True)
    reportingTo = models.ForeignKey(User , related_name = "managing" , null=True)
    primaryApprover = models.ForeignKey(User, related_name = "approving" , null=True)
    secondaryApprover = models.ForeignKey(User , related_name = "alsoApproving" , null=True)
    team = models.ManyToManyField(Team , related_name='teamMembers' , blank = True)
    salaryGrade = models.ForeignKey(SalaryGrade , related_name = "sallary" , null=True)

User.designation = property(lambda u : designation.objects.get_or_create(user = u)[0])


@receiver(user_signed_up, dispatch_uid="user_signed_up")
def user_signed_up_(request, user, **kwargs):
    user.username = user.email+str(user.pk)
    user.save()


class Announcements(models.Model):
    created = models.DateField(auto_now_add = True)
    updated = models.DateField(auto_now=True)
    createdUser = models.ForeignKey(User , related_name = "announcementCreated")
    message = models.TextField(null= True , blank=True)
    fil = models.FileField(upload_to = getAnnouncementFilePath ,  null = True)
    toAll = models.BooleanField(default = False)
    toTeam = models.ForeignKey(Team ,null = True, related_name = "announcementTeam")
