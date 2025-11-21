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


