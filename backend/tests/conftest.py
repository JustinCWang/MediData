import os
import sys
from pathlib import Path
from types import SimpleNamespace
from typing import Generator

import pytest
from fastapi.testclient import TestClient

# Make sure the backend root (which contains the `app` package) is on sys.path
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

# Ensure required environment variables exist before importing the app
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "service-role-key")
os.environ.setdefault("SUPABASE_ANON_KEY", "anon-key")

import app.main as app_main  # noqa: E402


@pytest.fixture(scope="session")
def app() -> "app_main.FastAPI":
    """
    FastAPI application instance for tests.
    """
    return app_main.app


@pytest.fixture()
def client(app) -> Generator[TestClient, None, None]:
    """
    Synchronous test client for calling API routes.
    """
    with TestClient(app) as c:
        yield c


@pytest.fixture()
def mock_supabase(monkeypatch):
    """
    Replace Supabase clients with lightweight fakes for unit tests.
    """
    class DummyAuthResponse:
        def __init__(self, email: str = "test@example.com", role: str = "patient"):
            self.user = SimpleNamespace(
                id="user-123",
                email=email,
                user_metadata={
                    "first_name": "Test",
                    "last_name": "User",
                    "role": role,
                },
            )
            self.session = SimpleNamespace(access_token="access-token-123")


    class DummyAuth:
        def __init__(self, role: str = "patient"):
            self._role = role

        def sign_up(self, data):
            user_email = data.get("email", "test@example.com")
            user_role = data.get("options", {}).get("data", {}).get("role", "patient")
            return DummyAuthResponse(email=user_email, role=user_role)

        def sign_in_with_password(self, data):
            # Always succeed for happy-path tests, echoing back the requested email
            user_email = data.get("email", "test@example.com")
            return DummyAuthResponse(email=user_email)

        def get_user(self, token):
            # Minimal object with .user for dependencies that might call this
            return SimpleNamespace(user=DummyAuthResponse().user)


    class DummyTable:
        def __init__(self, name: str):
            self.name = name
            self._data = []

        def insert(self, data):
            # Simulate a successful insert by returning itself with data
            self._data = [data]
            return self

        # The backend code sometimes chains .select(), .eq(), .execute(), etc.
        # These methods just return self so the chain doesn't fail.
        def select(self, *args, **kwargs):
            return self

        def eq(self, *args, **kwargs):
            return self

        def in_(self, *args, **kwargs):
            return self

        def ilike(self, *args, **kwargs):
            return self

        def delete(self, *args, **kwargs):
            return self

        def update(self, *args, **kwargs):
            return self

        def execute(self):
            return SimpleNamespace(data=self._data or [{}])


    class DummySupabase:
        def __init__(self, role: str = "patient"):
            self.auth = DummyAuth(role=role)

        def table(self, name: str):
            return DummyTable(name)


    dummy_supabase = DummySupabase()

    monkeypatch.setattr(app_main, "supabase", dummy_supabase)
    monkeypatch.setattr(app_main, "supabase_auth", dummy_supabase)

    return dummy_supabase


def _build_user(*, user_id: str, email: str, role: str, first_name: str = "Test", last_name: str = "User"):
    return SimpleNamespace(
        id=user_id,
        email=email,
        user_metadata={
            "role": role,
            "first_name": first_name,
            "last_name": last_name,
        },
    )


@pytest.fixture()
def patient_user():
    return _build_user(
        user_id="patient-123",
        email="patient@example.com",
        role="patient",
        first_name="Pat",
        last_name="Smith",
    )


@pytest.fixture()
def provider_user():
    return _build_user(
        user_id="provider-456",
        email="provider@example.com",
        role="provider",
        first_name="Dr.",
        last_name="Jones",
    )


@pytest.fixture()
def set_current_user(app):
    """
    Helper for overriding get_current_user dependency inside tests.
    """

    def _set(user):
        def _dependency():
            return user

        app.dependency_overrides[app_main.get_current_user] = _dependency

    yield _set
    app.dependency_overrides.pop(app_main.get_current_user, None)


