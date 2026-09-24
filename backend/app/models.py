import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, DateTime, Index
from .database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = Column(String(255), nullable=False, index=True)
    activity_type = Column(String(50), nullable=False, index=True)
    quantity = Column(Float, nullable=False)
    co2_kg = Column(Float, nullable=False)
    flagged = Column(Boolean, nullable=False, default=False)
    logged_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utc_now)

    __table_args__ = (
        Index("idx_activities_device_date", "device_id", "logged_at"),
        Index("idx_activities_device_type", "device_id", "activity_type"),
    )


class WeeklyTarget(Base):
    __tablename__ = "weekly_targets"

    device_id = Column(String(255), primary_key=True)
    target_kg = Column(Float, nullable=False)
    rollover_debt_kg = Column(Float, nullable=False, default=0.0)  # DP1 rollover compensation
    updated_at = Column(DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now)
