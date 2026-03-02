# Deployment Guide: Supabase + Render + Netlify

This project is deployed as:
- `database` (PostgreSQL): Supabase
- `backend` (Django API): Render
- `frontend` (Vite app): Netlify

## 1. Prerequisites

1. Push your project to GitHub.
2. Create accounts on Supabase, Render, and Netlify.

## 2. Create Database (Supabase)

1. In Supabase, create a new project.
2. Open **Project Settings -> Database**.
3. Copy a PostgreSQL connection string from **Connection string -> URI**.
4. Ensure the URI includes SSL, for example:

```text
postgresql://postgres.<project-ref>:<password>@<host>:5432/postgres?sslmode=require
```

Use this as `DATABASE_URL` in Render.

## 3. Deploy Backend (Render)

### 3.1 Use Blueprint deploy

1. In Render, click **New + -> Blueprint**.
2. Connect your GitHub repository.
3. Select this repo and deploy using `render.yaml`.
4. Render will create the web service `biz-hub-api`.

Note: `render.yaml` is configured so `DATABASE_URL` must be set manually (external database).

### 3.2 Set backend environment variables

In Render (**biz-hub-api -> Environment**), set/verify:

```text
DJANGO_SECRET_KEY=<strong-random-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-render-service>.onrender.com
CORS_ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app
CSRF_TRUSTED_ORIGINS=https://<your-netlify-site>.netlify.app
DATABASE_URL=<supabase-postgres-uri-with-sslmode=require>
DB_SSL_REQUIRE=True
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<set-a-strong-password>
ADMIN_FORCE_PASSWORD_RESET=False
```

`render.yaml` startup runs:
- `python manage.py migrate`
- `python manage.py ensure_admin_user`

So database migrations and admin bootstrap run on deploy.

### 3.3 Test backend

1. Open your Render API URL.
2. Test:
   - `https://<your-render-service>.onrender.com/healthz/`
   - `https://<your-render-service>.onrender.com/api/categories/`

## 4. Deploy Frontend (Netlify)

### 4.1 Create Netlify site

1. In Netlify, click **Add new site -> Import an existing project**.
2. Connect GitHub and select this repository.
3. Netlify should read `netlify.toml` automatically:
   - Base: `frontend`
   - Build: `npm ci && npm run build`
   - Publish: `dist`

### 4.2 Set frontend environment variable

In Netlify site settings, set:

```text
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
```

### 4.3 Deploy

1. Trigger deploy.
2. Copy Netlify URL:
   - `https://<your-site>.netlify.app`

## 5. Final CORS/CSRF update on Render

After your final Netlify domain is known, update Render:

```text
CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app
CSRF_TRUSTED_ORIGINS=https://<your-site>.netlify.app
```

Then redeploy/restart `biz-hub-api`.

## 6. Final Verification Checklist

1. Open the Netlify frontend URL.
2. Confirm categories/products load from API.
3. Confirm browser network calls target `onrender.com`.
4. Confirm no CORS errors in browser console.
5. Confirm API health check returns success.
