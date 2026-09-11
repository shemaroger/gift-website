#!/bin/sh
set -e

# collectstatic/migrate need real settings (SECRET_KEY, DB_*, ...), which
# only exist as environment variables at container *runtime* (from
# docker-compose's `environment:` block) — not during `docker build`, which
# has no access to them. Running these here instead of as a build-time RUN
# step is what makes that actually work.
python manage.py collectstatic --noinput
python manage.py migrate --noinput

exec gunicorn giftwebsite.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
