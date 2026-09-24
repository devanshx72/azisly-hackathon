import uuid


def test_missing_device_id_defaults_cleanly(client):
    """
    Hard Rule 5: Missing or empty X-Device-Id must transparently fallback to 'default',
    never throwing 400, 401, or 403.
    """
    # 1. Log activity with no header
    res = client.post("/api/activities", json={"activity_type": "bus", "quantity": 10.0})
    assert res.status_code == 201
    assert res.json()["device_id"] == "default"

    # 2. Get activities with no header
    res_list = client.get("/api/activities")
    assert res_list.status_code == 200
    assert len(res_list.json()) >= 1
    assert res_list.json()[0]["device_id"] == "default"

    # 3. Get dashboard with no header
    res_dash = client.get("/api/dashboard")
    assert res_dash.status_code == 200
    assert res_dash.json()["device_id"] == "default"

    # 4. Check device endpoint with no header
    res_dev = client.get("/api/device/current")
    assert res_dev.status_code == 200
    assert res_dev.json()["device_id"] == "default"


def test_unknown_fresh_device_id_never_errors(client):
    """
    Hard Rule 3: An unrecognized or brand new device ID must simply start a fresh
    empty dataset, never showing credential/not-found errors.
    """
    fresh_id = str(uuid.uuid4())
    headers = {"X-Device-Id": fresh_id}

    # Query history on a fresh key -> 200 with empty list
    res_hist = client.get("/api/activities", headers=headers)
    assert res_hist.status_code == 200
    assert res_hist.json() == []

    # Query dashboard on a fresh key -> 200 with zero totals
    res_dash = client.get("/api/dashboard", headers=headers)
    assert res_dash.status_code == 200
    data = res_dash.json()
    assert data["device_id"] == fresh_id
    assert data["total_co2_kg"] == 0.0
    assert data["total_activities"] == 0


def test_swagger_and_openapi_docs_accessible(client):
    """
    Pre-submission checklist: Swagger docs (/docs) and openapi schema (/openapi.json)
    must load cleanly to satisfy the standard API declaration requirement.
    """
    res_docs = client.get("/docs")
    assert res_docs.status_code == 200

    res_openapi = client.get("/openapi.json")
    assert res_openapi.status_code == 200
    schema = res_openapi.json()
    assert "paths" in schema
    assert "/api/activities" in schema["paths"]
    assert "/api/dashboard" in schema["paths"]
    assert "/api/target" in schema["paths"]
    assert "/api/device/current" in schema["paths"]
