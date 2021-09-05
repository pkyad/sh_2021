from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
# from gitweb.serializers import repoLiteSerializer
# from finance.models import CostCenter , ExpenseSheet , Account , ExpenseHeading
from django.db.models import Sum,Q
from datetime import datetime , timedelta
from ERP.models import service
from HR.models import Team
from HR.serializers import TeamSerializer
from django.core.exceptions import PermissionDenied,SuspiciousOperation

class OCRConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRConfig
        fields = ( 'pk' , 'name' , 'owner','grabs', 'width' , 'height')

class UserBasicDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ( 'pk' , 'username' , 'first_name','last_name')

class PlannerItemSerializer(serializers.ModelSerializer):

    companyName = serializers.SerializerMethodField()
    class Meta:
        model = PlannerItem
        fields = ( 'pk' , 'created' , 'teamLead','date', 'company' ,'location', 'name', 'description', 'timeZone', 'companyName' )
        # read_only_fields = ('company',)
    def get_companyName(self , obj):
        return obj.company.name

class mediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = media
        fields = ( 'pk', 'link' , 'attachment' , 'mediaType', 'name', 'user' , 'created')
        read_only_fields = ('fileName' ,'user',)
    def create(self , validated_data):
        m = media(**validated_data)
        m.name = validated_data['attachment'].name
        m.user = self.context['request'].user
        m.save()
        return m

class projectCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = projectComment
        fields = ( 'user' , 'text' , 'media')


class OCRConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = OCRConfig
        fields = ( 'name' , 'owner' , 'grabs', 'pk')


from django.db.models import Count,Sum, Max
import json


def projectStats(prj):
    filObj = FileUpload.objects.filter(project = prj,parent__isnull=True)
    totalFiles = filObj.count()
    reDoObjs = filObj.filter(qcComment__isnull=False)
    totalRecount = reDoObjs.count()
    if totalFiles>0:
        codingCt = round((filObj.filter(coded=True).count()/float(totalFiles))*100,2)
        qcCt = round((filObj.filter(checked=True).count()/float(totalFiles))*100,2)
        if totalRecount>0:
            reCodingCt = round((reDoObjs.filter(recoded=True).count()/float(totalRecount))*100,2)
            reQcCt = round((reDoObjs.filter(rechecked=True).count()/float(totalRecount))*100,2)
        else:
            reCodingCt = 0
            reQcCt = 0
        codingval = filObj.filter(coded=True).count()
        qcval = filObj.filter(status = 'approved').count()
        reCodingval = reDoObjs.filter(recoded=True).count()
        reQcval = reDoObjs.filter(rechecked=True).count()
    else:
        codingCt = 0
        qcCt = 0
        reCodingCt = 0
        reQcCt = 0
        codingval = 0
        qcval = 0
        reCodingval = 0
        reQcval = 0
    return {'coding':codingCt , 'recoding' : reCodingCt , 'qc': qcCt , 'reqc': reQcCt ,'totalFiles': totalFiles,'codingval':codingval , 'qcval' : qcval , 'reCodingval': reCodingval , 'reQcval': reQcval}


class projectLiteListSerializer(serializers.ModelSerializer):
    filesLength = serializers.SerializerMethodField()
    can_code = serializers.SerializerMethodField()
    can_recode = serializers.SerializerMethodField()
    can_qc = serializers.SerializerMethodField()
    can_reQc = serializers.SerializerMethodField()
    can_cc = serializers.SerializerMethodField()
    filesDetails = serializers.SerializerMethodField()

    class Meta:
        model = project
        fields = ('pk', 'title' , 'files' , 'status','filesLength', 'can_code', 'can_recode' , 'can_qc' , 'can_reQc', 'projectStart', 'can_cc', 'filesDetails', 'coding')
        read_only_fields = ('user', 'team',)


    def get_filesLength(self, obj):
        return FileUpload.objects.filter(project=obj,parent__isnull=True).count()

    def get_can_code(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.coderTeam in self.context['request'].user.designation.team.all()
    def get_can_recode(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reCoderTeam in self.context['request'].user.designation.team.all()
    def get_can_reQc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reQaTeam in self.context['request'].user.designation.team.all()
    def get_can_qc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.qaTeam in self.context['request'].user.designation.team.all()
    def get_can_cc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.ccTeam in self.context['request'].user.designation.team.all()
    def get_filesDetails(self , obj):
        return projectStats(obj)




class projectSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    # repos = repoLiteSerializer(many = True , read_only = True)
    comments = projectCommentSerializer(many = True , read_only = True)
    # costCenter = CostCenterLiteSerializer(many = False , read_only = True)
    # ourBoundInvoices = OutBoundInvoiceLiteSerializer(many = True , read_only = True)
    coderTeam = TeamSerializer(many = False , read_only = True)
    ccTeam = TeamSerializer(many = False , read_only = True)
    qaTeam = TeamSerializer(many = False , read_only = True)
    reCoderTeam = TeamSerializer(many = False , read_only = True)
    reQaTeam = TeamSerializer(many = False , read_only = True)
    totalCost = serializers.SerializerMethodField()
    filesLength = serializers.SerializerMethodField()
    fieldsLength = serializers.SerializerMethodField()
    can_code = serializers.SerializerMethodField()
    can_recode = serializers.SerializerMethodField()
    can_qc = serializers.SerializerMethodField()
    can_reQc = serializers.SerializerMethodField()
    can_cc = serializers.SerializerMethodField()
    timeData = serializers.SerializerMethodField()
    abbyImport = serializers.SerializerMethodField()
    projectEnd = serializers.SerializerMethodField()
    filesDetails = serializers.SerializerMethodField()

    class Meta:
        model = project
        fields = ('pk','dueDate', 'created' , 'title' , 'description' , 'files' , 'team', 'comments','user','budget','projectClosed','totalCost','company','coderTeam','qaTeam','reCoderTeam','reQaTeam' , 'ldd' , 'coding' , 'status', 'qaCanEdit','factor','filesLength','fieldsLength', 'can_code', 'can_recode' , 'can_qc' , 'can_reQc','timeData','archived','archivedUser','archivedDt','disabled','lddFilePath','abbyImport', 'projectStart', 'lddUploadedOn', 'ccTeam', 'can_cc', 'projectEnd', 'filesDetails', 'uploadingBreakFile')
        read_only_fields = ('user', 'team',)
    def create(self , validated_data):
        # print self.context['request'].data,'dataaaaaaaaaaa'
        p = project(**validated_data)
        p.user = self.context['request'].user
        # if 'costCenter' in self.context['request'].data:
        #     p.costCenter = CostCenter.objects.get(pk=int(self.context['request'].data['costCenter']))
        if 'company' in self.context['request'].data:
            p.company = service.objects.get(pk=int(self.context['request'].data['company']))
        if 'coderTeam' in self.context['request'].data:
            p.coderTeam = Team.objects.get(pk=int(self.context['request'].data['coderTeam']))
        if 'qaTeam' in self.context['request'].data:
            p.qaTeam = Team.objects.get(pk=int(self.context['request'].data['qaTeam']))
        if 'reCoderTeam' in self.context['request'].data:
            p.reCoderTeam = Team.objects.get(pk=int(self.context['request'].data['reCoderTeam']))
        if 'reQaTeam' in self.context['request'].data:
            p.reQaTeam = Team.objects.get(pk=int(self.context['request'].data['reQaTeam']))
        if 'ccTeam' in self.context['request'].data:
            p.ccTeam = Team.objects.get(pk=int(self.context['request'].data['ccTeam']))
        p.save()
        if 'team' in self.context['request'].data:
            for u in self.context['request'].data['team']:
                p.team.add(User.objects.get(pk=u))
        if 'files' in self.context['request'].data:
            for f in self.context['request'].data['files']:
                p.files.add(media.objects.get(pk = f))
        p.save()
        if 'cloningProject' in self.context['request'].data:
            fieldPks = ProjectFields.objects.filter(project__id=int(self.context['request'].data['cloningProject']))
            for i in fieldPks:
                i.pk = None
                i.project = p
                i.save()
            # print 'doneeee'
        return p
    def update(self, instance , validated_data):
        for key in ['dueDate' , 'title' , 'description','budget','projectClosed','status','factor','archived','archivedDt','status','disabled','lddFilePath' , 'qaCanEdit', 'lddUploadedOn' , 'projectStart' ]:
            try:
                setattr(instance , key , validated_data[key])
            except:
                # print "Error while saving " , key
                pass

        if 'archivedUser' in self.context['request'].data:
            instance.archivedUser = self.context['request'].user
        if 'coderTeam' in self.context['request'].data:
            instance.coderTeam = Team.objects.get(pk=int(self.context['request'].data['coderTeam']))
        if 'qaTeam' in self.context['request'].data:
            instance.qaTeam = Team.objects.get(pk=int(self.context['request'].data['qaTeam']))
        if 'reCoderTeam' in self.context['request'].data:
            instance.reCoderTeam = Team.objects.get(pk=int(self.context['request'].data['reCoderTeam']))
        if 'reQaTeam' in self.context['request'].data:
            instance.reQaTeam = Team.objects.get(pk=int(self.context['request'].data['reQaTeam']))
        if 'ccTeam' in self.context['request'].data:
            instance.ccTeam = Team.objects.get(pk=int(self.context['request'].data['ccTeam']))

        if 'files' in self.context['request'].data:
            instance.files.clear()
            for f in self.context['request'].data['files']:
                instance.files.add(media.objects.get(pk = f))
        if 'team' in self.context['request'].data:
            instance.team.clear()
            for u in self.context['request'].data['team']:
                instance.team.add(User.objects.get(pk=u))
        instance.save()
        return instance
    def get_totalCost(self, obj):
        try:
            expTotal = ProjectPettyExpense.objects.filter(project=obj).aggregate(tot=Sum('amount'))
            expTotal = expTotal['tot'] if expTotal['tot'] else 0
            return expTotal
        except:
            return 0
    def get_filesLength(self, obj):
        return FileUpload.objects.filter(project=obj,parent__isnull=True).count()
    def get_fieldsLength(self, obj):
        return ProjectFields.objects.filter(project=obj).count()
    def get_can_code(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.coderTeam in self.context['request'].user.designation.team.all()
    def get_can_recode(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reCoderTeam in self.context['request'].user.designation.team.all()
    def get_can_reQc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reQaTeam in self.context['request'].user.designation.team.all()
    def get_can_qc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.qaTeam in self.context['request'].user.designation.team.all()
    def get_can_cc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.ccTeam in self.context['request'].user.designation.team.all()
    def get_timeData(self , obj):
        fObjs = FileUpload.objects.filter(project = obj , parent__isnull = True)
        cTime = fObjs.aggregate(ct = Sum('codeTime'))['ct']
        cTime = cTime if cTime else 0
        qcTime = fObjs.aggregate(ct = Sum('qcTime'))['ct']
        qcTime = qcTime if qcTime else 0
        rcTime = fObjs.aggregate(ct = Sum('reCodeTime'))['ct']
        rcTime = rcTime if rcTime else 0
        rQcTime = fObjs.aggregate(ct = Sum('reQcTime'))['ct']
        rQcTime = rQcTime if rQcTime else 0
        return {'cTime':cTime,'qcTime':qcTime,'rcTime':rcTime,'rQcTime':rQcTime,'projTime':cTime+qcTime+rcTime+rQcTime}
    def get_abbyImport(self , obj):
        fieldsObjs = obj.projectfields.filter(Q(type='name')|Q(multi=True))
        if fieldsObjs.count()>0:
            return False
        else:
            return True
    def get_projectEnd(self , obj):
        return FileUpload.objects.filter(project = obj , parent__isnull = True).aggregate(Max('lastupdated'))
    def get_filesDetails(self , obj):
        return projectStats(obj)


class LDDAssignmentSerializer(serializers.ModelSerializer):
    json_files = serializers.SerializerMethodField()
    count_begin = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    class Meta:
        model = LDDAssignment
        fields = ('pk', 'created' , 'qc' , 'coder', 'folder' , 'files' , 'project' , 'count' , 'coded' , 'checked', 'output', 'qcOutput', 'json_files','count_begin', 'coderComment', 'codingStarted', 'qcStarted', 'updated', 'project_name', 'pagesCount')

    def get_json_files(self , obj):
        toReturn = []
        for fl in obj.files.split(','):
            toReturn.append({"fileName": fl , "count":1, "children":[]})

        return json.dumps(toReturn)
    def get_count_begin(self , obj):
        cnt = LDDAssignment.objects.filter(pk__lt = obj.pk , project = obj.project).aggregate(ct = Sum('count'))['ct']
        if cnt:
            return cnt
        else:
            return 0
        # return list(LDDAssignment.objects.filter(pk__lt = obj.pk , project = obj.project).aggregate(ct = Count('count')).values_list('ct',flat=True))[0]
    def get_project_name(self , obj):
        return obj.project.title

class projectLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = project
        fields = ('pk' , 'title', 'description','budget')

class projectDashboardLiteSerializer(serializers.ModelSerializer):
    files = mediaSerializer(many = True , read_only = True)
    can_code = serializers.SerializerMethodField()
    can_recode = serializers.SerializerMethodField()
    can_qc = serializers.SerializerMethodField()
    can_reQc = serializers.SerializerMethodField()
    can_cc = serializers.SerializerMethodField()
    class Meta:
        model = project
        fields = ('pk' , 'title', 'status', 'can_code', 'can_recode' , 'can_qc' , 'can_reQc', 'can_cc', 'coding', 'files')
    def get_can_code(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.coderTeam in self.context['request'].user.designation.team.all()
    def get_can_recode(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reCoderTeam in self.context['request'].user.designation.team.all()
    def get_can_reQc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.reQaTeam in self.context['request'].user.designation.team.all()
    def get_can_qc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.qaTeam in self.context['request'].user.designation.team.all()
    def get_can_cc(self , obj):
        if self.context['request'].user.is_superuser:
            return True
        return obj.ccTeam in self.context['request'].user.designation.team.all()


class timelineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = timelineItem
        fields = ('pk','created' , 'user' , 'category' , 'text' , 'project' )
        read_only_fields = ('user',)
    def create(self , validated_data):
        i = timelineItem(**validated_data)
        req = self.context['request']
        i.user = req.user
        i.save()
        return i
    def update(self , instance , validated_data):
        raise PermissionDenied({'NOT_ALLOWED'})

class ProjectFieldsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFields
        fields = ( 'pk' ,'created' , 'name' , 'type', 'required' , 'default' , 'project' , 'dropOptions', 'prefix', 'fName', 'mName', 'lName','checkbox','switchh', 'case', 'maxLength', 'multi', 'multiSeperator', 'dateFormat','compName','nameFormat' , 'multiLimit', 'restrict', 'dynamicForm')
    def create(self , validated_data):
        p = ProjectFields(**validated_data)
        if 'project' in self.context['request'].data:
            p.project = project.objects.get(pk=int(self.context['request'].data['project']))
        p.save()
        return p

class DynamicFormSerializer(serializers.ModelSerializer):
    fields = ProjectFieldsSerializer(many = True , read_only = True)
    class Meta:
        model = DynamicForm
        fields = ( 'pk' ,'name' , 'fields' )
    def create(self , validated_data):
        p = DynamicForm(**validated_data)
        p.user = self.context['request'].user
        p.save()
        return p

class FileUploadLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ( 'pk' ,'created' , 'path' , 'order' ,'project','file','status','user','coderComment','qcComment','recoderComment','reqcComment','locked', 'coder' , 'qa', 'recoder' , 'reqa','codeTime','qcTime','reCodeTime','reQcTime', 'relocked')

from rest_framework.response import Response
from rest_framework.exceptions import APIException
import pytz
import traceback , sys

class NoDataToReturn(APIException):
    status_code = 200
    default_detail = 'NoDataToReturn'
    default_code = 'NoDataToReturn'


class FileUploadSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    coder = UserBasicDataSerializer(many = False , read_only = True)
    qa = UserBasicDataSerializer(many = False , read_only = True)
    recoder = UserBasicDataSerializer(many = False , read_only = True)
    reqa = UserBasicDataSerializer(many = False , read_only = True)
    class Meta:
        model = FileUpload
        fields = ( 'pk' ,'created' , 'path' , 'order' ,'project','file','status','user','coderComment','qcComment','recoderComment','reqcComment','locked', 'coder' , 'qa', 'recoder' , 'reqa','children','codeTime','qcTime','reCodeTime','reQcTime','parent', 'relocked')

    def get_children(self , obj):
        return FileUploadLiteSerializer(obj.children.all().order_by('pk') , many = True).data

    def create(self , validated_data):
        f = FileUpload(**validated_data)
        f.project = project.objects.get(pk=int(self.context['request'].data['project']))
        f.save()
        return f

    def update(self ,instance, validated_data):
        for key in ['status','coderComment','qcComment','recoderComment','reqcComment','order','locked' , 'coded' ,'relocked', 'recoded' , 'checklocked','checked', 'rechecklocked' , 'rechecked','skiped','mistake','serverPath','codeTime','qcTime','reCodeTime','reQcTime' ]:
            tz = pytz.timezone('Asia/Kolkata')
            userTimeStamp = "-%s"%(self.context['request'].user.first_name )
            # userTimeStamp = "-%s@%s"%(self.context['request'].user.first_name ,  (datetime.now()+ timedelta(minutes = 330)).strftime("%I:%M%p-%B %d, %Y") )
            try:
                if key == 'qcComment' and key in self.context['request'].data:
                    if instance.qcComment is None:
                        instance.qcComment = ""
                    setattr(instance , key , instance.qcComment + '||' + self.context['request'].data[key] + userTimeStamp )
                elif key == 'coderComment' and key in self.context['request'].data:
                    if instance.coderComment is None:
                        instance.coderComment = ""
                    setattr(instance , key , instance.coderComment + '||' + self.context['request'].data[key] + userTimeStamp )
                elif key == 'recoderComment' and key in self.context['request'].data:
                    if instance.recoderComment is None:
                        instance.recoderComment = ""
                    setattr(instance , key , instance.recoderComment + '||' + self.context['request'].data[key] + userTimeStamp )
                elif key == 'reqcComment' and key in self.context['request'].data:
                    if instance.reqcComment is None:
                        instance.reqcComment = ""
                    setattr(instance , key , instance.reqcComment + '||' + self.context['request'].data[key] + userTimeStamp )
                else:
                    # pass
                    setattr(instance , key , self.context['request'].data[key])
            except:
                traceback.print_exc(file=sys.stdout)
        if 'user' in self.context['request'].data:
            user = User.objects.get(pk = self.context['request'].data['user'])
            instance.user = user
        if 'updateCoderVal' in self.context['request'].data:
            if instance.coder is not None and instance.coder != self.context['request'].user:
                raise PermissionDenied({'NOT_ALLOWED'})
            instance.coder = self.context['request'].user
        if 'updateqaVal' in self.context['request'].data:
            instance.qa = self.context['request'].user
        if 'updaterecodingVal' in self.context['request'].data:
            instance.recoder = self.context['request'].user
        if 'updatereqaVal' in self.context['request'].data:
            instance.reqa = self.context['request'].user

        if 'completeData' in self.context['request'].data:
            # projectObj = instance.project
            FieldValue.objects.filter(file = instance).delete()
            for fv in self.context['request'].data['completeData']:
                # fi =  instance
                # field =  ProjectFields.objects.get(pk= fv['field'] )

                f = FieldValue(**{'file':instance,'field':ProjectFields.objects.get(pk= fv['field'] ),'project':instance.project})
                for key in ['dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','number','needCorrection','compName','reCodedField', 'order' , 'showDelete', 'miltiIndex', 'dtMode']:
                    try:
                        setattr(f , key , fv[key])
                    except:
                        pass
                f.lastModifiedBy = self.context['request'].user

                stg = self.context['request'].META.get('HTTP_REFERER', '')
                if '/coder/' in stg:
                    f.lastStage = 'coding'
                elif '/qa/' in stg:
                    f.lastStage = 'QC'
                elif '/recoder/' in stg:
                    f.lastStage = 'Recoding'
                elif '/reqa/' in stg:
                    f.lastStage = 'ReQC'

                f.save()

        if 'toReject' in self.context['request'].data:
            FieldValue.objects.filter(file = instance).update(needCorrection = False)
            FieldValue.objects.filter(pk__in = self.context['request'].data['toReject']).update(needCorrection = True)

        if 'fieldsValArr' in self.context['request'].data:
            stg = self.context['request'].META.get('HTTP_REFERER', '')
            for eva in self.context['request'].data['fieldsValArr']:
                if 'pk' in eva:
                    # print "update values"
                    f = FieldValue.objects.get( pk = eva['pk'] )
                else:
                    f = FieldValue(**{'file':instance,'field':ProjectFields.objects.get(pk= eva['field']) ,'project':instance.project})
                    # print "Create a new record"

                for key in ['dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','number','needCorrection','compName','reCodedField', 'order' , 'showDelete', 'miltiIndex', 'dtMode']:
                    try:
                        setattr(f , key , eva[key])
                    except:
                        pass
                f.lastModifiedBy = self.context['request'].user


                if '/coder/' in stg:
                    f.lastStage = 'coding'
                elif '/qa/' in stg:
                    f.lastStage = 'QC'
                elif '/recoder/' in stg:
                    f.lastStage = 'Recoding'
                elif '/reqa/' in stg:
                    f.lastStage = 'ReQC'

                f.save()

        instance.save()

        raise NoDataToReturn()
        # return Response({}, status=status.HTTP_200_OK)

        # return instance




class FieldValueSerializer(serializers.ModelSerializer):
    field = ProjectFieldsSerializer(many = False , read_only = True)
    class Meta:
        model = FieldValue
        fields = ( 'pk' ,'created' , 'field' ,'project', 'dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','file','number', 'needCorrection','compName','reCodedField' , 'order' , 'showDelete' , 'miltiIndex', 'dtMode' )
    def create(self , validated_data):
        projectObj = project.objects.get(pk=int(self.context['request'].data['project']))
        fi =  FileUpload.objects.get(pk=int(self.context['request'].data['file']))
        field =  ProjectFields.objects.get(pk=int(self.context['request'].data['field']))
        f = FieldValue(**{'file':fi,'field':field,'project':projectObj})
        for key in ['dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','number','needCorrection','compName','reCodedField', 'order' , 'showDelete', 'miltiIndex', 'dtMode']:
            try:
                setattr(f , key , validated_data[key])
            except:
                pass
        f.lastModifiedBy = self.context['request'].user

        stg = self.context['request'].META.get('HTTP_REFERER', '')
        if '/coder/' in stg:
            f.lastStage = 'coding'
        elif '/qa/' in stg:
            f.lastStage = 'QC'
        elif '/recoder/' in stg:
            f.lastStage = 'Recoding'
        elif '/reqa/' in stg:
            f.lastStage = 'ReQC'

        f.save()
        return f
    def update(self ,instance, validated_data):
        # print validated_data
        for key in ['dt' , 'dtTime','bool', 'char' , 'txt','fname','lname', 'mName' , 'prefix','email','number','needCorrection','compName','reCodedField', 'order' , 'showDelete', 'miltiIndex', 'dtMode']:
            # setattr(instance , key , None)
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        instance.lastModifiedBy = self.context['request'].user
        instance.saveCount +=1


        stg = self.context['request'].META.get('HTTP_REFERER', '')
        if '/coder/' in stg:
            instance.lastStage = 'coding'
        elif '/qa/' in stg:
            instance.lastStage = 'QC'
        elif '/recoder/' in stg:
            instance.lastStage = 'Recoding'
        elif '/reqa/' in stg:
            instance.lastStage = 'ReQC'

        instance.save()
        return instance


class FieldHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FieldHistory
        fields = ( 'pk' ,'created' , 'value', 'user' ,'fieldType' , 'fieldName' , 'post' , 'field' , 'saveCount' , 'stage')


class FileUploadTracerSerializer(serializers.ModelSerializer):
    history = FieldHistorySerializer(many = True , read_only = True)
    class Meta:
        model = FileUpload
        fields = ( 'pk' ,'created' , 'path', 'history', 'project' )
