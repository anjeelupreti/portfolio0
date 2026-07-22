# Portfolio — Django + React

A fully dynamic personal portfolio site. Almost nothing is hardcoded — content, theme colors, which
homepage sections are visible, and site-wide widgets are all stored in the database and editable from
a custom admin dashboard, so the same codebase can be reused for a different person by editing data,
not code.

**Live components:**
- **Public site** — hero, about, experience timeline, tech stack, services, projects, blog, contact
- **Admin dashboard** (`/admin/*` in the frontend) — content editing, blog CMS, theming, analytics, email
- **Django REST API** — backs both of the above

---

## What's dynamic vs. what's fixed in code

This is the part that makes the project reusable. Everything listed as "dynamic" lives in the database
and is edited from the dashboard — no redeploy needed to change it.

| Area | Dynamic (DB-driven) | Fixed in code |
|---|---|---|
| **Profile** | Name, title, tagline, bio, contact info, social links, photo, resume file, "open to work" flag | — |
| **Experience / Projects / Skills / Education / Training / References / Languages** | All content, ordering | Field structure (e.g. a "certificate" is a file, not free text) |
| **Homepage sections** | Which sections show, and in what order (`SiteSection` model) | The section components themselves (Hero.jsx, About.jsx, etc.) |
| **Theme** | Primary/secondary color (20 presets + custom hex), applied site-wide via CSS custom properties | The token *names* (`--color-accent`, `--color-ink`, etc.) and what each token controls |
| **Light/dark mode** | Per-visitor toggle, stored in their own browser | What "dark" looks like for each token |
| **Widgets** | WhatsApp button (on/off, number, message), scroll-to-top (on/off), resume download button (on/off), blog share buttons (on/off), cookie banner (on/off, message) | The widget components themselves |
| **Blog** | Posts, categories, tags, comments (moderated), draft/publish state | The editor UI, the public rendering template |
| **Pricing plans** | Plan content — but the whole section defaults to hidden via a `SiteSection` flag | — |
| **Contact/email** | Messages, replies sent from the dashboard (threaded), standalone "Compose" emails | The branded HTML email wrapper template |
| **Analytics** | Nothing to configure — it just tracks visits automatically | The dimensions tracked (device/browser/OS/referrer/path) |

To reuse this for someone else: swap the seed data (see `backend/portfolio_api/management/commands/seed_data.py`),
upload their photo/resume/certificates from the dashboard, and pick a theme preset. No component code needs to change
unless you want a different visual structure entirely.

---

## Stack

**Backend** — Django 6 + Django REST Framework, JWT auth (SimpleJWT), Gmail SMTP for email, SQLite (dev)
or PostgreSQL (prod via `DATABASE_URL`).

**Frontend** — React 19 + Vite, Tailwind CSS v4, Framer Motion, TipTap (rich text editor), Recharts
(analytics charts), react-router-dom. One app, two route trees: `/` and `/blog/*` are public, `/admin/*`
is the authenticated dashboard.

```
portfolio/
├── backend/            Django REST API
│   └── portfolio_api/  models, views, serializers, admin, auth
└── frontend/            React app (Vite)
    └── src/
        ├── components/  public site sections + shared UI
        ├── pages/        public routes (Home, BlogList, BlogDetail)
        └── admin/        dashboard (auth, layout, pages, API client)
```

---

## Local development

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows: venv\Scripts\activate | macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # then fill in real values, see below
python manage.py migrate
python manage.py seed_data       # optional — populates real CV content as a starting point
python manage.py createsuperuser
python manage.py runserver 8000
```

`.env` values (see `backend/.env.example`):

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key — generate a real one for anything beyond local dev |
| `DEBUG` | `True` locally, `False` in production |
| `ALLOWED_HOSTS` | Comma-separated hostnames Django will serve |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins allowed to call the API |
| `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Gmail address + **App Password** (not your regular password — requires 2-Step Verification enabled, generate one at Google Account → Security → App Passwords) |
| `DEFAULT_FROM_EMAIL` / `CONTACT_RECEIVER_EMAIL` | Sender/recipient for contact form and reset emails |
| `EMAIL_TIMEOUT` | Optional, seconds before a stalled SMTP send is abandoned rather than hanging the request (see note below) |
| `FRONTEND_URL` | Used to build links back to the SPA (e.g. password reset) |
| `DATABASE_URL` | Optional — if unset, falls back to a local SQLite file |

### Frontend

```bash
cd frontend
npm install
cp .env.example .env             # VITE_API_BASE_URL, defaults to http://127.0.0.1:8000/api
npm run dev                       # http://localhost:5173
```

Dashboard login: whatever you set with `createsuperuser`. Dashboard lives at `/admin/login`.

---

## Deployment

The frontend and backend deploy independently — **Vercel** for the React app, **Render** for the Django
API + PostgreSQL. Deploy the backend first so you have its live URL for the frontend's env var.

### Backend → Render

**Free-tier Render has no shell access**, so `createsuperuser` (which normally prompts interactively)
and `seed_data` need to run as part of the build instead. Both are safe to run on every deploy:
`ensure_superuser` is a no-op once the account exists, and `seed_data` uses `update_or_create`
throughout, so re-running it just re-applies the same content rather than duplicating anything.

1. **Create a PostgreSQL instance** on Render (Dashboard → New → PostgreSQL). Copy its **Internal Database URL**.
2. **Create a Web Service** on Render, pointing at this repo with **Root Directory: `backend`**.
   - **Build Command:**
     ```
     pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py ensure_superuser && python manage.py seed_data
     ```
     Drop `&& python manage.py seed_data` once you've replaced the seed content with your own (or don't
     want it re-applied on every deploy).
   - **Start Command:**
     ```
     gunicorn config.wsgi:application
     ```
3. **Environment variables** (Render → your service → Environment):

   | Key | Value |
   |---|---|
   | `SECRET_KEY` | generate one, e.g. `python -c "import secrets; print(secrets.token_urlsafe(50))"` |
   | `DEBUG` | `False` |
   | `ALLOWED_HOSTS` | `your-service.onrender.com` |
   | `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
   | `DATABASE_URL` | the Postgres URL from step 1 |
   | `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | your Gmail + App Password |
   | `DEFAULT_FROM_EMAIL` / `CONTACT_RECEIVER_EMAIL` | same Gmail address (or different recipient) |
   | `EMAIL_TIMEOUT` | `8` — see note below |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` |
   | `DJANGO_SUPERUSER_USERNAME` | your chosen dashboard login username |
   | `DJANGO_SUPERUSER_EMAIL` | your email (can be the same Gmail address) |
   | `DJANGO_SUPERUSER_PASSWORD` | a real password — **remove this env var after the first successful deploy** so the credential doesn't sit in your Render dashboard indefinitely |

4. Deploy. `ensure_superuser` creates your dashboard login during the build — log in at
   `/admin/login` on the deployed frontend with the username/password from step 3.
5. Note the live API URL (`https://your-service.onrender.com`) for the frontend step below.

**Known limitation — email on Render's free tier:** outbound SMTP (port 587) is blocked/unreliable on
Render's free web services. `EMAIL_TIMEOUT` (default 8s) stops a blocked send from hanging the whole
request forever — the contact form still saves the message and responds normally to the visitor
either way — but the notification/auto-reply emails themselves may simply not arrive. Contact
messages always show up in the dashboard's Messages page regardless, so nothing is lost; you can
reply manually from your own email client. If reliable outbound email becomes worth fixing later,
the two real options are (a) an HTTPS-based provider like Resend (django-anymail is already
installed; a ready-to-use Resend config is commented out in `settings.py`) — requires verifying a
domain you own, or (b) hosting the backend somewhere that doesn't block outbound SMTP.

**Known limitation:** Render's filesystem is ephemeral — uploaded files (resume, certificates, blog
cover images, profile photo) will **not** survive a redeploy or restart, even though the database
(Postgres) does persist correctly. This is fine to ship with for now; the fix later is swapping
`FileField`/`ImageField` storage to something like S3 or Cloudinary, which is a config-only change
(no model changes needed) whenever that becomes worth doing.

### Frontend → Vercel

1. Import the repo into Vercel, set **Root Directory: `frontend`**.
2. Framework preset: Vite (auto-detected). Build command and output directory are the Vite defaults —
   no changes needed.
3. **Environment variable:**

   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://your-service.onrender.com/api` |

4. Deploy. Once live, go back to Render and update `CORS_ALLOWED_ORIGINS` and `FRONTEND_URL` to the
   real Vercel URL if you used a placeholder earlier, then redeploy the backend.
5. Vercel's default rewrite rules handle client-side routing (`/admin/*`, `/blog/*`) automatically for
   a Vite SPA — if you see 404s on a direct link to a non-root route, add a `vercel.json` with a
   catch-all rewrite to `/index.html`.

### Post-deploy checklist

- [ ] Log into `/admin/login` on the deployed frontend with the superuser you created
- [ ] Upload a real profile photo and resume (Dashboard → Profile)
- [ ] Add/verify social links (Dashboard → Social Links)
- [ ] Pick a theme preset (Dashboard → Personalization)
- [ ] Toggle the WhatsApp widget on/off and set the real number (Dashboard → Widgets)
- [ ] Send a test contact-form submission and confirm the email arrives
- [ ] Confirm `Dashboard → Overview` shows real visit data after a few page loads

---

## Notes on the codebase

- **Auth**: JWT (SimpleJWT) — access token 30min, refresh 7 days, rotates on use. The dashboard's axios
  client auto-refreshes on a 401 and redirects to login if the refresh also fails.
- **File uploads**: use `multipart/form-data` — the Content-Type header must **not** be set manually
  (the browser needs to generate the boundary itself); see `uploadResume`/`uploadProfileImage`/
  `uploadTrainingCertificate` in `frontend/src/admin/api/adminResources.js` for the working pattern.
- **Singleton models** (`SiteTheme`, `SiteWidget`): enforced via a hardcoded `pk=1` in `save()` — there's
  always exactly one row, fetched with a `load()` classmethod that creates it on first access.
- **Public vs. staff permissions**: most content ViewSets use the same pattern — `AllowAny` for
  `list`/`retrieve`, `IsAuthenticated` for everything else, via a `get_permissions()` override.
