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
        ("rose-gold", "Rose Gold"),
        ("slate-blue", "Slate Blue"),
        ("amber-noir", "Amber Noir"),
        ("mint-fresh", "Mint Fresh"),
        ("deep-plum", "Deep Plum"),
        ("coral-reef", "Coral Reef"),
        ("cyber-teal", "Cyber Teal"),
        ("golden-hour", "Golden Hour"),
        ("electric-indigo", "Electric Indigo"),
        ("monochrome", "Monochrome"),
        ("cherry-blossom", "Cherry Blossom"),
        ("arctic-frost", "Arctic Frost"),
        ("volcanic-red", "Volcanic Red"),
        ("neon-cyber", "Neon Cyber"),
    ]

    preset = models.CharField(max_length=30, choices=PRESET_CHOICES, default="lime-ink")
    primary_color = models.CharField(max_length=7, default="#d9ff4b", help_text="Hex color, e.g. #d9ff4b")
    secondary_color = models.CharField(max_length=7, default="#0a0a0a", help_text="Hex color, e.g. #0a0a0a")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site theme"

    def __str__(self):
        """Show the active preset name in admin/list views."""
        return f"Theme ({self.preset})"

    def save(self, *args, **kwargs):
        """Force pk=1 so there is ever only one theme row."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """Fetch the singleton row, creating it with defaults on first use."""
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj


class SiteWidget(models.Model):
    """Singleton: configuration for site-wide widgets like the floating WhatsApp button."""

    whatsapp_enabled = models.BooleanField(default=True)
    whatsapp_number = models.CharField(
        max_length=20, blank=True, default="+9779843951313",
        help_text="Include country code, e.g. +9779843951313 (no spaces or dashes).",
    )
    whatsapp_default_message = models.CharField(
        max_length=300, blank=True,
        default="Hi! I saw your portfolio and would like to get in touch.",
        help_text="Prefilled message when a visitor opens the WhatsApp chat.",
    )

    scroll_to_top_enabled = models.BooleanField(default=True)

    resume_download_enabled = models.BooleanField(default=True)

    blog_share_enabled = models.BooleanField(default=True)

    cookie_banner_enabled = models.BooleanField(default=True)
    cookie_banner_message = models.CharField(
        max_length=300, blank=True,
        default=(
            "This site collects basic, anonymous visit analytics (page views, device type) "
            "to help improve the experience. No personal data is sold or shared."
        ),
        help_text="Text shown in the dismissible cookie/analytics consent banner.",
    )

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Site widgets"

    def __str__(self):
        """Static label since this is a singleton settings row."""
        return "Site widget settings"

    def save(self, *args, **kwargs):
        """Force pk=1 so there is ever only one widget-settings row."""
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        """Fetch the singleton row, creating it with defaults on first use."""
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
        """Show the section label plus its current visibility state."""
        return f"{self.label} ({'on' if self.is_visible else 'off'})"


class Profile(models.Model):
    """The single person this portfolio is about: bio, contact info, and social links."""

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

    portfolio_url = models.URLField(blank=True, help_text="Link to a separate personal site/blog, if any — not a social platform.")

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """Identify the profile by name in admin/list views."""
        return self.full_name


class SocialLink(models.Model):
    """
    One social/contact platform link (GitHub, LinkedIn, Twitter, etc), shown
    as an icon on the public site. Replaces the old fixed *_url fields on
    Profile so new platforms don't need a migration — just a new row.
    is_visible lets the admin hide a link without deleting its URL.
    """

    PLATFORM_CHOICES = [
        ("github", "GitHub"),
        ("linkedin", "LinkedIn"),
        ("facebook", "Facebook"),
        ("instagram", "Instagram"),
        ("twitter", "Twitter / X"),
        ("youtube", "YouTube"),
        ("telegram", "Telegram"),
        ("discord", "Discord"),
    ]

    platform = models.CharField(max_length=20, choices=PLATFORM_CHOICES)
    url = models.URLField()
    is_visible = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Show the platform and its current visibility state."""
        return f"{self.get_platform_display()} ({'shown' if self.is_visible else 'hidden'})"


class Experience(models.Model):
    """A single job/role entry shown in the work-history timeline."""

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
        """Show role and company for quick identification."""
        return f"{self.role} @ {self.company}"


class ExperienceHighlight(models.Model):
    """One bullet point under an Experience entry (e.g. an achievement or responsibility)."""

    experience = models.ForeignKey(Experience, related_name="highlights", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Truncate the highlight text for compact admin listing."""
        return self.text[:50]


class Project(models.Model):
    """A portfolio project entry with links, image, and a featured flag for the homepage."""

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
        """Identify the project by title."""
        return self.title


class SkillCategory(models.Model):
    """A grouping bucket for related Skill entries (e.g. 'Backend', 'DevOps')."""

    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "Skill categories"

    def __str__(self):
        """Identify the category by name."""
        return self.name


class Skill(models.Model):
    """A single skill with a proficiency score, shown under its parent SkillCategory."""

    category = models.ForeignKey(SkillCategory, related_name="skills", on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    proficiency = models.PositiveIntegerField(default=80, help_text="0-100")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Identify the skill by name."""
        return self.name


class Education(models.Model):
    """A degree/institution entry shown in the education timeline."""

    institution = models.CharField(max_length=200)
    degree = models.CharField(max_length=200)
    start_year = models.CharField(max_length=10)
    end_year = models.CharField(max_length=10)
    gpa = models.CharField(max_length=20, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-order", "-id"]

    def __str__(self):
        """Show degree and institution together."""
        return f"{self.degree} - {self.institution}"


class Training(models.Model):
    """A certification or short course, optionally with an uploaded certificate file."""

    title = models.CharField(max_length=200)
    provider = models.CharField(max_length=200)
    certificate_file = models.FileField(
        upload_to="certificates/", blank=True, null=True,
        help_text="Optional certificate image or PDF. If uploaded, shown on the public site with a preview.",
    )
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Show title and provider together."""
        return f"{self.title} ({self.provider})"


class Reference(models.Model):
    """A professional reference/contact shown on the public site, if provided."""

    name = models.CharField(max_length=150)
    role = models.CharField(max_length=200)
    company = models.CharField(max_length=150, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Identify the reference by name."""
        return self.name


class Language(models.Model):
    """A spoken language with a proficiency label and dot-rating for the About section."""

    name = models.CharField(max_length=50)
    proficiency_label = models.CharField(max_length=50, help_text="e.g. Native, Proficient")
    proficiency_level = models.PositiveIntegerField(default=5, help_text="1-5 dots")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Identify the language by name."""
        return self.name


class ContactMessage(models.Model):
    """An inbound message submitted through the public contact form."""

    name = models.CharField(max_length=150)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Show sender name and subject for admin inbox listing."""
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
        """Show recipient and subject for admin listing."""
        return f"To {self.to_email}: {self.subject}"


class SiteVisit(models.Model):
    """A single pageview record used for the analytics dashboard (device/browser/OS breakdowns)."""

    path = models.CharField(max_length=300)
    visited_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=300, blank=True)
    referrer = models.CharField(max_length=500, blank=True)
    country = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)
    device_type = models.CharField(max_length=20, blank=True)
    browser = models.CharField(max_length=50, blank=True)
    os = models.CharField(max_length=50, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        """Show path and timestamp for admin listing."""
        return f"{self.path} @ {self.visited_at}"


class Service(models.Model):
    """A service offering listed on the public site (e.g. 'API development')."""

    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=100, blank=True, help_text="e.g. a lucide-react icon name")
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Identify the service by title."""
        return self.title


class PricingPlan(models.Model):
    """A pricing tier shown on the public site, with a set of PricingFeature bullets."""

    name = models.CharField(max_length=100)
    price = models.CharField(max_length=50, help_text="e.g. $499 or Custom")
    billing_period = models.CharField(max_length=50, blank=True, help_text="e.g. one-time, /month")
    description = models.TextField(blank=True)
    is_featured = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Identify the plan by name."""
        return self.name


class PricingFeature(models.Model):
    """One included/excluded feature line under a PricingPlan."""

    plan = models.ForeignKey(PricingPlan, related_name="features", on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    included = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        """Truncate the feature text for compact admin listing."""
        return self.text[:50]


class BlogCategory(models.Model):
    """A category used to group BlogPost entries."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "Blog categories"

    def __str__(self):
        """Identify the category by name."""
        return self.name


class BlogTag(models.Model):
    """A freeform tag attachable to multiple BlogPost entries."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        """Identify the tag by name."""
        return self.name


class BlogPost(models.Model):
    """A blog article, either draft or published, with rich-text content from the admin editor."""

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
        """Identify the post by title."""
        return self.title

    def save(self, *args, **kwargs):
        """Stamp published_at the first time a post transitions to 'published'."""
        if self.status == "published" and self.published_at is None:
            self.published_at = timezone.now()
        super().save(*args, **kwargs)


class BlogComment(models.Model):
    """A visitor comment on a BlogPost, held for moderation via is_approved."""

    post = models.ForeignKey(BlogPost, related_name="comments", on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    email = models.EmailField()
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        """Show commenter and post for admin moderation listing."""
        return f"Comment by {self.name} on {self.post}"
