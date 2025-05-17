import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient, ASGITransport
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
from google.genai import types
import asyncio

# Add the src directory to the Python path
src_path = Path(__file__).parent.parent / "src"
sys.path.append(str(src_path))

# Create patches for all Google Cloud dependencies
@pytest.fixture(autouse=True)
def mock_google_cloud():
    """Mock all Google Cloud dependencies."""
    with patch('google.adk.sessions.InMemorySessionService') as mock_session_service, \
         patch('google.genai.Client') as mock_client, \
         patch('google.adk.runners.Runner') as mock_runner:
        
        # Mock session service
        mock_session = MagicMock()
        mock_session_service.return_value.create_session.return_value = mock_session
        
        # Mock Vertex AI client
        mock_client_instance = MagicMock()
        mock_client.return_value = mock_client_instance
        
        # Mock runner
        mock_runner_instance = MagicMock()
        async def mock_run_async(*args, **kwargs):
            mock_event = MagicMock()
            mock_event.is_final_response.return_value = True
            mock_event.content = types.Content(
                role="assistant",
                parts=[types.Part(text="Mocked response about tariffs")]
            )
            yield mock_event
        mock_runner_instance.run_async.side_effect = mock_run_async
        mock_runner.return_value = mock_runner_instance
        
        yield {
            'session_service': mock_session_service,
            'client': mock_client,
            'runner': mock_runner
        }

@pytest.fixture
def app():
    """Create a fresh app instance for testing."""
    from app import app
    return app

@pytest.fixture
def test_client(app):
    """Create a TestClient instance."""
    return TestClient(app)

@pytest.fixture
async def async_client(app):
    """Create an async client for testing."""
    async with AsyncClient(base_url="http://testserver", transport=ASGITransport(app=app)) as ac:
        yield ac

@pytest.mark.asyncio
class TestRootAgent:
    @pytest.mark.asyncio
    async def test_root_agent_endpoint_structure(self, async_client):
        """Test the basic structure and availability of the root agent endpoint."""
        response = await async_client.get("/api/v1/root_agent/")
        assert response.status_code == 405  # Method not allowed (only POST should work)

    @pytest.mark.asyncio
    @pytest.mark.parametrize("query", [
        {"text": ""},  # Empty text
        {},  # Missing text field
        {"text": 123},  # Wrong type for text
        {"wrong_field": "some text"}  # Wrong field name
    ])
    async def test_root_agent_invalid_payloads(self, async_client, query):
        """Test various invalid payload scenarios."""
        response = await async_client.post("/api/v1/root_agent/", json=query)
        assert response.status_code == 422
        assert "detail" in response.json()

    @pytest.mark.asyncio
    async def test_root_agent_valid_queries(self, async_client):
        """Test multiple valid queries to ensure consistent response structure."""
        valid_queries = [
            {
                "text": "What are the latest tariff changes between US and China?",
                "description": "tariff query"
            },
            {
                "text": "What is the current trade situation between EU and Japan?",
                "description": "trade situation query"
            },
            {
                "text": "Tell me about recent economic policies in India",
                "description": "economic policy query"
            }
        ]
        
        for query in valid_queries:
            payload = {"text": query["text"]}
            response = await async_client.post("/api/v1/root_agent/", json=payload)
            
            assert response.status_code == 200
            response_json = response.json()
            assert "response" in response_json
            assert isinstance(response_json["response"], str)
            assert len(response_json["response"]) > 0

    @pytest.mark.asyncio
    async def test_root_agent_response_format(self, async_client):
        """Test specific format requirements of the response."""
        payload = {"text": "What are the latest tariff changes between US and China?"}
        response = await async_client.post("/api/v1/root_agent/", json=payload)
        
        assert response.status_code == 200
        response_json = response.json()
        assert isinstance(response_json, dict)
        assert "response" in response_json
        assert isinstance(response_json["response"], str)

    @pytest.mark.asyncio
    async def test_root_agent_long_query(self, async_client):
        """Test the endpoint with a longer query."""
        long_text = "What are the economic implications of recent trade policies " * 10
        payload = {"text": long_text}
        response = await async_client.post("/api/v1/root_agent/", json=payload)
        
        assert response.status_code == 200
        assert "response" in response.json()

    @pytest.mark.asyncio
    async def test_root_agent_special_characters(self, async_client):
        """Test the endpoint with special characters in the query."""
        payload = {"text": "What about trade policies in São Paulo & Rio de Janeiro?"}
        response = await async_client.post("/api/v1/root_agent/", json=payload)
        
        assert response.status_code == 200
        assert "response" in response.json()

    @pytest.mark.asyncio
    async def test_concurrent_requests(self, async_client):
        """Test the endpoint's behavior with concurrent requests."""
        async def make_request():
            payload = {"text": "What are the latest tariff changes?"}
            response = await async_client.post("/api/v1/root_agent/", json=payload)
            return response.status_code
        
        # Make 5 concurrent requests
        tasks = [make_request() for _ in range(5)]
        results = await asyncio.gather(*tasks)
        
        # All requests should be successful
        assert all(status == 200 for status in results) 