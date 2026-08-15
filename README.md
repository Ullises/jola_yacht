<p align="center">
  <img src="frontend/public/assets/logo.png" alt="Jola Yacht logo" width="180" />
</p>

# Jola Yacht

Booking site for water activities (yacht, jetski, and waverunner rentals and experiences), Cancún-style, bilingual (Spanish/English).

Monorepo with a separate `frontend/` (React) and `backend/` (FastAPI), each with its own dependency tree and no shared root package.

## Repo layout

- `frontend/` — Create React App (via CRACO) + Tailwind + shadcn/radix UI components. Public site, booking flow, admin dashboard.
- `backend/` — FastAPI + PostgreSQL (via SQLAlchemy core, raw SQL — no ORM models/migrations framework). Single-file API, single-file business logic, single-file queries.
- `DB/` — **legacy/stale**. Contains an older MySQL-based `docker-compose.yml` and `init.sql` from before the Postgres rebuild. The authoritative DB setup is `backend/docker-compose.yml` + `backend/init.sql` (Postgres 16). Don't use `DB/` as a reference for the current schema.

## Getting started

### Frontend (`frontend/`)
```bash
npm install
npm start        # craco start - dev server on :3000
npm run build    # craco build - production build
npm test         # craco test
```
There is no separate lint script; ESLint rules are wired into CRACO's webpack config (`craco.config.js`) and run as part of `start`/`build`.

### Backend (`backend/`)
```bash
docker-compose up --build   # runs db-jolayacht (Postgres), backend (FastAPI on :5010), adminer (:8081)
```
Requires a pre-existing `.env` in `backend/` (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `DATABASE_URL`, `JWT_SECRET_KEY`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `PAYPAL_CLIENT_ID`/`SECRET`, `CORS_ORIGINS`, `ADMIN_EMAIL`/`PASSWORD`).

Running outside Docker:
```bash
python -m uvicorn src.API.api:app --host 0.0.0.0 --port 5010
```
from `backend/`, with a venv that has `requirements.txt` installed and `.env` loaded.

- Health check: `GET /health` (pings the DB)
- Root: `GET /`

## Architecture overview

### Backend

Everything lives in `backend/src/`, three layers, no framework-level routers/blueprints — it's all one FastAPI app instance:

- `API/api.py` — the entire FastAPI app: route declarations, Pydantic request models, CORS, Stripe/PayPal checkout flows, admin JWT auth dependency (`get_current_admin`).
- `Utils/jolayacht_exec.py` — business logic layer (experiences, fleet, reviews, faqs, promotions, reservations, payments, stats, auth). Also owns password hashing/JWT and booking confirmation emails.
- `Queries/jolayacht_queries.py` — raw SQL query builders/strings consumed by the Utils layer.
- `config/config.py` — reads `.env` into module-level constants.

No ORM models; rows are plain dicts. IDs are Postgres `uuid` (via `pgcrypto`'s `gen_random_uuid()`).

Key domain rules encoded in `backend/init.sql` (the schema is the source of truth):
- A `reservations` row must reference exactly one of `experience_id` or `fleet_id`, never both/neither.
- Double-booking prevention is a DB-level partial unique index per asset + date + time_slot, excluding cancelled reservations — not app-level locking.
- `experiences.rating`/`review_count` are auto-maintained by a Postgres trigger on `reviews` insert/update/delete.
- `promotions` supports percentage/fixed discounts, optional promo codes, and can target all/experiences/fleet/specific items.

Payments: both Stripe and PayPal are supported in parallel, each writing to a shared `payment_transactions` table and updating the related reservation's payment status on success.

Auth: a single admin-user table, JWT bearer tokens (24h expiry), no roles beyond "is an admin".

### Frontend

CRA (via CRACO) app, path alias `@` → `frontend/src`.

- `App.js` — all routing (react-router). Public landing page, booking pages, payment result pages, and admin pages.
- `components/ui/` — shadcn-style primitives generated from Radix — treated as generated/vendor code.
- `components/*.jsx` — page/section components.
- `context/LanguageContext.jsx` — app-wide ES/EN language switching.
- `lib/utils.js` — shadcn `cn()` classname helper.

Talks to the backend over `axios`/`fetch` using `REACT_APP_BACKEND_URL` (defaults to `http://localhost:5010`). Stripe checkout uses `REACT_APP_STRIPE_PUBLIC_KEY`.

## Notes

There are no automated backend tests in this repo currently.

For repository-specific guidance aimed at AI coding assistants, see [CLAUDE.md](./CLAUDE.md).
