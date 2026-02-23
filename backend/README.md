# Backend (Django)

## Quick Start

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python -m pip install -r backend/requirements.txt
backend/.venv/Scripts/python backend/manage.py migrate
backend/.venv/Scripts/python backend/manage.py runserver
```

## Environment Variables

Set these before running the backend.

```powershell
# Django
$env:DJANGO_ALLOWED_HOSTS="127.0.0.1,localhost"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"

# Database (PostgreSQL)
$env:DB_NAME="biz_hub_db"
$env:DB_USER="postgres"
$env:DB_PASSWORD="your_db_password"
$env:DB_HOST="127.0.0.1"
$env:DB_PORT="5432"
```

## API Endpoints

- `GET/POST /api/categories/`
- `GET/PUT/PATCH/DELETE /api/categories/{id}/`
- `GET/POST /api/products/`
- `GET/PUT/PATCH/DELETE /api/products/{id}/`
- `GET/POST /api/analytics-events/`
- `GET/PUT/PATCH/DELETE /api/analytics-events/{id}/`
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET /api/analytics/summary/`

## Auth and Permissions

- `GET` on `categories` and `products`: public.
- `POST/PUT/PATCH/DELETE` on `categories` and `products`: admin only.
- `POST /api/analytics-events/`: public (for client event tracking).
- `GET/PUT/PATCH/DELETE /api/analytics-events/*`: admin only.
- `/api/analytics/summary/`: admin only.

## Filtering and Pagination

`GET /api/categories/`
- `q`: search by category name/description.
- `page`: enables paginated response.

`GET /api/products/`
- `q`: search by product name/description/category name.
- `category_id`: filter by category.
- `min_price`: minimum price.
- `max_price`: maximum price.
- `ordering`: one of `price`, `-price`, `name`, `-name`, `created_at`, `-created_at`.
- `page`: enables paginated response.

Notes:
- Without `page`, list endpoints return a plain array.
- With `page`, list endpoints return DRF pagination (`count`, `next`, `previous`, `results`).

## Admin User (Development)

Create an admin account with Django's prompt:

```powershell
backend/.venv/Scripts/python backend/manage.py createsuperuser
```

Do not use shared/demo passwords in real environments.

## Production Checklist

Before deployment:

- Set `DEBUG=False`.
- Use a strong secret key from environment (do not hardcode it).
- Set secure cookie and HTTPS settings (`SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`, `SECURE_HSTS_SECONDS`).
- Restrict `DJANGO_ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` to real domains.
- Run:

```powershell
backend/.venv/Scripts/python backend/manage.py check --deploy
```
