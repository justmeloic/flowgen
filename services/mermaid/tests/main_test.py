import os
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src.main import create_app


@pytest.fixture
def client(env_setup: Any) -> TestClient:
    """Create a TestClient instance for making requests to the FastAPI app."""
    app = create_app()
    return TestClient(app)


def test_create_app_success(client: TestClient):
    """Test successful creation of FastAPI app"""
    response = client.get("/api/v1/")
    assert response.status_code == 200


def test_create_app_env_file_missing(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    """Test RuntimeError is raised when .env file is missing"""

    def mock_load_dotenv():
        raise FileNotFoundError

    monkeypatch.setattr(
        "src.main.load_dotenv", mock_load_dotenv
    )  # Mock load_dotenv to raise FileNotFoundError
    original_dir = os.getcwd()
    os.chdir(tmp_path)

    try:
        with pytest.raises(
            RuntimeError,
            match="'.env' file not found. Please create one for environment variables.",
        ):
            create_app()
    finally:
        os.chdir(original_dir)


'''
Deprecated tests: see issue #14 (https://github.com/justmeloic/from-first-principles/issues/14)


def test_routers_included(client: TestClient):
    """Test that routers are included in the FastAPI app"""
    response = client.get("/api/v1/")
    assert response.status_code == 200
    response = client.post(
        "/api/v1/chat", json={"message": "test"}
    )  # Assuming chat endpoint requires a message
    assert response.status_code == 200

'''
