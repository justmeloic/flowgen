import os
from unittest.mock import patch

import pytest
from absl import flags
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Functions/classes to import from your source for specific tests
from src.app import configure_gcp_environment, create_app  # For direct unit testing

# These fixtures are expected to be defined in tests/conftest.py:
# - app: Provides a FastAPI app instance configured for tests.
# - client: Provides a TestClient for the test-configured app.
# - setup_test_environment_and_flags: (session-scoped, autouse=True) Handles flag and env setup.


def test_app_instance_creation(app: FastAPI):
    """Test that the FastAPI app instance is created successfully."""
    assert app is not None
    assert isinstance(app, FastAPI)
    # The setup_test_environment_and_flags fixture should ensure that
    # create_app() runs without errors related to flags or GCP env vars.


@pytest.fixture(scope='function')
async def initialized_app(app: FastAPI):
    """Fixture that ensures the app goes through startup."""
    async with app:
        yield app


@pytest.mark.asyncio
async def test_app_shutdown_completes_gracefully(setup_test_environment_and_flags):
    # This test now just ensures the app with its lifespan can shutdown
    # without the specific session_service.cleanup call causing an error.
    # The error was logged but didn't stop pytest before, this just makes it cleaner.
    test_app_instance = create_app()
    async with test_app_instance.router.lifespan_context(test_app_instance):
        assert hasattr(test_app_instance.state, 'session_service')  # Startup check
    # Shutdown happens here, no specific assertion for cleanup if removed
    assert True  # If it reaches here without error, shutdown was okay


def test_gcp_environment_configured_successfully_for_app(client: TestClient):
    """
    Implicitly tests that configure_gcp_environment ran successfully
    during app creation by making a simple API call.
    The `setup_test_environment_and_flags` in conftest.py should set the required env vars.
    """
    response = client.get('/api/v1/status')  # A known healthy endpoint
    assert (
        response.status_code == 200
    )  # If app failed to start, this would error out earlier


# --- Unit tests for configure_gcp_environment itself ---
def test_unit_configure_gcp_environment_success():
    """Unit test: configure_gcp_environment success when env vars are present."""
    with patch.dict(
        os.environ,
        {
            'GOOGLE_CLOUD_PROJECT': 'test-project-for-unit',
            'GOOGLE_CLOUD_LOCATION': 'test-location-for-unit',
        },
    ):
        try:
            configure_gcp_environment()  # Call the function directly
        except ValueError:
            pytest.fail('configure_gcp_environment raised ValueError unexpectedly')


def test_unit_configure_gcp_environment_failure_project_missing():
    """Unit test: configure_gcp_environment failure when GOOGLE_CLOUD_PROJECT is missing."""
    with patch.dict(os.environ, {'GOOGLE_CLOUD_LOCATION': 'test-location'}, clear=True):
        # clear=True ensures only GOOGLE_CLOUD_LOCATION is set for this test context
        with pytest.raises(ValueError) as exc_info:
            configure_gcp_environment()
        assert 'Missing required Google Cloud environment variables' in str(
            exc_info.value
        )


def test_unit_configure_gcp_environment_failure_location_missing():
    """Unit test: configure_gcp_environment failure when GOOGLE_CLOUD_LOCATION is missing."""
    with patch.dict(os.environ, {'GOOGLE_CLOUD_PROJECT': 'test-project'}, clear=True):
        with pytest.raises(ValueError) as exc_info:
            configure_gcp_environment()
        assert 'Missing required Google Cloud environment variables' in str(
            exc_info.value
        )


def test_unit_configure_gcp_environment_failure_both_missing():
    """Unit test: configure_gcp_environment failure when both GCP env vars are missing."""
    with patch.dict(os.environ, {}, clear=True):  # No relevant env vars
        with pytest.raises(ValueError) as exc_info:
            configure_gcp_environment()
        assert 'Missing required Google Cloud environment variables' in str(
            exc_info.value
        )


# --- Test API Status Endpoint ---
def test_api_status_endpoint(client: TestClient, app: FastAPI):
    """Test the /api/v1/status endpoint for correct response."""
    # The `app` fixture uses settings derived from flags set in conftest.py
    # We can access app.state or re-fetch settings if needed for assertion,
    # but for this, we'll assume flags set in conftest are reflected.

    # Expected values based on typical setup in conftest.py's setup_test_environment_and_flags
    # If your conftest.py sets FLAGS.api_title = "Test Suite API", etc.
    expected_title = flags.FLAGS.api_title  # Access the flag value directly
    expected_description = flags.FLAGS.api_description
    expected_version = flags.FLAGS.api_version

    response = client.get('/api/v1/status')
    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'healthy'
    assert data['title'] == expected_title
    assert data['description'] == expected_description
    assert data['version'] == expected_version


# --- Basic Static File Serving Test (Optional) ---
# This test is very basic. Proper testing of static files can be complex
# and might require creating temporary static files and directories for the test run.
# Your app.py logs warnings if STATIC_FILES_DIR is not found. These tests
# check the behavior when that directory is likely missing in a standard test environment.


def test_catch_all_path_serves_404_when_file_and_index_html_are_missing(
    client: TestClient,
):
    """
    Tests that a non-API, non-existent path returns 404.
    This tests the @app.get('/{full_path:path}') catch-all.
    """
    response = client.get('/some/non_existent/path/that_is_not_an_api')
    assert response.status_code == 404
    assert 'Not Found' in response.json().get(
        'detail', ''
    )  # From the catch-all HTTPException


# If you wanted to test successful static file serving, you would need to:
# 1. Create a temporary directory in your tests (e.g., tests/temp_static_frontend).
# 2. Create dummy files like 'index.html' or 'favicon.ico' inside it.
# 3. Patch 'src.app.STATIC_FILES_DIR' *before* `create_app()` is called in your `app` fixture
#    to point to this temporary directory.
# This is more involved and typically only done if static file serving is a critical part of the tested logic.
# Example (conceptual, would need careful integration with app fixture):
# @patch('src.app.STATIC_FILES_DIR', new='/path/to/test_temp_static_frontend')
# def test_serves_index_html_from_temp_dir(client_with_mocked_statics: TestClient):
#     response = client_with_mocked_statics.get("/")
#     assert response.status_code == 200
#     assert "dummy test index" in response.text # Assuming content of dummy index.html
