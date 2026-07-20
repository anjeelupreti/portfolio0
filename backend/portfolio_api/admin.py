from django.contrib import admin

from .models import (
    Profile, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, ContactMessage, SiteVisit,
    Service, PricingPlan, PricingFeature, SiteSection,
    BlogCategory, BlogTag, BlogPost, BlogComment,
)


@admin.register(SiteSection)
class SiteSectionAdmin(admin.ModelAdmin):
    list_display = ("label", "key", "is_visible", "order")
    list_editable = ("is_visible", "order")
    search_fields = ("label", "key")


class ExperienceHighlightInline(admin.TabularInline):
    model = ExperienceHighlight
    extra = 1


class PricingFeatureInline(admin.TabularInline):
    model = PricingFeature
    extra = 1


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 1


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "title", "email", "open_to_work", "updated_at")
    search_fields = ("full_name", "title", "email")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("role", "company", "start_date", "end_date", "is_current", "order")
    list_filter = ("is_current",)
    search_fields = ("role", "company")
    inlines = [ExperienceHighlightInline]


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "featured", "order", "created_at")
    list_filter = ("featured",)
    search_fields = ("title", "description")


@admin.register(SkillCategory)
class SkillCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    search_fields = ("name",)
    inlines = [SkillInline]


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "proficiency", "order")
    list_filter = ("category",)
    search_fields = ("name",)


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ("degree", "institution", "start_year", "end_year", "order")
    search_fields = ("degree", "institution")


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ("title", "provider", "order")
    search_fields = ("title", "provider")


@admin.register(Reference)
class ReferenceAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "company", "email", "order")
    search_fields = ("name", "company")


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ("name", "proficiency_label", "proficiency_level", "order")
    search_fields = ("name",)


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created_at", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("name", "email", "subject", "message")


@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display = ("path", "visited_at", "device_type", "browser", "os", "country", "ip_address")
    list_filter = ("device_type", "browser", "os", "country")
    search_fields = ("path", "user_agent", "ip_address")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "icon_name", "order", "is_active")
    list_filter = ("is_active",)
    search_fields = ("title",)


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "billing_period", "is_featured", "order")
    list_filter = ("is_featured",)
    search_fields = ("name",)
    inlines = [PricingFeatureInline]


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "order")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    search_fields = ("name",)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "author", "status", "published_at", "view_count")
    list_filter = ("status", "category", "tags")
    search_fields = ("title", "excerpt", "content")
    prepopulated_fields = {"slug": ("title",)}
    filter_horizontal = ("tags",)


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "post", "is_approved", "created_at")
    list_filter = ("is_approved", "created_at")
    search_fields = ("name", "email", "content")
    actions = ["approve_comments"]

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approve selected comments"
