from http import HTTPStatus
from types import SimpleNamespace

import httpx
import pytest
from fastapi import HTTPException

import app.main as app_main
from tests.utils import InMemoryTable, setup_supabase


def test_health_endpoint_returns_ok(client):
    """The /api/health endpoint responds with a simple JSON payload confirming the API is alive."""
    response = client.get("/api/health")
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"status": "ok"}


def test_get_current_user_missing_header_raises():
    """Calling get_current_user with no Authorization header raises a 401 with an explanatory message."""
    with pytest.raises(HTTPException) as excinfo:
        app_main.get_current_user(None)
    assert excinfo.value.status_code == HTTPStatus.UNAUTHORIZED
    assert "authorization" in excinfo.value.detail.lower()


def test_get_current_user_invalid_token(monkeypatch):
    """If Supabase cannot resolve a user from the token, get_current_user raises 401 'Invalid token'."""
    def fake_get_user(_token):
        return SimpleNamespace(user=None)

    monkeypatch.setattr(app_main.supabase_auth.auth, "get_user", fake_get_user)

    with pytest.raises(HTTPException) as excinfo:
        app_main.get_current_user("Bearer invalid")

    assert excinfo.value.status_code == HTTPStatus.UNAUTHORIZED
    assert "invalid token" in excinfo.value.detail.lower()


def test_search_affiliated_providers_filters_by_name_and_location(monkeypatch):
    """search_affiliated_providers applies first-name and location filters and shapes results into our Provider schema."""
    providers_table = InMemoryTable(
        [
            {
                "provider_id": "p1",
                "first_name": "Ann",
                "last_name": "Smith",
                "taxonomy": "Dermatology",
                "city": "Springfield",
                "state": "IL",
                "insurance": "Plan A",
                "email": "ann@example.com",
            },
            {
                "provider_id": "p2",
                "first_name": "Bob",
                "last_name": "Jones",
                "taxonomy": "Cardiology",
                "city": "Chicago",
                "state": "IL",
            },
        ]
    )
    setup_supabase(monkeypatch, {"Providers": providers_table})

    results = app_main.search_affiliated_providers(
        first_name="Ann",
        city="Springfield",
        state="IL",
    )

    assert len(results) == 1
    assert results[0]["id"] == "p1"
    assert results[0]["specialty"] == "Dermatology"
    assert results[0]["location"] == "Springfield, IL"


def test_transform_npi_result_individual():
    """transform_npi_result converts a full NPI individual payload into our normalized Provider structure."""
    payload = {
        "number": 1234567890,
        "basic": {
            "enumeration_type": "NPI-1",
            "first_name": "Alex",
            "last_name": "Johnson",
            "credential": "MD",
        },
        "taxonomies": [
            {"desc": "Internal Medicine", "primary": True},
        ],
        "addresses": [
            {
                "address_purpose": "LOCATION",
                "city": "Chicago",
                "state": "IL",
                "postal_code": "60601",
                "telephone_number": "5551234567",
            }
        ],
    }

    result = app_main.transform_npi_result(payload)

    assert result["name"] == "Alex Johnson, MD"
    assert result["specialty"] == "Internal Medicine"
    assert result["location"].startswith("Chicago")
    assert result["npi_number"] == "1234567890"


def test_transform_npi_result_missing_basic_returns_none():
    """When NPI basic info is missing, transform_npi_result treats the input as unusable and returns None."""
    payload = {"number": 1234, "taxonomies": [], "addresses": []}

    assert app_main.transform_npi_result(payload) is None


def test_transform_npi_result_missing_npi_returns_none():
    """If the NPI number field is missing or empty, transform_npi_result returns None to skip that record."""
    payload = {"basic": {"first_name": "Test"}, "taxonomies": [], "addresses": []}

    assert app_main.transform_npi_result(payload) is None

