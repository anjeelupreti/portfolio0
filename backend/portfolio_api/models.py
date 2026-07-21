from django.conf import settings
from django.db import models
from django.utils import timezone


class SiteTheme(models.Model):
    """Singleton: site-wide color palette, set by the admin, applied for every visitor."""

    PRESET_CHOICES = [
        ("custom", "Custom"),
        ("lime-ink", "Lime & Ink"),
        ("ocean-blue", "Ocean Blue"),
        ("sunset-orange", "Sunset Orange"),
        ("violet-dusk", "Violet Dusk"),
        ("forest-green", "Forest Green"),
        ("crimson-rose", "Crimson Rose"),
    ]

    preset = models.CharField(max_length=30, choices=PRESET_CHOICES, default="lime-ink")
    primary_color = models.CharField(max_length=7, default="#d9ff4b", help_text="Hex color, e.g. #d9ff4b")
    secondary_color = models.CharField(max_length=7, default="#0a0a0a", help_text="Hex color, e.g. #0a0a0a")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site theme"

    def __str__(self):
        return f"Theme ({self.preset})"

    def save(self, *args, **kwargs):
        self.pk = 1  # enforce singleton
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteSection(models.Model):
    """Feature flags controlling which homepage sections are visible on the public site."""

    key = models.SlugField(unique=True, help_text="e.g. hero, about, timeline, tech-stack, projects, pricing, blog, contact")
    label = models.CharField(max_length=100, help_text="Human-readable name shown in the dashboard")
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.label} ({'on' if self.is_visible else 'off'})"


class Profile(models.Model):
    full_name = models.CharField(max_length=150)
    title = models.CharField(max_length=150)
    tagline = models.CharField(
        max_length=200, blank=True,
        help_text="Short punchy line shown as the big About headline, e.g. 'I build backend systems that scale.'",
    )
    summary = models.TextField(help_text="Full bio paragraph, shown as regular body text under the tagline.")
    email = models.EmailField()
    phone = models.CharField(max_length=30, blank=True)
    location = models.CharField(max_length=150, blank=True)
    resume_file = models.FileField(upload_to="resume/", blank=True, null=True)
    profile_image = models.ImageField(upload_to="profile/", blank=True, null=True)
    open_to_work = models.BooleanField(default=True)

    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


class Experience(models.Model):
    company = models.CharField(max_length=150)
    role = models.CharField(max_length=150)
    location = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    start_date = models.CharField(max_length=30, help_text="e.g. 2025 or 04/2024")
    end_date = models.CharField(max_length=30, blank=True, help_text="Leave blank if present")
    is_current = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-order", "-id"]

    def __str__(self):
        return f"{self.role} @ {self.company}"


class ExperienceHighlight(models.Model):
    experience = models.ForeignKey(Experience, related_name="highlights", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.text[:50]


class Project(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField()
    repo_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    image = models.ImageField(upload_to="projects/", blank=True, null=True)
    featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-featured", "-order", "-id"]

    def __str__(self):
        return self.title


class SkillCategory(models.Model):
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "Skill categories"

    def __str__(self):
        return self.name


class Skill(models.Model):
    category = models.ForeignKey(SkillCategory, related_name="skills", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    proficiency = models.PositiveIntegerField(default=80, help_text="0-100")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Education(models.Model):
    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    start_year = models.CharField(max_length=10)
    end_year = models.CharField(max_length=10)
    gpa = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-order", "-id"]

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Training(models.Model):
    title = models.CharField(max_length=200)
    provider = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.title} ({self.provider})"


class Reference(models.Model):
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class Language(models.Model):
    name = models.CharField(max_length=50)
    proficiency_label = models.CharField(max_length=50, help_text="e.g. Native, Proficient")
    proficiency_level = models.PositiveIntegerField(default=5, help_text="1-5 dots")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class ContactMessage(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.subject or 'no subject'}"


class EmailReply(models.Model):
    """An outgoing email sent from the dashboard, optionally threaded to a ContactMessage."""

    contact_message = models.ForeignKey(
        ContactMessage, related_name="replies", on_delete=models.CASCADE, null=True, blank=True,
        help_text="Left blank for standalone Compose emails not tied to an inbound message.",
    )
    to_email = models.EmailField()
    subject = models.CharField(max_length=200)
    body_html = models.TextField(help_text="Rich text HTML body, before branded email wrapping.")
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="sent_emails", on_delete=models.SET_NULL, null=True, blank=True
    )
    sent_at = models.DateTimeField(auto_now_add=True)
    send_error = models.CharField(max_length=500, blank=True, help_text="Set if SMTP send failed.")

    class Meta:
        ordering = ["-sent_at"]

    def __str__(self):
        return f"To {self.to_email}: {self.subject}"


class SiteVisit(models.Model):
    path = models.CharField(max_length=300)
    visited_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=300, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    # NOTE: country/city are left blank for now. A GeoIP2 lookup (e.g. via
    # django.contrib.gis.geoip2 + MaxMind GeoLite2 db, or a geolocation API)
    # could populate these fields from ip_address in the future.
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"{self.path} @ {self.visited_at}"


class Service(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=100, blank=True, help_text="e.g. a lucide-react icon name")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class PricingPlan(models.Model):
    name = models.CharField(max_length=100)
    price = models.CharField(max_length=50, help_text="e.g. $499 or Custom")
    billing_period = models.CharField(max_length=50, blank=True, help_text="e.g. one-time, /month")
    description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.name


class PricingFeature(models.Model):
    plan = models.ForeignKey(PricingPlan, related_name="features", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    included = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.text[:50]


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "Blog categories"

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
    ]

    title = models.CharField(max_length=250)
    slug = models.SlugField(unique=True, max_length=250)
    excerpt = models.TextField(blank=True)
    content = models.TextField(help_text="Rich text HTML from WYSIWYG editor")
    cover_image = models.ImageField(upload_to="blog/", blank=True, null=True)
    category = models.ForeignKey(
        BlogCategory, related_name="posts", on_delete=models.SET_NULL, null=True, blank=True
    )
    tags = models.ManyToManyField(BlogTag, related_name="posts", blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name="blog_posts", on_delete=models.SET_NULL, null=True, blank=True
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    view_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.status == "published" and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class BlogComment(models.Model):
    post = models.ForeignKey(BlogPost, related_name="comments", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.name} on {self.post}"
