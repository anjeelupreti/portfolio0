import threading

from django.conf import settings as django_settings
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
    Profile, SocialLink, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, ContactMessage, EmailReply,
    Service, PricingPlan, PricingFeature, BlogCategory, BlogTag, BlogPost, BlogComment,
    SiteVisit, SiteSection, SiteTheme, SiteWidget, EmailSettings,
)
from .serializers import (
    ProfileSerializer, SocialLinkSerializer, ExperienceSerializer, ExperienceHighlightSerializer,
    ProjectSerializer, SkillCategorySerializer, SkillSerializer,
    EducationSerializer, TrainingSerializer, ReferenceSerializer, LanguageSerializer,
    ContactMessageSerializer, EmailReplySerializer, EmailReplyWriteSerializer,
    ServiceSerializer, PricingPlanSerializer, PricingFeatureSerializer, SiteSectionSerializer, SiteThemeSerializer,
    SiteWidgetSerializer, EmailSettingsSerializer,
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


class EmailSettingsView(APIView):
    """Singleton contact-form email settings: staff-only GET/PATCH (visitors never need to see the auto-reply template)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Return the current (or default) email settings."""
        return Response(EmailSettingsSerializer(EmailSettings.load()).data)

    def patch(self, request):
        """Partially update the singleton email-settings record."""
        settings_obj = EmailSettings.load()
        serializer = EmailSettingsSerializer(settings_obj, data=request.data, partial=True)
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


class ExperienceViewSet(viewsets.ModelViewSet):
    """CRUD for work-history entries; public read, staff-only write."""

    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer

    def get_permissions(self):
        """Anyone can view experience entries; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class ExperienceHighlightViewSet(viewsets.ModelViewSet):
    """Staff-only CRUD for individual highlight bullets under an Experience entry (read via the parent's nested list on the public site)."""

    queryset = ExperienceHighlight.objects.all()
    serializer_class = ExperienceHighlightSerializer
    permission_classes = [IsAuthenticated]


class ProjectViewSet(viewsets.ModelViewSet):
    """CRUD for portfolio projects; public read, staff-only write."""

    queryset = Project.objects.all()
    serializer_class = ProjectSerializer

    def get_permissions(self):
        """Anyone can view projects; only authenticated staff can add/edit/remove them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class SkillCategoryViewSet(viewsets.ModelViewSet):
    """CRUD for skill categories with nested skills; public read, staff-only write."""

    queryset = SkillCategory.objects.all()
    serializer_class = SkillCategorySerializer

    def get_permissions(self):
        """Anyone can view skill categories; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class SkillViewSet(viewsets.ModelViewSet):
    """Staff-only CRUD for individual skills under a SkillCategory (read via the parent's nested list on the public site)."""

    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]


class EducationViewSet(viewsets.ModelViewSet):
    """CRUD for education/degree entries; public read, staff-only write."""

    queryset = Education.objects.all()
    serializer_class = EducationSerializer

    def get_permissions(self):
        """Anyone can view education entries; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class TrainingViewSet(viewsets.ModelViewSet):
    """CRUD for certifications/training entries; public read, staff-only write."""

    queryset = Training.objects.all()
    serializer_class = TrainingSerializer

    def get_permissions(self):
        """Anyone can view trainings; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class ReferenceViewSet(viewsets.ModelViewSet):
    """CRUD for professional references; public read, staff-only write."""

    queryset = Reference.objects.all()
    serializer_class = ReferenceSerializer

    def get_permissions(self):
        """Anyone can view references; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class LanguageViewSet(viewsets.ModelViewSet):
    """CRUD for spoken languages; public read, staff-only write."""

    queryset = Language.objects.all()
    serializer_class = LanguageSerializer

    def get_permissions(self):
        """Anyone can view languages; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class ContactMessageCreateView(generics.CreateAPIView):
    """
    Public endpoint the contact form posts to; creates a ContactMessage record,
    then (per EmailSettings) emails the owner a notification and/or emails the
    visitor an auto-reply confirmation.

    Both emails are sent from a background thread, not inline, so the HTTP
    response always returns as soon as the message is saved — a slow or
    blocked SMTP connection (e.g. on hosts that restrict outbound SMTP) can
    no longer make the request itself hang or time out client-side. Each
    send is still wrapped in its own try/except so a failure there is just
    silently dropped rather than raised anywhere.
    """

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def perform_create(self, serializer):
        """Save the message, then fire the notification/auto-reply emails on a background thread."""
        contact_message = serializer.save()
        settings_obj = EmailSettings.load()
        profile = Profile.objects.first()
        owner_name = profile.full_name if profile else "the site owner"

        def send_emails():
            if settings_obj.notify_owner_enabled:
                self._send_owner_notification(contact_message)
            if settings_obj.auto_reply_enabled:
                self._send_auto_reply(contact_message, settings_obj, owner_name)

        threading.Thread(target=send_emails, daemon=True).start()

    @staticmethod
    def _send_owner_notification(contact_message):
        """Email CONTACT_RECEIVER_EMAIL with the submitted message; failure is logged, not raised."""
        try:
            phone_line_html = f"<p><strong>Phone:</strong> {contact_message.phone}</p>" if contact_message.phone else ""
            phone_line_text = f"Phone: {contact_message.phone}\n" if contact_message.phone else ""
            body_html = (
                f"<p><strong>From:</strong> {contact_message.name} ({contact_message.email})</p>"
                f"{phone_line_html}"
                f"<p><strong>Subject:</strong> {contact_message.subject or '(no subject)'}</p>"
                f"<p>{contact_message.message}</p>"
            )
            email = EmailMultiAlternatives(
                subject=f"New contact form message: {contact_message.subject or contact_message.name}",
                body=(
                    f"From: {contact_message.name} ({contact_message.email})\n"
                    f"{phone_line_text}"
                    f"Subject: {contact_message.subject or '(no subject)'}\n\n"
                    f"{contact_message.message}"
                ),
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                to=[django_settings.CONTACT_RECEIVER_EMAIL],
                reply_to=[contact_message.email],
            )
            email.attach_alternative(render_branded_email(body_html), "text/html")
            email.send(fail_silently=True)
        except Exception:
            pass

    @staticmethod
    def _send_auto_reply(contact_message, settings_obj, owner_name):
        """Email the visitor a confirmation using the dashboard-editable template; failure is logged, not raised."""
        try:
            message_text = settings_obj.auto_reply_message.format(
                name=contact_message.name, owner_name=owner_name
            )
            body_html = message_text.replace("\n", "<br>")
            email = EmailMultiAlternatives(
                subject=settings_obj.auto_reply_subject,
                body=message_text,
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                to=[contact_message.email],
            )
            email.attach_alternative(render_branded_email(body_html), "text/html")
            email.send(fail_silently=True)
        except Exception:
            pass


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


class ServiceViewSet(viewsets.ModelViewSet):
    """CRUD for service offerings; public read (active only), staff-only write (sees all, including inactive)."""

    serializer_class = ServiceSerializer

    def get_queryset(self):
        """Visitors only see active services; staff managing the list see everything."""
        if self.action in ("list", "retrieve") and not (
            self.request.user and self.request.user.is_authenticated
        ):
            return Service.objects.filter(is_active=True)
        return Service.objects.all()

    def get_permissions(self):
        """Anyone can view active services; only authenticated staff can edit them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class PricingPlanViewSet(viewsets.ModelViewSet):
    """CRUD for pricing plans; public read, staff-only write."""

    queryset = PricingPlan.objects.all()
    serializer_class = PricingPlanSerializer

    def get_permissions(self):
        """Anyone can view pricing plans; only authenticated staff can add/edit/remove them."""
        if self.action in ("list", "retrieve"):
            return [AllowAny()]
        return [IsAuthenticated()]


class PricingFeatureViewSet(viewsets.ModelViewSet):
    """Staff-only CRUD for individual feature bullets under a pricing plan (read via the plan's nested list on the public site)."""

    queryset = PricingFeature.objects.all()
    serializer_class = PricingFeatureSerializer
    permission_classes = [IsAuthenticated]


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
