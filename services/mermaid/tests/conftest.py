import os

import pytest
from fastapi.testclient import TestClient

from src.main import create_app


@pytest.fixture
def app():
    """Create and configure a new FastAPI app instance for each test."""
    app = create_app()
    return app


@pytest.fixture
def client(app):
    """Create a TestClient instance for making requests to the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def env_setup(tmp_path):
    """Setup temporary environment with .env file for testing."""

    # Create temporary .env file
    env_path = tmp_path / ".env"
    env_path.write_text("API_KEY=test_key\n")

    # Store original directory
    original_dir = os.getcwd()

    # Change to temp directory
    os.chdir(tmp_path)

    yield tmp_path

    # Cleanup: restore original directory
    os.chdir(original_dir)
