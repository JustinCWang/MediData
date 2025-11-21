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


