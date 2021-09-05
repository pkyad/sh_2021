from __future__ import unicode_literals

from django.contrib.auth.models import *
from django.db import models
import datetime
import django.utils.timezone
from django.db.models.signals import post_save , pre_delete
from django.dispatch import receiver
import requests
from django.conf import settings as globalSettings
# Create your models here.
from time import time
from HR.models import Team
from ERP.models import service
# from finance.models import CostCenter , ExpenseSheet , Account , ExpenseHeading , OutBoundInvoice
# from clientRelationships.models import ProductMeta


def getProjectsUploadsPath(instance , filename ):
    return 'projects/doc/%s_%s_%s' % (str(time()).replace('.', '_'), instance.user.username, filename)

def getcontentFilePath(instance , filename ):
    return 'projects/issue/%s_%s__%s' % (str(time()).replace('.', '_'), instance.title, filename)

def getPettyCashInvoicePath(instance , filename ):
    return 'projects/pettyExpense/%s_%s__%s__%s' % (str(time()).replace('.', '_'), instance.heading.title,instance.project.title, filename)

def getUploadFilePath(instance , filename ):
    return 'projects/fileUpload/%s_%s__%s' % (str(time()).replace('.', '_'), instance.created, filename)


MEDIA_TYPE_CHOICES = (
    ('onlineVideo' , 'onlineVideo'),
    ('video' , 'video'),
    ('image' , 'image'),
    ('onlineImage' , 'onlineImage'),
    ('doc' , 'doc'),
)

class media(models.Model):
    """
    Stores a multimedia file of various types.
    """
    user = models.ForeignKey(User , related_name = 'projectsUploads' , null = False)
    created = models.DateTimeField(auto_now_add = True)
    link = models.TextField(null = True , max_length = 300) # can be youtube link or an image link
    attachment = models.FileField(upload_to = getProjectsUploadsPath , null = True ) # can be image , video or document
    mediaType = models.CharField(choices = MEDIA_TYPE_CHOICES , max_length = 10 , default = 'image')
    name = models.CharField(max_length = 100 , null = True)

class comment(models.Model):
    created = models.DateTimeField (auto_now_add = True,null = True)
    user = models.ForeignKey(User, null = False , related_name='projectsComment')
    text = models.TextField(max_length=200 , null=True)
    media = models.ForeignKey(media , null = True)

PROJECT_STATUS_CHOICES = (
    ('created' , 'created'),
    ('lddInProgress' , 'lddInProgress'),
    ('lddQCInProgress' , 'lddQCInProgress'),
    ('lddReInProgress' , 'lddReInProgress'),
    ('lddReQCInProgress' , 'lddReQCInProgress'),
    ('coding' , 'coding'),
    ('qc' , 'qc'),
    ('recoding' , 'recoding'),
    ('reqc' , 'reqc'),
    ('complete' , 'complete'),
)

class project(models.Model):
    user = models.ForeignKey(User , null = False , related_name='projectsInitiated') # the creator
    dueDate = models.DateTimeField(null = True)
    created = models.DateTimeField (auto_now_add = True)
    title = models.CharField(blank = False , max_length = 200)
    description = models.TextField(max_length=2000 , blank=False)
    files = models.ManyToManyField(media , related_name='projects')
    team = models.ManyToManyField(User , related_name = 'projectsInvolvedIn')
    budget = models.PositiveIntegerField(default=0)
    projectClosed = models.BooleanField(default = False)
    company = models.ForeignKey(service , related_name = 'projects',null=True)
    coderTeam =  models.ForeignKey(Team , models.SET_NULL, blank= True, null = True , related_name='codersTeam')
    qaTeam =  models.ForeignKey(Team ,models.SET_NULL, blank= True,  null = True , related_name='qualityassTeam')
    reCoderTeam =  models.ForeignKey(Team ,models.SET_NULL, blank= True,  null = True , related_name='reCodersTeam')
    reQaTeam =  models.ForeignKey(Team ,models.SET_NULL, blank= True,  null = True , related_name='reQualityassTeam')
    ccTeam =  models.ForeignKey(Team ,models.SET_NULL, blank= True,  null = True , related_name='ccTeam')
    qaCanEdit = models.BooleanField(default = False)
    status = models.CharField(choices = PROJECT_STATUS_CHOICES , default = 'created' , max_length = 50)
    ldd = models.BooleanField(default = True)
    coding = models.BooleanField(default = True)
    factor = models.FloatField(default=1)
    archived = models.BooleanField(default = False)
    archivedUser = models.ForeignKey(User , null = True , related_name='archivedUser')
    archivedDt = models.DateTimeField(null = True)
    disabled = models.BooleanField(default = False)
    lddFilePath = models.CharField(null=True,blank=True , max_length = 200)
    lddUploadedOn = models.DateTimeField(null = True)
    projectStart = models.DateTimeField(null = True)
    uploadingBreakFile = models.BooleanField(default = False)


class projectComment(comment):
    project = models.ForeignKey(project , null= False , related_name='comments')

TIMELINE_ITEM_CATEGORIES = (
    ('message' , 'message'),
    ('file' , 'file'),
    ('system' , 'system'),
)

class timelineItem(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    user =  models.ForeignKey(User , null = True, related_name='projectsTimelineItems')
    category = models.CharField(choices = TIMELINE_ITEM_CATEGORIES , max_length = 50 , default = 'message')
    project = models.ForeignKey(project , null = False)
    text = models.TextField(max_length=2000 , null=True)





#--------------------------projects issues model --====-=-=-=-=-=-=-=-=-

ISSUES_ITEM_PRIORITY = (
    ('high', 'high'),
    ('medium', 'medium'),
    ('low', 'low'),
)
ISSUES_ITEM_RESULT = (
    ('resolved','resolved'),
    ('partial','partial'),
    ('parked','parked'),
)
ISSUES_ITEM_STATUS = (
    ('inprogress','inprogress'),
    ('created','created'),
    ('resolved','resolved'),
    ('stuck','stuck'),

)

class LDDAssignment(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    qc = models.ForeignKey(User , related_name='lddqaAssignments' , null = True)
    coder = models.ForeignKey(User , related_name='lddcoderAssignments' , null = True)
    folder = models.CharField(max_length = 100 , null = True)
    files = models.TextField(max_length = 100000 , null = True)
    project = models.ForeignKey(project , related_name='lddAssignments' , null = False)
    count = models.PositiveIntegerField(default = 0)
    output = models.TextField(max_length = 100000 , null = True) #json array with parent and child relationships
    qcOutput = models.TextField(max_length = 100000 , null = True) #json array with parent and child relationships
    coded = models.BooleanField(default = False)
    checked = models.BooleanField(default = False)
    comment = models.CharField(max_length = 100 , null = True)
    coderComment =  models.CharField(max_length = 200 , null = True)
    codingStarted = models.BooleanField(default = False)
    qcStarted = models.BooleanField(default = False)
    updated = models.DateTimeField(auto_now=True)
    pagesCount = models.PositiveIntegerField(null = True)
    class Meta:
        unique_together = ('project', 'folder',)

TYPE_CHOICES = (
    ('name' , 'name'),
    ('email' , 'email'),
    ('text' , 'text'),
    ('date' , 'date'),
    ('boolean' , 'boolean'),
    ('dropdown' , 'dropdown'),
    ('datetime', 'datetime'),
    ('number', 'number'),
    ('smallText', 'smallText'),
)

CASE_CHOICES = (
    ('ANY_CASE' , 'ANY_CASE'),
    ('UPPER_CASE' , 'UPPER_CASE'),
    ('CAMEL_CASE' , 'CAMEL_CASE'),
    ('LOWER_CASE' , 'LOWER_CASE'),
    ('GENERAL' , 'GENERAL'),
)


class DynamicForm(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 100 , null = True)
    user =  models.ForeignKey(User , null = False, related_name='dynamicForms')




class ProjectFields(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length = 100 , null = True)
    type = models.CharField(default = 'created',max_length = 30 ,choices = TYPE_CHOICES)
    required = models.BooleanField(default = False)
    default = models.CharField(max_length = 100 , null = True,blank=True)
    project = models.ForeignKey(project , related_name='projectfields' , null = True)
    dropOptions = models.CharField(max_length = 4000 , null = True)
    prefix = models.BooleanField(default = False)
    fName = models.BooleanField(default = False)
    mName = models.BooleanField(default = False)
    lName = models.BooleanField(default = False)
    compName = models.BooleanField(default = False)
    checkbox = models.BooleanField(default = False)
    switchh = models.BooleanField(default = False)
    case = models.CharField(max_length = 50 , choices = CASE_CHOICES , default = "ANY_CASE")
    maxLength = models.PositiveIntegerField(default = 100)
    multi = models.BooleanField(default = False)
    multiSeperator = models.CharField(null = True , max_length = 10)
    multiLimit = models.PositiveIntegerField(default = 10)
    dateFormat = models.CharField(max_length = 100 , null = True , default = '%d-%m-%Y')
    nameFormat = models.CharField(max_length = 50 , null = True,blank=True)
    restrict = models.CharField(max_length = 200 , blank = True , null = True , default = "")
    dynamicForm = models.ForeignKey(DynamicForm , null = True , related_name='fields')

CHOICES_STATUS = (
  ('created' , 'created'),
  ('approved' , 'approved'),
  ('rejected' , 'rejected'),
  ('coded' , 'coded'),
  ('checked' , 'checked'),
  ('revised' , 'revised'),
)

class FileUpload(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    path = models.CharField(max_length = 300, null = True)
    order = models.PositiveIntegerField(null = True)
    project = models.ForeignKey(project , related_name='projectfiles' , null = True)
    file = models.FileField(upload_to = getUploadFilePath ,  null = True)
    status = models.CharField(default = 'created',max_length = 30 ,choices = CHOICES_STATUS)
    user = models.ForeignKey(User , related_name='filescompltedbyuser' , null = True)
    parent = models.ForeignKey("self" , related_name="children" , null = True)
    parentName = models.CharField(max_length = 300, null = True)
    locked = models.BooleanField(default = False)
    coded = models.BooleanField(default = False)
    relocked = models.BooleanField(default = False)
    recoded = models.BooleanField(default = False)
    checklocked = models.BooleanField(default = False)
    checked = models.BooleanField(default = False)
    rechecklocked = models.BooleanField(default = False)
    rechecked = models.BooleanField(default = False)
    skiped = models.BooleanField(default = False)
    coder = models.ForeignKey(User , related_name='codedDocs' , null = True)
    recoder = models.ForeignKey(User , related_name='recodedDocs' , null = True)
    qa = models.ForeignKey(User , related_name='checkedDocs' , null = True)
    reqa = models.ForeignKey(User , related_name='recheckedDocs' , null = True)
    mistake = models.BooleanField(default = False)
    serverPath = models.CharField(null = True , max_length = 100)
    attachment = models.ForeignKey("self" , related_name="filechildren" , null = True)
    codeTime = models.PositiveIntegerField(default=0)
    qcTime = models.PositiveIntegerField(default=0)
    reCodeTime = models.PositiveIntegerField(default=0)
    reQcTime = models.PositiveIntegerField(default=0)
    coderComment = models.TextField(max_length = 500, null = True , blank=True)
    qcComment = models.TextField(max_length = 500, null = True , blank=True)
    recoderComment = models.TextField(max_length = 500, null = True , blank=True)
    reqcComment = models.TextField(max_length = 500, null = True , blank=True)
    lastupdated = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ('order',)


class FieldValue(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    project = models.ForeignKey(project, related_name='project' , null = False)
    field = models.ForeignKey(ProjectFields, related_name='projectfields' , null = False )
    dt = models.DateField(null = True, blank=True)
    dtTime = models.DateTimeField(null = True, blank=True)
    bool = models.BooleanField(default = False)
    char = models.CharField(max_length = 1000 , null = True , blank = True)
    email = models.CharField(max_length = 200 , null = True , blank = True)
    number = models.FloatField(max_length = 20 , null = True)
    txt = models.TextField(max_length=5000 , null = True, blank=True)
    fname = models.CharField(max_length = 200 , null = True , blank = True)
    lname = models.CharField(max_length = 200 , null = True , blank = True)
    mName = models.CharField(max_length = 200 , null = True , blank = True)
    compName = models.CharField(max_length = 200 , null = True , blank = True)
    prefix = models.CharField(max_length = 20 , null = True , blank = True)
    file = models.ForeignKey(FileUpload, related_name='filedValues' , null = False)
    needCorrection = models.BooleanField(default = False)
    lastEdited = models.ForeignKey(User , related_name='lastModifiedFields' , null = True)
    posx = models.PositiveIntegerField(null = True)
    posy = models.PositiveIntegerField(null = True)
    posw = models.PositiveIntegerField(null = True)
    posh = models.PositiveIntegerField(null = True)
    img = models.TextField(max_length = 100000 , null = True)
    ocrResult = models.TextField(max_length= 500 , null = True)
    handWritten = models.BooleanField(default = False)
    reCodedField = models.BooleanField(default = False)
    showDelete = models.BooleanField(default = False)
    order = models.PositiveIntegerField(default = 0)
    miltiIndex = models.PositiveIntegerField(default = 0)
    lastModifiedBy = models.ForeignKey(User , related_name='recentlyModifiedFiles' , null = True)
    lastStage = models.CharField(max_length = 10 , null = True)
    saveCount = models.PositiveIntegerField(default = 0)
    dtMode = models.CharField(default = 'fullDate' , max_length = 15)

from rest_framework import serializers
class FieldValueLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldValue
        fields = ( 'pk' ,'created', 'dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','number', 'needCorrection','compName','reCodedField', 'dtMode')

class FieldHistory(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    project = models.ForeignKey(project, related_name='project_fieldshistory' , null = False)
    field = models.ForeignKey(ProjectFields, related_name='projectfields_fieldshistory' , null = False )
    value = models.TextField( max_length=5000 , null = False)
    user = models.ForeignKey(User , related_name='user_entry_history' , null = False )
    parent = models.ForeignKey(FileUpload, related_name='history' , null = True)
    post = models.BooleanField(default = True)
    fieldType = models.CharField(null = True , max_length = 20)
    fieldName = models.CharField(null = True , max_length = 100)
    needCorrection = models.BooleanField(default = False)
    stage = models.CharField(null = True , max_length = 10)
    saveCount = models.PositiveIntegerField(default = 0)

@receiver(post_save, sender=FieldValue, dispatch_uid="server_post_save")
def createFieldValueHistory(sender, instance, **kwargs):
    typ = instance.field.type
        # ('name' , 'name'),
        # ('email' , 'email'),
        # ('text' , 'text'),
        # ('date' , 'date'),
        # ('boolean' , 'boolean'),
        # ('dropdown' , 'dropdown'),
        # ('datetime', 'datetime'),
        # ('number', 'number'),
        # ('smallText', 'smallText'),
    if typ == 'name':
        nameArr = []
        if instance.prefix is None:
            nameArr.append('')
        else:
            nameArr.append(instance.prefix)
        if instance.fname is None:
            nameArr.append('')
        else:
            nameArr.append(instance.fname)
        if instance.mName is None:
            nameArr.append('')
        else:
            nameArr.append(instance.mName)
        if instance.lname is None:
            nameArr.append('')
        else:
            nameArr.append(instance.lname)

        if instance.compName is None:
            nameArr.append('')
        else:
            nameArr.append(instance.compName)

        val = '|'.join(nameArr)

    elif typ == 'email':
        val = instance.email
    elif typ == 'text':
        val = instance.txt
    elif typ == 'date' and instance.dt is not None:
        try:
            val = instance.dt.strftime("%x")
        except:
            val = instance.dt
    elif typ == 'boolean':
        if instance.bool:
            val = 'Yes'
        else:
            val = 'No'
    elif typ == 'dropdown':
        val = instance.char
    elif typ == 'datetime' and instance.dtTime is not None:
        try:
            val = instance.dtTime.strftime('%c')
        except:
            val = instance.dtTime
    elif typ == 'number':
        val = str(instance.number)
    else:
        val = instance.char

    if val is None:
        val = ""

    fh = FieldHistory(value = val , project = instance.project , field = instance.field , parent = instance.file , user = instance.lastModifiedBy , fieldType = typ, fieldName =  instance.field.name , needCorrection = instance.needCorrection , stage = instance.lastStage , saveCount = instance.saveCount )
    fh.post = kwargs['created']
    fh.save()
    pass


class PlannerItem(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    teamLead = models.ForeignKey(User , related_name='planner_items' , null = False )
    date = models.DateTimeField(null = True, blank=True)
    company = models.ForeignKey(service , related_name='planner_items' , null = False )
    location = models.CharField(max_length = 20 , null = False)
    name = models.CharField(max_length = 200 , null = False)
    description = models.CharField(max_length = 1000 , null = False , blank = True)
    timeZone = models.CharField(max_length = 20 , null = False)

class OCRConfig(models.Model):
    name = models.CharField(max_length = 200 , null = False)
    owner = models.ForeignKey(User , related_name='ocrConfigs' , null = False )
    created = models.DateTimeField(auto_now_add=True)
    grabs = models.TextField(max_length=10000 , blank = True , null = True)
    width = models.CharField(max_length = 10 , null = True)
    height = models.CharField(max_length = 10 , null = True)
