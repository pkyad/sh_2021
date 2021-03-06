from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()
router.register(r'module' , moduleViewSet , base_name = 'module')
router.register(r'application' , applicationViewSet , base_name = 'application')
router.register(r'applicationAdminMode' , applicationAdminViewSet , base_name = 'applicationAdminMode')
router.register(r'device' , deviceViewSet , base_name = 'device')
router.register(r'appSettings' , applicationSettingsViewSet , base_name = 'applicationSettings')
router.register(r'appSettingsAdminMode' , applicationSettingsAdminViewSet , base_name = 'applicationSettingsAdminMode')
router.register(r'groupPermission' , groupPermissionViewSet , base_name = 'groupAccess')
router.register(r'permission' , permissionViewSet , base_name = 'access')
router.register(r'profile' , profileViewSet , base_name = 'profile')
router.register(r'service' , serviceViewSet , base_name = 'service')
router.register(r'roles' , RolesViewSet , base_name = 'roles')
router.register(r'error' , ErrorViewSet , base_name = 'error')
router.register(r'serviceSearch' , ServiceSearchViewSet , base_name = 'serviceSearch')
router.register(r'pythonIDEFile' , PythonIDEFileViewSet , base_name = 'pythonIDEFile')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'registerDevice/$' , registerDeviceApi.as_view()),
    url(r'sendSMS/$' , SendSMSApi.as_view()),
    url(r'getPythonFile/$' , GetPythonFile.as_view()),
]
