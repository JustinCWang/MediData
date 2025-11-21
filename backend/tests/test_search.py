from http import HTTPStatus

import pytest


def test_search_providers_without_params_returns_empty_list(client):
    """
    When no query parameters are provided, the endpoint should
    short‑circuit and return an empty result set without calling external APIs.
    """
    response = client.get("/api/providers/search")

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["result_count"] == 0
    assert data["results"] == []


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_with_first_name_uses_limit_and_returns_structure(client, monkeypatch):
    """
    Basic structural test with a search parameter.
    We stub out the NPI API call and affiliated provider search so the
    endpoint logic can be exercised without real network/database access.
    """
    import app.main as app_main
    from types import SimpleNamespace

    # Stub affiliated provider search to return one provider
    def fake_search_affiliated_providers(**kwargs):
        return [
            {
                "id": "provider-1",
                "name": "Test Provider",
                "specialty": "Family Medicine",
                "location": "Champaign, IL",
                "rating": 0,
                "insurance": [],
                "npi_number": "",
                "enumeration_type": "",
                "is_affiliated": True,
                "email": "provider@example.com",
            }
        ]

    monkeypatch.setattr(
        app_main, "search_affiliated_providers", fake_search_affiliated_providers
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
            # Return one NPI result with minimal fields
            return DummyResponse(
                {
                    "result_count": 1,
                    "results": [
                        {
                            "number": "1234567890",
                            "basic": {
                                "enumeration_type": "NPI-1",
                                "first_name": "Alex",
                                "last_name": "Johnson",
                            },
                            "taxonomies": [
                                {"desc": "Internal Medicine", "primary": True}
                            ],
                            "addresses": [
                                {
                                    "address_purpose": "LOCATION",
                                    "city": "Champaign",
                                    "state": "IL",
                                    "postal_code": "61820",
                                    "telephone_number": "5551234567",
                                }
                            ],
                        }
                    ],
                }
            )

    monkeypatch.setattr("app.main.httpx.AsyncClient", DummyAsyncClient)

    response = client.get("/api/providers/search", params={"first_name": "Alex", "limit": 5})

    assert response.status_code == HTTPStatus.OK
    data = response.json()

    # We expect both affiliated and NPI results, but limited to 5
    assert data["result_count"] <= 5
    assert "affiliated_count" in data
    assert "npi_count" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) == data["result_count"]


