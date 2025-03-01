import pytest
from fastapi.testclient import TestClient

from src.main import create_app


@pytest.fixture
def client():
    """Create a TestClient instance for making requests to the FastAPI app."""
    app = create_app()
    return TestClient(app)


def test_read_root_status_code(client: TestClient):
    """Test that the root endpoint returns a 200 status code."""
    response = client.get("/api/v1/")
    assert response.status_code == 200


def test_read_root_content_type(client: TestClient):
    """Test that the response content type is HTML."""
    response = client.get("/api/v1/")
    assert response.headers["content-type"] == "text/html; charset=utf-8"


def test_read_root_content(client: TestClient):
    """Test that the HTML content includes specific elements."""
    response = client.get("/api/v1/")
    html_content = response.text
    assert "<title>Mermaid Diagram Generator</title>" in html_content
    assert '<div class="container">' in html_content
    assert '<textarea id="mermaid-input" placeholder="Describe your system here..."></textarea>' in html_content
    assert '<button id="generate-btn">Generate Diagram</button>' in html_content
    assert '<div id="mermaid-output"></div>' in html_content
    assert '<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>' in html_content
