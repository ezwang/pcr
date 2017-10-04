from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings
import mimetypes
import urllib2

from lib.api import api


def static(request, page):
  context = {
      'base_dir': './',
      'content': api('pcrsite-static', page)
    }
  return render(request, 'static.html', context)



def proxy(request, path):
    url = '%s%s%s' % (settings.DOMAIN, path, '?token=D6cPWQc5czjT4v2Vp_h8PjFLs1OkKQ')
    try:
        proxied_request = urllib2.urlopen(url)
        status_code = proxied_request.code
        mimetype = proxied_request.headers.typeheader or mimetypes.guess_type(url)
        content = proxied_request.read()
    except urllib2.HTTPError as e:
        return HttpResponse(e.msg, status=e.code, mimetype='text/plain')
    else:
        return HttpResponse(content, status=status_code, mimetype=mimetype)
