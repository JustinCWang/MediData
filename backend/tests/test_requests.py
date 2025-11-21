from http import HTTPStatus

import pytest

import app.main as app_main
from tests.utils import InMemoryTable, setup_supabase


def test_create_request_patient_success(client, set_current_user, patient_user, monkeypatch):
    """A patient can create an appointment request when the provider exists; we persist all core fields."""
    set_current_user(patient_user)
    providers_table = InMemoryTable([{"provider_id": "prov-1"}])
    requests_table = InMemoryTable()
    setup_supabase(
        monkeypatch,
        {
            "Providers": providers_table,
            "Requests": requests_table,
        },
    )

    payload = {
        "provider_id": "prov-1",
        "message": "Need a consultation",
        "date": "2025-01-10",
        "time": "09:00:00",
    }

    response = client.post("/api/requests", json=payload)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["message"] == "Request created successfully"
    saved_request = requests_table.rows[0]
    assert saved_request["patient_id"] == patient_user.id
    assert saved_request["provider_id"] == payload["provider_id"]
    assert saved_request["status"] == "pending"
    assert saved_request["message"] == payload["message"]


def test_create_request_forbidden_for_provider_role(client, set_current_user, provider_user, monkeypatch):
    """Providers are not allowed to create requests; the endpoint returns HTTP 403 for provider role."""
    set_current_user(provider_user)
    setup_supabase(monkeypatch, {"Providers": InMemoryTable(), "Requests": InMemoryTable()})

    response = client.post(
        "/api/requests",
        json={"provider_id": "prov-1", "message": "Help"},
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert response.json()["detail"] == "Only patients can create requests"


def test_create_request_missing_provider_returns_404(client, set_current_user, patient_user, monkeypatch):
    """If the provider_id does not exist, create_request returns HTTP 404 'Provider not found'."""
    set_current_user(patient_user)
    setup_supabase(monkeypatch, {"Providers": InMemoryTable(), "Requests": InMemoryTable()})

    response = client.post(
        "/api/requests",
        json={"provider_id": "prov-unknown", "message": "Help"},
    )

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert response.json()["detail"] == "Provider not found"


def test_get_requests_returns_transformed_patient_view(client, set_current_user, patient_user, monkeypatch):
    """For patients, /api/requests returns their own requests with provider details mapped into display fields."""
    set_current_user(patient_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": patient_user.id,
                "provider_id": "prov-1",
                "status": "pending",
                "message": "Need help",
                "date": "2025-01-10",
                "time": "09:00:00",
                "created_at": "2025-01-01T12:00:00Z",
            }
        ]
    )
    providers_table = InMemoryTable(
        [
            {
                "provider_id": "prov-1",
                "first_name": "Kelly",
                "last_name": "Doe",
                "taxonomy": "Cardiology",
            }
        ]
    )
    setup_supabase(
        monkeypatch,
        {
            "Requests": requests_table,
            "Providers": providers_table,
        },
    )

    response = client.get("/api/requests")

    assert response.status_code == HTTPStatus.OK
    data = response.json()["requests"]
    assert len(data) == 1
    request = data[0]
    assert request["providerName"] == "Kelly Doe"
    assert request["specialty"] == "Cardiology"
    assert request["status"] == "pending"
    assert request["message"] == "Need help"


def test_update_request_patient_reopens_request(client, set_current_user, patient_user, monkeypatch):
    """When a patient edits details, the request is reset to pending and any provider response is cleared."""
    set_current_user(patient_user)
    existing_request = {
        "appointment_id": "appt-1",
        "patient_id": patient_user.id,
        "provider_id": "prov-1",
        "status": "approved",
        "message": "Old message",
        "response": "See you soon",
    }
    requests_table = InMemoryTable([existing_request])
    setup_supabase(monkeypatch, {"Requests": requests_table})

    payload = {
        "message": "Updated message",
        "date": "2025-02-01",
        "time": "10:30",
    }

    response = client.put("/api/requests/appt-1", json=payload)

    assert response.status_code == HTTPStatus.OK
    updated_row = requests_table.rows[0]
    assert updated_row["message"] == "Updated message"
    assert updated_row["date"] == "2025-02-01"
    assert updated_row["time"] == "10:30:00"
    assert updated_row["status"] == "pending"  # auto-reset
    assert updated_row["response"] is None


def test_update_request_provider_sets_status(client, set_current_user, provider_user, monkeypatch):
    """Providers can update request status and response text for requests that target them."""
    set_current_user(provider_user)
    existing_request = {
        "appointment_id": "appt-1",
        "patient_id": "patient-999",
        "provider_id": provider_user.id,
        "status": "pending",
    }
    requests_table = InMemoryTable([existing_request])
    setup_supabase(monkeypatch, {"Requests": requests_table})

    response = client.put(
        "/api/requests/appt-1",
        json={"status": "approved", "response": "See you Tuesday"},
    )

    assert response.status_code == HTTPStatus.OK
    updated_row = requests_table.rows[0]
    assert updated_row["status"] == "approved"
    assert updated_row["response"] == "See you Tuesday"


def test_update_request_provider_invalid_status(client, set_current_user, provider_user, monkeypatch):
    """An invalid status value for providers (not pending/approved/rejected) returns HTTP 400."""
    set_current_user(provider_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": "patient-1",
                "provider_id": provider_user.id,
                "status": "pending",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Requests": requests_table})

    response = client.put("/api/requests/appt-1", json={"status": "maybe"})

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "Invalid status" in response.json()["detail"]


def test_cancel_request_patient_success(client, set_current_user, patient_user, monkeypatch):
    """Patients can cancel (delete) their own requests; the row is removed and we return a success message."""
    set_current_user(patient_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": patient_user.id,
                "provider_id": "prov-1",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Requests": requests_table})

    response = client.delete("/api/requests/appt-1")

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == "Request cancelled successfully"
    assert requests_table.rows == []


def test_create_request_includes_npi_num(client, set_current_user, patient_user, monkeypatch):
    """Optional npi_num from the payload is stored alongside the request when provided."""
    set_current_user(patient_user)
    providers_table = InMemoryTable([{"provider_id": "prov-1"}])
    requests_table = InMemoryTable()
    setup_supabase(
        monkeypatch,
        {
            "Providers": providers_table,
            "Requests": requests_table,
        },
    )

    payload = {
        "provider_id": "prov-1",
        "message": "Need help",
        "npi_num": 9876543210,
    }

    response = client.post("/api/requests", json=payload)

    assert response.status_code == HTTPStatus.OK
    assert requests_table.rows[0]["npi_num"] == 9876543210


def test_get_requests_provider_view_shows_patient_name(
    client, set_current_user, provider_user, monkeypatch
):
    """For providers, /api/requests displays the patient name instead of provider name in providerName field."""
    set_current_user(provider_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": "patient-1",
                "provider_id": provider_user.id,
                "status": "pending",
                "message": "Please help",
            }
        ]
    )
    patients_table = InMemoryTable(
        [
            {"patient_id": "patient-1", "first_name": "Jamie", "last_name": "Doe"},
        ]
    )
    setup_supabase(
        monkeypatch,
        {
            "Requests": requests_table,
            "Patients": patients_table,
        },
    )

    response = client.get("/api/requests")

    assert response.status_code == HTTPStatus.OK
    data = response.json()["requests"][0]
    assert data["providerName"] == "Jamie Doe"


def test_update_request_patient_cannot_change_status(
    client, set_current_user, patient_user, monkeypatch
):
    """Patients attempting to change status directly are forbidden and receive HTTP 403."""
    set_current_user(patient_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": patient_user.id,
                "provider_id": "prov-1",
                "status": "pending",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Requests": requests_table})

    response = client.put("/api/requests/appt-1", json={"status": "approved"})

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "Only providers can update request status" in response.json()["detail"]


def test_update_request_no_valid_fields_returns_400(
    client, set_current_user, provider_user, monkeypatch
):
    """Sending an empty update payload results in HTTP 400 'No valid fields to update'."""
    set_current_user(provider_user)
    requests_table = InMemoryTable(
        [
            {
                "appointment_id": "appt-1",
                "patient_id": "patient-1",
                "provider_id": provider_user.id,
                "status": "pending",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Requests": requests_table})

    response = client.put("/api/requests/appt-1", json={})

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "No valid fields to update" in response.json()["detail"]


def test_cancel_request_forbidden_for_provider(
    client, set_current_user, provider_user, monkeypatch
):
    """Providers cannot cancel requests; attempting to do so returns HTTP 403."""
    set_current_user(provider_user)
    setup_supabase(monkeypatch, {"Requests": InMemoryTable()})

    response = client.delete("/api/requests/appt-1")

    assert response.status_code == HTTPStatus.FORBIDDEN


def test_cancel_request_not_found_returns_404(
    client, set_current_user, patient_user, monkeypatch
):
    """Trying to cancel a non-existent or unauthorized request returns HTTP 404."""
    set_current_user(patient_user)
    setup_supabase(monkeypatch, {"Requests": InMemoryTable()})

    response = client.delete("/api/requests/appt-missing")

    assert response.status_code == HTTPStatus.NOT_FOUND


