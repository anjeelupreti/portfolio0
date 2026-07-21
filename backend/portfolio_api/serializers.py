from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import (
    Profile, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, ContactMessage, EmailReply,
    Service, PricingPlan, PricingFeature, SiteSection, SiteTheme, SiteWidget,
    BlogCategory, BlogTag, BlogPost, BlogComment,
)

User = get_user_model()


class SiteSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSection
        fields = ["id", "key", "label", "is_visible", "order"]


class SiteThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteTheme
        fields = ["preset", "primary_color", "secondary_color", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate_primary_color(self, value):
        return self._validate_hex(value)

    def validate_secondary_color(self, value):
        return self._validate_hex(value)

    @staticmethod
    def _validate_hex(value):
        import re
        if not re.match(r"^#[0-9a-fA-F]{6}$", value):
            raise serializers.ValidationError("Must be a hex color like #d9ff4b.")
        return value


class SiteWidgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteWidget
        fields = ["whatsapp_enabled", "whatsapp_number", "whatsapp_default_message", "updated_at"]
        read_only_fields = ["updated_at"]

    def validate_whatsapp_number(self, value):
        import re
        if value and not re.match(r"^\+[1-9]\d{7,14}$", value):
            raise serializers.ValidationError(
                "Must be in international format with country code, e.g. +9779843951313."
            )
        return value


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = "__all__"


class ExperienceHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExperienceHighlight
        fields = ["id", "text", "order"]


class ExperienceSerializer(serializers.ModelSerializer):
    highlights = ExperienceHighlightSerializer(many=True, read_only=True)

    class Meta:
        model = Experience
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "proficiency", "order"]


class SkillCategorySerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = SkillCategory
        fields = ["id", "name", "order", "skills"]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = "__all__"


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = "__all__"


class ReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reference
        fields = "__all__"


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = "__all__"


class EmailReplySerializer(serializers.ModelSerializer):
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
    replies = EmailReplySerializer(many=True, read_only=True)

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "subject", "message", "created_at", "is_read", "replies"]
        read_only_fields = ["id", "created_at", "is_read", "replies"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class PricingFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingFeature
        fields = ["id", "text", "included", "order"]


class PricingPlanSerializer(serializers.ModelSerializer):
    features = PricingFeatureSerializer(many=True, read_only=True)

    class Meta:
        model = PricingPlan
        fields = "__all__"


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = "__all__"


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = "__all__"


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = ["id", "post", "name", "email", "content", "created_at", "is_approved"]
        read_only_fields = ["id", "created_at", "is_approved"]


class BlogPostListSerializer(serializers.ModelSerializer):
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
        approved = obj.comments.filter(is_approved=True)
        return BlogCommentSerializer(approved, many=True).data


class BlogPostWriteSerializer(serializers.ModelSerializer):
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
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name"]
        read_only_fields = ["id", "username"]

    def validate_email(self, value):
        qs = User.objects.filter(email=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if value and qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
