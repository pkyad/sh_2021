from django.conf.urls import include, url

urlpatterns = [
    url(r'^HR/', include('HR.urls')),
    url(r'^ERP/', include('ERP.urls')),
    url(r'^PIM/', include('PIM.urls')),
    url(r'^projects/', include('projects.urls')),
    url(r'^taskBoard/', include('taskBoard.urls')),
    url(r'^tools/', include('tools.urls')),
]
