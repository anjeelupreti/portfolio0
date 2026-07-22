from django.core.mail import EmailMultiAlternatives
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.utils import timezone
from datetime import timedelta

from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import (
    Profile, SocialLink, Experience, Project, SkillCategory,
    Education, Training, Reference, Language, ContactMessage, EmailReply,
    Service, PricingPlan, BlogCategory, BlogTag, BlogPost, BlogComment,
    SiteVisit, SiteSection, SiteTheme, SiteWidget,
)
from .serializers import (
    ProfileSerializer, SocialLinkSerializer, ExperienceSerializer, ProjectSerializer, SkillCategorySerializer,
    EducationSerializer, TrainingSerializer, ReferenceSerializer, LanguageSerializer,
    ContactMessageSerializer, EmailReplySerializer, EmailReplyWriteSerializer,
    ServiceSerializer, PricingPlanSerializer, SiteSectionSerializer, SiteThemeSerializer,
    SiteWidgetSerializer,
    BlogCategorySerializer, BlogTagSerializer,
    BlogPostListSerializer, BlogPostDetailSerializer, BlogPostWriteSerializer,
    BlogCommentSerializer,
)
from .utils import parse_user_agent, get_client_ip, render_branded_email


class SiteSectionViewSet(viewsets.ModelViewSet):
    """CRUD for homepage section visibility flags; public read, staff-only write."""

    queryset = SiteSection.objects.all()
    serializer_class = SiteSectionSerializer

    def get_permissions(self):
        """Anyone can read section flags; only authenticated staff can change them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class SiteThemeView(APIView):
    """Singleton site-wide color theme: public GET, staff-only PATCH."""

    def get_permissions(self):
        """GET is public so the theme can be applied for every visitor; PATCH requires auth."""
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """Return the current (or default) site theme."""
        return Response(SiteThemeSerializer(SiteTheme.load()).data)

    def patch(self, request):
        """Partially update the singleton theme record."""
        theme = SiteTheme.load()
        serializer = SiteThemeSerializer(theme, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SiteWidgetView(APIView):
    """Singleton widget settings (e.g. floating WhatsApp button): public GET, staff-only PATCH."""

    def get_permissions(self):
        """GET is public so widgets render for every visitor; PATCH requires auth."""
        if self.request.method == "GET":
            return [AllowAny()]
        return [IsAuthenticated()]

    def get(self, request):
        """Return the current (or default) widget settings."""
        return Response(SiteWidgetSerializer(SiteWidget.load()).data)

    def patch(self, request):
        """Partially update the singleton widget-settings record."""
        widget = SiteWidget.load()
        serializer = SiteWidgetSerializer(widget, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    """CRUD for the site owner's Profile; public read, staff-only write."""

    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_permissions(self):
        """Anyone can view the profile; only authenticated staff can edit it."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class SocialLinkViewSet(viewsets.ModelViewSet):
    """CRUD for social/contact platform links; public read, staff-only write."""

    queryset = SocialLink.objects.all()
    serializer_class = SocialLinkSerializer

    def get_permissions(self):
        """Anyone can view social links; only authenticated staff can add/edit/remove them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class ExperienceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of work-history entries."""

    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """CRUD for portfolio projects; public read, staff-only write."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        """Anyone can view projects; only authenticated staff can add/edit/remove them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class SkillCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of skill categories with nested skills."""

    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer


class EducationViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of education entries."""

    queryset = Education.objects.all()
    serializer_class = EducationSerializer


class TrainingViewSet(viewsets.ModelViewSet):
    """CRUD for certifications/training entries; public read, staff-only write."""

    queryset = Training.objects.all()
    serializer_class = TrainingSerializer

    def get_permissions(self):
        """Anyone can view trainings; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class ReferenceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of professional references."""

    queryset = Reference.objects.all()
    serializer_class = ReferenceSerializer


class LanguageViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of spoken languages."""

    queryset = Language.objects.all()
    serializer_class = LanguageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    """Public endpoint the contact form posts to; creates a ContactMessage record."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer


class ContactMessageViewSet(viewsets.ReadOnlyModelViewSet):
    """Staff-only inbox for viewing contact form submissions."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        """Flip is_read on a message, used when staff opens it in the dashboard inbox."""
        message = self.get_object()
        message.is_read = True
        message.save(update_fields=["is_read"])
        return Response(self.get_serializer(message).data)


class SendEmailView(APIView):
    """
    Sends a themed HTML email from the dashboard (either a reply to a
    ContactMessage or a standalone Compose email) and stores it as an
    EmailReply record for the thread/history view.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Validate input, send the branded email, and record the outcome as an EmailReply.

        Persists the EmailReply before attempting SMTP send so a history record exists
        even if delivery fails; on failure the error is stored on the reply instead of
        raising, so the dashboard can show a per-message send status.
        """
        serializer = EmailReplyWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        contact_message = data.get("contact_message")
        to_email = data["to_email"]
        subject = data["subject"]
        body_html = data["body_html"]

        reply = EmailReply.objects.create(
            contact_message=contact_message,
            to_email=to_email,
            subject=subject,
            body_html=body_html,
            sender=request.user,
        )

        try:
            html_content = render_branded_email(body_html)
            email = EmailMultiAlternatives(
                subject=subject,
                body=body_html,
                to=[to_email],
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
        except Exception as exc:
            reply.send_error = str(exc)[:500]
            reply.save(update_fields=["send_error"])
            return Response(EmailReplySerializer(reply).data, status=status.HTTP_502_BAD_GATEWAY)

        if contact_message and not contact_message.is_read:
            contact_message.is_read = True
            contact_message.save(update_fields=["is_read"])

        return Response(EmailReplySerializer(reply).data, status=status.HTTP_201_CREATED)


class ServiceViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of active service offerings."""

    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer


class PricingPlanViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of pricing plans with nested features."""

    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of blog categories."""

    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer


class BlogTagViewSet(viewsets.ReadOnlyModelViewSet):
    """Public read-only listing of blog tags."""

    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer


class BlogPostViewSet(viewsets.ModelViewSet):
    """CRUD for blog posts, looked up by slug; staff see drafts, the public only sees published posts."""

    lookup_field = "slug"

    def get_queryset(self):
        """Staff can see drafts and published posts; anonymous/non-staff users only see published ones."""
        user = self.request.user
        if user.is_authenticated and user.is_staff:
            return BlogPost.objects.all()
        return BlogPost.objects.filter(status="published")

    def get_serializer_class(self):
        """Use the write serializer for mutations, the detail serializer for single-post reads,
        and the lighter list serializer otherwise."""
        if self.action in ("create", "update", "partial_update"):
            return BlogPostWriteSerializer
        if self.action == "retrieve":
            return BlogPostDetailSerializer
        return BlogPostListSerializer

    def get_permissions(self):
        """Anyone can read posts; only authenticated staff can create/edit/delete."""
        if self.action in ("create", "update", "partial_update", "destroy"):
            return [IsAuthenticated()]
        return [AllowAny()]

    def perform_create(self, serializer):
        """Stamp the logged-in staff user as the post's author on creation."""
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Increment view_count on published posts before returning them (drafts don't count views)."""
        instance = self.get_object()
        if instance.status == "published":
            BlogPost.objects.filter(pk=instance.pk).update(view_count=instance.view_count + 1)
            instance.refresh_from_db()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class BlogCommentViewSet(viewsets.ModelViewSet):
    """CRUD for blog comments; anyone can submit a comment, only staff can moderate/manage them."""

    queryset = BlogComment.objects.all()
    serializer_class = BlogCommentSerializer

    def get_permissions(self):
        """Public visitors can post new comments; all other actions (moderation) require staff."""
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]


class AnalyticsSummaryView(APIView):
    """Staff-only dashboard endpoint aggregating SiteVisit records into summary stats."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        """Build the analytics summary: totals, a 7-day trend, and top pages/device/browser/country breakdowns."""
        total_visits = SiteVisit.objects.count()

        since = timezone.now() - timedelta(days=7)
        visits_last_7_days_qs = (
            SiteVisit.objects.filter(visited_at__gte=since)
            .annotate(date=TruncDate("visited_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )
        visits_last_7_days = [
            {"date": row["date"].isoformat(), "count": row["count"]} for row in visits_last_7_days_qs
        ]

        top_pages_qs = (
            SiteVisit.objects.values("path")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        top_pages = [{"path": row["path"], "count": row["count"]} for row in top_pages_qs]

        device_breakdown_qs = (
            SiteVisit.objects.exclude(device_type="")
            .values("device_type")
            .annotate(count=Count("id"))
        )
        device_breakdown = {row["device_type"]: row["count"] for row in device_breakdown_qs}

        browser_breakdown_qs = (
            SiteVisit.objects.exclude(browser="")
            .values("browser")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )
        browser_breakdown = [{"browser": row["browser"], "count": row["count"]} for row in browser_breakdown_qs]

        country_breakdown_qs = (
            SiteVisit.objects.exclude(country="")
            .values("country")
            .annotate(count=Count("id"))
            .order_by("-count")[:10]
        )
        country_breakdown = [{"country": row["country"], "count": row["count"]} for row in country_breakdown_qs]

        return Response({
            "total_visits": total_visits,
            "visits_last_7_days": visits_last_7_days,
            "top_pages": top_pages,
            "device_breakdown": device_breakdown,
            "browser_breakdown": browser_breakdown,
            "country_breakdown": country_breakdown,
        })


class TrackVisitView(APIView):
    """Public endpoint the frontend pings on each pageview to log a SiteVisit for analytics."""

    permission_classes = [AllowAny]

    def post(self, request):
        """Parse the request's user agent/IP and store a new SiteVisit row."""
        path = request.data.get("path", "")
        referrer = request.data.get("referrer", "")
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        parsed = parse_user_agent(user_agent)
        ip_address = get_client_ip(request)

        SiteVisit.objects.create(
            path=path,
            user_agent=user_agent,
            referrer=referrer,
            device_type=parsed["device_type"],
            browser=parsed["browser"],
            os=parsed["os"],
            ip_address=ip_address,
        )
        return Response(status=status.HTTP_201_CREATED)
