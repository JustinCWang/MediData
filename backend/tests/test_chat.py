"""
test_chat.py - Chatbot API tests

Exercises chatbot prompt/response endpoints for status and payload handling.
"""
from http import HTTPStatus
from types import SimpleNamespace

import pytest

import app.main as app_main


class DummyModel:
    def __init__(self, *_args, response_text: str = "Sample guidance"):
        self._response_text = response_text

    def generate_content(self, prompt: str):
        # Capture prompt for assertions if needed later
        self.last_prompt = prompt
        return SimpleNamespace(text=self._response_text)


def test_chat_success_returns_ai_response(client, monkeypatch):
    """End-to-end happy path: valid messages and API key yield a 200 and a model-generated reply."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test-key")
    dummy_model = DummyModel(response_text="Please see a specialist")
    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: dummy_model)

    payload = {
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "How can I help?"},
            {"role": "user", "content": "I have a rash"},
        ]
    }

    response = client.post("/api/chat", json=payload)

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == "Please see a specialist"


def test_chat_missing_api_key_returns_503(client, monkeypatch):
    """When GEMINI_API_KEY is not configured, the endpoint returns 503 with a helpful message."""
    monkeypatch.setattr(app_main, "gemini_api_key", None)

    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Test"}]})

    assert response.status_code == HTTPStatus.SERVICE_UNAVAILABLE
    assert "not configured" in response.json()["detail"]


def test_chat_requires_user_message(client, monkeypatch):
    """If the last message in the conversation is not from the user, the API rejects the request with 400."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test")
    dummy_model = DummyModel()
    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: dummy_model)

    response = client.post(
        "/api/chat",
        json={
            "messages": [
                {"role": "user", "content": "Hi"},
                {"role": "assistant", "content": "Hello"},
            ]
        },
    )

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "Last message must be from user"


def test_chat_requires_messages(client, monkeypatch):
    """An empty messages list is considered invalid input and returns HTTP 400."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test")
    dummy_model = DummyModel()
    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: dummy_model)

    response = client.post("/api/chat", json={"messages": []})

    assert response.status_code == HTTPStatus.BAD_REQUEST
    assert response.json()["detail"] == "No messages provided"


def test_chat_single_message_uses_simple_prompt(client, monkeypatch):
    """Single user message path still works and returns a model response without conversation context."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test-key")
    dummy_model = DummyModel(response_text="Provide more info")
    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: dummy_model)

    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "Need help"}]},
    )

    assert response.status_code == HTTPStatus.OK
    assert response.json()["message"] == "Provide more info"


def test_chat_handles_empty_model_response(client, monkeypatch):
    """If Gemini returns no text, we convert that into a 500 'Failed to generate response' error."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test-key")

    class EmptyModel(DummyModel):
        def generate_content(self, prompt: str):
            return SimpleNamespace(text=None)

    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: EmptyModel())

    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Test"}]})

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Failed to generate" in response.json()["detail"]


def test_chat_invalid_api_key_error(client, monkeypatch):
    """Gemini authentication failures are turned into HTTP 401 with an 'invalid API key' message."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test-key")

    class ErrorModel(DummyModel):
        def generate_content(self, prompt: str):
            raise Exception("authentication failure detected")

    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: ErrorModel())

    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Test"}]})

    assert response.status_code == HTTPStatus.UNAUTHORIZED
    assert "Invalid Gemini API key" in response.json()["detail"]


def test_chat_generic_exception_returns_500(client, monkeypatch):
    """Any other exception from Gemini is reported as a generic 500 'Error generating chat response'."""
    monkeypatch.setattr(app_main, "gemini_api_key", "test-key")

    class BoomModel(DummyModel):
        def generate_content(self, prompt: str):
            raise Exception("something else failed")

    monkeypatch.setattr(app_main.genai, "GenerativeModel", lambda *_args, **_kwargs: BoomModel())

    response = client.post("/api/chat", json={"messages": [{"role": "user", "content": "Test"}]})

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert "Error generating chat response" in response.json()["detail"]


