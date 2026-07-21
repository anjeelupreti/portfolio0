from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views, auth_views

router = DefaultRouter()
router.register(r"site-sections", views.SiteSectionViewSet, basename="sitesection")
router.register(r"profile", views.ProfileViewSet, basename="profile")
router.register(r"experience", views.ExperienceViewSet, basename="experience")
router.register(r"projects", views.ProjectViewSet, basename="project")
router.register(r"skill-categories", views.SkillCategoryViewSet, basename="skillcategory")
router.register(r"education", views.EducationViewSet, basename="education")
router.register(r"training", views.TrainingViewSet, basename="training")
router.register(r"references", views.ReferenceViewSet, basename="reference")
router.register(r"languages", views.LanguageViewSet, basename="language")
router.register(r"services", views.ServiceViewSet, basename="service")
router.register(r"pricing-plans", views.PricingPlanViewSet, basename="pricingplan")
router.register(r"blog-categories", views.BlogCategoryViewSet, basename="blogcategory")
router.register(r"blog-tags", views.BlogTagViewSet, basename="blogtag")
router.register(r"blog-posts", views.BlogPostViewSet, basename="blogpost")
router.register(r"blog-comments", views.BlogCommentViewSet, basename="blogcomment")
router.register(r"contact-messages", views.ContactMessageViewSet, basename="contactmessage")

urlpatterns = [
    path("", include(router.urls)),
    path("contact/", views.ContactMessageCreateView.as_view(), name="contact-message"),
    path("site-theme/", views.SiteThemeView.as_view(), name="site-theme"),
    path("site-widgets/", views.SiteWidgetView.as_view(), name="site-widgets"),
    path("send-email/", views.SendEmailView.as_view(), name="send-email"),

    # auth
    path("auth/login/", auth_views.LoginView.as_view(), name="auth-login"),
    path("auth/refresh/", auth_views.RefreshView.as_view(), name="auth-refresh"),
    path("auth/me/", auth_views.MeView.as_view(), name="auth-me"),
    path("auth/change-password/", auth_views.ChangePasswordView.as_view(), name="auth-change-password"),
    path("auth/forgot-password/", auth_views.ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("auth/reset-password/", auth_views.ResetPasswordView.as_view(), name="auth-reset-password"),

    # analytics
    path("analytics/summary/", views.AnalyticsSummaryView.as_view(), name="analytics-summary"),
    path("track-visit/", views.TrackVisitView.as_view(), name="track-visit"),
]
