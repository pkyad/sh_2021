from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template import RequestContext
from django.conf import settings as globalSettings
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from django.db.models import Q
from allauth.account.adapter import DefaultAccountAdapter
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
import requests
from datetime import date,timedelta
from dateutil.relativedelta import relativedelta
import calendar
from rest_framework import filters
from django.utils import translation
from django.http import JsonResponse
import traceback , sys

def renderedStatic(request , filename):

    if request.COOKIES.get('lang') == None:
        language = translation.get_language_from_request(request)
    else:
        language = request.COOKIES.get('lang')

    translation.activate(language )
    request.LANGUAGE_CODE = translation.get_language()
    return render(request , filename , {"lang" : request.LANGUAGE_CODE})


class SendSMSApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print "came"
        if 'number' not in request.data or 'text' not in request.data:
            return Response(status = status.HTTP_400_BAD_REQUEST)
        else:
            # url = globalSettings.SMS_API_PREFIX + 'number=%s&message=%s'%(request.data['number'] , request.data['text'])
            # print url
            # requests.get(url)
            globalSettings.SEND_SMS(request.data['number'] , request.data['text'])
            return Response(status = status.HTTP_200_OK)


class serviceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny , )
    serializer_class = serviceSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    filter_fields = ['name','vendor']
    search_fields = ('name','web')
    def get_queryset(self):
        # u = self.request.user
        return service.objects.all()

class ServiceSearchViewSet(viewsets.ModelViewSet):
    """
        provides the end point to search the companies list
    """
    permission_classes = (permissions.AllowAny , )
    serializer_class = ServiceSearchSerializer
    filter_backends = [DjangoFilterBackend,filters.SearchFilter]
    filter_fields = ['name','vendor']
    search_fields = ('name','web')
    def get_queryset(self):
        return service.objects.all()


class registerDeviceApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        if 'username' in request.data and 'password' in request.data and 'sshKey' in request.data:
            sshKey = request.data['sshKey']
            deviceName =sshKey.split()[2]
            mode = request.data['mode']
            print sshKey
            user = authenticate(username =  request.data['username'] , password = request.data['password'])
            if user is not None:
                if user.is_active:
                    d , n = device.objects.get_or_create(name = deviceName , sshKey = sshKey)
                    gp , n = profile.objects.get_or_create(user = user)
                    if mode == 'logout':
                        print "deleted"
                        gp.devices.remove(d)
                        d.delete()
                        generateGitoliteConf()
                        return Response(status=status.HTTP_200_OK)
                    gp.devices.add(d)
                    gp.save()
                    generateGitoliteConf()
            else:
                raise NotAuthenticated(detail=None)
            return Response(status=status.HTTP_200_OK)
        else:
            raise ValidationError(detail={'PARAMS' : 'No data provided'} )

class deviceViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = deviceSerializer
    queryset = device.objects.all()

class profileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = profileSerializer
    queryset = profile.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['id']

class AccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        return globalSettings.ON_REGISTRATION_SUCCESS_REDIRECT

def getModules(user , includeAll=False):
    if user.is_superuser:
        if includeAll:
            return module.objects.all()
        else:
            return module.objects.filter(~Q(name='public'))
    else:
        ma = [1]
        for m in application.objects.filter(owners__in = [user,]).values('module').distinct():
            ma.append(m['module'])
        aa = []
        for a in user.accessibleApps.all().values('app'):
            aa.append(a['app'])
        for m in application.objects.filter(pk__in = aa).values('module').distinct():
            ma.append(m['module'])
        return module.objects.filter(pk__in = ma)

class moduleViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = module.objects.all()
    serializer_class = moduleSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        includeAll = False
        if 'mode' in self.request.GET:
            if self.request.GET['mode'] == 'search':
                includeAll = True
        u = self.request.user
        return getModules(u , includeAll)

def getApps(user):
    aa = [1]
    for a in user.accessibleApps.all().values('app'):
        aa.append(a['app'])
    if user.appsManaging.all().count()>0:
        return application.objects.filter(pk__in = aa).exclude(pk__in = user.appsManaging.all().values('pk')).exclude(module = module.objects.get(name = 'public')) | user.appsManaging.all()
    return application.objects.filter(pk__in = aa)

class applicationViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly,)
    serializer_class = applicationSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name' , 'module']
    def get_queryset(self):
        u = self.request.user
        if not u.is_superuser:
            return getApps(u)
        else:
            if 'user' in self.request.GET:
                return getApps(User.objects.get(username = self.request.GET['user']))
            return application.objects.filter(inMenu = True)

class applicationAdminViewSet(viewsets.ModelViewSet):
    permission_classes = (isAdmin,)
    serializer_class = applicationAdminSerializer
    # queryset = application.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']
    def get_queryset(self):
        if not self.request.user.is_superuser:
            raise PermissionDenied(detail=None)
        return application.objects.all()


class applicationSettingsViewSet(viewsets.ModelViewSet):
    permission_classes = (readOnly , )
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app']

class applicationSettingsAdminViewSet(viewsets.ModelViewSet):
    # permission_classes = (isAdmin,)
    queryset = appSettingsField.objects.all()
    serializer_class = applicationSettingsAdminSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['app' , 'name']


class groupPermissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = groupPermission.objects.all()
    serializer_class = groupPermissionSerializer

class permissionViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = permission.objects.all()
    serializer_class = permissionSerializer

class RolesViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated, )
    serializer_class = RolesSerializer
    queryset = Roles.objects.all()
    filter_backends = [DjangoFilterBackend]
    filter_fields = ['name']


class ErrorViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    serializer_class = ErrorSerializer
    queryset = Error.objects.all()
    filter_backends = [DjangoFilterBackend]


class PythonIDEFileViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    queryset = PythonIDEFile.objects.all()
    serializer_class = PythonIDEFileSerializer
    filter_backends = [DjangoFilterBackend]
    filter_fields = [ 'name']


class pythonRunnerView(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        # request.data['env'] = "default"
        baseDir = os.path.join(globalSettings.BASE_DIR , 'environments', request.data['env'])

        if not os.path.exists(os.path.join(baseDir , 'runner.py')):
            # pass
            os.system("bash " + os.path.join(globalSettings.BASE_DIR , 'environments' , "create_new_environment.sh") + " " + request.user.username   )

        if request.GET['mode'] == 'runDev':

            f = open(os.path.join(baseDir , 'script.py'), 'w')
            f.write(request.data['code'])
            f.close()

            print "os.path.join(baseDir , 'UIPath.py') : " , os.path.join(baseDir , 'UIPath.py')
            f2 = open(os.path.join(baseDir , 'UIPath.py'))
            runTimeData =  "data=%s \n#RUNTIME#\n"%(request.data['runTimeData'])
            runTimeData = runTimeData + f2.read().split('#RUNTIME#')[1]
            f2.close()
            f3 = open(os.path.join(baseDir , 'UIPath.py'), 'w')
            f3.write(runTimeData)
            f3.close()

            os.system("bash " + os.path.join(baseDir , "run.sh") + " " + os.path.join(baseDir , 'runner.py') + " " + request.user.username  )

            return JsonResponse({"status" : "ok"} ,status =200 )

        elif request.GET['mode'] == 'pip_install':
            res = os.popen("bash " + os.path.join(baseDir , "pip_install.sh") + " " + request.data['lib'] + " " + request.user.username).read()
            return JsonResponse({"status" : res} ,status =200 )
        elif request.GET['mode'] == 'pip_uninstall':
            res = os.popen("bash " + os.path.join(baseDir , "pip_uninstall.sh") + " " + request.data['lib'] + " " + request.user.username).read()
            return JsonResponse({"status" : res} ,status =200 )

class GetPythonFile(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        pif , created = PythonIDEFile.objects.get_or_create(user = request.user , name = request.GET['fileName'])
        return JsonResponse({"fileContent" : pif.fileContent , "name" : pif.name , "pk" : pif.pk} ,status =200 )

# @login_required(login_url = '/login')
def pythonIDEView(request):
    if not request.user.is_authenticated():
        try:
            acc = ApiAccount.objects.get(apiKey = request.GET['apikey'])
        except:
            traceback.print_exc(file=sys.stdout)
            raise SuspiciousOperation('Expired')
        login(request , acc.user, backend='django.contrib.auth.backends.ModelBackend')
    return render(request, 'pythonIDE.html' ,{"BRAND_NAME" : globalSettings.BRAND_NAME , "WS_SERVER"  : globalSettings.WAMP_SERVER })


def rsoDesignerView(request):
    if not request.user.is_authenticated():
        try:
            acc = ApiAccount.objects.get(apiKey = request.GET['apikey'])
        except:
            traceback.print_exc(file=sys.stdout)
            raise SuspiciousOperation('Expired')
        login(request , acc.user, backend='django.contrib.auth.backends.ModelBackend')
    return render(request, 'rsoDesignerMain.html' ,{"BRAND_NAME" : globalSettings.BRAND_NAME , "WS_SERVER"  : globalSettings.WAMP_SERVER })



def formEditorView(request):

    if not request.user.is_authenticated():
        try:
            acc = ApiAccount.objects.get(apiKey = request.GET['apikey'])
        except:
            traceback.print_exc(file=sys.stdout)
            raise SuspiciousOperation('Expired')
        login(request , acc.user, backend='django.contrib.auth.backends.ModelBackend')


    return render(request, 'formEditor.html' ,{"BRAND_NAME" : globalSettings.BRAND_NAME})
