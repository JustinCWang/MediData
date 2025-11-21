from http import HTTPStatus

import pytest


@pytest.mark.usefixtures("mock_supabase")
def test_register_patient_success(client):
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
    # This hits the validation branch before any Supabase calls
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
    """
    Simulate Supabase returning an 'already registered' style error and
    verify we surface it as HTTP 409 with a helpful message.
    """
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
    """
    Simulate Supabase rejecting a weak password and verify we map that to
    a 400 with clear guidance.
    """
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
    """
    Simulate invalid credentials from Supabase and ensure we return 401
    with a generic 'invalid email or password' message.
    """
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
    """
    Simulate Supabase indicating that no user exists for the given email
    and verify we surface a 404 with a clear message.
    """
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


