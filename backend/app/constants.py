from typing import Dict

# Emission factors in kg CO₂ per unit (single source of truth)
# car: kg/km, bus: kg/km, flight: kg/km, electricity: kg/kWh, meals: kg/meal (flat)
FACTORS: Dict[str, float] = {
    "car": 0.20,
    "bus": 0.08,
    "flight": 0.25,
    "electricity": 0.80,
    "veg_meal": 0.50,
    "non_veg_meal": 2.00,
}

# DP2 Absurd input thresholds for a single entry
ABSURD_THRESHOLDS: Dict[str, float] = {
    "car": 2000.0,         # km (exceptional single-day road distance)
    "bus": 1000.0,         # km
    "flight": 20000.0,     # km (approx. half the globe)
    "electricity": 500.0,  # kWh (normal household uses ~10-30 kWh/day)
    "veg_meal": 10.0,      # count of meals
    "non_veg_meal": 10.0,  # count of meals
}

ACTIVITY_UNITS: Dict[str, str] = {
    "car": "km",
    "bus": "km",
    "flight": "km",
    "electricity": "kWh",
    "veg_meal": "meals",
    "non_veg_meal": "meals",
}

VALID_ACTIVITY_TYPES = tuple(FACTORS.keys())


def compute_co2(activity_type: str, quantity: float) -> float:
    """
    Computes CO2 footprint in kg based on activity type and quantity.
    Emission factors are maintained here as the single source of truth.
    """
    if activity_type not in FACTORS:
        raise ValueError(f"Unknown activity_type: '{activity_type}'. Valid types: {list(FACTORS.keys())}")
    if quantity < 0:
        raise ValueError("Quantity cannot be negative.")
    
    factor = FACTORS[activity_type]
    return round(factor * quantity, 4)


def is_absurd_input(activity_type: str, quantity: float) -> bool:
    """
    DP2: Evaluates if an input exceeds realistic physical boundaries.
    """
    threshold = ABSURD_THRESHOLDS.get(activity_type)
    if threshold is None:
        return False
    return quantity > threshold
