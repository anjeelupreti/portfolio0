from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Profile, SocialLink, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, ContactMessage, EmailReply,
    Service, PricingPlan, PricingFeature, SiteSection, SiteTheme, SiteWidget, EmailSettings,
    BlogCategory, BlogTag, BlogPost, BlogComment,
)

User = get_user_model()


class SiteSectionSerializer(serializers.ModelSerializer):
    """(De)serializes homepage section visibility flags for the dashboard toggle UI."""

    class Meta:
        model = SiteSection
        fields = ["id", "key", "label", "is_visible", "order"]


class SiteThemeSerializer(serializers.ModelSerializer):
    """(De)serializes the singleton site color theme, enforcing hex color format on write."""

    class Meta:
        model = SiteTheme
        fields = ["preset", "primary_color", "secondary_color", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate_primary_color(self, value):
        """Ensure the submitted primary color is a valid hex string."""
        return self._validate_hex(value)

    def validate_secondary_color(self, value):
        """Ensure the submitted secondary color is a valid hex string."""
        return self._validate_hex(value)

    @staticmethod
    def _validate_hex(value):
        """Shared hex-color check used by both color field validators."""
        import re
        if not re.match(r"^#[0-9a-fA-F]{6}$", value):
            raise serializers.ValidationError("Must be a hex color like #d9ff4b.")
        return value


class SiteWidgetSerializer(serializers.ModelSerializer):
    """(De)serializes the singleton site widget toggles (WhatsApp, cookie banner, etc)."""

    class Meta:
        model = SiteWidget
        fields = [
            "whatsapp_enabled", "whatsapp_number", "whatsapp_default_message",
            "scroll_to_top_enabled", "resume_download_enabled",
            "blog_share_enabled", "cookie_banner_enabled", "cookie_banner_message",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_whatsapp_number(self, value):
        """Require international format (leading + and country code) so the wa.me link works."""
        import re
        if value and not re.match(r"^\+[1-9]\d{7,14}$", value):
            raise serializers.ValidationError(
                "Must be in international format with country code, e.g. +9779843951313."
            )
        return value


class EmailSettingsSerializer(serializers.ModelSerializer):
    """(De)serializes the singleton contact-form email behavior settings (owner notification, visitor auto-reply)."""

    class Meta:
        model = EmailSettings
        fields = [
            "notify_owner_enabled",
            "auto_reply_enabled", "auto_reply_subject", "auto_reply_message",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]


class ProfileSerializer(serializers.ModelSerializer):
    """(De)serializes the single Profile record (bio and contact info). Social links live separately on SocialLink."""

    class Meta:
        model = Profile
        fields = "__all__"


class SocialLinkSerializer(serializers.ModelSerializer):
    """(De)serializes one social/contact platform link, including its human-readable platform label."""

    platform_label = serializers.CharField(source="get_platform_display", read_only=True)

    class Meta:
        model = SocialLink
        fields = ["id", "platform", "platform_label", "url", "is_visible", "order"]


class ExperienceHighlightSerializer(serializers.ModelSerializer):
    """(De)serializes a single bullet point under an Experience entry."""

    class Meta:
        model = ExperienceHighlight
        fields = ["id", "text", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    """(De)serializes a work-history entry, nesting its highlights read-only."""

    highlights = ExperienceHighlightSerializer(many=True, read_only=True)

    class Meta:
        model = Experience
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    """(De)serializes a portfolio project entry."""

    class Meta:
        model = Project
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    """(De)serializes a single skill with its proficiency score."""

    class Meta:
        model = Skill
        fields = ["id", "name", "proficiency", "order"]


class SkillCategorySerializer(serializers.ModelSerializer):
    """(De)serializes a skill category, nesting its skills read-only."""

    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillCategory
        fields = ["id", "name", "order", "skills"]


class EducationSerializer(serializers.ModelSerializer):
    """(De)serializes an education/degree entry."""

    class Meta:
        model = Education
        fields = "__all__"


class TrainingSerializer(serializers.ModelSerializer):
    """(De)serializes a certification/training entry, including its certificate file."""

    class Meta:
        model = Training
        fields = "__all__"


class ReferenceSerializer(serializers.ModelSerializer):
    """(De)serializes a professional reference entry."""

    class Meta:
        model = Reference
        fields = "__all__"


class LanguageSerializer(serializers.ModelSerializer):
    """(De)serializes a spoken language proficiency entry."""

    class Meta:
        model = Language
        fields = "__all__"


class EmailReplySerializer(serializers.ModelSerializer):
    """Read serializer for a sent EmailReply; exposes the sender's username alongside the FK."""

    sender_username = serializers.CharField(source="sender.username", read_only=True, default=None)

    class Meta:
        model = EmailReply
        fields = [
            "id", "contact_message", "to_email", "subject", "body_html",
            "sender", "sender_username", "sent_at", "send_error",
        ]
        read_only_fields = ["id", "sender", "sender_username", "sent_at", "send_error"]


class EmailReplyWriteSerializer(serializers.Serializer):
    """Input shape for sending a reply/compose email — not directly a ModelSerializer
    since sending happens in the view (needs SMTP + branded-template rendering)."""

    contact_message = serializers.PrimaryKeyRelatedField(
        queryset=ContactMessage.objects.all(), required=False, allow_null=True
    )
    to_email = serializers.EmailField()
    subject = serializers.CharField(max_length=200)
    body_html = serializers.CharField()


class ContactMessageSerializer(serializers.ModelSerializer):
    """(De)serializes an inbound contact form message, nesting any sent replies read-only."""

    replies = EmailReplySerializer(many=True, read_only=True)

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "subject", "message", "created_at", "is_read", "replies"]
        read_only_fields = ["id", "created_at", "is_read", "replies"]


class ServiceSerializer(serializers.ModelSerializer):
    """(De)serializes a service offering entry."""

    class Meta:
        model = Service
        fields = "__all__"


class PricingFeatureSerializer(serializers.ModelSerializer):
    """(De)serializes a single feature line under a pricing plan. `plan` is required on create/update but omitted from the nested read-only listing on PricingPlanSerializer."""

    class Meta:
        model = PricingFeature
        fields = ["id", "plan", "text", "included", "order"]


class PricingPlanSerializer(serializers.ModelSerializer):
    """(De)serializes a pricing plan, nesting its features read-only."""

    features = PricingFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = PricingPlan
        fields = "__all__"


class BlogCategorySerializer(serializers.ModelSerializer):
    """(De)serializes a blog category."""

    class Meta:
        model = BlogCategory
        fields = "__all__"


class BlogTagSerializer(serializers.ModelSerializer):
    """(De)serializes a blog tag."""

    class Meta:
        model = BlogTag
        fields = "__all__"


class BlogCommentSerializer(serializers.ModelSerializer):
    """(De)serializes a blog comment; approval state is server-controlled, not client-writable."""

    class Meta:
        model = BlogComment
        fields = ["id", "post", "name", "email", "content", "created_at", "is_approved"]
        read_only_fields = ["id", "created_at", "is_approved"]


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight read serializer for blog list views — omits full content for smaller payloads."""

    author = serializers.CharField(source="author.username", read_only=True, default=None)
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "cover_image",
            "category", "tags", "author", "status", "published_at", "view_count",
        ]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Full read serializer for a single blog post, including body content and approved comments."""

    author = serializers.CharField(source="author.username", read_only=True, default=None)
    category = BlogCategorySerializer(read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "content", "cover_image",
            "category", "tags", "author", "status", "published_at",
            "created_at", "updated_at", "view_count", "comments",
        ]

    def get_comments(self, obj):
        """Return only approved comments — unapproved ones stay hidden from the public site."""
        approved = obj.comments.filter(is_approved=True)
        return BlogCommentSerializer(approved, many=True).data


class BlogPostWriteSerializer(serializers.ModelSerializer):
    """Write serializer for the admin blog editor; accepts category/tags by primary key."""

    category = serializers.PrimaryKeyRelatedField(
        queryset=BlogCategory.objects.all(), required=False, allow_null=True
    )
    tags = serializers.PrimaryKeyRelatedField(queryset=BlogTag.objects.all(), many=True, required=False)

    class Meta:
        model = BlogPost
        fields = [
            "id", "title", "slug", "excerpt", "content", "cover_image",
            "category", "tags", "status", "published_at",
            "created_at", "updated_at", "view_count",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "view_count"]


class UserProfileSerializer(serializers.ModelSerializer):
    """(De)serializes the admin user's own account fields for the dashboard profile-edit page."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username"]

    def validate_email(self, value):
        """Reject emails already used by another user account."""
        qs = User.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if value and qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
