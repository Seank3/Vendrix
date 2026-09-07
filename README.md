# Vendrix

**The operational backbone for African commerce.** Vendrix is a multi-tenant e-commerce operations platform: a master product catalog, a real-time inventory engine, channel order ingestion, pluggable integrations (Shopify, Jumia, Etsy, Amazon, TikTok Shop, WhatsApp, Odoo), an event-driven core, and analytics — with an enterprise web console.

## Repository map

| Path | What it is | Status |
|---|---|---|
| `vendrix/` + `apps/` | **The product** — Django 5 + DRF multi-tenant API (`/api/v1`) | Active |
| `frontend/` | **The console** — React 18 + Vite admin UI | Active |
| `scripts/` | Dev helpers (`seed_demo.py`, `run_seed_admin.py`) | Dev only |
| `backend/` | Legacy single-tenant Django 4.2 dashboard (predecessor) | Reference |
| `ecommerce_tool/` | Legacy Python CLI / FastAPI tool (predecessor) | Reference |
| `vendrix-frontend/` | Vite starter scaffold (unrelated) | Ignore |

## Architecture

- **Modular monolith**: `core` (tenant context, RBAC, encryption) · `identity` (organizations, users, JWT + API keys) · `products` · `inventory` (levels + append-only ledger) · `orders` (normalized ingestion) · `integrations` (connector registry + sync jobs) · `events` (persistent domain-event bus) · `analytics` (metric snapshots, sync-failure log).
- **Multi-tenancy**: every record carries an `organization_id`; a thread-local tenant context is resolved by `TenantMiddleware`/`TenantAPIView` from the JWT user or API key.
- **RBAC**: `admin` / `operator` / `viewer` enforced per endpoint (`IsAdmin`, `IsOperator`, `IsViewer`).
- **Events**: state changes publish to a `domain_events` log and dispatch synchronously in dev (Celery in prod) to handlers + analytics.
- **Connectors**: `BaseConnector` interface (authenticate / push_product / sync_inventory / fetch_orders / normalize_order) with a string-path registry. Shopify has a full mock; other platforms inherit `MockConnector` until live APIs are implemented.

## Run locally

```bash
# 1. Backend (Python 3.12+; SQLite is the default in development settings)
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python scripts/run_seed_admin.py     # seeds known dev logins (Acme org)
python manage.py runserver 0.0.0.0:8000

# 2. Seed demo data (optional, while the server runs)
python scripts/seed_demo.py

# 3. Frontend (Node 20+)
cd frontend
npm install
npm run dev        # http://localhost:5173 — proxies /api to :8000
```

**Dev logins** (seeded): `a@a.com` / `VendrixDemo!2026` · `admin@vendrix.dev` / `VendrixDemo!2026`

To use PostgreSQL/Redis in production, set the env vars in `.env.example` (the dev settings default to SQLite + in-memory cache).

## API surface (`/api/v1`)

- `auth/` — `register`, `login`, `me`, `api-keys`, `users`
- `products/`, `inventory/` (+ `adjust`, `ledger`, `buffers`), `orders/` (+ `status`)
- `integrations/` (+ `platforms`, `push-product`, `fetch-orders`, `sync-jobs`)
- `analytics/` (`overview`, `orders-by-channel`, `sku-performance`, `sync-failures`)
- `events/`

## Configuration

`.env.example` documents every knob: `DEBUG`, `SECRET_KEY`, `ALLOWED_HOSTS`, `DATABASE_*`, `REDIS_URL`, `CELERY_*`, `CREDENTIALS_ENCRYPTION_KEY` (Fernet — **must** be stable across restarts in production), `CORS_ALLOWED_ORIGINS`.
