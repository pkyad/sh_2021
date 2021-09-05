from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect , get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
from django.core.exceptions import ObjectDoesNotExist , SuspiciousOperation
from django.views.decorators.csrf import csrf_exempt, csrf_protect
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from ERP.models import application, permission , module , CompanyHolidays,service
# from clientRelationships.models import Contact, CustomerSession
from ERP.views import getApps, getModules
from django.db.models import Q
from django.http import JsonResponse
import random, string
from django.utils import timezone
from rest_framework.views import APIView
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta
import calendar
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
import json
from django.core.mail import send_mail , EmailMessage
# from finance.models import OutBoundInvoice
# from payroll.models import Payslip
from django.template.loader import render_to_string, get_template
import pandas as pd
import re


def generateOTPCode():
    length = 4
    chars = string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(chars) for i in range(length))

def tokenAuthentication(request):

    ak = get_object_or_404(accountsKey, activation_key=request.GET['key'] , keyType='hashed')
    #check if the activation key has expired, if it hase then render confirm_expired.html
    if ak.key_expires < timezone.now():
        raise SuspiciousOperation('Expired')
    #if the key hasn't expired save user and set him as active and render some template to confirm activation
    user = ak.user
    login(request , user, backend='django.contrib.auth.backends.ModelBackend')
    authStatus = {'status' : 'success' , 'message' : 'Account actived, please login.' }

    ak.delete()

    if 'next' in request.GET:
        return redirect(request.GET['next'] + '?mode=api')

    return render(request , globalSettings.LOGIN_TEMPLATE , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN})

@csrf_exempt
def customerLoginView(request):
    authStatus = {'status' : 'default' , 'message' : '' ,'showFullForm':False,'email':'','eOtp':''}
    statusCode = 200

    if request.method == 'POST':
        authStatus['email'] = str(request.POST['email'])
    	if 'eOtp' in request.POST:
            authStatus['eOtp'] = str(request.POST['eOtp'])
            authStatus['status'] = 'danger'
            authStatus['message'] = 'Invalid OTP'
            authStatus['showFullForm'] = True
            return render(request , 'customerLogin.html' , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)
            while True:
                try:
                    sessionId = ''.join(random.choice(string.ascii_lowercase + string.digits) for _ in range(32))
                    # custObj = CustomerSession.objects.get(sessionId=sessionId)
                except:
                    custsessionObj.sessionId = sessionId
                    break
            custsessionObj.save()

            response = redirect('customerHome')
            response.set_cookie('customerSessionId',json.dumps({'id':custsessionObj.sessionId,'typ':typ}))
            return response
        else:
            try:
                outboundObj = OutBoundInvoice.objects.filter(email=str(request.POST['email']))
                typ = 'invoice'
            except:
                authStatus['status'] = 'danger'
                authStatus['message'] = 'No Customer Account For This Email'
                return render(request , 'customerLogin.html' , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)
            otp = generateOTPCode()
            email_subject = "Yor Account Login OTP"
            email_body = "Hi , This Is Your OTP {0} For Account Login".format(custsessionObj.otp)
            print email_subject,email_body
            msg = EmailMessage(email_subject , email_body, to= [custsessionObj.email])
            msg.send()
            authStatus['status'] = 'success'
            authStatus['message'] = 'OTP Has Been Sent To Your Email'
            authStatus['showFullForm'] = True
    return render(request , 'customerLogin.html' , {'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)

def customerHomeView(request):
    print 'customer homeeeeeeeeeeeeeee'
    print request.COOKIES,'cookiesssssssssssssss'
    if 'customerSessionId' in request.COOKIES:
        sessionData = json.loads(request.COOKIES['customerSessionId'])
        try:
            typ = sessionData['typ']
        except:
            return redirect('customerLogin')
    else:
        return redirect('customerLogin')
    return render(request , 'customerHome.html' , {'typ':typ,'sessionId':custObj.sessionId,'wampServer' : globalSettings.WAMP_SERVER, 'useCDN' : globalSettings.USE_CDN , 'BRAND_LOGO' : globalSettings.BRAND_LOGO,'BRAND_NAME' :  globalSettings.BRAND_NAME,})


@csrf_exempt
def generateOTP(request):
    print request.POST
    key_expires = timezone.now() + datetime.timedelta(2)
    otp = generateOTPCode()
    user = get_object_or_404(User, username = request.POST['id'])
    ak = accountsKey(user= user, activation_key= otp,
        key_expires=key_expires , keyType = 'otp')
    ak.save()
    print ak.activation_key
    print user.profile.mobile

    globalSettings.SEND_SMS(user.profile.mobile , 'OTP is %s'%(ak.activation_key)  )

    return JsonResponse({} ,status =200 )




@csrf_exempt
def loginView(request):
    if globalSettings.LOGIN_URL != 'login':
        return redirect(reverse(globalSettings.LOGIN_URL))
    authStatus = {'status' : 'default' , 'message' : '' }
    statusCode = 200
    if request.user.is_authenticated():
        if 'next' in request.GET:
            return redirect(request.GET['next'])
        else:
            return redirect(reverse(globalSettings.LOGIN_REDIRECT))
    if request.method == 'POST':
    	usernameOrEmail = request.POST['username']
        otpMode = False
        if 'otp' in request.POST:
            print "otp"
            otp = request.POST['otp']
            otpMode = True
        else:
            password = request.POST['password']
        if '@' in usernameOrEmail and '.' in usernameOrEmail:
            u = User.objects.get(email = usernameOrEmail)
            username = u.username
        else:
            username = usernameOrEmail
            try:
                u = User.objects.get(username = username)
            except:
                statusCode = 404
        if not otpMode:
            user = authenticate(username = username , password = password)
            if user is None:
                profileObj = get_object_or_404(profile , user__username = username )
                failureCount = profileObj.loginFailureAttempt
                profileObj.loginFailureAttempt =failureCount+1
                profileObj.save()
                if profileObj.loginFailureAttempt==5:
                    u.is_active = False
                    u.save()
            else:
                profileObj = profile.objects.get(user = u)
                if profileObj.loginFailureAttempt != 0:
                    profileObj.loginFailureAttempt = 0
                    profileObj.save()
        else:
            print "OTP Mode"
            ak = None
            try:
                aks = accountsKey.objects.filter(activation_key=otp , keyType='otp')
                ak = aks[len(aks)-1]
                print "Aks", aks,ak
            except:
                pass
            print ak
            if ak is not None:
                #check if the activation key has expired, if it has then render confirm_expired.html
                if ak.key_expires > timezone.now():
                    user = ak.user
                    user.backend = 'django.contrib.auth.backends.ModelBackend'
                else:
                    user = None
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect OTP'}
                statusCode = 401

    	if user is not None:
            login(request , user)
            if request.GET and 'next' in request.GET:
                if not (user.is_superuser or user.is_staff):
                    return redirect(reverse('lightHome') )
                return redirect(request.GET['next'])
            else:
                if 'mode' in request.GET and request.GET['mode'] == 'api':
                    return JsonResponse({'userpk':user.pk,'name':user.first_name +' '+ user.last_name,'is_staff':user.is_staff} , status = 200)
                else:
                    if not (user.is_superuser or user.is_staff):
                        return redirect(reverse('lightHome') )
                    return redirect(reverse(globalSettings.LOGIN_REDIRECT))
        else:
            if statusCode == 200 and not u.is_active:
                authStatus = {'status' : 'warning' , 'message' : 'Your account is not active.'}
                statusCode = 423
            else:
                authStatus = {'status' : 'danger' , 'message' : 'Incorrect username or password.'}
                statusCode = 401

    if 'mode' in request.GET and request.GET['mode'] == 'api':
        return JsonResponse(authStatus , status = statusCode)


    return render(request , globalSettings.LOGIN_TEMPLATE , {'a':7,'b':7,'authStatus' : authStatus ,'useCDN' : globalSettings.USE_CDN , 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE , "brandLogo" : globalSettings.BRAND_LOGO , "brandLogoInverted": globalSettings.BRAND_LOGO_INVERT}, status=statusCode)

def registerView(request):
    if globalSettings.REGISTER_URL != 'register':
        return redirect(reverse(globalSettings.REGISTER_URL))
    msg = {'status' : 'default' , 'message' : '' }
    if request.method == 'POST':
    	name = request.POST['name']
    	email = request.POST['email']
    	password = request.POST['password']
        if User.objects.filter(email = email).exists():
            msg = {'status' : 'danger' , 'message' : 'Email ID already exists' }
        else:
            user = User.objects.create(username = email.replace('@' , '').replace('.' ,''))
            user.first_name = name
            user.email = email
            user.set_password(password)
            user.save()
            user = authenticate(username = email.replace('@' , '').replace('.' ,'') , password = password)
            login(request , user)
            if request.GET:
                return redirect(request.GET['next'])
            else:
                return redirect(globalSettings.LOGIN_REDIRECT)
    return render(request , 'register.simple.html' , {'msg' : msg})


def logoutView(request):
    logout(request)
    return redirect(globalSettings.LOGOUT_REDIRECT)

def root(request):
    return redirect(globalSettings.ROOT_APP)


@login_required(login_url = globalSettings.LOGIN_URL)
def pwdResetView(request):
    authStatus = {'status' : 'default' , 'message' : '' }
    intVal = {'newPwd':'','cofPwd':''}
    if request.method == 'POST':
        newPwd = request.POST['newPwd']
        cofPwd = request.POST['cofPwd']
        intVal = {'newPwd':newPwd,'cofPwd':cofPwd}
        if len(str(newPwd))==0:
            authStatus = {'status' : 'danger' , 'message' : 'Please Mention New Password'}
        elif newPwd != cofPwd:
            authStatus = {'status' : 'danger' , 'message' : 'Both Passwords should Be Same'}
        else:
            flag = 0
            if len(str(newPwd))<8:
                flag = -1
            elif not re.search("[a-z]", newPwd):
                flag = -1
            elif not re.search("[A-Z]", newPwd):
                flag = -1
            elif not re.search("[0-9]", newPwd):
                flag = -1
            # elif not re.search("[_@$]", password):
            #     flag = -1
            # elif re.search("\s", password):
            #     flag = -1
            else:
                flag = 1
                print 'Valid Passworddddddddddddd'

            if flag == -1:
                authStatus = {'status' : 'danger' , 'message' : 'Password Should Contains Minimum 8 Alphanumeric Characters'}
            else:
                u = request.user
                prof = u.profile
                u.set_password(str(newPwd))
                u.save()
                prof.needPwdReset=False
                prof.save()
                return redirect('ERP')
    return render(request , 'pwdReset.html' , {'authStatus' : authStatus ,'intVal':intVal,'useCDN' : globalSettings.USE_CDN ,'icon_logo':globalSettings.BRAND_LOGO, 'backgroundImage': globalSettings.LOGIN_PAGE_IMAGE})

from datetime import datetime
from projects.views import getPerformanceStats
from datetime import date , timedelta
from django.template import Template, Context
import os
from django.http import HttpResponse

lightDashboardTemplate = Template(open( os.path.join(globalSettings.BASE_DIR , 'HR', 'templates','dashboard.light.html')).read())

@csrf_exempt
def lightHome(request):
    u = request.user
    performance = None
    announcements = None
    if request.method == 'POST':
        startDate = date.today()
        endDate = date.today() + timedelta(days = 1)
        performance = getPerformanceStats( startDate ,endDate ,request)
        announcements = Announcements.objects.all().order_by('-updated')[:10]
    # now = datetime.now()
    myTeams = u.designation.team.all()
    userTams = list(myTeams.values_list('pk',flat=True))
    projs = project.objects.filter( ~Q(status='complete'), disabled=False).filter( Q(coderTeam__in = userTams) | Q(qaTeam__in = userTams) | Q(reCoderTeam__in = userTams) | Q(reQaTeam__in = userTams)).order_by('-created')

    for proj in projs:
        proj.can_code =  (proj.coderTeam in myTeams) or (proj.reCoderTeam in myTeams)
        proj.can_qa =  (proj.reQaTeam in myTeams) or (proj.qaTeam in myTeams)





    return HttpResponse(lightDashboardTemplate.render(Context({"projects" : projs , "name" : u.first_name  + " " + u.last_name , "performance" : performance , "logo" : globalSettings.BRAND_LOGO , "announcements" : announcements})))

@login_required(login_url = globalSettings.LOGIN_URL)
def home(request):

    u = request.user

    # if not (u.is_superuser or u.is_staff):
    #     return redirect('lightHome')

    if u.is_superuser:
        apps = application.objects.all()
        modules = module.objects.filter(~Q(name='public'))
    else:
        if u.profile.needPwdReset:
            return redirect('pwdReset')
        apps = getApps(u)
        modules = getModules(u)
    apps = apps.filter(~Q(name__startswith='configure.' )).filter(~Q(name='app.users')).filter(~Q(name__endswith='.public'))
    return render(request , 'ngBase.html' , {'wampServer' : globalSettings.WAMP_SERVER, 'appsWithJs' : apps.filter(haveJs=True) \
    ,'appsWithCss' : apps.filter(haveCss=True) , 'modules' : modules , 'useCDN' : globalSettings.USE_CDN , 'BRAND_LOGO' : globalSettings.BRAND_LOGO \
    ,'BRAND_NAME' :  globalSettings.BRAND_NAME,'sourceList':globalSettings.SOURCE_LIST , 'commonApps' : globalSettings.SHOW_COMMON_APPS , 'defaultState' : globalSettings.DEFAULT_STATE , 'toolName':globalSettings.TOOL_NAME   })


class userProfileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = userProfileSerializer
    queryset = profile.objects.all()

class SalaryGradeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    serializer_class = SalaryGradeSerializer
    queryset = SalaryGrade.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class userProfileAdminModeViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    serializer_class = userProfileAdminModeSerializer
    queryset = profile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user']

class userDesignationViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = designation.objects.all()
    serializer_class = userDesignationSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['user']

class userAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin ,)
    queryset = User.objects.all()
    serializer_class = userAdminSerializer

class UserViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username','email','is_staff','is_active']
    serializer_class = userSerializer
    def get_queryset(self):
        if 'reportingTo' in self.request.GET:
            userPks = list(designation.objects.filter(reportingTo = int(self.request.GET['reportingTo'])).values_list('user__pk',flat=True))
            print userPks,'userpkkkkkkkkkkk'
            if len(userPks)>0:
                toRet = User.objects.filter(pk__in=userPks)
            else:
                toRet = User.objects.none()
            return toRet
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('first_name')
        else:
            return User.objects.all().order_by('first_name')



class UserSearchViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated ,)
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['username']
    serializer_class = userSearchSerializer
    queryset = User.objects.all()
    def get_queryset(self):
        if 'mode' in self.request.GET:
            if self.request.GET['mode']=="mySelf":
                if self.request.user.is_authenticated:
                    return User.objects.filter(username = self.request.user.username)
                else:
                    raise PermissionDenied()
            else :
                return User.objects.all().order_by('-date_joined')
        else:
            return User.objects.all().order_by('-date_joined')

class GroupViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = Group.objects.all()
    serializer_class = groupSerializer

class TeamViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = TeamSerializer
    queryset = Team.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['title']

class AnnouncementsViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AnnouncementsSerializer
    def get_queryset(self):
        return Announcements.objects.all().order_by('-updated')


def findChild(d, pk = None):
    toReturn = []
    sameLevel = False
    for des in  d.user.managing.all():
        try:
            dp = des.user.profile.displayPicture.url
            if dp == None:
                dp = '/static/images/userIcon.png'
        except:
            dp = '/static/images/userIcon.png'

        if des.role:
            role = des.role.name
        else:
            role = ''

        if str(des.user.pk) == pk:
            for tr in toReturn:
                tr['className'] = 'rd-dept'

            clsName = 'middle-level'
            sameLevel = True
        else:
            clsName = 'product-dept'
            if sameLevel:
                clsName = 'rd-dept'

        print des.user , clsName

        toReturn.append({
            "id" : des.user.pk,
            "name" : des.user.first_name + ' ' +  des.user.last_name,
            "dp" : dp,
            "children" : findChild(des),
            "role" : role,
            "className" :  clsName
        })

    return toReturn



class OrgChartAPI(APIView):
    def get(self , request , format = None):
        d = User.objects.get(pk = request.GET['user']).designation
        print d.role,d.reportingTo
        if d.reportingTo is not None:
            d = d.reportingTo.designation
        try:
            dp = d.user.profile.displayPicture.url
            if dp == None:
                dp = '/static/images/userIcon.png'

        except:
            dp = '/static/images/userIcon.png'

        if d.role:
            role = d.role.name
        else:
            role = ''


        if str(d.user.pk) == request.GET['user']:
            clsName = 'middle-level'
        else:
            clsName = 'product-dept'


        toReturn = {
            "id" : d.user.pk,
            "name" : d.user.first_name + ' ' +  d.user.last_name,
            "dp" : dp,
            "children" : findChild(d , pk = request.GET['user']),
            "role" : role,
            "className" :  clsName
        }

        return Response(toReturn )

class ExEmployeeAccessDataAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny,)
    def get(self, request, format=None):
        print '****** entered', request.GET
        toSend = {}
        try:
            empSessObj = ExemployeeSession.objects.get(sessionId=str(request.GET['sessionId']))
            userData = userSerializer(empSessObj.empProfile.user,many=False).data
            print userData
            toSend = userData
            try:
                toSend['fullName'] = toSend['first_name'] + ' ' + toSend['last_name']
            except:
                toSend['fullName'] = toSend['first_name']
            if not toSend['profile']['displayPicture']:
                toSend['profile']['displayPicture'] = '/static/images/userIcon.png'
            paySlipsObj =[]
            # paySlipsObj = list(Payslip.objects.filter(user=empSessObj.empProfile.user).order_by('created').values())
            for i in paySlipsObj:
                i['slipMonth'] = str(calendar.month_name[int(i['month'])]) + ' ' + str(i['year'])
            toSend['payslipsData'] = paySlipsObj
        except:
            pass
        return Response(toSend, status=status.HTTP_200_OK)


class sendDeboardingEmailAPIView(APIView):
    renderer_classes = (JSONRenderer,)
    def post(self, request, format=None):
        print 'Sennding-----mailll-------manager'
        date = request.data['startDate']
        emp =  User.objects.get(pk = request.data['userPk'])
        emaiIDs = []
        manager = profile.objects.get(user__pk = request.data['manPk'] )
        sManager = profile.objects.get(user__pk = request.data['sManPk'])
        emaiIDs.append(manager.email)
        emaiIDs.append(sManager.email)
        empMail_subject = str('Deboarding Initiated')
        email_subject =str('Deboard Approval')
        # msgBody='Deboarding Approval Request.'
        ctx = {
            'fname': emp.first_name,
            'lname': emp.last_name,
            'initiatedOn':date,
            'linkUrl': 'cioc.co.in',
            'linkText' : 'View Online',
            'sendersAddress' : '(C) CIOC FMCG Pvt Ltd',
            'sendersPhone' : '841101',
            'linkedinUrl' : 'https://www.linkedin.com/company/13440221/',
            'fbUrl' : 'facebook.com',
            'twitterUrl' : 'twitter.com',
        }
        email_body = get_template('app.HR.deboardEmail.html').render(ctx)
        msg = EmailMessage(email_subject, email_body,  to=emaiIDs)
        msg.content_subtype = 'html'
        msg.send()
        email_emp = get_template('app.HR.deboardEmailtoEmployee.html').render(ctx)
        empMsg = EmailMessage(empMail_subject, email_emp,  to=[emp.profile.email])
        empMsg.content_subtype = 'html'
        empMsg.send()
        return Response({},status = status.HTTP_200_OK)

class BulkAssignAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        toRet = {}
        print type(request.data['postData'])
        for i in request.data['postData']:
            desgObj = designation.objects.get(pk=int(i['designation']))
            desgObj.team.add(int(i['team']))
        return Response(toRet,status=status.HTTP_200_OK)

class BulkUploadAPI(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny,)
    def post(self, request, format=None):
        toRet = {}
        df = pd.read_excel(request.FILES['dataFile'])
        lstDic = df.T.to_dict().values()
        createdObjs = []
        for i in lstDic:
            userObj,created = User.objects.get_or_create(username = str(i['User Name']))
            if created:
                userObj.email = str(i['User Name'])
                userObj.first_name = str(i['First Name'])
                userObj.last_name = str(i['Last Name'])
                userObj.set_password('sourcehub')
                userObj.save()
                createdObjs.append(userObj)
                print userObj.profile,str(i['Emp Id']),'objjjjjjjjjjjjjSSSSSSS'
                profileObj = userObj.profile
                profileObj.empID = str(i['Emp Id'])
                profileObj.save()

        toRet['totalRows'] = len(lstDic)
        toRet['createdRecords'] = len(createdObjs)
        return Response(toRet,status=status.HTTP_200_OK)

class ResetNeedPasswordFieldAPI(APIView):
    def get(self , request , format = None):
        superUsersPkList = list(User.objects.filter(is_superuser=True).values_list('pk',flat=True))
        profObjs = profile.objects.exclude(user__in=superUsersPkList).update(needPwdReset=True)
        return Response({'status':'Done'}, status = status.HTTP_200_OK)

class AssignTeamToTeamView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny,)
    def post(self , request , format = None):
        print request.data['members']
        print request.data['team']

        ds = designation.objects.filter( user__pk__in = request.data['members'] )
        t =  Team.objects.get(pk = request.data['team'])
        for dst in ds:
            dst.team.add(t)
            dst.save()
        return Response({"count" : 0 },  status = status.HTTP_200_OK)

class GetPaginationView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny,)
    def get(self , request , format = None):
        return Response({'count':User.objects.all().count()})
        # return Response({'count':185})

from tools.models import ApiAccount
import random
import string , traceback , sys

def randomString(stringLength=10):
    """Generate a random string of fixed length """
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(stringLength))

@csrf_exempt
def getTokenByEmail(request):
    d = request.POST
    if d['token'] != globalSettings.API_KEY:
        return

    try:
        userObj = User.objects.get(email = d['email'] )
    except:
        userObj = User(email = d['email'] ,first_name = d['first_name'] , last_name = d['last_name'], username = d['email'] )
        userObj.save()

    account , created = ApiAccount.objects.get_or_create(email = userObj.email , user = userObj , name = userObj.first_name )

    if created:
        tkn = randomString(40)
        account.apiKey = tkn
        account.remaining = 1000
        account.active = True
        account.save()
    else:
        tkn = account.apiKey

    return JsonResponse({"token" : tkn} , status = status.HTTP_200_OK)
