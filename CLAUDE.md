# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a monorepo with two independent projects that only relate to each other over HTTP:

- `gift-frontend/` — React 18 + Vite + Tailwind CSS SPA (the public site and the admin dashboard)
- `giftwebsite/` — Django 4.2 + Django REST Framework API backend (single app: `giftapp`)

There is no shared build step between them; run each independently.

## Commands

### Frontend (`gift-frontend/`)

```bash
npm run dev       # start Vite dev server (localhost:5173)
npm run build     # production build via vite build — use this to verify JS/JSX validity
npm run preview   # preview a production build
npm run lint      # eslint . — currently broken for a pre-existing, unrelated reason
```

`npm run lint` fails repo-wide with `ConfigError: Global "AudioWorkletGlobalScope " has leading or trailing whitespace` from the ESLint flat-config globals package — this is not caused by your changes. Use `npx vite build` to check for real syntax/compile errors instead of relying on lint.

There is no test suite for the frontend.

### Backend (`giftwebsite/`)

```bash
source venv/bin/activate          # or use venv/bin/python3 directly
python manage.py runserver        # localhost:8000
python manage.py migrate
python manage.py createsuperuser
python manage.py changepassword <email>   # look up by email, not username — see Auth model notes below
python manage.py shell
```

Backend config is read from `giftwebsite/.env` (gitignored, not committed) via `python-decouple`. Required keys: `SECRET_KEY`, `DEBUG`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Without this file, `manage.py` will raise a `decouple` `UndefinedValueError` on startup.

`giftapp/tests.py` is an empty Django boilerplate stub — there is no real backend test suite either.

## Architecture

### Frontend routing and layout shells

All routes are declared in `gift-frontend/src/App.jsx`. Public-facing routes are wrapped inline per-route with `<Navbar />` and `<Footer />`; admin routes are nested under `/dashboard` and instead render inside `<Dashboard />` (a sidebar shell component), e.g. `/dashboard/getUser`, `/dashboard/addEvent`. `/autho/login` and `/dashboard` itself render with no shared chrome.

Public pages live directly under `src/Pages/*.jsx` (e.g. `Home.jsx`, `Donate.jsx`, `Events.jsx`). Admin CRUD pages are grouped by resource under `src/Pages/{Admin,User,Role,Ads,Blogs,Announcements,Contacts,Donate,Events,Gallery}/`. Shared page-agnostic UI (Navbar, Footer, Dashboard shell, reusable section components like `Feature.jsx`, `features_info.jsx`, `Events.jsx`, `blogs.jsx`) lives in `src/Pages/Components/`.

`Home.jsx` is a composition page — it imports and stacks most of the `src/Pages/Components/*` section components rather than containing its own content directly. Its section order was deliberately arranged as a narrative: hero → who we are → mission/vision/values → how we work → proof of impact → where the money goes → get involved (events) → blog.

The Mission and Vision sections live only on the Home page (`id="mission"` / `id="vision"`), not as standalone routes. Navigation to them (from the Navbar's "About Us" dropdown, or anywhere else) uses `HashLink`/`NavHashLink` from `react-router-hash-link`, not plain `NavLink`, so that clicking works both from other pages (navigate home + scroll) and while already on the home page (scroll only). Sections that are hash-scroll targets need `scroll-mt-*` classes to clear the fixed navbar height.

### Two separate API client modules — do not mix them up

- `src/api.jsx` — axios instance used by **authenticated/admin** calls. Its request interceptor reads `access_token` from `localStorage` and attaches `Authorization: Bearer <token>`; if no token is present, it force-redirects the browser to `/autho/login` (guarded against looping on the login route itself). Used throughout the `/dashboard/*` admin pages.
- `src/publicApi.jsx` — a separate axios instance for **public, unauthenticated** reads (announcements, events, gallery, blog listings, etc.) used by public-facing pages and by `Navbar.jsx`. It does not attach a token and does not redirect.

Both read `API_BASE_URL` from `import.meta.env.VITE_API_BASE_URL`, set in `gift-frontend/.env` (gitignored). Point this at `http://localhost:8000/api` for local dev against the Django backend.

### Auth flow (frontend + backend, two-step OTP login)

1. `POST /api/login/` with email + password → `LoginSerializer` validates credentials directly via `user.check_password()` (it does **not** go through Django's `AUTHENTICATION_BACKENDS`/`authenticate()` — `giftapp/backends.py` referenced in `AUTHENTICATION_BACKENDS` doesn't actually exist as a file, which is a dead reference that only matters for Django Admin login, not this flow). On success, a 6-digit OTP is generated, stored on the `User` row, and emailed; in `DEBUG` mode it's also printed to the server console as `[DEV] OTP for {email}: {otp}` so you don't need to check email during local testing.
2. `POST /api/verify-otp/` with email + OTP → issues JWT `access`/`refresh` tokens via `rest_framework_simplejwt`. Every failure path in this view (unknown email, no active OTP, expired OTP, wrong OTP) returns the **same** generic `"Invalid or expired verification code"` message at `400` — this is deliberate, to prevent using the endpoint to enumerate registered emails.
3. Frontend (`Login.jsx`) stores `access_token`, `refresh`, and the `user` object in `localStorage` on success, then calls `fetchUserById` and redirects to `/dashboard/adminDashboard`.

Failed logins increment `User.failed_login_attempts`; 5 failures locks the account for 30 minutes (`record_failed_login` / `is_account_locked`). The same lockout is applied to repeated wrong-OTP guesses, not just wrong passwords.

`User.USERNAME_FIELD = "email"`, not `username` — management commands like `changepassword` must be given the email, even though a separate `username` field also exists on the model (auto-set equal to email on save if left blank).

### Backend structure

Everything lives in one Django app, `giftapp`. `models.py` defines: `User`/`Role`/`UserProfile`/`AuthToken` (auth), `Ad`, `Event`/`EventRegistration`, `BlogCategory`/`BlogPost`/`BlogComment`/`BlogLike`, `Announcement`, `GalleryCategory`/`GalleryItem`, `Contact`, `DonationCommitment`. All API routes are mounted under `/api/` (`giftwebsite/urls.py` → `include('giftapp.urls')`).

Media uploads go to Cloudinary (`django-cloudinary-storage`), not local disk, via `DEFAULT_FILE_STORAGE` / `CLOUDINARY_STORAGE` in `settings.py`.

`UserDetailView` (`/api/userDetails/<id>/`) is intentionally still `permission_classes = [AllowAny]` — a known, unresolved gap. It's called from both `Login.jsx` (right after OTP verify) and `Dashboard.jsx` (on mount) using raw unauthenticated `axios` calls that don't attach a bearer token. Locking this endpoint down requires updating both call sites to use the authenticated `api.jsx` client first — don't change the permission class without also fixing those two call sites, or the login flow and dashboard will break.

### Design system (frontend)

Established through iterative work on this codebase — treat as intentional, not accidental:

- **Colors**: solid `orange-600` (primary) and `green-600` (secondary) only. No purple/indigo/teal/blue/pink as primary UI colors anywhere in the public site or admin — those read as leftover template colors and have been actively removed. All `<button>` backgrounds were deliberately converted to solid orange, including former destructive/cancel buttons — this removed prior red=delete/gray=cancel color-coding site-wide as an explicit choice.
- **Typography**: `font-display` (mapped to Fraunces, a serif) for headings; body text uses the default (Poppins, set globally). Don't introduce other display fonts.
- **Shape**: `rounded-lg` is the standard container/card/button radius. `rounded-full` is reserved for true pills (the Donate CTA specifically) and circular avatars/icon badges — not overused as a default.
- **Depth**: flat design — prefer `border border-gray-100`/`border-gray-200` over `shadow-lg`/`shadow-xl`/glassmorphism `backdrop-blur`. No gradients (`bg-gradient-to-*`) anywhere.
- No emoji as icons anywhere — use `lucide-react` icons.

### Local environment notes

- Local Postgres database for backend dev: `giftapp_db` / role `giftapp_user`, configured via `giftwebsite/.env` (not `sqlite3` — an earlier sqlite fallback in `settings.py` has been replaced).
- Production Railway deployment config (`Procfile`, `railway.json`, `build.sh`, `nixpacks.toml`, `runtime.txt`) was deliberately removed from this repo — redeploying to Railway requires recreating that config from scratch.
- `CORS_ALLOWED_ORIGINS` in `settings.py` is currently limited to `localhost:5173`/`127.0.0.1:5173` only — production frontend origins were intentionally stripped out and will need to be re-added before pointing a deployed frontend at this backend.
- Tokens (`access_token`, `refresh`, and the full `user` object) are stored in plain `localStorage` on the frontend — a known XSS-exposure tradeoff that has been flagged but not changed; switching to httpOnly cookies would be a real auth-architecture change, not a small fix.
