from django.core.management.base import BaseCommand

from portfolio_api.models import (
    Profile, Experience, ExperienceHighlight, Project, SkillCategory, Skill,
    Education, Training, Reference, Language, Service, PricingPlan, PricingFeature,
    SiteSection,
)


class Command(BaseCommand):
    """`manage.py seed_data`: populates/updates the database with Anjeel Upreti's real CV content.
    Uses update_or_create throughout so it's safe to re-run without duplicating rows."""

    help = "Seed the database with Anjeel Upreti's CV content"

    def handle(self, *args, **options):
        """Run all seed_* steps in order, then print a success message."""
        self.seed_site_sections()
        self.seed_profile()
        self.seed_experience()
        self.seed_projects()
        self.seed_skills()
        self.seed_education()
        self.seed_training()
        self.seed_references()
        self.seed_languages()
        self.seed_services()
        self.seed_pricing()
        self.stdout.write(self.style.SUCCESS("Seed data applied."))

    def seed_site_sections(self):
        """Seed the default homepage section list and their visibility/order."""
        data = [
            ("hero", "Hero", True, 0),
            ("about", "About Me", True, 1),
            ("timeline", "Experience Timeline", True, 2),
            ("tech-stack", "Tech Stack", True, 3),
            ("services", "Services", True, 4),
            ("projects", "Projects / Portfolio", True, 5),
            ("pricing", "Pricing", False, 6),
            ("blog", "Insights / Blog", True, 7),
            ("contact", "Contact", True, 8),
        ]
        for key, label, visible, order in data:
            SiteSection.objects.update_or_create(
                key=key, defaults=dict(label=label, is_visible=visible, order=order)
            )

    def seed_profile(self):
        """Seed the single Profile record: bio, contact info, and social links."""
        Profile.objects.update_or_create(
            email="anjeelupretiofficial@gmail.com",
            defaults=dict(
                full_name="Anjeel Upreti",
                title="Software Engineer",
                tagline="I build backend systems that scale.",
                summary=(
                    "Python Developer with over a couple of years experience in backend web "
                    "development, specializing in Django, Odoo, and PostgreSQL. Adept at "
                    "building scalable solutions, optimizing system performance, and integrating "
                    "RESTful APIs."
                ),
                phone="+977 9843951313",
                location="Kathmandu, Nepal",
                open_to_work=True,
                github_url="https://github.com/anjeelupreti",
                linkedin_url="https://www.linkedin.com/in/anjeelupreti/",
                facebook_url="https://www.facebook.com/anjeelupreti",
                instagram_url="https://www.instagram.com/anjeelupreti/",
                portfolio_url="https://anjeelupreti.vercel.app/",
            ),
        )

    def seed_experience(self):
        """Seed work-history entries and their highlight bullets (existing highlights are replaced)."""
        data = [
            dict(
                company="Pagoda Labs",
                role="Mid Python Developer",
                location="Kupondole, Lalitpur",
                start_date="2026",
                end_date="",
                is_current=True,
                order=3,
                highlights=["Serving management systems, CRMs, etc.", "Tailor Dealer Management Systems"],
            ),
            dict(
                company="Radiant Infotech Pvt Ltd",
                role="Software Engineer",
                location="Naxal, Kathmandu",
                start_date="2025",
                end_date="",
                is_current=True,
                order=2,
                highlights=[
                    "RIPL has been serving small and medium-sized businesses, institutions, "
                    "and government agencies in and out of Nepal.",
                    "Increased web development efficiency through scalable and reusable programming solutions.",
                    "Train Interns and Associates.",
                ],
            ),
            dict(
                company="Nepa Works Pvt Ltd",
                role="Python Developer",
                location="Sifal, Kathmandu",
                start_date="04/2024",
                end_date="12/2025",
                is_current=False,
                order=1,
                highlights=[
                    "Florida-based wholesale distribution company utilizing Odoo for its ERP system.",
                    "Led the creation of 20+ unique Odoo modules to boost inventory, website, "
                    "sales, and overall system performance and ease of use.",
                ],
            ),
        ]
        for item in data:
            highlights = item.pop("highlights")
            exp, _ = Experience.objects.update_or_create(
                company=item["company"], role=item["role"], defaults=item
            )
            exp.highlights.all().delete()
            for i, text in enumerate(highlights):
                ExperienceHighlight.objects.create(experience=exp, text=text, order=i)

    def seed_projects(self):
        """Seed featured portfolio project entries."""
        data = [
            dict(
                title="Xero OAuth Integration",
                description=(
                    "Implemented Xero's OAuth 2.0 authentication flow in Django, enabling secure "
                    "and seamless third-party application integration."
                ),
                repo_url="https://github.com/anjeelupreti/xero_oauth_integration.git",
                featured=True,
                order=3,
            ),
            dict(
                title="Project Tracker",
                description=(
                    "Agile project tracking system with Kanban & Scrum support, facilitating task "
                    "assignments, time tracking, and comprehensive reporting."
                ),
                repo_url="https://github.com/anjeelupreti/project_tracker.git",
                featured=True,
                order=2,
            ),
            dict(
                title="College Management System",
                description=(
                    "User, course, staff & student management with attendance tracking and "
                    "dashboard reporting functionalities."
                ),
                repo_url="https://github.com/anjeelupreti/college_management_system.git",
                featured=False,
                order=1,
            ),
        ]
        for item in data:
            Project.objects.update_or_create(title=item["title"], defaults=item)

    def seed_skills(self):
        """Seed skill categories and their skills with proficiency scores (existing skills are replaced)."""
        categories = {
            "Backend & Languages": [
                ("Python", 90), ("Django", 90), ("Django REST", 88), ("Odoo", 85),
                ("PHP", 60), ("JavaScript", 65), ("C", 55), ("SQL", 85),
            ],
            "Databases": [("PostgreSQL", 85), ("MySQL", 80), ("SQLite", 80), ("SQLAlchemy", 70)],
            "Tools & Cloud": [
                ("GitHub", 85), ("Docker", 70), ("Postman", 85), ("AWS", 65),
                ("Celery", 65), ("Redis", 65),
            ],
            "APIs & Practices": [
                ("REST APIs", 90), ("OAuth 2.0", 80), ("MVC", 80), ("Agile", 80), ("ORM", 85),
            ],
            "Data": [("Pandas", 60), ("NumPy", 55), ("Matplotlib", 55)],
        }
        for cat_order, (cat_name, skills) in enumerate(categories.items()):
            cat, _ = SkillCategory.objects.update_or_create(name=cat_name, defaults={"order": cat_order})
            cat.skills.all().delete()
            for i, (name, prof) in enumerate(skills):
                Skill.objects.create(category=cat, name=name, proficiency=prof, order=i)

    def seed_education(self):
        """Seed the degree/institution entry."""
        Education.objects.update_or_create(
            institution="Nepal Commerce Campus",
            degree="Bachelor in Information Management",
            defaults=dict(start_year="2021", end_year="2026", gpa="3.65 / 4.0", order=1),
        )

    def seed_training(self):
        """Seed certification/training entries."""
        data = [
            ("Python and Django", "Broadway Infosys"),
            ("Intermediate SQL", "Udemy"),
            ("AWS Cloud Practitioner (CLF-C02)", "Datacamp"),
            ("Git and GitHub", "Udemy"),
        ]
        for i, (title, provider) in enumerate(data):
            Training.objects.update_or_create(title=title, provider=provider, defaults={"order": i})

    def seed_references(self):
        """Seed professional reference entries."""
        data = [
            ("Silas Dhakal", "Software Engineer I", "Verisk"),
            ("Manoj Khadka", "Team Lead", "NEPA Works"),
            ("Kul Prasad Paudel", "Assistant Manager", "F1soft International Pvt Ltd"),
            ("Sudan Bhandari", "Python Instructor", "Broadway Infosys"),
        ]
        for i, (name, role, company) in enumerate(data):
            Reference.objects.update_or_create(name=name, defaults=dict(role=role, company=company, order=i))

    def seed_languages(self):
        """Seed spoken language proficiency entries."""
        data = [("English", "Proficient", 4), ("Nepali", "Native", 5)]
        for i, (name, label, level) in enumerate(data):
            Language.objects.update_or_create(
                name=name, defaults=dict(proficiency_label=label, proficiency_level=level, order=i)
            )

    def seed_services(self):
        """Seed service offering entries shown on the public site."""
        data = [
            dict(title="Backend Development", description="Scalable Django & DRF backends with clean, maintainable architecture.", icon_name="server", order=1),
            dict(title="Odoo ERP Development", description="Custom Odoo modules for inventory, sales, and business process automation.", icon_name="boxes", order=2),
            dict(title="API Integration", description="RESTful API design and third-party integrations, including OAuth 2.0 flows.", icon_name="plug", order=3),
            dict(title="Database Design", description="PostgreSQL/MySQL schema design and query optimization for performance.", icon_name="database", order=4),
        ]
        for item in data:
            Service.objects.update_or_create(title=item["title"], defaults=item)

    def seed_pricing(self):
        """Seed pricing plans and their feature bullets (existing features are replaced)."""
        plans = [
            dict(name="Starter", price="$299", billing_period="one-time", description="Small backend feature or API integration.", is_featured=False, order=1,
                 features=["1 API integration", "Basic documentation", "1 revision round", "Email support"]),
            dict(name="Professional", price="$799", billing_period="one-time", description="Full backend module or ERP customization.", is_featured=True, order=2,
                 features=["Custom Django/Odoo module", "Database design included", "3 revision rounds", "Priority support", "Deployment assistance"]),
            dict(name="Enterprise", price="Custom", billing_period="", description="Ongoing backend development and system architecture.", is_featured=False, order=3,
                 features=["Dedicated development time", "Architecture consulting", "Unlimited revisions", "Slack/direct support"]),
        ]
        for item in plans:
            features = item.pop("features")
            plan, _ = PricingPlan.objects.update_or_create(name=item["name"], defaults=item)
            plan.features.all().delete()
            for i, text in enumerate(features):
                PricingFeature.objects.create(plan=plan, text=text, order=i)
