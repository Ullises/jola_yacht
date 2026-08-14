# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Jola Yacht — a booking site for water activities (yacht/jetski/waverunner rentals and experiences) in Cancún-style Spanish/English bilingual style. Monorepo with a separate `frontend/` (React) and `backend/` (FastAPI), each with its own dependency tree and no shared root package.

## Repo layout

- `frontend/` — Create React App (via CRACO) + Tailwind + shadcn/radix UI components. Public site, booking flow, admin dashboard.
- `backend/` — FastAPI + PostgreSQL (via SQLAlchemy core, raw SQL — no ORM models/migrations framework). Single-file API, single-file business logic, single-file queries.
- `DB/` — **legacy/stale**. Contains an older MySQL-based `docker-compose.yml` and `init.sql` from before the Postgres rebuild. The authoritative DB setup is `backend/docker-compose.yml` + `backend/init.sql` (Postgres 16). Don't use `DB/` as a reference for current schema.

## Commands

### Frontend (`frontend/`)
```bash
npm start        # craco start - dev server on :3000
npm run build    # craco build - production build
npm test         # craco test
```
There is no lint script defined; ESLint rules are wired into CRACO's webpack config (`craco.config.js`) and run as part of `start`/`build`.

### Backend (`backend/`)
```bash
docker-compose up --build   # runs db-jolayacht (Postgres), backend (FastAPI on :5010), adminer (:8081)
```
Requires a pre-existing `.env` in `backend/` (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, DATABASE_URL, JWT_SECRET_KEY, STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET, PAYPAL_CLIENT_ID/SECRET, CORS_ORIGINS, ADMIN_EMAIL/PASSWORD). The compose file expects the network `jolayacht-net` (created automatically by this compose file itself — not external, despite what `backend/README.md` implies).

Running outside Docker: `python -m uvicorn src.API.api:app --host 0.0.0.0 --port 5010` from `backend/` with a venv (`backend/.venv` already exists) that has `requirements.txt` installed and `.env` loaded (`config.py` calls `load_dotenv()`).

There are no automated backend tests in this repo currently.

Health check: `GET /health` (pings the DB). Root: `GET /`.

## Backend architecture

Everything lives in `backend/src/`, three layers, no framework-level routers/blueprints — it's all one FastAPI app instance:

- `API/api.py` — the entire FastAPI app: route declarations, Pydantic request models, CORS, Stripe/PayPal checkout flows, admin JWT auth dependency (`get_current_admin`). ~850 lines, all endpoints in one file.
- `Utils/jolayacht_exec.py` — business logic layer. Each entity (experiences, fleet, reviews, faqs, promotions, reservations, payments, stats, auth) has plain functions here (`get_all_x`, `create_x`, `update_x`, `delete_x`) that call into the query layer and shape results. Also owns password hashing/JWT (`hash_password`, `create_token`, `verify_token`) and email sending (`send_booking_confirmation_email`).
- `Queries/jolayacht_queries.py` — raw SQL query builders/strings consumed by the Utils layer.
- `config/config.py` — reads `.env` into module-level constants (`DATABASE_URL` built from discrete DB_* vars, JWT settings, SMTP settings).

Data access goes through three primitives defined in `jolayacht_exec.py`: `execute_query` (SELECT → list of dicts), `execute_write` (INSERT/UPDATE with RETURNING → list of dicts), `execute_update` (UPDATE/DELETE → rowcount). No ORM models; rows are plain dicts. IDs are Postgres `uuid` (via `pgcrypto`'s `gen_random_uuid()`).

Key domain rules encoded in `backend/init.sql` (the schema is the source of truth for these):
- A `reservations` row must reference exactly one of `experience_id` or `fleet_id` (`ck_reservation_one_item`), never both/neither.
- Double-booking prevention is a DB-level partial unique index per asset+date+time_slot, excluding cancelled reservations (`uq_reservation_experience_slot`, `uq_reservation_fleet_slot`) — not app-level locking. The API layer catches the resulting unique-violation and turns it into a 409.
- `experiences.rating`/`review_count` are auto-maintained by a Postgres trigger (`trg_update_experience_rating`) on `reviews` insert/update/delete — never set these directly from app code.
- `promotions` supports percentage/fixed discounts, optional promo codes (case-insensitive-by-convention, app uppercases), and can target all/experiences/fleet/specific items (specific items stored as a JSON array of UUID strings in `specific_items`, not a join table).

Payments: both Stripe (`/checkout/session`, `/webhook/stripe`) and PayPal (`/checkout/paypal`, `/checkout/paypal/capture/{order_id}`) are supported in parallel, each writing to the shared `payment_transactions` table keyed by `session_id` (Stripe session id or PayPal order id) and updating `reservations.payment_session_id`/`payment_status` on success. There's also `/internal/confirm-payment/{session_id}`, an admin-only manual fallback for when webhooks aren't reachable (e.g. local dev).

Auth: a single admin-user table (`admin_users`), JWT bearer tokens (`JWT_SECRET_KEY`, HS256, 24h expiry), no roles/permissions beyond "is an admin". `POST /admin/seed-admin` bootstraps the first admin (409s if one already exists for that email) — there's no other way to create an admin.

## Frontend architecture

CRA (via CRACO) app, path alias `@` → `frontend/src` (configured in both `craco.config.js` and `jsconfig.json`).

- `App.js` — all routing (react-router). Public landing page is one long scroll of section components (`HeroSection`, `ExperiencesSection`, `FleetSection`, etc.) rendered together; booking (`/booking/:experienceId` and `/booking/fleet/:fleetId`), payment result pages (`/payment/success`, `/payment/cancel`), and admin (`/admin`, `/admin/dashboard`) are separate routed pages.
- `components/ui/` — shadcn-style primitives generated from Radix (`components.json` present) — treat these as generated/vendor code, edit sparingly.
- `components/*.jsx` — actual page/section components (one file per section/feature, not further nested).
- `context/LanguageContext.jsx` — app-wide ES/EN language switching; most user-facing copy is bilingual and pulled through this context rather than an i18n library.
- `lib/utils.js` — just the shadcn `cn()` classname helper (clsx + tailwind-merge).

Talks to the backend over plain `axios`/`fetch` using `REACT_APP_BACKEND_URL` (set in `frontend/.env`, defaults to `http://localhost:5010`). Stripe checkout uses `REACT_APP_STRIPE_PUBLIC_KEY` from the same `.env`.

`craco.config.js` also has optional, env-gated dev-only features (disabled unless the corresponding env var is set) for a webpack health-check endpoint and a "visual edits" babel/dev-server plugin — both reference a `./plugins/` directory that doesn't currently exist in this repo, so leave `ENABLE_HEALTH_CHECK`/`ENABLE_VISUAL_EDITS` unset unless those plugin files are added.
