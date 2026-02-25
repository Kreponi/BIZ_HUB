# Deployment Guide: Render + Netlify

This project is deployed as:
- `backend` (Django API) on Render
- `frontend` (Vite app) on Netlify

## 1. Prerequisites

1. Push your project to GitHub.
2. Create accounts on Render and Netlify.

## 2. Backend Deploy (Render)

### 2.1 Use Blueprint deploy

1. In Render, click **New + -> Blueprint**.
2. Connect your GitHub repository.
3. Select this repo and deploy using `render.yaml`.
4. Render will create:
   - PostgreSQL database: `biz-hub-db`
   - Web service: `biz-hub-api`

### 2.2 Verify backend environment variables

In Render (**biz-hub-api -> Environment**), verify:

```text
DJANGO_SECRET_KEY=<strong-random-secret>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=<your-render-service>.onrender.com
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
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<set-a-strong-password>
ADMIN_FORCE_PASSWORD_RESET=False
```

`render.yaml` startup runs `python manage.py ensure_admin_user`, so the admin account is created automatically on deploy.

### 2.3 Test backend

1. Open Render service URL.
2. Test:
   - `https://<your-render-service>.onrender.com/healthz/`
   - `https://<your-render-service>.onrender.com/api/categories/`

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
VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api
```

### 3.3 Deploy

1. Trigger deploy.
2. After success, copy Netlify URL:
   - `https://<your-site>.netlify.app`

## 4. Final Cross-Origin Update

After Netlify URL is known, return to Render environment variables and set:

```text
CORS_ALLOWED_ORIGINS=https://<your-site>.netlify.app
CSRF_TRUSTED_ORIGINS=https://<your-site>.netlify.app
```

Then redeploy or restart the Render service.

## 5. Final Verification Checklist

1. Open frontend URL on Netlify.
2. Confirm product/category data loads.
3. Confirm API requests go to Render domain.
4. Confirm no CORS errors in browser console.
5. Confirm health check works:
   - `https://<your-render-service>.onrender.com/healthz/`
