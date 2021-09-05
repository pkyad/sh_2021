from django.conf.urls import include, url
from .views import *
from rest_framework import routers


router = routers.DefaultRouter()

router.register(r'ocrModel' , OcrModelViewSet , base_name ='ocrModel')

urlpatterns = [
    url(r'^', include(router.urls)),
    url(r'apiAccountPublic/$' , ApiAccountPublicApi.as_view()),
    url(r'generateAPIKEY/$' , generateAPIKEYAPI.as_view()),
    url(r'convertPDFtoImage/$' , ConvertPDFtoImage.as_view()),
    url(r'getTextFromImage/$' , GetTextFromImage.as_view()),
    url(r'getCurrentPage/$' , GetCurrentPage.as_view()),
]
