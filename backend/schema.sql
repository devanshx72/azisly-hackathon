-- PlanetPulse Database Schema for PostgreSQL / Supabase
-- Can be run in the Supabase SQL Editor directly or via migrate.py

CREATE TABLE IF NOT EXISTS activities (
    id            VARCHAR(36) PRIMARY KEY,
    device_id     VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN
                    ('car','bus','flight','electricity','veg_meal','non_veg_meal')),
    quantity      DOUBLE PRECISION NOT NULL,
    co2_kg        DOUBLE PRECISION NOT NULL,
    flagged       BOOLEAN NOT NULL DEFAULT FALSE,
    logged_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activities_device_date ON activities (device_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_activities_device_type ON activities (device_id, activity_type);

CREATE TABLE IF NOT EXISTS weekly_targets (
    device_id        VARCHAR(255) PRIMARY KEY,
    target_kg        DOUBLE PRECISION NOT NULL,
    rollover_debt_kg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
