from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_device_id
from ..constants import compute_co2, is_absurd_input, ABSURD_THRESHOLDS, ACTIVITY_UNITS, VALID_ACTIVITY_TYPES
from ..schemas import ActivityCreate, ActivityResponse, OutlierWarningResponse
from ..repositories import activity_repo

router = APIRouter(prefix="/api/activities", tags=["Activities"])


@router.post(
    "",
    response_model=ActivityResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "Activity successfully logged", "model": ActivityResponse},
        409: {"description": "DP2: Outlier detected requiring user confirmation", "model": OutlierWarningResponse},
        422: {"description": "Validation error (invalid activity type or non-positive quantity)"},
    },
    summary="Log a carbon activity (Feature 1 & Feature 2)",
)
def log_activity(
    payload: ActivityCreate,
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Logs an activity (car, bus, flight, electricity, veg_meal, non_veg_meal) with quantity.
    
    - Computes CO2 server-side using immutable emission factors (Feature 2).
    - DP2 Absurd Input Handling: If quantity exceeds the realistic threshold and 'confirm_outlier'
      is False, returns a 409 Conflict with an outlier warning message asking for confirmation.
      When confirmed ('confirm_outlier' = True), the record is saved with 'flagged = True',
      tagging it as an outlier and excluding it from the weekly target calculation.
    """
    if payload.activity_type not in VALID_ACTIVITY_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid activity_type '{payload.activity_type}'. Must be one of {list(VALID_ACTIVITY_TYPES)}.",
        )

    # DP2 check: Is this entry absurdly large?
    is_outlier = is_absurd_input(payload.activity_type, payload.quantity)

    if is_outlier and not payload.confirm_outlier:
        threshold = ABSURD_THRESHOLDS[payload.activity_type]
        unit = ACTIVITY_UNITS.get(payload.activity_type, "units")
        warning_data = OutlierWarningResponse(
            is_outlier=True,
            threshold=threshold,
            activity_type=payload.activity_type,
            quantity=payload.quantity,
            unit=unit,
            message=(
                f"That's an unusually large entry ({payload.quantity} {unit} for {payload.activity_type}, "
                f"threshold is {threshold} {unit}) — did you mean this? "
                "Confirm to save this record as a flagged outlier."
            ),
            requires_confirmation=True,
        )
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=warning_data.model_dump(),
        )

    co2_kg = compute_co2(payload.activity_type, payload.quantity)
    flagged = is_outlier  # Flagged if confirmed outlier

    activity = activity_repo.create_activity(
        db=db,
        device_id=device_id,
        activity_type=payload.activity_type,
        quantity=payload.quantity,
        co2_kg=co2_kg,
        flagged=flagged,
        logged_at=payload.logged_at,
    )

    return ActivityResponse(
        id=activity.id,
        device_id=activity.device_id,
        activity_type=activity.activity_type,
        unit=ACTIVITY_UNITS.get(activity.activity_type, "units"),
        quantity=activity.quantity,
        co2_kg=activity.co2_kg,
        flagged=activity.flagged,
        logged_at=activity.logged_at,
        created_at=activity.created_at,
    )


@router.get(
    "",
    response_model=List[ActivityResponse],
    summary="Get logged activity history with filters (Feature 5)",
)
def get_activities_history(
    type: Optional[str] = Query(None, description="Filter by activity type (car, bus, flight, electricity, veg_meal, non_veg_meal)"),
    from_date: Optional[datetime] = Query(None, description="Filter activities logged on or after this timestamp"),
    to_date: Optional[datetime] = Query(None, description="Filter activities logged on or before this timestamp"),
    include_flagged: bool = Query(True, description="Whether to include DP2 flagged outlier entries"),
    limit: int = Query(100, ge=1, le=500, description="Max number of items to return"),
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Returns historical activities for the current device_id.
    Filterable by activity type, date range, and whether flagged outliers are included.
    """
    if type and type not in VALID_ACTIVITY_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid activity type filter '{type}'. Must be one of {list(VALID_ACTIVITY_TYPES)}.",
        )

    records = activity_repo.get_activities(
        db=db,
        device_id=device_id,
        activity_type=type,
        from_date=from_date,
        to_date=to_date,
        include_flagged=include_flagged,
        limit=limit,
    )

    return [
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
        for rec in records
    ]


@router.delete(
    "/{activity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a logged activity entry",
)
def delete_activity(
    activity_id: str,
    device_id: str = Depends(get_device_id),
    db: Session = Depends(get_db),
):
    """
    Deletes an activity entry by ID for the current device_id.
    """
    success = activity_repo.delete_activity(db=db, device_id=device_id, activity_id=activity_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity entry not found or does not belong to current device ID.",
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)

