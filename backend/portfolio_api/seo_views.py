"""Sitemap and robots.txt views, served from the site root (not under /api/) so crawlers
find them at the conventional /sitemap.xml and /robots.txt paths. These describe the public
React frontend's routes, not the Django backend's own URLs."""

from django.conf import settings
from django.http import HttpResponse

from .models import BlogPost

STATIC_PATHS = ["", "blog"]


def sitemap_xml(request):
    """Generates a sitemap listing the frontend's static routes plus every published blog post."""
    base_url = settings.FRONTEND_URL.rstrip("/")
    urls = [f"{base_url}/{path}".rstrip("/") or base_url for path in STATIC_PATHS]
    urls += [
        f"{base_url}/blog/{slug}"
        for slug in BlogPost.objects.filter(status="published").values_list("slug", flat=True)
    ]

    body = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url in urls:
        body.append(f"<url><loc>{url}</loc></url>")
    body.append("</urlset>")

    return HttpResponse("".join(body), content_type="application/xml")


def robots_txt(request):
    """Allows all crawling and points to the sitemap."""
    base_url = settings.FRONTEND_URL.rstrip("/")
    body = "User-agent: *\nAllow: /\n\nSitemap: {}/sitemap.xml\n".format(base_url)
    return HttpResponse(body, content_type="text/plain")
