from unittest.mock import MagicMock, patch

import pytest
from fastapi import FastAPI, Request, Response
from fastapi.testclient import TestClient

from src.middleware.session_middleware import SessionMiddleware

# --- Test Application Setup ---


@pytest.fixture
def app_with_session_mw() -> FastAPI:
    """
    Creates a minimal FastAPI application instance with the SessionMiddleware
    and a simple endpoint for testing.
    """
    _app = FastAPI()
    _app.add_middleware(SessionMiddleware)  # Add the middleware to be tested

    # Define a simple endpoint that the middleware will process
    @_app.get('/api/v1/test_session_endpoint')
    async def session_endpoint(request: Request):
        # Simulate downstream logic that might set actual_session_id
        # For some tests, we'll let it be set by the fallback in middleware
        # For others, we can simulate it being set here.
        if hasattr(request.state, 'simulate_actual_id_set'):
            request.state.actual_session_id = request.state.simulate_actual_id_set
        return {
            'message': 'Session endpoint reached',
            'candidate_session_id_on_state': getattr(
                request.state, 'candidate_session_id', None
            ),
            'actual_session_id_on_state': getattr(
                request.state, 'actual_session_id', None
            ),
        }

    @_app.get('/non_api/v1/other_endpoint')
    async def non_api_endpoint(request: Request):
        return {'message': 'Non-API endpoint reached'}

    return _app


@pytest.fixture
def client_mw(app_with_session_mw: FastAPI) -> TestClient:
    """Provides a TestClient for the app with SessionMiddleware."""
    return TestClient(app_with_session_mw)


# --- Test Cases ---


def test_middleware_skips_non_api_v1_paths(client_mw: TestClient):
    """
    Tests that the middleware does not process requests for paths
    not starting with /api/v1/.
    """
    response = client_mw.get('/non_api/v1/other_endpoint')
    assert response.status_code == 200
    assert 'X-Session-ID' not in response.headers
    assert 'Access-Control-Expose-Headers' not in response.headers
    # Check that request.state was not populated by the middleware
    # This requires the endpoint to not try to access it or have a default
    # For this test, we assume the non_api_endpoint doesn't interact with request.state.candidate_session_id


@patch(
    'src.middleware.session_middleware.uuid.uuid4'
)  # Patch uuid.uuid4 where it's used
def test_middleware_generates_session_id_if_not_provided(
    mock_uuid4: MagicMock, client_mw: TestClient
):
    """
    Tests that a new session ID is generated if 'X-Session-ID' header is missing.
    """
    mock_generated_uuid = 'mock-generated-uuid-12345'
    mock_uuid4.return_value = mock_generated_uuid

    response = client_mw.get('/api/v1/test_session_endpoint')

    assert response.status_code == 200
    mock_uuid4.assert_called_once()  # Ensure uuid4 was called

    # Check request state (via endpoint response)
    response_data = response.json()
    assert response_data['candidate_session_id_on_state'] == mock_generated_uuid

    # Check response headers
    assert response.headers['X-Session-ID'] == mock_generated_uuid
    assert 'X-Session-ID' in response.headers['Access-Control-Expose-Headers']


def test_middleware_uses_provided_session_id(client_mw: TestClient):
    """
    Tests that an existing session ID from 'X-Session-ID' header is used.
    """
    provided_session_id = 'my-existing-session-abcde'
    headers = {'X-Session-ID': provided_session_id}

    response = client_mw.get('/api/v1/test_session_endpoint', headers=headers)

    assert response.status_code == 200

    # Check request state (via endpoint response)
    response_data = response.json()
    assert response_data['candidate_session_id_on_state'] == provided_session_id

    # Check response headers
    assert response.headers['X-Session-ID'] == provided_session_id
    assert 'X-Session-ID' in response.headers['Access-Control-Expose-Headers']


def test_middleware_uses_actual_session_id_if_set_by_downstream(client_mw: TestClient):
    """
    Tests that the response header 'X-Session-ID' uses request.state.actual_session_id
    if it was set by a downstream handler (e.g., get_or_create_session).
    """
    candidate_id = 'candidate-session-id-789'
    actual_id_set_downstream = 'actual-session-id-xyz'

    # To simulate downstream setting actual_session_id, we modify the app or endpoint for this test.
    # A cleaner way for this specific test might be to mock `call_next` if testing middleware in true isolation.
    # However, using the TestClient with a slightly modified endpoint behavior is also common.

    # For this test, we'll modify the app fixture on the fly or have a dedicated one.
    # Simpler: The test_session_endpoint in the fixture already checks for `simulate_actual_id_set`.
    # We can't easily modify request.state *before* call_next from the client side.
    # So, we rely on the endpoint to show what happened.
    # The middleware's logic is: actual_session_id = getattr(request.state, "actual_session_id", candidate_session_id)

    # To test this specific line, we need `request.state.actual_session_id` to be set
    # when the middleware's response processing part runs.
    # We can achieve this by having the endpoint itself set it.

    # Let's make a new app for this specific scenario to avoid complexity in the main fixture
    _app = FastAPI()
    _app.add_middleware(SessionMiddleware)

    @_app.get('/api/v1/sets_actual_id')
    async def endpoint_sets_actual_id(request: Request):
        request.state.actual_session_id = (
            actual_id_set_downstream  # Simulate downstream logic
        )
        return {'message': 'ok', 'candidate': request.state.candidate_session_id}

    client_for_this_test = TestClient(_app)
    response = client_for_this_test.get(
        '/api/v1/sets_actual_id', headers={'X-Session-ID': candidate_id}
    )

    assert response.status_code == 200
    assert response.headers['X-Session-ID'] == actual_id_set_downstream
    assert (
        response.json()['candidate'] == candidate_id
    )  # candidate_session_id was still set initially
    assert 'X-Session-ID' in response.headers['Access-Control-Expose-Headers']


def test_access_control_expose_headers_appended_correctly(client_mw: TestClient):
    """
    Tests that 'X-Session-ID' is correctly appended to 'Access-Control-Expose-Headers'
    if other headers are already exposed.
    """
    # To test this, the response from `call_next` must already have some exposed headers.
    # We need to modify the endpoint or mock `call_next`.

    _app = FastAPI()
    _app.add_middleware(SessionMiddleware)

    @_app.get('/api/v1/custom_expose_headers')
    async def custom_expose_endpoint(request: Request, starlette_response: Response):
        starlette_response.headers['Access-Control-Expose-Headers'] = (
            'Content-Length, X-Custom-Header'
        )
        return {'message': 'ok'}

    client_for_this_test = TestClient(_app)
    response = client_for_this_test.get('/api/v1/custom_expose_headers')

    assert response.status_code == 200
    exposed_headers = response.headers['Access-Control-Expose-Headers']
    assert 'Content-Length' in exposed_headers
    assert 'X-Custom-Header' in exposed_headers
    assert 'X-Session-ID' in exposed_headers
    # Check that X-Session-ID wasn't added twice if already present (though current code doesn't prevent this explicitly, it checks before adding)
    assert exposed_headers.count('X-Session-ID') == 1


def test_access_control_expose_headers_set_if_not_present(client_mw: TestClient):
    """
    Tests that 'Access-Control-Expose-Headers' is set to 'X-Session-ID'
    if it wasn't present in the response from call_next.
    (This is covered by test_middleware_generates_session_id_if_not_provided)
    """
    response = client_mw.get(
        '/api/v1/test_session_endpoint'
    )  # This endpoint doesn't set expose_headers
    assert response.status_code == 200
    assert response.headers['Access-Control-Expose-Headers'] == 'X-Session-ID'


@patch('src.middleware.session_middleware.logger.info')
def test_middleware_logs_info_messages(
    mock_logger_info: MagicMock, client_mw: TestClient
):
    """
    Tests that the middleware logs appropriate info messages.
    """
    # Scenario 1: New ID generated
    with patch('src.middleware.session_middleware.uuid.uuid4') as mock_uuid4_log:
        mock_generated_uuid_log = 'logged-uuid-generated'
        mock_uuid4_log.return_value = mock_generated_uuid_log
        client_mw.get('/api/v1/test_session_endpoint')

        # Check log calls
        # First log: "Generated new session ID: ..."
        # Second log: "Using existing session ID: ..." (this is from request.state.candidate_session_id)
        # Third log: "Set session ID in response headers: ..."

        # Let's check for specific log messages related to generation and setting in response
        generated_log_found = any(
            f'Generated new session ID: {mock_generated_uuid_log}' in call_args[0][0]
            for call_args in mock_logger_info.call_args_list
        )
        set_in_response_log_found_generated = any(
            f'Set session ID in response headers: {mock_generated_uuid_log}'
            in call_args[0][0]
            for call_args in mock_logger_info.call_args_list
        )
        assert generated_log_found
        assert set_in_response_log_found_generated

    mock_logger_info.reset_mock()  # Reset for next scenario

    # Scenario 2: Existing ID used
    provided_session_id_log = 'logged-existing-id'
    client_mw.get(
        '/api/v1/test_session_endpoint',
        headers={'X-Session-ID': provided_session_id_log},
    )

    existing_log_found = any(
        f'Using existing session ID: {provided_session_id_log}' in call_args[0][0]
        for call_args in mock_logger_info.call_args_list
    )
    set_in_response_log_found_existing = any(
        f'Set session ID in response headers: {provided_session_id_log}'
        in call_args[0][0]
        for call_args in mock_logger_info.call_args_list
    )
    assert existing_log_found
    assert set_in_response_log_found_existing
