from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_device_id
from ..schemas import WeeklyTargetSet, WeeklyTargetResponse, RolloverActionRequest
from ..repositories import target_repo, activity_repo
from ..week_utils import get_current_iso_week_bounds, compute_week_pacing

router = APIRouter(prefix="/api/target", tags=["Weekly Target"])


def build_nudge_payload(
    is_over_target: bool,
    overage_kg: float,
    progress_percent: float,
    days_remaining: int,
    rollover_debt_kg: float,
) -> dict:
    """
    DP1: Constructs the constructive alert and rollover compensation signal.
    """
    if is_over_target:
        return {
            "level": "warning",
            "title": "Weekly Target Exceeded",
            "message": (
                f"You have exceeded your weekly target by {overage_kg:.2f} kg CO₂. "
                "You can choose to compensate by rolling this excess over to reduce next week's budget."
            ),
            "can_rollover": True,
            "suggested_rollover_kg": overage_kg,
            "rollover_applied": rollover_debt_kg > 0,
            "reduction_tips": [
                "Swap 2 short car trips for bus transit or walking.",
                "Incorporate a meatless meal into your dinner rotation.",
                "Unplug high-draw electronics during peak hours.",
            ],
        }
    elif progress_percent is not None and progress_percent >= 80.0:
        return {
            "level": "caution",
            "title": "Approaching Weekly Limit",
            "message": f"You have reached {progress_percent:.1f}% of your weekly target with {days_remaining} day(s) remaining.",
            "can_rollover": False,
            "suggested_rollover_kg": 0.0,
            "rollover_applied": rollover_debt_kg > 0,
            "reduction_tips": [
                "Consider carpooling or public transit for remaining trips this week.",
                "Keep lighting and AC usage moderate.",
            ],
        }
    else:
        return {
            "level": "success",
            "title": "Within Target Budget",
            "message": f"You are pacing comfortably within your weekly budget ({progress_percent or 0:.1f}% consumed).",
            "can_rollover": False,
            "suggested_rollover_kg": 0.0,
            "rollover_applied": rollover_debt_kg > 0,
            "reduction_tips": [
                "Keep up the conscious sustainable choices!",
            ],
        }


@router.get(
    "",
    response_model=WeeklyTargetResponse,
    summary="Get weekly target and DP1 nudge status (Feature 4 & DP1)",
)
def get_target(
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Retrieves the current weekly CO2 budget, progress percentage,
    and DP1 constructive nudge status (including rollover compensation options).
    """
    record = target_repo.get_target(db=db, device_id=device_id)
    if not record:
        record = target_repo.upsert_target(db=db, device_id=device_id, target_kg=30.0)

    week_start, week_end = get_current_iso_week_bounds()
    week_totals = activity_repo.get_week_co2_totals(
        db=db,
        device_id=device_id,
        week_start=week_start,
        week_end=week_end,
    )

    unflagged_co2 = week_totals["unflagged"]
    pacing = compute_week_pacing(
        week_co2_kg=unflagged_co2,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
    )

    nudge = build_nudge_payload(
        is_over_target=pacing["is_over_target"],
        overage_kg=pacing["overage_kg"],
        progress_percent=pacing["progress_percent"],
        days_remaining=pacing["days_remaining"],
        rollover_debt_kg=record.rollover_debt_kg,
    )

    return WeeklyTargetResponse(
        device_id=record.device_id,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
        effective_target_kg=pacing["effective_target_kg"],
        current_week_co2_kg=unflagged_co2,
        progress_percent=pacing["progress_percent"] or 0.0,
        is_over_target=pacing["is_over_target"],
        overage_kg=pacing["overage_kg"],
        days_remaining=pacing["days_remaining"],
        nudge=nudge,
        updated_at=record.updated_at,
    )


@router.put(
    "",
    response_model=WeeklyTargetResponse,
    summary="Set or update weekly target budget (Feature 4)",
)
def set_target(
    payload: WeeklyTargetSet,
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Sets or updates the weekly target budget in kg CO2.
    Optionally accepts a rollover debt to compensate for previous overage.
    """
    record = target_repo.upsert_target(
        db=db,
        device_id=device_id,
        target_kg=payload.target_kg,
        rollover_debt_kg=payload.rollover_debt_kg or 0.0,
    )

    week_start, week_end = get_current_iso_week_bounds()
    week_totals = activity_repo.get_week_co2_totals(
        db=db,
        device_id=device_id,
        week_start=week_start,
        week_end=week_end,
    )

    unflagged_co2 = week_totals["unflagged"]
    pacing = compute_week_pacing(
        week_co2_kg=unflagged_co2,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
    )

    nudge = build_nudge_payload(
        is_over_target=pacing["is_over_target"],
        overage_kg=pacing["overage_kg"],
        progress_percent=pacing["progress_percent"],
        days_remaining=pacing["days_remaining"],
        rollover_debt_kg=record.rollover_debt_kg,
    )

    return WeeklyTargetResponse(
        device_id=record.device_id,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
        effective_target_kg=pacing["effective_target_kg"],
        current_week_co2_kg=unflagged_co2,
        progress_percent=pacing["progress_percent"] or 0.0,
        is_over_target=pacing["is_over_target"],
        overage_kg=pacing["overage_kg"],
        days_remaining=pacing["days_remaining"],
        nudge=nudge,
        updated_at=record.updated_at,
    )


@router.post(
    "/rollover",
    response_model=WeeklyTargetResponse,
    summary="DP1: Apply or clear rollover compensation debt for next week",
)
def manage_rollover(
    payload: RolloverActionRequest,
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    DP1 Rollover Compensation:
    If apply_rollover is true and user is currently over budget,
    sets rollover_debt_kg to current week's overage.
    If false, resets rollover debt to 0.
    """
    record = target_repo.get_target(db=db, device_id=device_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No weekly target set. Please set a target first.",
        )

    week_start, week_end = get_current_iso_week_bounds()
    week_totals = activity_repo.get_week_co2_totals(
        db=db,
        device_id=device_id,
        week_start=week_start,
        week_end=week_end,
    )

    unflagged_co2 = week_totals["unflagged"]
    pacing = compute_week_pacing(
        week_co2_kg=unflagged_co2,
        target_kg=record.target_kg,
        rollover_debt_kg=0.0,  # calculate gross overage
    )

    new_debt = pacing["overage_kg"] if payload.apply_rollover else 0.0
    record = target_repo.update_rollover_debt(db=db, device_id=device_id, rollover_debt_kg=new_debt)

    new_pacing = compute_week_pacing(
        week_co2_kg=unflagged_co2,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
    )

    nudge = build_nudge_payload(
        is_over_target=new_pacing["is_over_target"],
        overage_kg=new_pacing["overage_kg"],
        progress_percent=new_pacing["progress_percent"],
        days_remaining=new_pacing["days_remaining"],
        rollover_debt_kg=record.rollover_debt_kg,
    )

    return WeeklyTargetResponse(
        device_id=record.device_id,
        target_kg=record.target_kg,
        rollover_debt_kg=record.rollover_debt_kg,
        effective_target_kg=new_pacing["effective_target_kg"],
        current_week_co2_kg=unflagged_co2,
        progress_percent=new_pacing["progress_percent"] or 0.0,
        is_over_target=new_pacing["is_over_target"],
        overage_kg=new_pacing["overage_kg"],
        days_remaining=new_pacing["days_remaining"],
        nudge=nudge,
        updated_at=record.updated_at,
    )
