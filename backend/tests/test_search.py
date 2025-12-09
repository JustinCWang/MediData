from http import HTTPStatus

import pytest
import httpx


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
    import app.Controllers.QueryController as query_controller

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
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
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

    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", DummyAsyncClient)

    response = client.get("/api/providers/search", params={"first_name": "Alex", "limit": 5})

    assert response.status_code == HTTPStatus.OK
    data = response.json()

    # We expect both affiliated and NPI results, but limited to 5
    assert data["result_count"] <= 5
    assert "affiliated_count" in data
    assert "npi_count" in data
    assert isinstance(data["results"], list)
    assert len(data["results"]) == data["result_count"]


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_with_filters_but_no_results_returns_empty(client, monkeypatch):
    """
    When filters are provided but both NPI and affiliated sources return no
    matches, we should still get an empty result set.
    """
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return []

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
            # Simulate NPI returning no matches
            return DummyResponse({"result_count": 0, "results": []})

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", DummyAsyncClient)

    response = client.get(
        "/api/providers/search",
        params={"first_name": "Nonexistent", "city": "Nowhere", "limit": 10},
    )

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["result_count"] == 0
    assert data["results"] == []


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_network_error_falls_back_to_affiliated_only(client, monkeypatch):
    """
    If the NPI API call fails with a network error, but we have affiliated
    providers, the endpoint should still return the affiliated results and
    include an error message.
    """
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return [
            {
                "id": "provider-1",
                "name": "Affiliated Provider",
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

    class FailingAsyncClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            request = httpx.Request("GET", url)
            raise httpx.RequestError("Network error", request=request)

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", FailingAsyncClient)

    response = client.get(
        "/api/providers/search",
        params={"first_name": "Alex", "limit": 10},
    )

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    # We should still see the affiliated result
    assert data["result_count"] == 1
    assert data["affiliated_count"] == 1
    assert data["npi_count"] == 0
    assert len(data["results"]) == 1
    assert data["results"][0]["is_affiliated"] is True
    assert "error" in data
    assert "Failed to connect to NPI Registry API" in data["error"]


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_large_result_set_respects_limit(client, monkeypatch):
    """
    When the combined NPI + affiliated results exceed the requested limit,
    the endpoint should truncate the list to the limit value.
    """
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        # 3 affiliated providers
        return [
            {
                "id": f"provider-{i}",
                "name": f"Affiliated {i}",
                "specialty": "Family Medicine",
                "location": "Champaign, IL",
                "rating": 0,
                "insurance": [],
                "npi_number": "",
                "enumeration_type": "",
                "is_affiliated": True,
                "email": f"provider{i}@example.com",
            }
            for i in range(3)
        ]

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
            # 5 external providers from NPI
            results = []
            for i in range(5):
                results.append(
                    {
                        "number": f"12345678{i:02d}",
                        "basic": {
                            "enumeration_type": "NPI-1",
                            "first_name": f"Alex{i}",
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
                )

            return DummyResponse(
                {
                    "result_count": len(results),
                    "results": results,
                }
            )

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", DummyAsyncClient)

    # Combined results would be 8, but limit them to 3
    response = client.get(
        "/api/providers/search",
        params={"first_name": "Alex", "limit": 3},
    )

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["result_count"] == 3
    assert len(data["results"]) == 3


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_http_status_error_returns_affiliated_results(client, monkeypatch):
    """HTTPStatusError from NPI API still returns affiliated results plus an error message when available."""
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return [{"id": "prov-1", "is_affiliated": True}]

    class StatusErrorClient:
        def __init__(self, *args, **kwargs):
            request = httpx.Request("GET", "https://npiregistry.cms.hhs.gov/api/")
            self.response = httpx.Response(status_code=500, request=request)

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            request = httpx.Request("GET", url)
            response = httpx.Response(status_code=502, request=request)
            raise httpx.HTTPStatusError("bad", request=request, response=response)

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", StatusErrorClient)

    response = client.get("/api/providers/search", params={"first_name": "Test"})

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["result_count"] == 1
    assert data["npi_count"] == 0
    assert "error" in data


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_http_status_error_without_affiliated_returns_502(client, monkeypatch):
    """If NPI API fails and there are no affiliated providers, we propagate a 502 Bad Gateway error."""
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return []

    class StatusErrorClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            request = httpx.Request("GET", url)
            response = httpx.Response(status_code=500, request=request)
            raise httpx.HTTPStatusError("bad", request=request, response=response)

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", StatusErrorClient)

    response = client.get("/api/providers/search", params={"first_name": "Test"})

    assert response.status_code == HTTPStatus.BAD_GATEWAY


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_request_error_without_affiliated_returns_503(client, monkeypatch):
    """Network-level RequestError with no affiliated providers yields a 503 Service Unavailable."""
    import app.main as app_main

    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return []

    class FailingClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def get(self, url, params=None):
            request = httpx.Request("GET", url)
            raise httpx.RequestError("boom", request=request)

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", FailingClient)

    response = client.get("/api/providers/search", params={"first_name": "Test"})

    assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE


@pytest.mark.usefixtures("mock_supabase")
def test_search_providers_accepts_all_filters(client, monkeypatch):
    """Smoke test that all documented query parameters are accepted and forwarded without raising errors."""
    import app.Controllers.QueryController as query_controller

    def fake_search_affiliated_providers(**kwargs):
        return []

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
            return DummyResponse({"result_count": 0, "results": []})

    monkeypatch.setattr(
        query_controller, "search_affiliated_providers", fake_search_affiliated_providers
    )
    monkeypatch.setattr("app.Controllers.QueryController.httpx.AsyncClient", DummyAsyncClient)

    query = {
        "number": "1234567890",
        "enumeration_type": "NPI-1",
        "taxonomy_description": "Cardiology",
        "first_name": "Alex",
        "last_name": "Smith",
        "organization_name": "Clinic",
        "city": "Chicago",
        "state": "IL",
        "postal_code": "60601",
        "country_code": "US",
        "limit": 5,
    }

    response = client.get("/api/providers/search", params=query)

    assert response.status_code == HTTPStatus.OK
    assert response.json()["result_count"] == 0


