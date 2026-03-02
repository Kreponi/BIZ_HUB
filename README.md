# BIZ HUB

BIZ HUB is a full-stack marketplace app with:
- `frontend`: React + Vite
- `backend`: Django + Django REST Framework
- `database`: PostgreSQL (local or Supabase in production)

## Project Structure

- `frontend/` - web client
- `backend/` - API and admin/auth logic
- `render.yaml` - Render backend service blueprint
- `netlify.toml` - Netlify frontend build config
- `DEPLOYMENT.md` - production deployment guide (Supabase + Render + Netlify)

## Local Development

## 1. Backend (Django)

From repo root (PowerShell):

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python backend/manage.py migrate
backend/.venv/Scripts/python backend/manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

## 2. Frontend (Vite)

```powershell
cd frontend
npm ci
npm run dev
```

Frontend runs at `http://localhost:5173`.

## Environment Variables

## Backend

Common local values:

```powershell
$env:DJANGO_ALLOWED_HOSTS="127.0.0.1,localhost"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

$env:DB_NAME="biz_hub_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_db_password"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="5432"
```

Production uses `DATABASE_URL` (for Supabase on Render).

## Frontend

Create `frontend/.env`:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full production steps:
- Supabase (database)
- Render (backend)
- Netlify (frontend)

## API Highlights

- `GET /api/categories/`
- `GET /api/products/`
- `POST /api/auth/login/`
- `GET /healthz/`
