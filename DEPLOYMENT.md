# Deployment Guide (Step by Step)

This project has two deployable parts:
- `frontend` (Vite static app)
- `backend` (Django API)

## 0. Recommended Hosting Split (Netlify + Render)

- Host `frontend` on Netlify.
- Host `backend` on Render web service with Render PostgreSQL.
- Set frontend env var on Netlify:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`
- Set backend env vars on Render:
  - `DJANGO_ALLOWED_HOSTS=<your-render-service>.onrender.com`
  - `CORS_ALLOWED_ORIGINS=https://<your-netlify-site>.netlify.app`
  - `CSRF_TRUSTED_ORIGINS=https://<your-netlify-site>.netlify.app`

## 1. Prerequisites

1. Install Node.js 20+ and Python 3.12+.
2. Provision a PostgreSQL database.
3. Decide your domains:
   - Frontend: `https://app.example.com`
   - Backend API: `https://api.example.com`

## 2. Backend Environment Setup

1. Copy `backend/.env.example` to your deploy platform env vars.
2. Set required values:
   - `DJANGO_SECRET_KEY`
   - `DJANGO_DEBUG=False`
   - `DJANGO_ALLOWED_HOSTS=api.example.com`
   - `CORS_ALLOWED_ORIGINS=https://app.example.com`
   - `CSRF_TRUSTED_ORIGINS=https://app.example.com`
   - `DATABASE_URL=postgresql://...`

## 3. Backend Build and Start

Run from repo root:

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python backend/manage.py migrate
backend/.venv/Scripts/python backend/manage.py collectstatic --noinput
backend/.venv/Scripts/python backend/manage.py check --deploy
backend/.venv/Scripts/python backend/manage.py createsuperuser
```

Production start command (from `backend` directory):

```powershell
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

Health check endpoint:
- `GET /healthz/` returns `{"status":"ok"}`

## 4. Frontend Environment Setup

1. Copy `frontend/.env.example` values into frontend deployment env vars.
2. Set:
   - `VITE_API_BASE_URL=https://api.example.com/api`

## 5. Frontend Build and Deploy

Run from repo root:

```powershell
cd frontend
npm ci
npm run build
```

Deploy the generated `frontend/dist` folder to your static host (Netlify, Cloudflare Pages, S3+CloudFront, etc.).

For Netlify in this repo:
- Netlify will read `netlify.toml` from the repo root.
- Build base: `frontend`
- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- SPA routing rewrite to `index.html` is already configured in `netlify.toml`.

## 6. Post-Deploy Verification

1. Backend:
   - Open `https://api.example.com/healthz/`
   - Open `https://api.example.com/api/categories/`
2. Frontend:
   - Load home page.
   - Open a product detail page.
   - Confirm API requests go to `https://api.example.com/api`.
3. Admin:
   - Log in through app admin UI.
   - Create/update a category and product.

## 7. DNS + TLS Checklist

1. Add DNS records for both frontend and backend domains.
2. Enable HTTPS certificates on both.
3. Confirm browser has no mixed-content warnings.

## 8. Docker Deployment Option

Use this if you prefer containerized deployment.

1. Create `backend/.env` from `backend/.env.example`.
2. Build and run:

```powershell
docker compose up --build -d
```

3. Validate:
   - Frontend: `http://localhost:8080`
   - Backend: `http://localhost:8000/healthz/`

## 9. Full Local Deployment Scan (No External DB Needed)

This runs frontend + backend + PostgreSQL together for a production-like local test.

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml up --build -d
```

Verify:
- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:8000/healthz/`
- API list: `http://localhost:8000/api/categories/`

Shutdown:

```powershell
docker compose -f docker-compose.yml -f docker-compose.local.yml down -v
```
