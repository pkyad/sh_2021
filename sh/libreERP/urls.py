from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings as globalSettings
from django.conf.urls.static import static
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from HR.views import loginView , logoutView , home , registerView , tokenAuthentication , root, generateOTP, customerLoginView,customerHomeView,pwdResetView , lightHome, getTokenByEmail
from projects.views import projeCtcoderStart,projectQaStart , projectRecoderStart , projectreQaStart, projectreCCStart, ImageViewerView, dynamicFormView, allDoneView, ConfigurationManagerView
from projects.views import QuickProjectView, downloadProjectReportByAPI, getDynamicForm , projectDocsView
from tools.views import getCurrentImageView 
from ERP.views import *

app_name="libreERP"

urlpatterns = [
    url(r'^$', home , name ='home'),
    url(r'^ERP/', home , name ='ERP'),
    url(r'^dashboard/',  lightHome , name = 'lightHome' ),
    url(r'^api/', include('API.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^login', loginView , name ='login'),
    url(r'^token', tokenAuthentication , name ='tokenAuthentication'),
    url(r'^logout/', logoutView , name ='logout'),
    url(r'^pwdReset/', pwdResetView , name ='pwdReset'),
    url(r'^api-auth/', include('rest_framework.urls', namespace ='rest_framework')),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^robots\.txt', include('robots.urls')),
    url(r'^generateOTP', generateOTP, name="generateOTP"),
    url(r'^customer/login', customerLoginView , name ='customerLogin'),
    url(r'^customer/home', customerHomeView , name ='customerHome'),
    url(r'^project/coder/(?P<pid>[\w|\W]+)', projeCtcoderStart , name ='projeCtcoderStart'),
    url(r'^project/qa/(?P<pid>[\w|\W]+)', projectQaStart , name ='projectQaStart'),
    url(r'^project/recoder/(?P<pid>[\w|\W]+)', projectRecoderStart , name ='projectRecoderStart'),
    url(r'^project/reqa/(?P<pid>[\w|\W]+)', projectreQaStart , name ='projectRecoderStart'),
    url(r'^project/CC/(?P<pid>[\w|\W]+)/(?P<fid>[\w|\W]+)', projectreCCStart , name ='projectRecoderStart'),
    url(r'^imageViewer', ImageViewerView , name ='ImageViewerView'),
    url(r'^configurationManager', ConfigurationManagerView , name ='configurationManager'),
    url(r'^quickProject', QuickProjectView , name ='quickProject'),
    url(r'^projectDownload/', downloadProjectReportByAPI , name ='projectDownload'),
    url(r'rsoDesigner$' , rsoDesignerView , name = "rsoDesigner"),
    url(r'formEditor$' , formEditorView , name = "formEditor"),
    url(r'getDynamicForm' , getDynamicForm , name = 'getDynamicForm'),
    url(r'^project/dynamicForm', dynamicFormView , name ='dynamicFormView'),
    url(r'^allDone', allDoneView , name ='allDoneView'),
    url(r'^getCurrentImage', getCurrentImageView , name ='getCurrentImage'),
    url(r'^projectDocs', projectDocsView , name ='getCurrentImage'),
    url(r'^doc/', include('django.contrib.admindocs.urls')),
    url(r'^getToken/', getTokenByEmail , name = 'getName'),


]

if globalSettings.DEBUG:
    urlpatterns +=static(globalSettings.STATIC_URL , document_root = globalSettings.STATIC_ROOT)
    urlpatterns +=static(globalSettings.MEDIA_URL , document_root = globalSettings.MEDIA_ROOT)

# urlpatterns.append(url(r'^(?P<blogname>[\w|\W]+)/(?P<id>[\w|\W]+)', projectStart , name ='projectStart'))
