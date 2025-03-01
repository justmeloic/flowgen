import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch
from src.main import create_app
from src.routers import mermaid_router


# Use the TestClient to interact with the FastAPI application
@pytest.fixture(scope="module")
def client():
    app = create_app()
    return TestClient(app)


def test_invalid_mermaid_request(client):
    """
    Tests a request with invalid input (missing message).
    """
    response = client.post("/api/v1/mermaid", json={})
    assert response.status_code == 422  # Unprocessable Entity


def test_mermaid_request_with_conversation_id(client):
    """
    Tests that providing a conversation_id in the request is handled correctly.
    """
    conversation_id = "test-conversation-123"
    with patch("src.routers.mermaid_router._model.generate_content") as mock_generate_content:
        mock_response = MagicMock()
        mock_response.text = "graph TD\nA[Client] --> B(Server)"
        mock_generate_content.return_value = mock_response

        response = client.post(
            "/api/v1/mermaid",
            json={"message": "Client sends to Server", "conversation_id": conversation_id},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["conversation_id"] == conversation_id
