from unittest.mock import MagicMock, patch
from langchain_core.messages import AIMessage


def test_chat_without_api_key(client, monkeypatch):
    """
    When MISTRAL_API_KEY is not set or empty, Leafy returns a graceful
    instruction message rather than throwing an internal 500 error.
    """
    monkeypatch.setattr("app.services.chat_service.MISTRAL_API_KEY", "")
    
    response = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "Hello Leafy"}]},
        headers={"X-Device-Id": "test-device"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "Leafy" in data["reply"]
    assert "MISTRAL_API_KEY" in data["reply"]


def test_chat_validation_empty_messages(client):
    """
    Empty messages array triggers 422 unprocessable entity.
    """
    response = client.post(
        "/api/chat",
        json={"messages": []},
        headers={"X-Device-Id": "test-device"},
    )
    assert response.status_code == 422


def test_chat_with_mocked_mistral(client, monkeypatch):
    """
    When MISTRAL_API_KEY is configured, ChatMistralAI is instantiated and invoked
    with context and user history.
    """
    monkeypatch.setattr("app.services.chat_service.MISTRAL_API_KEY", "mock-test-key")

    mock_llm_instance = MagicMock()
    mock_llm_instance.invoke.return_value = AIMessage(
        content="Hello! I'm Leafy 🌿. You're doing great keeping your carbon footprint low!"
    )

    with patch("app.services.chat_service.ChatMistralAI", return_value=mock_llm_instance):
        response = client.post(
            "/api/chat",
            json={
                "messages": [
                    {"role": "user", "content": "How is my progress looking this week?"}
                ],
                "include_progress": True,
            },
            headers={"X-Device-Id": "user-progress-test"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "Hello! I'm Leafy 🌿." in data["reply"]
        assert mock_llm_instance.invoke.called
        
        # Verify that SystemMessage with carbon progress context was passed
        passed_messages = mock_llm_instance.invoke.call_args[0][0]

        assert len(passed_messages) == 2
        # System prompt contains Leafy instructions, guardrails, and device ID
        assert "Leafy" in passed_messages[0].content
        assert "user-progress-test" in passed_messages[0].content
        assert "STRICT DOMAIN & SCOPE GUARDRAILS" in passed_messages[0].content
        assert "Do not use any emojis" in passed_messages[0].content
        assert passed_messages[1].content == "How is my progress looking this week?"


def test_chat_stream_without_api_key(client, monkeypatch):
    """
    POST /api/chat/stream returns SSE with setup instructions when API key is missing.
    """
    monkeypatch.setattr("app.services.chat_service.MISTRAL_API_KEY", "")

    response = client.post(
        "/api/chat/stream",
        json={"messages": [{"role": "user", "content": "Hello Leafy"}]},
        headers={"X-Device-Id": "test-device"},
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    content = response.text
    assert "data: " in content
    assert "MISTRAL_API_KEY" in content
    assert "data: [DONE]" in content


def test_chat_stream_with_mocked_mistral(client, monkeypatch):
    """
    POST /api/chat/stream emits incremental chunks via astream.
    """
    monkeypatch.setattr("app.services.chat_service.MISTRAL_API_KEY", "mock-test-key")

    class MockChunk:
        def __init__(self, content):
            self.content = content

    async def mock_astream(*args, **kwargs):
        yield MockChunk("Driving a car ")
        yield MockChunk("produces 0.20 kg CO2 per km.")

    mock_llm_instance = MagicMock()
    mock_llm_instance.astream = mock_astream

    with patch("app.services.chat_service.ChatMistralAI", return_value=mock_llm_instance):
        response = client.post(
            "/api/chat/stream",
            json={"messages": [{"role": "user", "content": "How much CO2 does driving emit?"}]},
            headers={"X-Device-Id": "test-device"},
        )
        assert response.status_code == 200
        assert response.headers["content-type"].startswith("text/event-stream")
        content = response.text
        assert "Driving a car " in content
        assert "produces 0.20 kg CO2 per km." in content
        assert "data: [DONE]" in content


