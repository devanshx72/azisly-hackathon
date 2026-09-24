from typing import Optional
from sqlalchemy.orm import Session
from ..models import WeeklyTarget, utc_now


def get_target(db: Session, device_id: str) -> Optional[WeeklyTarget]:
    """
    Returns the weekly target record for device_id, or None if not set.
    """
    return db.query(WeeklyTarget).filter(WeeklyTarget.device_id == device_id).first()


def upsert_target(
    db: Session,
    device_id: str,
    target_kg: float,
    rollover_debt_kg: float = 0.0,
) -> WeeklyTarget:
    """
    Inserts or updates the weekly target and optional rollover carbon debt.
    """
    record = get_target(db, device_id)
    if record:
        record.target_kg = target_kg
        record.rollover_debt_kg = rollover_debt_kg
        record.updated_at = utc_now()
    else:
        record = WeeklyTarget(
            device_id=device_id,
            target_kg=target_kg,
            rollover_debt_kg=rollover_debt_kg,
            updated_at=utc_now(),
        )
        db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_rollover_debt(
    db: Session,
    device_id: str,
    rollover_debt_kg: float,
) -> Optional[WeeklyTarget]:
    """
    Updates the rollover carbon debt for the current target cycle.
    """
    record = get_target(db, device_id)
    if record:
        record.rollover_debt_kg = max(0.0, rollover_debt_kg)
        record.updated_at = utc_now()
        db.commit()
        db.refresh(record)
    return record
