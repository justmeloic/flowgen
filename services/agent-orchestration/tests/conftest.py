"""
Pytest configuration file for the test suite.
"""
import os
import sys
from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Import flags from config
from config import FLAGS


def pytest_configure(config):
    """Configure custom markers for the test suite."""
    config.addinivalue_line(
        "markers",
        "asyncio: mark test as an asyncio coroutine-based test"
    )
    # Parse flags for testing
    if not FLAGS.is_parsed():
        FLAGS(sys.argv)

@pytest.fixture
def app() -> FastAPI:
    """Create a fresh app instance for testing."""
    from app import create_app
    test_app = create_app()
    test_app.dependency_overrides = {}  # Reset any dependency overrides
    return test_app

@pytest.fixture(autouse=True)
def env_setup():
    """Setup any environment variables and configurations needed for testing."""
    # Mock environment variables
    env_vars = {
        "GOOGLE_CLOUD_PROJECT": "test-project",
        "GOOGLE_CLOUD_LOCATION": "us-central1",
        "BQ_PROJECT_ID": "test-project"
    }
    
    with patch.dict(os.environ, env_vars):
        yield
    # Cleanup after tests if needed 

@pytest.fixture
def test_client(app):
    """Create a TestClient instance."""
    return TestClient(app) 