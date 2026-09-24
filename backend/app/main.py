from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS
from .database import init_db
from .routers import activities, dashboard, target, device

OPENAPI_DESCRIPTION = """
# 🌍 PlanetPulse API — Carbon Footprint Tracker

**CODE2CAREER AI Hackathon — Track 2: Real-World AI Products (Climate Tech Brief)**

PlanetPulse turns daily choices (travel, food, electricity) into a visible personal carbon footprint
against a weekly target, engineered with a **zero-friction, zero-authentication** model.

---

### 🔑 Identity & Data Partitioning Model
- **No authentication exists anywhere.** There are no passwords, OAuth tokens, sessions, or credentials.
- All endpoints accept an `X-Device-Id` header (a plain string UUID or identifier).
- If the header is omitted or blank, the API transparently defaults to `"default"` without erroring.
- Pasting an unrecognized ID simply initializes an empty dataset under that key — there are no "unauthorized" or "not found" credential states.

---

### ⚖️ Hackathon Decision Points
- **DP1 (The Nudge):** Target overage triggers constructive warnings and actionable reduction tips instead of shaming or blocking. Users can opt into a **carbon rollover compensation mechanism** that balances excess emissions in the following week.
- **DP2 (Absurd Input):** Physically unrealistic quantities (e.g. >2,000 km car trip) require explicit user confirmation. Once confirmed, they are stored with `flagged = true` and **excluded from the weekly target budget calculation** by default, preventing single-entry typos from distorting charts while preserving user input truthfulness.
- **DP3 (The Week):** Standard calendar week from **Monday 00:00 to Sunday 23:59 (ISO-8601)** with temporal pacing ("X days remaining", percent elapsed vs. percent consumed).
"""


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    init_db()
    yield


app = FastAPI(
    title="PlanetPulse API",
    description=OPENAPI_DESCRIPTION,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(activities.router)
app.include_router(dashboard.router)
app.include_router(target.router)
app.include_router(device.router)


@app.get("/", tags=["Health"])
def root_endpoint():
    """
    API root and welcome message with links to documentation.
    """
    return {
        "project": "PlanetPulse API",
        "status": "healthy",
        "version": "1.0.0",
        "documentation": "/docs",
        "auth_required": False,
        "default_device_id": "default",
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Service liveness and health probe.
    """
    return {"status": "ok"}
