from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_device_id
from ..constants import ACTIVITY_UNITS
from ..schemas import DashboardResponse, CategoryBreakdownItem, CurrentWeekSummary, ActivityResponse
from ..repositories import activity_repo, target_repo
from ..week_utils import get_current_iso_week_bounds, compute_week_pacing

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=DashboardResponse,
    summary="Get aggregated carbon footprint dashboard (Feature 3 & DP3)",
)
def get_dashboard(
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Returns total carbon footprint across all logged activities, category breakdown,
    and ISO Monday-Sunday week pacing analysis (DP3).
    
    Per DP2, flagged outlier entries are isolated and excluded from the standard
    weekly budget pacing calculation to prevent chart distortion.
    """
    # 1. Total category breakdown & aggregate footprint
    category_rows = activity_repo.get_category_aggregates(db=db, device_id=device_id)
    total_co2 = round(sum(item["co2_kg"] for item in category_rows), 2)
    total_activities = sum(item["activity_count"] for item in category_rows)

    categories = []
    for item in category_rows:
        percentage = round((item["co2_kg"] / total_co2 * 100), 1) if total_co2 > 0 else 0.0
        categories.append(
            CategoryBreakdownItem(
                activity_type=item["activity_type"],
                unit=item["unit"],
                total_quantity=item["total_quantity"],
                co2_kg=item["co2_kg"],
                activity_count=item["activity_count"],
                percentage=percentage,
            )
        )

    # 2. DP3 ISO Monday-Sunday week bounds and totals
    week_start, week_end = get_current_iso_week_bounds()
    week_totals = activity_repo.get_week_co2_totals(
        db=db,
        device_id=device_id,
        week_start=week_start,
        week_end=week_end,
    )

    # 3. Retrieve weekly target (default to 30.0 kg baseline so budget progress always tracks)
    target_record = target_repo.get_target(db=db, device_id=device_id)
    target_kg = target_record.target_kg if target_record else 30.0
    rollover_debt_kg = target_record.rollover_debt_kg if target_record else 0.0

    # 4. Pacing calculation (DP3) using unflagged emissions (DP2)
    pacing_info = compute_week_pacing(
        week_co2_kg=week_totals["unflagged"],
        target_kg=target_kg,
        rollover_debt_kg=rollover_debt_kg,
    )

    current_week = CurrentWeekSummary(
        week_start=pacing_info["week_start"],
        week_end=pacing_info["week_end"],
        day_of_week=pacing_info["day_of_week"],
        days_remaining=pacing_info["days_remaining"],
        elapsed_days=pacing_info["elapsed_days"],
        expected_pace_percent=pacing_info["expected_pace_percent"],
        week_co2_kg=week_totals["unflagged"],
        flagged_co2_kg=week_totals["flagged"],
        target_kg=target_kg,
        rollover_debt_kg=rollover_debt_kg,
        effective_target_kg=pacing_info["effective_target_kg"],
        progress_percent=pacing_info["progress_percent"],
        is_over_target=pacing_info["is_over_target"],
        overage_kg=pacing_info["overage_kg"],
        pacing_status=pacing_info["pacing_status"],
        pacing_message=pacing_info["pacing_message"],
    )

    # 5. Recent 5 activities
    recent_records = activity_repo.get_activities(db=db, device_id=device_id, limit=5)
    recent_activities = [
        ActivityResponse(
            id=rec.id,
            device_id=rec.device_id,
            activity_type=rec.activity_type,
            unit=ACTIVITY_UNITS.get(rec.activity_type, "units"),
            quantity=rec.quantity,
            co2_kg=rec.co2_kg,
            flagged=rec.flagged,
            logged_at=rec.logged_at,
            created_at=rec.created_at,
        )
        for rec in recent_records
    ]

    return DashboardResponse(
        device_id=device_id,
        total_co2_kg=total_co2,
        total_activities=total_activities,
        categories=categories,
        current_week=current_week,
        recent_activities=recent_activities,
    )
