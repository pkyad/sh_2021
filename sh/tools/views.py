from django.contrib.auth.models import User , Group
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse
from django.template.loader import render_to_string, get_template
from django.template import RequestContext , Context
from django.conf import settings as globalSettings
from django.core.mail import send_mail , EmailMessage
from django.core import serializers
from django.http import HttpResponse ,StreamingHttpResponse , FileResponse
from django.utils import timezone
from django.db.models import Min , Sum , Avg
# Related to the REST Framework
from rest_framework import viewsets , permissions , serializers
from rest_framework.exceptions import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.renderers import JSONRenderer
from rest_framework.decorators import api_view
from url_filter.integrations.drf import DjangoFilterBackend
from .serializers import *
from API.permissions import *
from HR.models import accountsKey
from django.core import serializers
from django.http import JsonResponse
from django.conf import settings as globalSettings
import datetime
from datetime import timedelta , date
from monthdelta import monthdelta
from time import time
import pytz
import math
import json
import requests

from StringIO import StringIO
import os
from django.core.files.base import ContentFile
from django.core.exceptions import PermissionDenied,SuspiciousOperation
from django.core.files.storage import default_storage,FileSystemStorage
import random, string

from PIL import Image as pilIMage
pilIMage.MAX_IMAGE_PIXELS = None
import subprocess
import glob
# from PIL.ImageQt import ImageQt
import sys, traceback
from os import getenv
import fitz
from io import BytesIO
import base64
import re
from pytesseract import image_to_string
# from cleaned_handwriting.runOCR import *

if globalSettings.API_MODE:
    from scripts.PDFReader.reader2 import *
    from scripts.PDFEditor.markings import *
    from scripts.nlp.nlpEngine import *
    from scripts.nlp.utils import compareSentance

from django.core import files
import tempfile
from django.views.decorators.csrf import csrf_exempt, csrf_protect
import pymssql
import hashlib, random

def getRemoteFilesList(docID):
    print docID
    server = globalSettings.SH_SQLSERVER_IP
    user = globalSettings.SH_SERVER_USER
    password = globalSettings.SH_SERVER_PASSWORD
    dbName = globalSettings.SH_SERVER_DATABASE
    conn = pymssql.connect(server, user, password, dbName)
    cursor = conn.cursor()
    cursor.execute("select * from PageMaster where DocumentMasterId = {0} ".format(docID))
    toRet = []
    for row in cursor:
        #print("ID=%s, Name=%s" % (row[2], row[3]))
        toRet.append("{0}{1}{2}".format(globalSettings.SH_FTP_PREFIX,row[3],row[2]))
        # row = cursor.fetchone()
    conn.close()
    return toRet

class ConvertPDFtoImage(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        toRet = []
        if 'fil' in request.FILES:
            fileObj = request.FILES['fil']
        else:
            if 'docId' in request.data:
                try:
                    urlData = getRemoteFilesList(int(request.data['docId']))
                except:
                    urlData = []
            else:
                urlData = []
                urlData.append(request.data['fileUrl'])
        for doxIdx,url in enumerate(urlData):
            exts = str(url.split('.')[-1]).lower()
            fl = url.split('/media/')[-1]
            origFilName = fl.split('/')[-1].split('.')[0]
            fileObj = default_storage.open(os.path.join(fl), 'r')

            if any(str(exts).lower().endswith(ext) for ext in ['png','jpg','jpeg','svg','tiff','gif']):
                try:
                    ts = str(time()).replace('.','_') + origFilName
                except:
                    ts = str(time).replace('.','_') + origFilName
                imgName = 'testfile_imageviewer__'+ts+ '.jpeg'
                # print imgName,'imggggg'
                img = pilIMage.open(fileObj)
                if img.mode in ("RGBA", "P"):
                    img = img.convert('RGB')
                img.save(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))
                flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)
                toRet.append({'imgpath':flp,'flpath':fileObj.name,'idx':0})
            elif  str(exts).lower().endswith('tif'):
                # print 'inpdffffffffffffffffffff'
                img = pilIMage.open(fileObj.name)

                for idx,i in enumerate( range(img.n_frames) ):
                    if idx==0:
                        # try:
                        #     ts = str(time()).replace('.','_') + origFilName
                        # except:
                        #     ts = str(time.time()).replace('.','_') + origFilName

                        # img.seek(i)
                        # img = img.convert('RGB')
                        # imgName = 'testfile_imageviewer__'+ts+'.jpeg'
                        # img.save(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))

                        flp = '/getCurrentImage/?path={0}&page={1}'.format( fileObj.name ,0)

                        # flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)
                    else:
                        flp = ''
                    toRet.append({'imgpath':flp,'flpath':fileObj.name,'idx':idx})
            elif  str(exts).lower().endswith('pdf'):
                # print 'inpdffffffffffffffffffff'
                doc = fitz.open(fileObj.name)
                # print len(doc)
                for idx,i in enumerate(range(len(doc))):
                    if idx==0:
                        # try:
                        #     ts = str(time()).replace('.','_') + origFilName
                        # except:
                        #     ts = str(time.time()).replace('.','_') + origFilName
                        #
                        # page = doc.loadPage(i) #number of page
                        # zoom_x = 3.0
                        # zoom_y = 3.0
                        # trans = fitz.Matrix(zoom_x, zoom_y).preRotate(0)
                        # pix = page.getPixmap(matrix=trans, alpha=False)
                        # imgName = 'testfile_imageviewer__'+ts+'.png'

                        #/getCurrentImage/?path=/home/pradeep/Documents/bacup/libreERP-main/media_root/accord6.pdf&page=1


                        # pix.writePNG(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))
                        flp = '/getCurrentImage/?path={0}&page={1}'.format( fileObj.name ,0)
                    else:
                        flp = ''
                    toRet.append({'imgpath':flp,'flpath':fileObj.name,'idx':idx})
            elif any(str(exts).lower().endswith(ext) for ext in ['doc','docx']):
                fs = FileSystemStorage(location='{0}/media_root/pdfToImg/'.format(globalSettings.BASE_DIR)) #defaults to   MEDIA_ROOT
                filename = fs.save('sampledoc_imageviewer.doc', fileObj)
                for rep in range(5):
                    try:
                        process = subprocess.check_output(['libreoffice', '--convert-to', 'pdf', '--outdir', '{0}/media_root/pdfToImg/'.format(globalSettings.BASE_DIR), '{0}/media_root/pdfToImg/sampledoc_imageviewer.doc'.format(globalSettings.BASE_DIR)])
                        doc = fitz.open('{0}/media_root/pdfToImg/sampledoc_imageviewer.pdf'.format(globalSettings.BASE_DIR))
                        print len(doc)
                        for idx,i in enumerate(range(len(doc))):
                            if idx==0:
                                ts = str(time()).replace('.','_') + origFilName
                                page = doc.loadPage(i) #number of page
                                zoom_x = 3.0
                                zoom_y = 3.0
                                trans = fitz.Matrix(zoom_x, zoom_y).preRotate(0)
                                pix = page.getPixmap(matrix=trans, alpha=False)
                                imgName = 'testfile_imageviewer__'+ts+'.png'
                                pix.writePNG(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))
                                # toRet.append('{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName))
                                flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)
                            else:
                                flp = ''
                            toRet.append({'imgpath':flp,'flpath':'{0}/media_root/pdfToImg/sampledoc_imageviewer.pdf'.format(globalSettings.BASE_DIR),'idx':idx})
                        break
                    except:
                        print 'try againg for doc to pdf'
            try:
                fileObj.close()
            except:
                print 'Error in closing the file'

        return Response({"imagesData" : toRet}, status=status.HTTP_200_OK)

class GetTextFromImage(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        imgUrl = request.data['imgUrl']
        base64_data = re.sub('^data:image/.+;base64,', '', imgUrl)
        byte_data = base64.b64decode(base64_data)
        img = pilIMage.open(BytesIO(byte_data))
        if False:
            try:
                txt, s = getOCTStr(img)
                # print 'using hand writingggggggg'
            except:
                # print 'error in  handwritingggggggg'
                txt = ''
        else:
            try:
                txt = image_to_string(img)
            except:
                txt = ''
        toRet = {"imageText" : txt,'ocrModelPk':0}
        if len(txt)>0:
            toRet['ocrModelPk'] = -1
        return Response(toRet, status=status.HTTP_200_OK)

class GetCurrentPage(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        try:
            ts = str(time()).replace('.','_')
        except:
            ts = str(time.time()).replace('.','_')

        if str(request.data['flPath']).lower().endswith('.pdf'):
            doc = fitz.open(str(request.data['flPath']))
            # print len(doc)
            page = doc.loadPage(int(request.data['idx'])) #number of page
            zoom_x = 3.0
            zoom_y = 3.0
            trans = fitz.Matrix(zoom_x, zoom_y).preRotate(0)
            pix = page.getPixmap(matrix=trans, alpha=False)
            imgName = 'testfile_imageviewer__'+ts+'.png'
            pix.writePNG(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))
            flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)


        elif str(request.data['flPath']).lower().endswith('.tif'):

            fileObj = default_storage.open(str(request.data['flPath']), 'r')
            img = pilIMage.open(fileObj)
            imgName = 'testfile_imageviewer__'+ts+'.jpeg'

            img.seek(int(request.data['idx']))
            img = img.convert('RGB')

            img.save(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))

            flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)
        else:
            fileObj = default_storage.open(str(request.data['flPath']), 'r')
            # print fileObj.name,'nameeeeeeee'
            if any(str(request.data['flPath']).lower().endswith(ext) for ext in ['png','jpg','jpeg','svg','tiff','tif','gif']):
                imgName = 'testfile_imageviewer__'+ts+'.jpeg'
                # print imgName,'imggggg'
                img = pilIMage.open(fileObj)
                if img.mode in ("RGBA", "P"):
                    img = img.convert('RGB')
                img.save(os.path.join(globalSettings.MEDIA_ROOT, 'pdfToImg',imgName))
                flp = '{0}/media/pdfToImg/{1}'.format(globalSettings.SITE_ADDRESS,imgName)
            else:

                flp=''
        return Response({"imageUrl" : flp}, status=status.HTTP_200_OK)


class OcrModelViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    queryset = OcrModel.objects.all()
    serializer_class = OcrModelSerializer

def generateOTPCode():
    length = 4
    chars = string.digits
    rnd = random.SystemRandom()
    return ''.join(rnd.choice(chars) for i in range(length))

def sendApiKeyEmail(apiKeyObj,typ):
    print apiKeyObj,'apkobjjjjjjjjj'
    try:
        if typ == 'otp':
            email_subject = "Your OTP For API Secret Key Activation"
            email_body = "Hi , Your API Secret Key Activation OTP Is : {0}".format(apiKeyObj.email_otp)
        else:
            email_subject = "Yor API Secret Key"
            email_body = "Hi , This Is Your API SecretKey \n{0}".format(apiKeyObj.emailApiKey)
        print email_subject,email_body
        msg = EmailMessage(email_subject , email_body, to= [apiKeyObj.email])
        msg.send()
        return True
    except:
        return False

class generateAPIKEYAPI(APIView):
    permission_classes = (permissions.AllowAny ,)
    def post(self , request , format = None):
        print request.data,'dataaaaaaaaa'
        if 'email' in request.data:
            if 'otp' in request.data:
                try:
                    apiKeyObj = ApiKeyRegistration.objects.get(email=request.data['email'],email_otp=request.data['otp'])
                    apiKeyObj.verified = True
                    try:
                        apiKeyValue = str(make_password(datetime.datetime.now()).split('sha256$')[1]).replace('+','')
                    except:
                        apiKeyValue = str(make_password(datetime.datetime.now())).replace('+','')
                    apiKeyObj.emailApiKey = apiKeyValue
                    apiKeyObj.save()
                    try:
                        superUserObj = User.objects.filter(is_superuser=True)[0]
                        print 'super user existsssss'
                    except:
                        superUserObj = User.objects.all()[0]
                    try:
                        apObj = ApiAccount.objects.get(email=apiKeyObj.email)
                        apObj.apiKey = apiKeyObj.emailApiKey
                        apObj.save()
                        print 'api account already Exists'
                    except:
                        apObj = ApiAccount(email=apiKeyObj.email,apiKey=apiKeyObj.emailApiKey,active=True,remaining=1000,user=superUserObj)
                        apObj.save()
                    emailSendMsg = sendApiKeyEmail(apiKeyObj,'apiKey')
                    if emailSendMsg:
                        return Response({'msg':apiKeyObj.emailApiKey}, status=status.HTTP_200_OK)
                    else:
                        return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                except:
                    return Response({'msg':'otpError'}, status=status.HTTP_200_OK)
            else:
                try:
                    apiKeyObj = ApiKeyRegistration.objects.get(email=request.data['email'])
                    if apiKeyObj.verified:
                        emailSendMsg = sendApiKeyEmail(apiKeyObj,'apiKey')
                        if emailSendMsg:
                            return Response({'msg':'apiKey_exists'}, status=status.HTTP_200_OK)
                        else:
                            return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                    else:
                        otp = generateOTPCode()
                        print otp
                        apiKeyObj.email_otp = otp
                        apiKeyObj.save()
                        emailSendMsg = sendApiKeyEmail(apiKeyObj,'otp')
                        if emailSendMsg:
                            return Response({'msg':'otp'}, status=status.HTTP_200_OK)
                        else:
                            return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
                except:
                    pass
                otp = generateOTPCode()
                print otp
                apiKeyObj = ApiKeyRegistration(email=request.data['email'],email_otp=otp)
                apiKeyObj.save()
                emailSendMsg = sendApiKeyEmail(apiKeyObj,'otp')
                if emailSendMsg:
                    return Response({'msg':'otp'}, status=status.HTTP_200_OK)
                else:
                    apiKeyObj.delete()
                    return Response({'msg':'Invalid Email'}, status=status.HTTP_200_OK)
        else:
            raise SuspiciousOperation('Invalid Data')


class ApiAccountPublicApi(APIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = (permissions.AllowAny ,)
    def get(self , request , format = None):
        key = request.GET['key']
        aa = get_object_or_404(ApiAccount, apiKey__contains = key)
        if aa.active:
            return Response({'remaining': aa.remaining}, status=status.HTTP_200_OK)
        else:
            return Response({'notActive': "Account not active"}, status=status.HTTP_403_FORBIDDEN)


def getFileInRequest(request):
    try:
        apiKey = request.POST["apiKey"]
    except:
        apiKey = request.GET["apiKey"]
    try:
        fileID = request.POST["fileID"]
    except:
        fileID = request.GET["fileID"]

    acc =get_object_or_404(ApiAccount, apiKey = apiKey)
    fc = get_object_or_404(FileCache, account = acc , fileID = fileID)
    return fc




@csrf_exempt
def PDFEditorApi(request):
    if 'rpc' not in request.GET:
        return Response("RPC not defined , please use it in the query params", status=status.HTTP_400_BAD_REQUEST)

    action = request.GET['rpc']
    fc = getFileInRequest(request).attachment
    pageNo = int(request.POST['pageNo'])

    if action in ['addText', 'addTextRelative']:
        if action == 'addText':
            x = int(request.POST['x'])
            y = int(request.POST['y'])
        elif action == 'addTextRelative':
            textRel = request.POST['relative']
            relationship = request.POST['relation']
        font = request.POST['font']
        text = request.POST['text']
        fontSize = int(request.POST['fontSize'])
    elif action in ['drawLine', 'drawRect']:
        p1x = int(request.POST['p1x'])
        p1y = int(request.POST['p1y'])
        p2x = int(request.POST['p2x'])
        p2y = int(request.POST['p2y'])


    if action == 'addText':
        color = request.POST['color']
        addText(fc.path , pageNo, text, x,y,font,fontSize,color)
    elif action == 'drawLine':
        color = request.POST['color']
        # stroke = int(request.POST['stroke'])
        drawLine(fc.path, pageNo, [p1x,p1y], [p2x,p2y], color = color)
    elif action == 'addTextRelative':
        color = request.POST['color']
        addTextRelative(fc.path , pageNo, text, textRel, relationship ,font,fontSize,color)
    elif action == 'drawRect':
        color = request.POST['color']
        rect = QtCore.QRect(QtCore.QPoint(p1x,p1y), QtCore.QPoint(p2x, p2y))
        drawRect(fc.path, pageNo, rect, color)
    elif action == 'drawImage':
        x = int(request.POST['x'])
        y = int(request.POST['y'])
        w = int(request.POST['width'])
        h = int(request.POST['height'])
        imgID = request.POST["imgID"]
        acc =get_object_or_404(ApiAccount, apiKey = request.GET["apiKey"])

        stampsList = ['APPROVED.png', 'AUTHORIZED.png', 'BANNED.png', 'CERTIFIED.png', 'COPY.png', 'DONOT COPY.png', 'DONT COPT.png', 'OFFICIAL DOCUMENTS.png', 'ORIGINAL.png', 'PAID.png', 'PAIDIFULL.png', 'RECIEVE.png', 'SAMPLE.png', 'SCANNED.png', 'SUCCESS.png', 'UNOFFICIAL DOCUMENT.png', 'URGENT.png']

        if imgID in stampsList:
            imgPath = os.path.join(globalSettings.BASE_DIR  , 'static_shared' , 'stamps' , imgID )
        else:
            img = get_object_or_404(FileCache, account = acc , fileID = imgID)
            imgPath = img.attachment.path

        drawImage(fc.path ,pageNo, x,y,imgPath,w,h)

    return JsonResponse({"status": "ok"} ,status =200 )


@csrf_exempt
def PDFReaderApi(request):
    print "PDF Reader start" , request.POST
    if request.method == 'GET':
        if "fileID" not in request.GET:
            return Response("FileID is not supplied", status=status.HTTP_400_BAD_REQUEST)

        fc = getFileInRequest(request)

        if "mode" in request.GET:
            if request.GET["mode"] == "findTitle":
                for pid in range(getMeta(fc.attachment.path)["numPages"]):
                    tables , paras , titles = processDoc(fc.attachment.path, pid, format_= 'json')
                    for title in titles:
                        if title['text']==request.GET["title"]:
                            return JsonResponse({"pageNumber" : pid, "x" : title['x'] , "y" : title['y']} ,status =200 )
                return JsonResponse({"status" : "not found"} ,status =404 )
            elif request.GET["mode"] == "getTitle":
                tables , paras , titles = processDoc(fc.attachment.path, int(request.GET["pageNumber"]), format_= 'json')
                title = titles[int(request.GET["index"])]
                print title
                return JsonResponse({"title" : title['text'] , "x" : title['x'] , "y" : title['y']} ,status =200 )
            elif request.GET["mode"] == "getTable":
                tables , paras , titles = processDoc(fc.attachment.path, int(request.GET["pageNumber"]), format_= 'json')

                table = tables[int(request.GET["index"])]
                return JsonResponse({"table": table} ,status =200 )
            elif request.GET["mode"] == "getParagraph":
                tables , paras , titles = processDoc(fc.attachment.path, int(request.GET["pageNumber"]), format_= 'json')

                para = paras[int(request.GET["index"])]
                return JsonResponse(para ,status =200 )

        res = getMeta(fc.attachment.path)
        return JsonResponse(res ,status =200 )

    else:
        print request.GET
        if "apiKey" not in request.GET or  "fileID" not in request.GET or  "pageNo" not in request.GET:
            return JsonResponse({"res" : "Either the apikey or fileID or pageNo is not supplied"} ,status =401 )

        pageNo = int(request.GET['pageNo'])

        fc = getFileInRequest(request)
        tables , paras , titles = processDoc(fc.attachment.path, pageNo, format_= 'json')
        return JsonResponse({"tables": tables , "paras" : paras , "titles" : titles} ,status =200 )


@csrf_exempt
def NLPParserApi(request):

    if "apiKey" not in request.POST:
        return JsonResponse({"res" : "Invalid API key"} ,status =401 )

    acc =get_object_or_404(ApiAccount, apiKey = request.POST['apiKey'])
    line = request.POST['sent']
    datafields , words,percents, durations , persons , miscs , locations, cleanedTags, dates, money = parseLine(line)

    dArray = []
    for d in dates:
        dArray.append({"str" : d[0] , "date" : d[1] })

    res = {'percents': percents , 'persons' : persons , 'locations' : locations ,'dates':dArray, 'money' : money}
    return JsonResponse(res ,status =200 )
@csrf_exempt
def NlpCorrelationApi(request):
    if "apiKey" not in request.POST:
        return JsonResponse({"res" : "Invalid API key"} ,status =401 )
    acc =get_object_or_404(ApiAccount, apiKey = request.POST['apiKey'])
    line1 = request.POST['sent1']
    line2 = request.POST['sent2']

    toRet = {"similarity" : compareSentance(Statement(line1) , Statement(line2))}
    return JsonResponse(toRet ,status =200 )

import io

def getCurrentImageView(request):
    path = request.GET['path']
    pagenumber = int(request.GET['page'])

    if str(path).lower().endswith('.pdf'):
        doc = fitz.open(str(path))
        # print len(doc)
        page = doc.loadPage(pagenumber) #number of page
        zoom_x = 2.0
        zoom_y = 2.0
        trans = fitz.Matrix(zoom_x, zoom_y).preRotate(0)
        pix = page.getPixmap(matrix=trans, alpha=True)
        d = pix.getPNGData()
        return FileResponse(d, content_type="image/png")

    elif str(path).lower().endswith('.tif'):
        response = HttpResponse(content_type="image/png")
        img = pilIMage.open(path)
        img.seek(pagenumber)
        img = img.convert('RGB')
        img.save(response, "PNG")
        return response
