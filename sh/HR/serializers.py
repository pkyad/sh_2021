
from django.contrib.auth.models import User , Group
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import *
from .models import *
from PIM.serializers import *
# from organization.serializers import *
import datetime
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.core.mail import send_mail, EmailMessage
from projects.models import project
from django.db.models import Q

class userProfileLiteSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    class Meta:
        model = profile
        fields = ('displayPicture' , 'prefix' ,'pk','mobile','empID' )

class userSearchSerializer(serializers.ModelSerializer):
    # to be used in the typehead tag search input, only a small set of fields is responded to reduce the bandwidth requirements
    profile = userProfileLiteSerializer(many=False , read_only=True)
    class Meta:
        model = User
        fields = ( 'pk', 'username' , 'first_name' , 'last_name' , 'profile' , 'designation' )

class SalaryGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryGrade
        fields=('pk','created','title','target')

class TeamLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields=('pk','created','manager','title')

class TeamSerializer(serializers.ModelSerializer):
    manager = userSearchSerializer(many=False , read_only=True)
    teamMembers = serializers.SerializerMethodField()
    completedProjects = serializers.SerializerMethodField()
    ongoingProjects = serializers.SerializerMethodField()
    class Meta:
        model = Team
        fields=('pk','created','manager','title','teamMembers','completedProjects','ongoingProjects')
        read_only_fields=('teamMembers',)
    def create(self , validated_data):
        t = Team(**validated_data)
        t.manager = User.objects.get(pk = self.context['request'].data['manager'])
        t.save()
        return t
    def update(self , instance , validated_data):
        if 'manager' in self.context['request'].data:
            instance.manager=User.objects.get(pk=self.context['request'].data['manager'])
        instance.save()
        return instance
    def get_teamMembers(self, obj):
        return designation.objects.filter(team=obj).values_list('user',flat=True)
    def get_completedProjects(self, obj):
        return project.objects.filter(Q(coderTeam=obj) | Q(qaTeam=obj) | Q(reCoderTeam=obj) | Q(reQaTeam=obj),status='complete').count()
    def get_ongoingProjects(self, obj):
        return project.objects.filter(Q(coderTeam=obj) | Q(qaTeam=obj) | Q(reCoderTeam=obj) | Q(reQaTeam=obj)).exclude(Q(status='created')|Q(status='complete')).count()

class salaryGradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalaryGrade
        fields = ('pk','title','target')


class userDesignationSerializer(serializers.ModelSerializer):
    # division = DivisionLiteSerializer(many = False , read_only = True)
    # unit = UnitsLiteSerializer(many = False , read_only = True)
    # department = DepartmentsSerializer(many = False , read_only = True)
    # role = RoleSerializer(many = False , read_only = True)
    team = TeamSerializer(many = True , read_only = True)
    salaryGrade = salaryGradeSerializer(many = False , read_only = True)
    class Meta:
        model = designation
        fields = ('pk' , 'user','reportingTo' ,'hrApprover', 'primaryApprover' , 'secondaryApprover' ,'team','salaryGrade')
        read_only_fields=('user',)
        def create(self , validated_data):
            d = designation()
            d.user=User.objects.get(pk=self.context['request'].user)
            d.reportingTo=User.objects.get(pk=self.context['request'].data['reportingTo'])
            d.hrApprover=User.objects.get(pk=self.context['request'].data['hrApprover'])
            d.primaryApprover=User.objects.get(pk=self.context['request'].data['primaryApprover'])
            d.secondaryApprover=User.objects.get(pk=self.context['request'].data['secondaryApprover'])
            # d.division=Division.objects.get(pk=self.context['request'].data['division'])
            # d.unit=Unit.objects.get(pk=self.context['request'].data['unit'])
            # d.department=Departments.objects.get(pk=self.context['request'].data['department'])
            # d.role=Role.objects.get(pk=self.context['request'].data['role'])
            # d.salaryGrade = SalaryGrade.objects.get(pk=self.context['request'].data['salaryGrade'])
            d.save()
            return d
    def update(self , instance , validated_data):
        for key in ['pk' , 'user', 'reportingTo' , 'hrApprover','primaryApprover' , 'secondaryApprover' ,'division' ,'unit' ,'department' ,'role','salaryGrade']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass
        if 'division' in self.context['request'].data:
            instance.division=Division.objects.get(pk=self.context['request'].data['division'])
        if 'unit' in self.context['request'].data:
            instance.unit=Unit.objects.get(pk=self.context['request'].data['unit'])
        if 'department' in self.context['request'].data:
            instance.department=Departments.objects.get(pk=self.context['request'].data['department'])
        if 'role' in self.context['request'].data:
            instance.role=Role.objects.get(pk=self.context['request'].data['role'])
        if 'salaryGrade' in self.context['request'].data:
            instance.salaryGrade = SalaryGrade.objects.get(pk=self.context['request'].data['salaryGrade'])
        if 'team' in self.context['request'].data:
            print self.context['request'].data['team'],'teammmmmmmmmm'
            if 'deleteTeam' in self.context['request'].data:
                instance.team.remove(Team.objects.get(pk=int(self.context['request'].data['team'])))
            elif 'addOne' in self.context['request'].data:
                instance.team.add(Team.objects.get(pk=int(self.context['request'].data['team'])))
            else:
                instance.team.clear()
                for t in self.context['request'].data['team']:
                    instance.team.add(Team.objects.get(pk=int(t)))
        instance.save()
        return instance




class userProfileSerializer(serializers.ModelSerializer):
    """ allow all the user """
    class Meta:
        model = profile
        fields = ( 'pk' , 'mobile' , 'displayPicture' , 'website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' ,'email','gender','needPwdReset')
        read_only_fields = ('website' , 'prefix' , 'almaMater', 'pgUniversity' , 'docUniversity' , )

class userProfileAdminModeSerializer(serializers.ModelSerializer):
    """ Only admin """
    class Meta:
        model = profile
        fields = ( 'pk','empID', 'married', 'dateOfBirth' ,'displayPicture' , 'anivarsary' , 'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry','sameAsLocal',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry', 'prefix', 'gender' , 'email', 'mobile' , 'emergency' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV', 'resignation','vehicleRegistration', 'appointmentAcceptance','pan', 'drivingLicense','cheque','passbook',
        'note1' , 'note2' , 'note3', 'bloodGroup','empType','needPwdReset')
    def update(self , instance , validated_data):
        u = self.context['request'].user
        if not u.is_staff:
            raise PermissionDenied()

        for key in ['empID','married', 'dateOfBirth' , 'displayPicture' ,'anivarsary' ,'permanentAddressStreet' , 'permanentAddressCity' , 'permanentAddressPin', 'permanentAddressState' , 'permanentAddressCountry','sameAsLocal',
        'localAddressStreet' , 'localAddressCity' , 'localAddressPin' , 'localAddressState' , 'localAddressCountry', 'prefix', 'gender' , 'email', 'mobile' , 'emergency' , 'website',
        'sign', 'IDPhoto' , 'TNCandBond' , 'resume' ,  'certificates', 'transcripts' , 'otherDocs' , 'almaMater' , 'pgUniversity' , 'docUniversity' , 'fathersName' , 'mothersName' , 'wifesName' , 'childCSV', 'resignation','vehicleRegistration', 'appointmentAcceptance','pan', 'drivingLicense','cheque','passbook',
        'note1' , 'note2' , 'note3', 'bloodGroup','empType','needPwdReset']:
            try:
                setattr(instance , key , validated_data[key])
            except:
                pass

        instance.save()
        # instance.user.email = validated_data['email']
        instance.user.save()
        return instance



class userSerializer(serializers.ModelSerializer):
    profile = userProfileSerializer(many=False , read_only=True)
    # payroll = payrollLiteSerializer(many = False , read_only = True)
    teams = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ('pk' , 'username' , 'email' , 'first_name' , 'last_name' , 'designation' ,'settings' , 'password', 'is_superuser','is_active','profile','is_staff','teams')
        read_only_fields = ('designation' , 'profile' , 'settings' )
        extra_kwargs = {'password': {'write_only': True} }
    def create(self , validated_data):
        raise PermissionDenied(detail=None)
    def update (self, instance, validated_data):
        if 'is_staff' in self.context['request'].data:
            instance.is_staff = self.context['request'].data['is_staff']
        if 'is_active' in self.context['request'].data:
            instance.is_active = self.context['request'].data['is_active']
        instance.save()
        if 'oldPassword' in self.context['request'].data:
            user = self.context['request'].user
            if authenticate(username = user.username , password = self.context['request'].data['oldPassword']) is not None:
                user = User.objects.get(username = user.username)
                user.set_password(validated_data['password'])
                user.save()
            else :
                raise PermissionDenied(detail=None)
            return user
        else:
            return instance
    def get_teams(self, obj):
        return TeamLiteSerializer(obj.designation.team.all(),many = True).data

class userAdminSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ('url' , 'username' , 'email' , 'first_name' , 'last_name' , 'is_staff' ,'is_active','is_superuser' )
    def create(self , validated_data):
        if not self.context['request'].user.is_superuser:
            raise PermissionDenied(detail=None)
        user = User.objects.create(**validated_data)
        user.email = user.username + '@cioc.co.in'
        password =  self.context['request'].data['password']
        user.set_password(password)
        user.save()
        return user
    def update (self, instance, validated_data):
        user = self.context['request'].user
        if user.is_staff or user.is_superuser:
            u = User.objects.get(username = self.context['request'].data['username'])
            if (u.is_staff and user.is_superuser ) or user.is_superuser: # superuser can change password for everyone , staff can change for everyone but not fellow staffs
                if 'password' in self.context['request'].data:
                    u.set_password(self.context['request'].data['password'])
                u.first_name = validated_data['first_name']
                u.last_name = validated_data['last_name']
                u.is_active = validated_data['is_active']
                u.is_staff = validated_data['is_staff']
                u.save()
            else:
                raise PermissionDenied(detail=None)
        try:
            return u
        except:
            raise PermissionDenied(detail=None)

class groupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ('url' , 'name')


class AnnouncementsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcements
        fields = ( 'pk' , 'created' , 'updated' , 'createdUser' , 'message' , 'fil', 'toAll' , 'toTeam')
        read_only_fields = ('createdUser' , )
    def create(self , validated_data):
        print validated_data,'dddddddddddddddd'
        an = Announcements(**validated_data)
        an.createdUser = self.context['request'].user
        print  self.context['request'].data,'ygyugyugyu'
        if 'toTeam' in self.context['request'].data:
            an.toTeam = Team.objects.get(pk=int(self.context['request'].data['toTeam']))
        else:
            an.toTeam = None
        an.save()
        return an
