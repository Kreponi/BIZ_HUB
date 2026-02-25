# Deployment Guide: PythonAnywhere + Netlify

This project is deployed as:
- `backend` (Django API) on PythonAnywhere
- `frontend` (Vite app) on Netlify

## 1. Prerequisites

1. Push your project to GitHub.
2. Create accounts on:
   - PythonAnywhere
   - Netlify
3. Have a PostgreSQL database URL ready (`DATABASE_URL`).

## 2. Backend Deploy (PythonAnywhere)

### 2.1 Create the web app

1. In PythonAnywhere, open **Web** and click **Add a new web app**.
2. Choose your domain (for example: `yourname.pythonanywhere.com`).
3. Select **Manual configuration**.
4. Choose Python 3.12 (or closest available).

### 2.2 Clone and install backend

Open a PythonAnywhere **Bash** console and run:

```bash
cd ~
git clone <your-github-repo-url> BIZ_HUB
cd BIZ_HUB/backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 2.3 Set environment variables

In **Web -> your app -> Environment variables**, add:

```text
DJANGO_SECRET_KEY=<strong-random-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourname.pythonanywhere.com
CORS_ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app
CSRF_TRUSTED_ORIGINS=https://<your-netlify-site>.netlify.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
DB_SSL_REQUIRE=True
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
```

### 2.4 Run Django setup commands

In Bash:

```bash
cd ~/BIZ_HUB/backend
source .venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py check --deploy
```

Optional admin user:

```bash
python manage.py createsuperuser
```

### 2.5 Configure WSGI

In **Web -> WSGI configuration file**, ensure:
- project path includes `~/BIZ_HUB/backend`
- virtualenv points to `~/BIZ_HUB/backend/.venv`
- WSGI app loads `config.wsgi`

Typical content:

```python
import os
import sys

path = '/home/<your-pythonanywhere-username>/BIZ_HUB/backend'
if path not in sys.path:
    sys.path.append(path)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
```

### 2.6 Configure static files

In **Web -> Static files**, add:
- URL: `/static/`
- Directory: `/home/<your-pythonanywhere-username>/BIZ_HUB/backend/staticfiles`

### 2.7 Reload and test backend

1. Click **Reload** in PythonAnywhere Web tab.
2. Test:
   - `https://yourname.pythonanywhere.com/healthz/`
   - `https://yourname.pythonanywhere.com/api/categories/`

## 3. Frontend Deploy (Netlify)

### 3.1 Create Netlify site

1. In Netlify, click **Add new site -> Import an existing project**.
2. Connect GitHub and select this repository.
3. Netlify should read `netlify.toml` automatically:
   - Base: `frontend`
   - Build: `npm ci && npm run build`
   - Publish: `dist`

### 3.2 Set frontend environment variable

In Netlify site settings, set:

```text
VITE_API_BASE_URL=https://yourname.pythonanywhere.com/api
```

### 3.3 Deploy

1. Trigger deploy.
2. After success, copy Netlify URL:
   - `https://<your-site>.netlify.app`

## 4. Final Cross-Origin Update

After Netlify URL is known, return to PythonAnywhere environment variables and set:

```text
CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app
CSRF_TRUSTED_ORIGINS=https://<your-site>.netlify.app
```

Then click **Reload** on PythonAnywhere again.

## 5. Final Verification Checklist

1. Open frontend URL on Netlify.
2. Confirm product/category data loads.
3. Confirm API requests go to PythonAnywhere domain.
4. Confirm no CORS errors in browser console.
5. Confirm health check works:
   - `https://yourname.pythonanywhere.com/healthz/`
