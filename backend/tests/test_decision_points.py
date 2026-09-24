import pytest
from datetime import datetime, timezone


def test_dp2_absurd_input_workflow(client):
    """
    Tests DP2 Absurd Input Handling:
    1. Unusually large input (>2,000 km car) without confirm_outlier triggers 409 warning.
    2. Data is not saved until user explicitly confirms.
    3. With confirm_outlier=True, returns 201 and marked flagged=True.
    4. Flagged entry is excluded from standard weekly budget calculations on dashboard.
    """
    headers = {"X-Device-Id": "device-dp2-test"}

    # 1. Attempt to log 500,000 km car trip without confirmation
    res = client.post(
        "/api/activities",
        json={"activity_type": "car", "quantity": 500000.0, "confirm_outlier": False},
        headers=headers,
    )
    assert res.status_code == 409
    body = res.json()
    assert body["is_outlier"] is True
    assert body["threshold"] == 2000.0
    assert body["requires_confirmation"] is True
    assert "unusually large entry" in body["message"]

    # Verify nothing was saved
    history_res = client.get("/api/activities", headers=headers)
    assert len(history_res.json()) == 0

    # 2. Resubmit with confirm_outlier=True
    res_confirmed = client.post(
        "/api/activities",
        json={"activity_type": "car", "quantity": 500000.0, "confirm_outlier": True},
        headers=headers,
    )
    assert res_confirmed.status_code == 201
    confirmed_data = res_confirmed.json()
    assert confirmed_data["flagged"] is True
    assert confirmed_data["quantity"] == 500000.0
    assert confirmed_data["co2_kg"] == 100000.0

    # 3. Also log a normal entry (10 km car = 2 kg CO2)
    client.post(
        "/api/activities",
        json={"activity_type": "car", "quantity": 10.0},
        headers=headers,
    )

    # 4. Set a weekly target of 50 kg CO2
    client.put("/api/target", json={"target_kg": 50.0}, headers=headers)

    # 5. Check dashboard: standard week_co2_kg should only be 2.0 kg (not 100,002 kg!)
    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash = dash_res.json()
    current_week = dash["current_week"]
    assert current_week["week_co2_kg"] == 2.0
    assert current_week["flagged_co2_kg"] == 100000.0
    assert current_week["is_over_target"] is False  # protected from false alarm!


def test_dp1_the_nudge_and_rollover_compensation(client):
    """
    Tests DP1 The Nudge:
    1. Warning alert trigger when target is crossed without shaming or blocking.
    2. Rollover compensation option to carry forward excess to next week's budget.
    """
    headers = {"X-Device-Id": "device-dp1-test"}

    # Set budget to 20 kg
    client.put("/api/target", json={"target_kg": 20.0}, headers=headers)

    # Log 10 km car = 2 kg CO2 -> Under budget
    client.post("/api/activities", json={"activity_type": "car", "quantity": 10.0}, headers=headers)
    t_res1 = client.get("/api/target", headers=headers)
    assert t_res1.status_code == 200
    t1 = t_res1.json()
    assert t1["is_over_target"] is False
    assert t1["nudge"]["level"] == "success"

    # Log 150 km car = 30 kg CO2 -> Total is now 32 kg (12 kg over 20 kg budget)
    client.post("/api/activities", json={"activity_type": "car", "quantity": 150.0}, headers=headers)
    t_res2 = client.get("/api/target", headers=headers)
    t2 = t_res2.json()
    assert t2["is_over_target"] is True
    assert t2["overage_kg"] == 12.0
    assert t2["nudge"]["level"] == "warning"
    assert t2["nudge"]["can_rollover"] is True
    assert t2["nudge"]["suggested_rollover_kg"] == 12.0
    assert len(t2["nudge"]["reduction_tips"]) > 0

    # User chooses to apply rollover debt to next week's budget
    roll_res = client.post("/api/target/rollover", json={"apply_rollover": True}, headers=headers)
    assert roll_res.status_code == 200
    roll_data = roll_res.json()
    assert roll_data["rollover_debt_kg"] == 12.0
    # Effective target is now 20 - 12 = 8 kg
    assert roll_data["effective_target_kg"] == 8.0


def test_dp3_iso_week_and_mid_week_pacing(client):
    """
    Tests DP3 The Week:
    1. Returns ISO-8601 Monday to Sunday week boundaries.
    2. Returns temporal pacing with days remaining and expected pace percentage.
    """
    headers = {"X-Device-Id": "device-dp3-test"}
    client.put("/api/target", json={"target_kg": 50.0}, headers=headers)

    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    cw = dash_res.json()["current_week"]

    assert 1 <= cw["day_of_week"] <= 7
    assert cw["elapsed_days"] + cw["days_remaining"] == 7
    assert 0 < cw["expected_pace_percent"] <= 100
    assert "week_start" in cw and "week_end" in cw
    assert cw["pacing_status"] in ["on_track", "caution", "exceeded"]
