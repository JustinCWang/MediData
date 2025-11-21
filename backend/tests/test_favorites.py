from http import HTTPStatus
from types import SimpleNamespace

import httpx
import pytest

import app.main as app_main
from tests.utils import InMemoryTable, setup_supabase


def test_add_favorite_affiliated_success(client, set_current_user, patient_user, monkeypatch):
    """A patient can successfully favorite an affiliated provider by UUID and we persist the record."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable()
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.post("/api/favorites/prov-1")

    assert response.status_code == HTTPStatus.OK
    assert favorites_table.rows[0]["provider_id"] == "prov-1"
    assert favorites_table.rows[0]["patient_id"] == patient_user.id


def test_add_favorite_duplicate_returns_409(client, set_current_user, patient_user, monkeypatch):
    """Favoriting the same affiliated provider twice returns HTTP 409 with an 'already in favorites' error."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {
                "favorite_id": "fav-1",
                "patient_id": patient_user.id,
                "provider_id": "prov-1",
            }
        ]
    )
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.post("/api/favorites/prov-1")

    assert response.status_code == HTTPStatus.CONFLICT
    assert "already in favorites" in response.json()["detail"]


def test_add_favorite_npi_success(client, set_current_user, patient_user, monkeypatch):
    """A patient can favorite an external NPI provider; we store provider_npi and associate it with the patient."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable()
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.post("/api/favorites/1234567890")

    assert response.status_code == HTTPStatus.OK
    saved = favorites_table.rows[0]
    assert saved["provider_npi"] == 1234567890
    assert saved["patient_id"] == patient_user.id


def test_add_favorite_forbidden_for_provider(client, set_current_user, provider_user):
    """Non-patient roles (providers) are forbidden from adding favorites and receive HTTP 403."""
    set_current_user(provider_user)

    response = client.post("/api/favorites/prov-1")

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "Only patients can favorite providers" in response.json()["detail"]


def test_add_favorite_duplicate_npi_returns_409(client, set_current_user, patient_user, monkeypatch):
    """Favoriting the same NPI-based provider twice returns HTTP 409 to prevent duplicates."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"patient_id": patient_user.id, "provider_npi": 1234567890},
        ]
    )
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.post("/api/favorites/1234567890")

    assert response.status_code == HTTPStatus.CONFLICT


def test_add_favorite_insert_failure_returns_500(client, set_current_user, patient_user, monkeypatch):
    """If the insert into FavProviders returns no data, we treat it as an internal error (500)."""
    set_current_user(patient_user)

    class InsertFailTable(InMemoryTable):
        def insert(self, _data):
            class Runner:
                def execute(self_inner):
                    return SimpleNamespace(data=[])

            return Runner()

    setup_supabase(monkeypatch, {"FavProviders": InsertFailTable()})

    response = client.post("/api/favorites/prov-1")

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Failed to add favorite" in response.json()["detail"]


def test_get_favorites_patient_returns_ids(client, set_current_user, patient_user, monkeypatch):
    """The /api/favorites endpoint returns both UUID and NPI favorites normalized to string IDs for the patient."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"patient_id": patient_user.id, "provider_id": "prov-1"},
            {"patient_id": patient_user.id, "provider_npi": 1234567890},
        ]
    )
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.get("/api/favorites")

    assert response.status_code == HTTPStatus.OK
    assert set(response.json()["favorites"]) == {"prov-1", "1234567890"}


def test_get_favorites_non_patient_is_empty(client, set_current_user, provider_user):
    """/api/favorites returns an empty list when called by a non-patient (e.g., provider)."""
    set_current_user(provider_user)

    response = client.get("/api/favorites")

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"favorites": []}


def test_remove_favorite_affiliated_success(client, set_current_user, patient_user, monkeypatch):
    """Deleting an affiliated favorite removes only the matching provider_id row for the patient."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"favorite_id": "fav-1", "patient_id": patient_user.id, "provider_id": "prov-1"},
            {"favorite_id": "fav-2", "patient_id": patient_user.id, "provider_id": "prov-2"},
        ]
    )
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.delete("/api/favorites/prov-1")

    assert response.status_code == HTTPStatus.OK
    remaining_ids = {row["provider_id"] for row in favorites_table.rows if row.get("provider_id")}
    assert remaining_ids == {"prov-2"}


def test_remove_favorite_npi_success(client, set_current_user, patient_user, monkeypatch):
    """Deleting a favorite by NPI removes rows keyed on provider_npi and leaves table otherwise empty."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"favorite_id": "fav-1", "patient_id": patient_user.id, "provider_npi": 1234567890},
        ]
    )
    setup_supabase(monkeypatch, {"FavProviders": favorites_table})

    response = client.delete("/api/favorites/1234567890")

    assert response.status_code == HTTPStatus.OK
    assert favorites_table.rows == []


def test_get_favorite_providers_returns_affiliated_details(client, set_current_user, patient_user, monkeypatch):
    """The /api/favorites/providers endpoint returns enriched provider details for affiliated favorites."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"patient_id": patient_user.id, "provider_id": "prov-1"},
        ]
    )
    providers_table = InMemoryTable(
        [
            {
                "provider_id": "prov-1",
                "first_name": "Jordan",
                "last_name": "Lee",
                "taxonomy": "Dermatology",
                "city": "Chicago",
                "state": "IL",
                "email": "jlee@example.com",
            }
        ]
    )
    setup_supabase(
        monkeypatch,
        {
            "FavProviders": favorites_table,
            "Providers": providers_table,
        },
    )

    response = client.get("/api/favorites/providers")

    assert response.status_code == HTTPStatus.OK
    providers = response.json()["providers"]
    assert len(providers) == 1
    provider = providers[0]
    assert provider["name"] == "Jordan Lee"
    assert provider["specialty"] == "Dermatology"
    assert provider["location"] == "Chicago, IL"
    assert provider["is_affiliated"] is True


def test_get_favorite_providers_non_patient_is_empty(client, set_current_user, provider_user):
    """/api/favorites/providers returns an empty providers list when called by non-patients."""
    set_current_user(provider_user)

    response = client.get("/api/favorites/providers")

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"providers": []}


def test_get_favorite_providers_returns_empty_when_no_favorites(
    client, set_current_user, patient_user, monkeypatch
):
    """When a patient has no favorites, /api/favorites/providers responds with an empty providers list."""
    set_current_user(patient_user)
    setup_supabase(monkeypatch, {"FavProviders": InMemoryTable()})

    response = client.get("/api/favorites/providers")

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {"providers": []}


def test_get_favorite_providers_includes_npi_results(
    client, set_current_user, patient_user, monkeypatch
):
    """NPI-based favorites trigger lookups against the NPI API and are merged into the providers list as external."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"patient_id": patient_user.id, "provider_npi": 1234567890},
        ]
    )
    setup_supabase(
        monkeypatch,
        {
            "FavProviders": favorites_table,
            "Providers": InMemoryTable(),
        },
    )

    class DummyResponse:
        def __init__(self, payload):
            self._payload = payload

        def raise_for_status(self):
            return None

        def json(self):
            return self._payload

    class DummyAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            return DummyResponse(
                {
                    "result_count": 1,
                    "results": [
                        {
                            "number": "1234567890",
                            "basic": {
                                "enumeration_type": "NPI-1",
                                "first_name": "Sam",
                                "last_name": "Taylor",
                            },
                            "taxonomies": [{"desc": "Oncology", "primary": True}],
                            "addresses": [
                                {
                                    "address_purpose": "LOCATION",
                                    "city": "Seattle",
                                    "state": "WA",
                                    "postal_code": "98101",
                                    "telephone_number": "5557778888",
                                }
                            ],
                        }
                    ],
                }
            )

    monkeypatch.setattr("app.main.httpx.AsyncClient", DummyAsyncClient)

    response = client.get("/api/favorites/providers")

    assert response.status_code == HTTPStatus.OK
    providers = response.json()["providers"]
    assert len(providers) == 1
    assert providers[0]["name"] == "Sam Taylor"
    assert providers[0]["is_affiliated"] is False


def test_get_favorite_providers_handles_npi_fetch_error(
    client, set_current_user, patient_user, monkeypatch
):
    """If NPI lookups fail, we still return affiliated providers and do not error the whole favorites request."""
    set_current_user(patient_user)
    favorites_table = InMemoryTable(
        [
            {"patient_id": patient_user.id, "provider_id": "prov-1"},
            {"patient_id": patient_user.id, "provider_npi": 1234567890},
        ]
    )
    providers_table = InMemoryTable(
        [
            {
                "provider_id": "prov-1",
                "first_name": "Jordan",
                "last_name": "Lee",
                "city": "Chicago",
                "state": "IL",
                "taxonomy": "Dermatology",
            }
        ]
    )
    setup_supabase(
        monkeypatch,
        {
            "FavProviders": favorites_table,
            "Providers": providers_table,
        },
    )

    class FailingAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            request = httpx.Request("GET", url)
            raise httpx.RequestError("boom", request=request)

    monkeypatch.setattr("app.main.httpx.AsyncClient", FailingAsyncClient)

    response = client.get("/api/favorites/providers")

    assert response.status_code == HTTPStatus.OK
    providers = response.json()["providers"]
    # Should still return affiliated provider despite failure
    assert any(p["is_affiliated"] for p in providers)


