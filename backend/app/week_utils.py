from datetime import datetime, timedelta, timezone
from typing import Tuple, Dict, Any


def get_current_iso_week_bounds(now: datetime = None) -> Tuple[datetime, datetime]:
    """
    DP3: Computes Monday 00:00:00 to Sunday 23:59:59 UTC boundary for the current ISO week.
    """
    if now is None:
        now = datetime.now(timezone.utc)
    elif now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    # weekday(): Monday is 0, Sunday is 6
    weekday = now.weekday()
    week_start = (now - timedelta(days=weekday)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    week_end = (week_start + timedelta(days=6)).replace(
        hour=23, minute=59, second=59, microsecond=999999
    )
    return week_start, week_end


def compute_week_pacing(
    week_co2_kg: float,
    target_kg: float = None,
    rollover_debt_kg: float = 0.0,
    now: datetime = None,
) -> Dict[str, Any]:
    """
    DP3: Computes mid-week progress, temporal pacing, and status indicators.
    """
    if now is None:
        now = datetime.now(timezone.utc)
    elif now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    week_start, week_end = get_current_iso_week_bounds(now)
    weekday = now.weekday()  # 0 to 6
    day_of_week = weekday + 1  # 1 (Monday) to 7 (Sunday)
    elapsed_days = day_of_week
    days_remaining = 7 - elapsed_days

    # Expected percentage of week elapsed: Day 1=14.3%, Day 4=57.1%, Day 7=100%
    expected_pace_percent = round((elapsed_days / 7.0) * 100, 1)

    effective_target_kg = None
    progress_percent = None
    is_over_target = False
    overage_kg = 0.0
    pacing_status = "no_target"
    pacing_message = "Set a weekly target in settings to track your budget."

    if target_kg is not None and target_kg > 0:
        # If rollover debt was accepted from previous week's overage, effective target is reduced
        effective_target_kg = max(0.1, round(target_kg - rollover_debt_kg, 2))
        progress_percent = round((week_co2_kg / effective_target_kg) * 100, 1)

        if week_co2_kg > effective_target_kg:
            is_over_target = True
            overage_kg = round(week_co2_kg - effective_target_kg, 2)
            pacing_status = "exceeded"
            pacing_message = f"Budget exceeded by {overage_kg} kg CO₂. You can roll over this excess to next week or cut back."
        elif progress_percent > (expected_pace_percent + 15.0):
            pacing_status = "caution"
            pacing_message = f"Currently at {progress_percent}% of budget vs. {expected_pace_percent}% week elapsed. Fast pace."
        else:
            pacing_status = "on_track"
            pacing_message = f"On track! Consumed {progress_percent}% of budget with {days_remaining} day(s) left."

    return {
        "week_start": week_start,
        "week_end": week_end,
        "day_of_week": day_of_week,
        "days_remaining": days_remaining,
        "elapsed_days": elapsed_days,
        "expected_pace_percent": expected_pace_percent,
        "effective_target_kg": effective_target_kg,
        "progress_percent": progress_percent,
        "is_over_target": is_over_target,
        "overage_kg": overage_kg,
        "pacing_status": pacing_status,
        "pacing_message": pacing_message,
    }
