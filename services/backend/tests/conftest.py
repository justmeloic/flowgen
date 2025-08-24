"""Minimal test configuration."""

import os
import sys

import pytest
from fastapi.testclient import TestClient

# Add the parent directory to the path so we can import from src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Set required environment variables before importing the app
os.environ.setdefault('GOOGLE_CLOUD_PROJECT', 'test-project')
os.environ.setdefault('GOOGLE_CLOUD_LOCATION', 'us-central1')
os.environ.setdefault('GCS_BUCKET_NAME', 'test-bucket')
os.environ.setdefault('SERVICE_ACCOUNT_EMAIL', 'test@test.iam.gserviceaccount.com')
os.environ.setdefault('SIGNED_URL_LIFETIME', '3600')

from src.app.main import app


@pytest.fixture
def client():
    """Create a test client."""
    with TestClient(app) as test_client:
        yield test_client
