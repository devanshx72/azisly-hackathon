from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..models import Activity, utc_now
from ..constants import VALID_ACTIVITY_TYPES, ACTIVITY_UNITS


def create_activity(
    db: Session,
    device_id: str,
    activity_type: str,
    quantity: float,
    co2_kg: float,
    flagged: bool,
    logged_at: Optional[datetime] = None,
) -> Activity:
    """
    Inserts a newly logged activity for a given device_id.
    """
    activity = Activity(
        device_id=device_id,
        activity_type=activity_type,
        quantity=quantity,
        co2_kg=co2_kg,
        flagged=flagged,
        logged_at=logged_at if logged_at is not None else utc_now(),
        created_at=utc_now(),
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


def get_activities(
    db: Session,
    device_id: str,
    activity_type: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    include_flagged: bool = True,
    limit: int = 100,
) -> List[Activity]:
    """
    Retrieves logged activities for a device, filterable by type, date range, and outlier flag.
    Ordered by logged_at descending.
    """
    query = db.query(Activity).filter(Activity.device_id == device_id)

    if activity_type:
        query = query.filter(Activity.activity_type == activity_type)

    if from_date:
        query = query.filter(Activity.logged_at >= from_date)

    if to_date:
        query = query.filter(Activity.logged_at <= to_date)

    if not include_flagged:
        query = query.filter(Activity.flagged.is_(False))

    return query.order_by(Activity.logged_at.desc()).limit(limit).all()


def get_category_aggregates(
    db: Session,
    device_id: str,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    include_flagged: bool = True,
) -> List[Dict[str, Any]]:
    """
    Aggregates total quantity, co2_kg, and record counts per activity category for the device.
    """
    query = db.query(
        Activity.activity_type,
        func.sum(Activity.quantity).label("total_quantity"),
        func.sum(Activity.co2_kg).label("total_co2"),
        func.count(Activity.id).label("count"),
    ).filter(Activity.device_id == device_id)

    if from_date:
        query = query.filter(Activity.logged_at >= from_date)

    if to_date:
        query = query.filter(Activity.logged_at <= to_date)

    if not include_flagged:
        query = query.filter(Activity.flagged.is_(False))

    rows = query.group_by(Activity.activity_type).all()

    results = []
    for row in rows:
        results.append({
            "activity_type": row.activity_type,
            "unit": ACTIVITY_UNITS.get(row.activity_type, "units"),
            "total_quantity": round(float(row.total_quantity or 0.0), 2),
            "co2_kg": round(float(row.total_co2 or 0.0), 2),
            "activity_count": int(row.count or 0),
        })
    return results


def get_week_co2_totals(
    db: Session,
    device_id: str,
    week_start: datetime,
    week_end: datetime,
) -> Dict[str, float]:
    """
    Computes valid (unflagged) and flagged CO2 totals for the given week.
    DP2: Flagged outliers are tracked separately and excluded from standard target budget by default.
    """
    rows = db.query(
        Activity.flagged,
        func.sum(Activity.co2_kg).label("co2_sum"),
    ).filter(
        Activity.device_id == device_id,
        Activity.logged_at >= week_start,
        Activity.logged_at <= week_end,
    ).group_by(Activity.flagged).all()

    totals = {"unflagged": 0.0, "flagged": 0.0}
    for row in rows:
        val = float(row.co2_sum or 0.0)
        if row.flagged:
            totals["flagged"] += val
        else:
            totals["unflagged"] += val

    return {
        "unflagged": round(totals["unflagged"], 2),
        "flagged": round(totals["flagged"], 2),
        "total": round(totals["unflagged"] + totals["flagged"], 2),
    }


def delete_activity(db: Session, device_id: str, activity_id: str) -> bool:
    """
    Deletes an activity record for a given device_id and activity_id.
    Returns True if deleted, False if not found.
    """
    activity = db.query(Activity).filter(Activity.id == activity_id, Activity.device_id == device_id).first()
    if not activity:
        return False
    db.delete(activity)
    db.commit()
    return True

