import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from backend root if present
backend_dir = Path(__file__).resolve().parent.parent
env_path = backend_dir / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Normalize Postgres URI scheme for SQLAlchemy 2.0
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Fallback to local SQLite if DATABASE_URL is not set
if not DATABASE_URL:
    db_file = backend_dir / "planetpulse.db"
    DATABASE_URL = f"sqlite:///{db_file}"

PORT = int(os.getenv("PORT", "8000"))
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",") if origin.strip()]
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "").strip()
MISTRAL_MODEL = os.getenv("MISTRAL_MODEL", "open-mistral-7b").strip()

