# 🌍 PlanetPulse Codebase Summary

> **CODE2CAREER AI Hackathon — Track 2: Real-World AI Products (Climate Tech Brief)**  
> **Team ID:** `AZIS-GXZB9T`

---

## 📌 1. Executive Summary & Purpose

**PlanetPulse** is a personal carbon footprint tracking system designed to translate daily human choices—transportation (car, bus, flight), energy consumption (electricity), and dietary habits (vegetarian and non-vegetarian meals)—into clear, actionable emissions metrics evaluated against a weekly target.

### Core Mission & Key Architectural Philosophies

1. **Frictionless Zero-Authentication Model ("Zero-Auth"):**
   - Eliminates sign-up forms, passwords, sessions, JWTs, and OAuth requirements.
   - Leverages a client-provided `X-Device-Id` header (e.g. browser/device UUID) as a soft partition key.
   - If missing or empty, all endpoints transparently default to `"default"` without throwing 400, 401, or 403 errors.

2. **Single-Source-of-Truth Carbon Factor Engine:**
   - Server-side calculation enforcing fixed conversion factors:
     - 🚗 **Car:** `0.20 kg CO₂ / km`
     - 🚌 **Bus:** `0.08 kg CO₂ / km`
     - ✈️ **Flight:** `0.25 kg CO₂ / km`
     - ⚡ **Electricity:** `0.80 kg CO₂ / kWh`
     - 🥗 **Veg Meal:** `0.50 kg CO₂ / meal`
     - 🥩 **Non-Veg Meal:** `2.00 kg CO₂ / meal`

3. **Hackathon Decision Points (DP1, DP2, DP3):**
   - **DP1 — The Nudge (Overage Behavior):** Constructive alerts with reduction tips and an opt-in **rollover compensation debt mechanism** (`POST /api/target/rollover`) to reduce next week's budget rather than shaming or blocking users.
   - **DP2 — Absurd Input Handling:** Unusually high single entries (e.g., >2,000 km car trip) prompt an inline confirmation warning (`HTTP 409 Conflict`). Once confirmed (`confirm_outlier=true`), records are stored with `flagged=true` and **excluded from weekly target budget calculations by default** to preserve visualization accuracy while maintaining input data truthfulness.
   - **DP3 — Calendar Week & Mid-Week Pacing:** Enforces a fixed **Monday 00:00:00 to Sunday 23:59:59 UTC calendar week** (ISO-8601). Computes temporal pacing comparing budget consumed % against week elapsed % ("X days remaining").

---

## 📊 2. Current Implementation Level

**Current Status:** **Backend Complete / Production-Ready Core REST API (MVP)**

| Component Layer | Implementation Status | Progress | Notes |
|---|---|---|---|
| **REST API Server** | ✅ Fully Implemented | 100% | FastAPI app with full OpenAPI 3.1 self-documenting endpoints (`/docs`, `/redoc`). |
| **Business & Factor Logic** | ✅ Fully Implemented | 100% | Single-source-of-truth calculations, outlier validation, and week pacing algorithms. |
| **Database & Repositories** | ✅ Fully Implemented | 100% | SQLAlchemy 2.0 ORM + Repository pattern supporting PostgreSQL (Supabase/Neon) & SQLite fallback. |
| **Zero-Auth Middleware** | ✅ Fully Implemented | 100% | Dependency injection handling `X-Device-Id` extraction with default fallback. |
| **Automated Test Suite** | ✅ Fully Implemented | 100% | **9/9 Pytest suites passing**, covering activities, decision points, and zero-auth rules. |
| **Documentation & Briefs** | ✅ Fully Implemented | 100% | Detailed `README.md` and explicit architectural justifications in `DECISIONS.md`. |
| **Frontend UI / Client** | ⏳ Not Started | 0% | Codebase currently contains backend service only. Web/Mobile frontend UI is pending. |

---

## 🛠️ 3. Architecture & Tech Stack

```
                               ┌────────────────────────────────┐
                               │   Client (Mobile / Web App)    │
                               └──────────────┬─────────────────┘
                                              │ HTTP Requests
                                              │ (Optional: X-Device-Id)
                                              ▼
                               ┌────────────────────────────────┐
                               │       FastAPI Middleware       │
                               │  (Zero-Auth Device Extractor)  │
                               └──────────────┬─────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
         ┌───────────────────────────┐                 ┌───────────────────────────┐
         │     Activities Router     │                 │   Dashboard & Target      │
         │ (/api/activities)         │                 │ (/api/dashboard, /target) │
         └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                       │                                             │
                       ├──────────────────────┬──────────────────────┘
                       ▼                      ▼
         ┌───────────────────────────┐  ┌───────────────────────────┐
         │   Single-Source Factors   │  │    ISO Week & Pacing      │
         │  (constants.py / compute) │  │  (week_utils.py / DP1-3)  │
         └─────────────┬─────────────┘  └─────────────┬─────────────┘
                       │                              │
                       └──────────────┬───────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   Repository Layer        │
                        │ (activity_repo/target_repo│
                        └─────────────┬─────────────┘
                                      ▼
                        ┌───────────────────────────┐
                        │   SQLAlchemy 2.0 ORM      │
                        │   (Activity, Target)      │
                        └─────────────┬─────────────┘
                                      ▼
                   ┌──────────────────────────────────┐
                   │ Database (PostgreSQL / SQLite)   │
                   └──────────────────────────────────┘
```

- **Framework:** FastAPI (Python 3.10+)
- **ORM / Querying:** SQLAlchemy 2.0
- **Database Support:** PostgreSQL (Supabase/Neon) with automatic local SQLite (`planetpulse.db`) fallback
- **Validation:** Pydantic v2 schemas
- **Testing:** Pytest & HTTPX

---

## 📂 4. Directory & File Inventory

```
azisly-hackathon/
├── README.md                      # Primary project overview, API specs, setup instructions
├── DECISIONS.md                   # In-depth hackathon decision point justifications (DP1, DP2, DP3)
├── SUMMARY.md                     # Codebase purpose, architecture, and status summary
└── backend/
    ├── schema.sql                 # DDL migration script for PostgreSQL / Supabase
    ├── migrate.py                 # Automated migration execution runner
    ├── requirements.txt           # Python dependency manifests
    ├── run.py                     # Entry script to launch Uvicorn web server
    ├── .env.example               # Environment variables configuration template
    ├── app/
    │   ├── main.py                # FastAPI app initialization, CORS, OpenAPI metadata, routes
    │   ├── config.py              # Environment variables loader (DATABASE_URL, CORS)
    │   ├── constants.py           # Emission factors, absurd thresholds, unit definitions
    │   ├── database.py            # Engine setup, session factory, SQLite fallback
    │   ├── dependencies.py        # Dependency injection for zero-auth X-Device-Id
    │   ├── models.py              # SQLAlchemy DB models (Activity, WeeklyTarget)
    │   ├── schemas.py             # Pydantic v2 request & response schemas
    │   ├── week_utils.py          # ISO week calculations, pacing formulas
    │   ├── repositories/
    │   │   ├── activity_repo.py   # SQL queries for logging, filtering, category totals
    │   │   └── target_repo.py     # SQL queries for setting targets & rollover debt
    │   └── routers/
    │       ├── activities.py      # POST & GET /api/activities (logging & history)
    │       ├── dashboard.py       # GET /api/dashboard (footprint & week pacing)
    │       ├── target.py          # GET, PUT /api/target & POST /api/target/rollover
    │       └── device.py          # GET /api/device/current (identity resolution)
    └── tests/
        ├── conftest.py            # SQLite memory database fixture for unit testing
        ├── test_activities.py     # Unit tests for activity logging & factor math
        ├── test_decision_points.py# Unit tests for DP1 (Nudge), DP2 (Outliers), DP3 (Pacing)
        └── test_zero_auth.py      # Unit tests for zero-auth fallbacks & Swagger docs
```

---

## 🔍 5. API Endpoints Reference

| Endpoint | Method | Description | Feature / Decision Point |
|---|---|---|---|
| `/api/activities` | `POST` | Logs carbon activity, calculates CO₂, and handles DP2 absurd input warnings. | Feature 1, Feature 2, DP2 |
| `/api/activities` | `GET` | Fetches activity history filtered by `type`, `from_date`, `to_date`, and outlier flag. | Feature 5 |
| `/api/dashboard` | `GET` | Retrieves aggregate footprint, category percentages, and mid-week pacing. | Feature 3, DP3 |
| `/api/target` | `GET` | Retrieves current weekly budget, progress %, and DP1 nudge status. | Feature 4, DP1 |
| `/api/target` | `PUT` | Sets or updates weekly target budget in kg CO₂. | Feature 4 |
| `/api/target/rollover` | `POST` | Opts into carrying forward excess CO₂ as rollover debt into next week's budget. | DP1 |
| `/api/device/current` | `GET` | Returns active `device_id` partition key. | Zero-Auth |
| `/docs` | `GET` | Interactive OpenAPI / Swagger documentation interface. | Standard API |

---

## 🧪 6. Verification & Test Execution

The automated test suite can be run via pytest:

```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests -v
```

**Results:** `9 passed in 0.14s`
- `test_log_activities_and_factor_calculations` PASSED
- `test_invalid_inputs_rejected` PASSED
- `test_history_and_filtering` PASSED
- `test_dp2_absurd_input_workflow` PASSED
- `test_dp1_the_nudge_and_rollover_compensation` PASSED
- `test_dp3_iso_week_and_mid_week_pacing` PASSED
- `test_missing_device_id_defaults_cleanly` PASSED
- `test_unknown_fresh_device_id_never_errors` PASSED
- `test_swagger_and_openapi_docs_accessible` PASSED
