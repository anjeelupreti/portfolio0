"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

import re

from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.decorators.clickjacking import xframe_options_exempt
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("portfolio_api.urls")),
]

# django.conf.urls.static.static() only adds this pattern when DEBUG=True —
# it's a no-op in production, which is why media uploads 404'd even after
# wiring MEDIA_ROOT/MEDIA_URL correctly. Call django.views.static.serve
# directly instead so uploaded files (resume, profile photo, certificates)
# are actually served regardless of DEBUG. Not using nginx/a CDN for this
# given the project's scale — see the README's known-limitations note.
#
# xframe_options_exempt: Django's default X-Frame-Options: DENY (from
# SecurityMiddleware) blocks the resume/certificate PDF preview modal's
# <iframe> from rendering at all. Only exempted for this media-serving view,
# not site-wide, so clickjacking protection still applies everywhere else.
urlpatterns += [
    re_path(
        r"^%s(?P<path>.*)$" % re.escape(settings.MEDIA_URL.lstrip("/")),
        xframe_options_exempt(serve),
        {"document_root": settings.MEDIA_ROOT},
    ),
]
