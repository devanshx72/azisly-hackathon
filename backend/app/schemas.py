from datetime import datetime
from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from .constants import VALID_ACTIVITY_TYPES, ACTIVITY_UNITS

ActivityTypeEnum = Literal[
    "car",
    "bus",
    "flight",
    "electricity",
    "veg_meal",
    "non_veg_meal",
]


class ActivityCreate(BaseModel):
    activity_type: ActivityTypeEnum = Field(
        ...,
        description="Category of carbon activity: car, bus, flight, electricity, veg_meal, non_veg_meal"
    )
    quantity: float = Field(
        ...,
        gt=0,
        description="Quantity of activity in respective units (km, kWh, or meal count). Must be strictly > 0."
    )
    confirm_outlier: bool = Field(
        default=False,
        description="DP2: If quantity exceeds threshold, must set to true to confirm saving as a flagged outlier entry."
    )
    logged_at: Optional[datetime] = Field(
        default=None,
        description="Optional timestamp of when activity occurred. Defaults to current time."
    )


class ActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    device_id: str
    activity_type: str
    unit: str
    quantity: float
    co2_kg: float
    flagged: bool
    logged_at: datetime
    created_at: datetime


class OutlierWarningResponse(BaseModel):
    is_outlier: bool = True
    threshold: float
    activity_type: str
    quantity: float
    unit: str
    message: str
    requires_confirmation: bool = True


class CategoryBreakdownItem(BaseModel):
    activity_type: str
    unit: str
    total_quantity: float
    co2_kg: float
    activity_count: int
    percentage: float


class CurrentWeekSummary(BaseModel):
    week_start: datetime
    week_end: datetime
    day_of_week: int  # 1 = Monday, 7 = Sunday
    days_remaining: int
    elapsed_days: int
    expected_pace_percent: float
    week_co2_kg: float
    flagged_co2_kg: float
    target_kg: Optional[float] = None
    rollover_debt_kg: float = 0.0
    effective_target_kg: Optional[float] = None
    progress_percent: Optional[float] = None
    is_over_target: bool = False
    overage_kg: float = 0.0
    pacing_status: str  # "on_track", "caution", "exceeded", "no_target"
    pacing_message: str


class DashboardResponse(BaseModel):
    device_id: str
    total_co2_kg: float
    total_activities: int
    categories: List[CategoryBreakdownItem]
    current_week: CurrentWeekSummary
    recent_activities: List[ActivityResponse]


class WeeklyTargetSet(BaseModel):
    target_kg: float = Field(..., gt=0, description="Weekly CO2 target budget in kg. Must be > 0.")
    rollover_debt_kg: Optional[float] = Field(
        default=0.0,
        ge=0,
        description="DP1: Optional carbon debt rolled over from prior week to compensate for overage."
    )


class WeeklyTargetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    device_id: str
    target_kg: float
    rollover_debt_kg: float
    effective_target_kg: float
    current_week_co2_kg: float
    progress_percent: float
    is_over_target: bool
    overage_kg: float
    days_remaining: int
    nudge: Dict[str, Any]
    updated_at: datetime


class RolloverActionRequest(BaseModel):
    apply_rollover: bool = Field(
        ...,
        description="DP1: If true, carries forward the current week's excess CO2 to next week's budget."
    )


class DeviceResponse(BaseModel):
    device_id: str
    message: str
