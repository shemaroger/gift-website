# Hosting Guide

This is a monorepo with two independently-deployed pieces:

- `giftwebsite/` — Django API backend, needs a real server + Postgres database
- `gift-frontend/` — Vite/React SPA, builds to static files that can be served from any static host

They talk to each other only over HTTP (the frontend calls the backend's `/api/*` endpoints), so they don't need to live on the same host or platform.

## Backend (`giftwebsite/`)

### What it needs from a host

- Python 3.12 runtime
- A process that runs `gunicorn giftwebsite.wsgi:application` (already in `requirements.txt`, and this is exactly what the old `Procfile` used to run — recreate a `Procfile` with `web: gunicorn giftwebsite.wsgi:application --bind 0.0.0.0:$PORT` if your host wants one)
- A Postgres database (the app is configured for `django.db.backends.postgresql`, not sqlite)
- Environment variables set on the host (see below) — the app currently reads these from a local `.env` via `python-decouple`; most platforms let you set the same variable names directly in their dashboard instead of shipping a `.env` file
- `whitenoise` is already wired up in `MIDDLEWARE` and `STATICFILES_STORAGE`, so Django can serve its own static files (admin CSS, etc.) without a separate static file host — just make sure the deploy step runs `python manage.py collectstatic --noinput`

### Required environment variables

These match exactly what `giftwebsite/.env` looks like locally — set the same keys on your host:

| Variable | Purpose |
|---|---|
| `SECRET_KEY` | Django secret key — generate a new one for production, don't reuse the local dev value |
| `DEBUG` | Set to `False` in production |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Postgres connection — most hosts (Railway, Render) provision this and give you the values, or a single connection string you'd need to split, or you can adapt `settings.py`'s `DATABASES` block to parse `DATABASE_URL` instead (via `dj-database-url`) if your host only gives you that |
| `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | Gmail SMTP account used to send OTP login codes — a Gmail *app password*, not the account password |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media/image uploads are stored on Cloudinary, not local disk |

### Settings that need updating for a real deployment

`giftwebsite/giftwebsite/settings.py` currently has two things set for local dev that a production deploy needs to revisit:

- `ALLOWED_HOSTS = ['*']` — fine for local dev, should be narrowed to your actual backend domain in production
- `CORS_ALLOWED_ORIGINS` currently only lists `http://localhost:5173` and `http://127.0.0.1:5173` — add your deployed frontend's real origin (e.g. `https://your-frontend-domain.com`) here, or the browser will block every request the deployed frontend makes to this API

### Deploying

Any host that runs a Python WSGI app + Postgres works (Railway, Render, Heroku-style platforms, a plain VPS with gunicorn behind nginx). This project previously ran on Railway — its old `Procfile`/`railway.json`/`nixpacks.toml`/`build.sh` were removed from the repo, so if you're going back to Railway you'd recreate:

- A `Procfile`: `web: gunicorn giftwebsite.wsgi:application --bind 0.0.0.0:$PORT`
- A release/build step that runs `pip install -r requirements.txt`, `python manage.py collectstatic --noinput`, and `python manage.py migrate`
- A Postgres addon (Railway/Render both provision one and inject connection details)

## Frontend (`gift-frontend/`)

### What it needs from a host

Nothing beyond a static file host — `npm run build` produces a `dist/` folder of plain HTML/CSS/JS. Netlify, Vercel, Cloudflare Pages, GitHub Pages, or any static bucket/CDN all work. There's no server-side rendering here.

### Build settings (for Netlify/Vercel-style platforms)

- **Build command**: `npm run build`
- **Output directory**: `dist`
- **Environment variable**: `VITE_API_BASE_URL` — set this to your deployed backend's API URL, e.g. `https://your-backend-domain.com/api`. This is read at build time (Vite inlines `import.meta.env.VITE_*` values into the built JS), so it must be set in the host's build environment, not just in a local `.env` file.

### SPA routing

This app uses `react-router-dom` client-side routing (`BrowserRouter`), so the host needs to serve `index.html` for any unmatched path (a rewrite rule), otherwise refreshing on a route like `/Gallery` will 404. Netlify/Vercel do this automatically for Vite projects; on a plain static bucket/nginx you'd need an explicit fallback rule (`try_files $uri /index.html;` on nginx, or a `_redirects` file with `/* /index.html 200` on Netlify).

## Putting it together

1. Deploy the backend first, get its live URL.
2. Add the frontend's eventual domain to `CORS_ALLOWED_ORIGINS` in `settings.py` (you can predict this if using a platform with predictable subdomains, or come back and add it after step 3).
3. Deploy the frontend with `VITE_API_BASE_URL` pointing at the backend's live `/api` URL.
4. If you guessed the frontend domain in step 2, verify it's still correct now and redeploy the backend if not.
5. Confirm login works end-to-end (this exercises CORS, the database, and email sending all at once) — see `CLAUDE.md` for how the OTP login flow works.
