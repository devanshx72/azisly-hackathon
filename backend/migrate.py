"""
Migration runner script for PlanetPulse.
Connects to configured DATABASE_URL (Supabase PostgreSQL or SQLite) and applies table schemas.
"""
import sys
from app.config import DATABASE_URL
from app.database import engine, Base
from app import models  # noqa: F401


def run_migration():
    print(f"Connecting to database: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else DATABASE_URL}")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables and indexes successfully created!")


if __name__ == "__main__":
    try:
        run_migration()
    except Exception as e:
        print(f"❌ Migration error: {e}", file=sys.stderr)
        sys.exit(1)
