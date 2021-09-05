from django.core.exceptions import PermissionDenied , SuspiciousOperation
import re
from django.conf import settings as globalSettings
regex = re.compile('^HTTP_')
apiList = ['api/marketing/schedule','api/marketing/leads','api/marketing/inviteMail']

class simple_middleware(object):
    def process_request(self, request):
        domainRFR = request.META.get('HTTP_REFERER', '')
        domainHST = request.META.get('HTTP_HOST', '')
        domainORG = request.META.get('HTTP_ORIGIN', '')
        if len(domainRFR)>0:
            domainUrl = domainRFR
        elif len(domainHST)>0:
            domainUrl = 'http://'+domainHST
        else:
            domainUrl = domainORG
        # print domainUrl,'ffffffffffffffff'

        if any(str(domainUrl).startswith(domain) for domain in globalSettings.TRUSTED_DOMAINS) or domainHST in globalSettings.SITE_ADDRESS:
            try:
                # print dict((regex.sub('', header), value) for (header, value) in request.META.items() if header.startswith('HTTP_'))
                if any(api in request.META['PATH_INFO'] for api in apiList):
                    if 'HTTP_X_CSRFTOKEN' not in request.META:
                        request.META['HTTP_X_CSRFTOKEN'] = str(request.META['HTTP_COOKIE']).split(';')[0].split('csrftoken=')[1]
                        # print 'updateddddddddddddddddd HTTP_X_CSRFTOKEN '
            except:
                pass
            return None
        else:
            print 'unknown domain'
            # raise SuspiciousOperation('Not Authorized')
