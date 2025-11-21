from http import HTTPStatus

import pytest


@pytest.mark.usefixtures("mock_supabase")
def test_register_patient_success(client):
    """Happy-path patient registration returns 201, echoes email, and includes an access token."""
    payload = {
        "email": "patient@example.com",
        "password": "StrongPassword123!",
        "firstName": "Pat",
        "lastName": "Smith",
        "role": "patient",
        "phoneNum": "555-1234",
        "gender": "other",
        "state": "IL",
        "city": "Champaign",
        "insurance": "Test Insurance",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    data = response.json()
    assert data["user"]["email"] == payload["email"]
    assert data["message"] == "Account created successfully"
    assert "access_token" in data


def test_register_invalid_role_returns_400(client):
    """Registering with an unsupported role value is rejected by our own validation with 400."""
    payload = {
        "email": "user@example.com",
        "password": "Password123!",
        "firstName": "Jane",
        "lastName": "Doe",
        "role": "admin",  # invalid
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "Role must be either 'patient' or 'provider'" in response.json()["detail"]


@pytest.mark.usefixtures("mock_supabase")
def test_login_success(client):
    """Happy-path login returns 200, the correct user email, and an access token."""
    payload = {
        "email": "patient@example.com",
        "password": "StrongPassword123!",
    }

    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == HTTPStatus.OK
    data = response.json()
    assert data["user"]["email"] == payload["email"]
    assert data["message"] == "Login successful"
    assert "access_token" in data


def test_register_email_already_exists_returns_409(client, monkeypatch, mock_supabase):
    """Supabase 'user already registered' error is translated into HTTP 409 with a clear message."""
    import app.main as app_main

    def fake_sign_up(_data):
        raise Exception("User already registered with this email")

    monkeypatch.setattr(app_main.supabase_auth.auth, "sign_up", fake_sign_up)

    payload = {
        "email": "existing@example.com",
        "password": "Password123!",
        "firstName": "Existing",
        "lastName": "User",
        "role": "patient",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.CONFLICT
    assert (
        response.json()["detail"]
        == "An account with this email already exists. Please log in instead."
    )


def test_register_weak_password_returns_400(client, monkeypatch, mock_supabase):
    """Supabase weak-password errors are converted into HTTP 400 with guidance to use a stronger password."""
    import app.main as app_main

    def fake_sign_up(_data):
        raise Exception("Password is too weak")

    monkeypatch.setattr(app_main.supabase_auth.auth, "sign_up", fake_sign_up)

    payload = {
        "email": "weakpass@example.com",
        "password": "123",
        "firstName": "Weak",
        "lastName": "Password",
        "role": "patient",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert (
        response.json()["detail"]
        == "Password does not meet requirements. Please use a stronger password."
    )


def test_login_invalid_credentials_returns_401(client, monkeypatch, mock_supabase):
    """Supabase invalid-credentials errors become HTTP 401 with a generic login error message."""
    import app.main as app_main

    def fake_sign_in_with_password(_data):
        raise Exception("Invalid login credentials")

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "sign_in_with_password", fake_sign_in_with_password
    )

    payload = {
        "email": "wrong@example.com",
        "password": "wrong-password",
    }

    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert (
        response.json()["detail"]
        == "Invalid email or password. Please check your credentials and try again."
    )


def test_login_user_not_found_returns_404(client, monkeypatch, mock_supabase):
    """Supabase 'no user found' errors are mapped to HTTP 404 with a 'register first' hint."""
    import app.main as app_main

    def fake_sign_in_with_password(_data):
        raise Exception("No user found with this email")

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "sign_in_with_password", fake_sign_in_with_password
    )

    payload = {
        "email": "missing@example.com",
        "password": "Password123!",
    }

    response = client.post("/api/auth/login", json=payload)

    assert response.status_code == HTTPStatus.NOT_FOUND
    assert (
        response.json()["detail"]
        == "No account found with this email. Please register first."
    )


@pytest.mark.usefixtures("mock_supabase")
def test_register_provider_success(client):
    """Happy-path provider registration (role='provider') returns 201 with the correct email."""
    payload = {
        "email": "provider@example.com",
        "password": "StrongPassword123!",
        "firstName": "Doc",
        "lastName": "Jones",
        "role": "provider",
        "taxonomy": "Dermatology",
        "location": "123 Clinic",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.CREATED
    assert response.json()["user"]["email"] == payload["email"]


def test_register_missing_user_returns_400(client, monkeypatch, mock_supabase):
    """If Supabase sign_up returns no user object, we treat it as a generic 400 registration failure."""
    import app.main as app_main

    class Response:
        def __init__(self):
            self.user = None
            self.session = None

    monkeypatch.setattr(app_main.supabase_auth.auth, "sign_up", lambda *_: Response())

    payload = {
        "email": "bad@example.com",
        "password": "Password123!",
        "firstName": "Bad",
        "lastName": "User",
        "role": "patient",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "Registration failed" in response.json()["detail"]


def test_register_unexpected_error_returns_500(client, monkeypatch, mock_supabase):
    """Unexpected errors from Supabase sign_up are surfaced as HTTP 500 with a 'Registration failed' message."""
    import app.main as app_main

    def fake_sign_up(_data):
        raise Exception("Something went terribly wrong")

    monkeypatch.setattr(app_main.supabase_auth.auth, "sign_up", fake_sign_up)

    payload = {
        "email": "boom@example.com",
        "password": "Password123!",
        "firstName": "Boom",
        "lastName": "User",
        "role": "patient",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Registration failed" in response.json()["detail"]


def test_login_missing_session_returns_401(client, monkeypatch, mock_supabase):
    """If Supabase returns a user but no session, we still treat it as invalid credentials (401)."""
    import app.main as app_main

    class Response:
        def __init__(self):
            from types import SimpleNamespace

            self.user = SimpleNamespace(
                id="user-1", email="test@example.com", user_metadata={}
            )
            self.session = None

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "sign_in_with_password", lambda *_: Response()
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password123!"},
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "Invalid email or password" in response.json()["detail"]


def test_login_unexpected_error_returns_500(client, monkeypatch, mock_supabase):
    """Unexpected errors during Supabase sign_in are mapped to HTTP 500 with a 'Login failed' message."""
    import app.main as app_main

    def fake_sign_in_with_password(_data):
        raise Exception("Service unavailable")

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "sign_in_with_password", fake_sign_in_with_password
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password123!"},
    )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Login failed" in response.json()["detail"]


def test_login_unverified_email_returns_403(client, monkeypatch, mock_supabase):
    """If Supabase indicates the email is not confirmed, we return 403 with a verification prompt."""
    import app.main as app_main

    def fake_sign_in_with_password(_data):
        raise Exception("Email not confirmed")

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "sign_in_with_password", fake_sign_in_with_password
    )

    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Password123!"},
    )

    assert response.status_code == HTTPStatus.FORBIDDEN
    assert "Email not verified" in response.json()["detail"]


def test_resend_verification_success(client, monkeypatch, mock_supabase):
    """Resend verification endpoint returns a generic success message even when the underlying SDK is mocked."""
    import app.main as app_main

    called = {}

    def fake_resend(payload):
        called["email"] = payload["email"]

    monkeypatch.setattr(app_main.supabase_auth.auth, "resend", fake_resend, raising=False)

    response = client.post(
        "/api/auth/resend-verification",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.OK
    assert "verification email has been sent" in response.json()["message"]
    assert called["email"] == "user@example.com"


def test_resend_verification_handles_sdk_missing_method(client, monkeypatch, mock_supabase):
    """If supabase_auth.auth.resend is missing, the endpoint still returns success without crashing."""
    import app.main as app_main

    # Ensure there's no resend attribute; raising=False so it quietly does nothing
    monkeypatch.delattr(app_main.supabase_auth.auth, "resend", raising=False)

    response = client.post(
        "/api/auth/resend-verification",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.OK


def test_resend_verification_unexpected_error_returns_500(client, monkeypatch, mock_supabase):
    """Unexpected exceptions in resend_verification are converted to HTTP 500."""
    import app.main as app_main

    def fake_resend(_payload):
        raise Exception("SMTP failure")

    monkeypatch.setattr(app_main.supabase_auth.auth, "resend", fake_resend, raising=False)

    response = client.post(
        "/api/auth/resend-verification",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Failed to resend verification email" in response.json()["detail"]


def test_forgot_password_success(client, monkeypatch, mock_supabase):
    """Forgot-password endpoint calls Supabase password reset helper if available and returns 200."""
    import app.main as app_main

    called = {}

    def fake_reset(email, options=None):
        called["email"] = email
        called["options"] = options or {}

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "reset_password_for_email", fake_reset, raising=False
    )

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.OK
    assert "password reset email has been sent" in response.json()["message"]
    assert called["email"] == "user@example.com"
    # Ensure we passed a redirect_to URL so reset links land on /reset-password
    assert "redirect_to" in called["options"]


def test_forgot_password_handles_missing_methods(client, monkeypatch, mock_supabase):
    """If no suitable reset password helper exists, the endpoint still returns a generic success message."""
    import app.main as app_main

    monkeypatch.delattr(
        app_main.supabase_auth.auth, "reset_password_for_email", raising=False
    )
    monkeypatch.delattr(
        app_main.supabase_auth.auth, "reset_password_email", raising=False
    )

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.OK


def test_forgot_password_unexpected_error_returns_500(client, monkeypatch, mock_supabase):
    """Unexpected exceptions from Supabase during password reset are surfaced as HTTP 500."""
    import app.main as app_main

    def fake_reset(_email):
        raise Exception("Mail service down")

    monkeypatch.setattr(
        app_main.supabase_auth.auth, "reset_password_for_email", fake_reset, raising=False
    )

    response = client.post(
        "/api/auth/forgot-password",
        json={"email": "user@example.com"},
    )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Failed to initiate password reset" in response.json()["detail"]


def test_reset_password_success(client, monkeypatch, mock_supabase):
    """reset-password endpoint calls Supabase auth REST API and returns a success message on 200."""
    import app.main as app_main
    import httpx

    captured = {}

    class DummyResponse:
        def __init__(self, status_code: int, payload=None, text: str = ""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def put(self, url, headers=None, json=None):
            captured["url"] = url
            captured["headers"] = headers
            captured["json"] = json
            return DummyResponse(200, {"id": "user-id"})

    monkeypatch.setattr(app_main, "httpx", httpx)
    monkeypatch.setattr("app.main.httpx.AsyncClient", DummyClient)

    response = client.post(
        "/api/auth/reset-password",
        json={"access_token": "test-token", "new_password": "NewStrongPass123!"},
    )

    assert response.status_code == HTTPStatus.OK
    body = response.json()
    assert "Password updated successfully" in body["message"]
    assert captured["headers"]["Authorization"] == "Bearer test-token"
    assert captured["json"]["password"] == "NewStrongPass123!"


def test_reset_password_expired_token_returns_400(client, monkeypatch, mock_supabase):
    """If Supabase reports an expired/invalid token (400/401), we return HTTP 400 with a helpful message."""
    import app.main as app_main

    class DummyResponse:
        def __init__(self, status_code: int, payload=None, text: str = ""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text

        def json(self):
            return self._payload

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def put(self, url, headers=None, json=None):
            return DummyResponse(400, {"msg": "Token has expired"})

    monkeypatch.setattr("app.main.httpx.AsyncClient", DummyClient)

    response = client.post(
        "/api/auth/reset-password",
        json={"access_token": "expired-token", "new_password": "NewStrongPass123!"},
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert "invalid or has expired" in response.json()["detail"]


def test_reset_password_unexpected_error_returns_500(client, monkeypatch, mock_supabase):
    """Unexpected non-400/401 responses from Supabase are mapped to HTTP 500."""

    class DummyResponse:
        def __init__(self, status_code: int, payload=None, text: str = ""):
            self.status_code = status_code
            self._payload = payload or {}
            self.text = text or "Database unavailable"

        def json(self):
            return self._payload

    class DummyClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc, tb):
            return False

        async def put(self, url, headers=None, json=None):
            return DummyResponse(500, {"msg": "Database unavailable"})

    monkeypatch.setattr("app.main.httpx.AsyncClient", DummyClient)

    response = client.post(
        "/api/auth/reset-password",
        json={"access_token": "test-token", "new_password": "NewStrongPass123!"},
    )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Failed to reset password" in response.json()["detail"]


