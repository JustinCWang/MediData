from http import HTTPStatus

from tests.utils import InMemoryTable, setup_supabase


def test_get_profile_patient_returns_db_fields(
    client, set_current_user, patient_user, monkeypatch
):
    """A patient calling /api/profile receives profile fields hydrated from the Patients table."""
    patients_table = InMemoryTable(
        [
            {
                "patient_id": patient_user.id,
                "first_name": "Pat",
                "last_name": "Smith",
                "phone_num": "555-1234",
                "gender": "other",
                "state": "IL",
                "city": "Urbana",
                "insurance": "Plan A",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Patients": patients_table})
    set_current_user(patient_user)

    response = client.get("/api/profile")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["role"] == "patient"
    assert data["firstName"] == "Pat"
    assert data["city"] == "Urbana"


def test_get_profile_provider_returns_db_fields(
    client, set_current_user, provider_user, monkeypatch
):
    """A provider calling /api/profile gets provider-specific fields such as location and taxonomy."""
    providers_table = InMemoryTable(
        [
            {
                "provider_id": provider_user.id,
                "first_name": "Alex",
                "last_name": "Jones",
                "phone_num": "555-9999",
                "gender": "female",
                "state": "IL",
                "city": "Chicago",
                "insurance": "Plan B",
                "location": "123 Main",
                "taxonomy": "Dermatology",
                "email": "doc@example.com",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Providers": providers_table})
    set_current_user(provider_user)

    response = client.get("/api/profile")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["role"] == "provider"
    assert data["location"] == "123 Main"
    assert data["taxonomy"] == "Dermatology"


def test_get_profile_fallback_when_not_found(
    client, set_current_user, patient_user, monkeypatch
):
    """If no DB row exists, /api/profile falls back to basic metadata (role and email) for the user."""
    setup_supabase(monkeypatch, {"Patients": InMemoryTable()})
    set_current_user(patient_user)

    response = client.get("/api/profile")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["role"] == "patient"
    assert data["email"] == patient_user.email


def test_update_profile_patient_success(
    client, set_current_user, patient_user, monkeypatch
):
    """Patients can update their own profile fields and receive the updated representation back."""
    patients_table = InMemoryTable(
        [
            {
                "patient_id": patient_user.id,
                "first_name": "Old",
                "last_name": "Name",
                "city": "Old City",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Patients": patients_table})
    set_current_user(patient_user)

    payload = {
        "firstName": "New",
        "city": "Springfield",
        "insurance": "Plan X",
    }

    response = client.put("/api/profile", json=payload)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["firstName"] == "New"
    assert data["city"] == "Springfield"
    assert patients_table.rows[0]["city"] == "Springfield"


def test_update_profile_provider_success(
    client, set_current_user, provider_user, monkeypatch
):
    """Providers can update provider-specific fields (location, taxonomy) via /api/profile."""
    providers_table = InMemoryTable(
        [
            {
                "provider_id": provider_user.id,
                "first_name": "Alex",
                "location": "Old Location",
            }
        ]
    )
    setup_supabase(monkeypatch, {"Providers": providers_table})
    set_current_user(provider_user)

    payload = {
        "location": "New Clinic",
        "taxonomy": "Cardiology",
    }

    response = client.put("/api/profile", json=payload)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["location"] == "New Clinic"
    assert data["taxonomy"] == "Cardiology"


def test_update_profile_not_found_returns_404(
    client, set_current_user, patient_user, monkeypatch
):
    """Attempting to update a profile when no DB row exists results in a 404 'Profile not found' error."""
    setup_supabase(monkeypatch, {"Patients": InMemoryTable()})
    set_current_user(patient_user)

    response = client.put("/api/profile", json={"firstName": "Nobody"})

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert "Profile not found" in response.json()["detail"]

