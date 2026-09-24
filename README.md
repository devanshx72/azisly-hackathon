# 🌍 PlanetPulse — Carbon Footprint Tracker

> **CODE2CAREER AI Hackathon — Track 2: Real-World AI Products (Climate Tech Brief)**

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-13%2F13%20Passing-brightgreen)]()
[![Zero-Auth](https://img.shields.io/badge/Authentication-Zero--Auth%20Compliant-blue)]()
[![Standard API](https://img.shields.io/badge/Standard%20API-FastAPI%20Swagger-purple)]()

PlanetPulse turns daily choices (transport, energy, meals) into an intuitive, actionable personal carbon footprint measured against a weekly target. Built under the hackathon constraint of **zero authentication**, every feature is instantly accessible with no signup, passwords, or dead-ends.

---

## 🏆 Hackathon Submission Details

- **Hackathon ID / Team ID:** `AZIS-GXZB9T`
- **Track:** Track 2 — Real-World AI Products (Climate Tech)
- **Standard API Declaration:** **Yes**, PlanetPulse implements and provides a self-documenting REST API compliant with OpenAPI 3.1 standards, accessible at `/docs` (Swagger UI) and `/openapi.json`.
- **Decision Points Documentation:** Full rationales are documented in [`DECISIONS.md`](./DECISIONS.md).

---

## 🚀 Key Features

| # | Feature | Endpoint | Description |
|---|---|---|---|
| **1** | **Log Activity** | `POST /api/activities` | Log activities with type (`car`, `bus`, `flight`, `electricity`, `veg_meal`, `non_veg_meal`) and quantity. |
| **2** | **CO₂ Calculation** | `POST /api/activities` | Single-source-of-truth calculations with fixed factors: car (0.20 kg/km), bus (0.08 kg/km), flight (0.25 kg/km), electricity (0.80 kg/kWh), veg meal (0.50 kg), non-veg meal (2.00 kg). |
| **3** | **Dashboard** | `GET /api/dashboard` | Overall emissions, category breakdown (totals, units, percentages), and mid-week pacing. |
| **4** | **Weekly Target & Nudge** | `GET /api/target`<br>`PUT /api/target`<br>`POST /api/target/rollover` | Set a weekly CO₂ budget, monitor progress %, receive constructive overage alerts, and manage carbon debt rollover. |
| **6** | **Leafy AI Chatbot** | `POST /api/chat` | AI climate companion powered by LangChain & Mistral AI with live weekly carbon progress sync. |

---



## ⚖️ Hackathon Decision Points

A detailed breakdown of all three decisions and their defense is in [`DECISIONS.md`](./DECISIONS.md):

1. **DP1 — The Nudge (Behavior When Target is Crossed):**
   - **Decision:** Constructive warning alert + **Rollover Compensation Option** rather than shame or blocking.
   - **Mechanism:** Displays an alert banner with actionable reduction tips and allows users to deduct this week's excess from next week's budget via `POST /api/target/rollover`.

2. **DP2 — Absurd Input Handling:**
   - **Decision:** Inline confirmation + Flagged outlier isolation.
   - **Mechanism:** Inputs exceeding physical limits (e.g. >2,000 km car trip) prompt a confirmation warning (`HTTP 409`). When confirmed (`confirm_outlier=true`), they are stored with `flagged=true` and **excluded from the weekly target calculation by default**, preventing typos from distorting weekly metrics while preserving logged records.

3. **DP3 — The Week Boundary & Mid-Week Pacing:**
   - **Decision:** Fixed **Monday 00:00 to Sunday 23:59 (ISO-8601)** calendar week.
   - **Mechanism:** Progress is shown as a progress percentage bar alongside an active **pacing indicator** comparing percentage of budget consumed against percentage of the week elapsed ("X days remaining").

---

## 🔒 Zero-Authentication Architecture

To ensure 100% compliance with the hackathon's "no auth" rule:
- **No credentials:** No passwords, sessions, JWTs, or OAuth tokens exist.
- **Lookup key:** Requests accept an optional `X-Device-Id` header (e.g. client UUID) used solely as a database partition key.
- **Resilient fallback:** If `X-Device-Id` is missing or empty, all endpoints transparently default to `"default"` — never throwing 400, 401, or 403.
- **No dead ends:** Providing an unrecognized key instantly initializes a fresh empty dataset.

---

## 🛠️ Tech Stack

- **Framework:** FastAPI (Python 3.11+)
- **Database ORM:** SQLAlchemy 2.0
- **Database:** PostgreSQL (Supabase / Neon) with seamless SQLite local fallback
- **Validation:** Pydantic v2
- **Testing:** Pytest & HTTPX

---

## 🏃 Running the Backend Locally

### 1. Setup Virtual Environment
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
To connect to your **Supabase PostgreSQL database**, update `DATABASE_URL`:
```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres
PORT=8000
```
*(If left blank, the app will automatically fall back to a local SQLite database `planetpulse.db`)*

### 3. Run Database Migrations
```bash
python migrate.py
```
*(Alternatively, execute `schema.sql` directly inside the Supabase SQL Editor)*

### 4. Start the Server
```bash
python run.py
# Or directly via uvicorn:
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The interactive Swagger documentation will be available at:
👉 **`http://localhost:8000/docs`**

---

## 🧪 Running Automated Tests

Run the test suite covering all 5 features, decision points, and zero-auth compliance:
```bash
pytest tests -v
```
All 9 test suites validate emissions factors, outlier confirmation, budget pacing, rollover compensation, and fallback handling.
