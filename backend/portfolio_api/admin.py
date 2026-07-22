from django.contrib import admin

from .models import (
    Profile, SocialLink, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, ContactMessage, EmailReply, SiteVisit,
    Service, PricingPlan, PricingFeature, SiteSection, SiteTheme, SiteWidget, EmailSettings,
    BlogCategory, BlogTag, BlogPost, BlogComment,
)


@admin.register(EmailReply)
class EmailReplyAdmin(admin.ModelAdmin):
    """Admin listing for sent dashboard emails."""

    list_display = ("to_email", "subject", "contact_message", "sender", "sent_at", "send_error")
    list_filter = ("sent_at",)
    search_fields = ("to_email", "subject", "body_html")


@admin.register(SiteSection)
class SiteSectionAdmin(admin.ModelAdmin):
    """Admin listing for homepage section visibility flags, editable inline."""

    list_display = ("label", "key", "is_visible", "order")
    list_editable = ("is_visible", "order")
    search_fields = ("label", "key")


@admin.register(SiteTheme)
class SiteThemeAdmin(admin.ModelAdmin):
    """Admin for the singleton site theme; blocks adding a second row or deleting the only one."""

    list_display = ("preset", "primary_color", "secondary_color", "updated_at")

    def has_add_permission(self, request):
        """Only allow adding if no SiteTheme row exists yet (enforces singleton)."""
        return not SiteTheme.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Never allow deleting the singleton theme row."""
        return False


@admin.register(SiteWidget)
class SiteWidgetAdmin(admin.ModelAdmin):
    """Admin for the singleton widget settings; blocks adding a second row or deleting the only one."""

    list_display = ("whatsapp_enabled", "whatsapp_number", "updated_at")

    def has_add_permission(self, request):
        """Only allow adding if no SiteWidget row exists yet (enforces singleton)."""
        return not SiteWidget.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Never allow deleting the singleton widget-settings row."""
        return False


@admin.register(EmailSettings)
class EmailSettingsAdmin(admin.ModelAdmin):
    """Admin for the singleton contact-form email settings; blocks adding a second row or deleting the only one."""

    list_display = ("notify_owner_enabled", "auto_reply_enabled", "auto_reply_subject", "updated_at")

    def has_add_permission(self, request):
        """Only allow adding if no EmailSettings row exists yet (enforces singleton)."""
        return not EmailSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        """Never allow deleting the singleton email-settings row."""
        return False


class ExperienceHighlightInline(admin.TabularInline):
    """Inline editor for highlight bullets on the Experience admin page."""

    model = ExperienceHighlight
    extra = 1


class PricingFeatureInline(admin.TabularInline):
    """Inline editor for feature bullets on the PricingPlan admin page."""

    model = PricingFeature
    extra = 1


class SkillInline(admin.TabularInline):
    """Inline editor for skills on the SkillCategory admin page."""

    model = Skill
    extra = 1


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    """Admin listing for the site owner's profile."""

    list_display = ("full_name", "title", "email", "open_to_work", "updated_at")
    search_fields = ("full_name", "title", "email")


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    """Admin listing for social/contact platform links, editable inline for quick toggling."""

    list_display = ("platform", "url", "is_visible", "order")
    list_editable = ("is_visible", "order")
    list_filter = ("platform", "is_visible")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    """Admin listing for work-history entries, with inline highlight bullets."""

    list_display = ("role", "company", "start_date", "end_date", "is_current", "order")
    list_filter = ("is_current",)
    search_fields = ("role", "company")
    inlines = [ExperienceHighlightInline]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    """Admin listing for portfolio projects."""

    list_display = ("title", "featured", "order", "created_at")
    list_filter = ("featured",)
    search_fields = ("title", "description")


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    """Admin listing for skill categories, with inline skills."""

    list_display = ("name", "order")
    search_fields = ("name",)
    inlines = [SkillInline]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    """Admin listing for individual skills."""

    list_display = ("name", "category", "proficiency", "order")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    """Admin listing for education entries."""

    list_display = ("degree", "institution", "start_year", "end_year", "order")
    search_fields = ("degree", "institution")


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    """Admin listing for certification/training entries."""

    list_display = ("title", "provider", "certificate_file", "order")
    search_fields = ("title", "provider")


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    """Admin listing for professional references."""

    list_display = ("name", "role", "company", "email", "order")
    search_fields = ("name", "company")


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    """Admin listing for spoken languages."""

    list_display = ("name", "proficiency_label", "proficiency_level", "order")
    search_fields = ("name",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    """Admin listing for inbound contact form messages."""

    list_display = ("name", "email", "subject", "created_at", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    """Admin listing for raw pageview/analytics records."""

    list_display = ("path", "visited_at", "device_type", "browser", "os", "country", "ip_address")
    list_filter = ("device_type", "browser", "os", "country")
    search_fields = ("path", "user_agent", "ip_address")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    """Admin listing for service offerings."""

    list_display = ("title", "icon_name", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title",)


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    """Admin listing for pricing plans, with inline features."""

    list_display = ("name", "price", "billing_period", "is_featured", "order")
    list_filter = ("is_featured",)
    search_fields = ("name",)
    inlines = [PricingFeatureInline]


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    """Admin listing for blog categories, with slug auto-populated from name."""

    list_display = ("name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    """Admin listing for blog tags, with slug auto-populated from name."""

    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    """Admin listing/editor for blog posts, with slug auto-populated from title."""

    list_display = ("title", "category", "author", "status", "published_at", "view_count")
    list_filter = ("status", "category", "tags")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    """Admin listing for blog comments, with a bulk-approve action."""

    list_display = ("name", "email", "post", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "email", "content")
    actions = ["approve_comments"]

    def approve_comments(self, request, queryset):
        """Bulk-approve the selected comments so they show up on the public site."""
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approve selected comments"
