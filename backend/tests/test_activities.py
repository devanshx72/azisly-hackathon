import pytest


def test_log_activities_and_factor_calculations(client):
    """
    Tests Feature 1 & Feature 2:
    Logging activities with each type and verifying CO2 emission factors:
    - car: 0.20 kg/km
    - bus: 0.08 kg/km
    - flight: 0.25 kg/km
    - electricity: 0.80 kg/kWh
    - veg_meal: 0.50 kg/meal
    - non_veg_meal: 2.00 kg/meal
    """
    headers = {"X-Device-Id": "test-device-1"}
    test_cases = [
        {"activity_type": "car", "quantity": 10.0, "expected_co2": 2.0},
        {"activity_type": "bus", "quantity": 50.0, "expected_co2": 4.0},
        {"activity_type": "flight", "quantity": 1000.0, "expected_co2": 250.0},
        {"activity_type": "electricity", "quantity": 100.0, "expected_co2": 80.0},
        {"activity_type": "veg_meal", "quantity": 3.0, "expected_co2": 1.5},
        {"activity_type": "non_veg_meal", "quantity": 2.0, "expected_co2": 4.0},
    ]

    for tc in test_cases:
        res = client.post(
            "/api/activities",
            json={"activity_type": tc["activity_type"], "quantity": tc["quantity"]},
            headers=headers,
        )
        assert res.status_code == 201, f"Failed on {tc['activity_type']}: {res.text}"
        data = res.json()
        assert data["activity_type"] == tc["activity_type"]
        assert data["quantity"] == tc["quantity"]
        assert data["co2_kg"] == tc["expected_co2"]
        assert data["flagged"] is False
        assert data["device_id"] == "test-device-1"
        assert "id" in data


def test_invalid_inputs_rejected(client):
    headers = {"X-Device-Id": "test-device-1"}

    # Invalid activity type
    res = client.post(
        "/api/activities",
        json={"activity_type": "spaceship", "quantity": 10.0},
        headers=headers,
    )
    assert res.status_code == 422

    # Negative quantity
    res = client.post(
        "/api/activities",
        json={"activity_type": "car", "quantity": -5.0},
        headers=headers,
    )
    assert res.status_code == 422

    # Zero quantity
    res = client.post(
        "/api/activities",
        json={"activity_type": "car", "quantity": 0.0},
        headers=headers,
    )
    assert res.status_code == 422


def test_history_and_filtering(client):
    """
    Tests Feature 5: History retrieval with type and date filters.
    """
    headers = {"X-Device-Id": "test-device-filters"}

    client.post("/api/activities", json={"activity_type": "car", "quantity": 15.0}, headers=headers)
    client.post("/api/activities", json={"activity_type": "car", "quantity": 25.0}, headers=headers)
    client.post("/api/activities", json={"activity_type": "bus", "quantity": 10.0}, headers=headers)

    # Get all
    res = client.get("/api/activities", headers=headers)
    assert res.status_code == 200
    items = res.json()
    assert len(items) == 3

    # Filter by type=car
    res_car = client.get("/api/activities?type=car", headers=headers)
    assert res_car.status_code == 200
    car_items = res_car.json()
    assert len(car_items) == 2
    for item in car_items:
        assert item["activity_type"] == "car"

    # Filter by type=bus
    res_bus = client.get("/api/activities?type=bus", headers=headers)
    assert res_bus.status_code == 200
    assert len(res_bus.json()) == 1

    # Invalid type filter
    res_invalid = client.get("/api/activities?type=invalid_type", headers=headers)
    assert res_invalid.status_code == 422
