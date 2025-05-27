from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException, Request, Response
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.sessions import Session as ADKSession

from src.agents.agent import root_agent  # Your actual agent
from src.routers.root_agent.datamodels import AgentConfig
from src.routers.root_agent.dependencies import (
    get_agent_config,
    get_or_create_session,
    get_runner,
    get_session_service,  # Assuming this returns request.app.state.session_service
)

# Note: Some of these dependencies are tightly coupled with the FastAPI Request object
# and its state. Testing them in complete isolation can be complex.
# The `client` fixture from conftest.py is more for integration tests.
# For unit tests here, we'll mock the Request object.


@pytest.fixture
def mock_request_obj() -> MagicMock:
    request = MagicMock(spec=Request)
    request.app = MagicMock()
    request.app.state = MagicMock()
    request.state = MagicMock()  # For candidate_session_id, actual_session_id
    return request


@pytest.fixture
def mock_response_obj() -> MagicMock:
    response = MagicMock(spec=Response)
    response.headers = {}  # Simulate headers dictionary
    return response


def test_get_agent_config_caching():
    """Test that get_agent_config caches results as expected."""
    with patch('src.routers.root_agent.dependencies.get_settings') as mock_get_settings:
        mock_settings = {
            'app_name': 'cached_app',
            'user_id': 'cached_user',
        }
        mock_get_settings.return_value = mock_settings

        # Clear any existing cache
        get_agent_config.cache_clear()

        # First call should hit the mock
        config1 = get_agent_config()
        assert mock_get_settings.call_count == 1

        # Second call should use cached value
        config2 = get_agent_config()
        assert mock_get_settings.call_count == 1  # Still only called once

        # Configs should be identical
        assert config1 is config2

        # Clear cache and verify new call hits mock again
        get_agent_config.cache_clear()
        config3 = get_agent_config()
        assert mock_get_settings.call_count == 2


def test_get_session_service(mock_request_obj: MagicMock):
    mock_service_instance = InMemorySessionService()
    mock_request_obj.app.state.session_service = mock_service_instance

    service = get_session_service(mock_request_obj)
    assert service is mock_service_instance


@pytest.mark.asyncio
async def test_get_or_create_session_creates_new(
    mock_request_obj: MagicMock,
    mock_response_obj: MagicMock,
    test_agent_config: AgentConfig,  # Fixture from conftest
):
    mock_request_obj.state.candidate_session_id = None  # No session ID provided
    mock_session_service = AsyncMock(spec=InMemorySessionService)

    # Mock create_session to return a predictable session
    created_session_id = 'newly-created-uuid'
    mock_created_session = ADKSession(
        id=created_session_id,
        app_name=test_agent_config.app_name,
        user_id=test_agent_config.user_id,
        state={},
        events=[],
    )
    mock_session_service.create_session.return_value = mock_created_session

    mock_request_obj.app.state.session_service = mock_session_service

    session = await get_or_create_session(
        mock_request_obj, mock_response_obj, test_agent_config
    )

    assert session is mock_created_session
    assert session.id == created_session_id
    mock_session_service.create_session.assert_awaited_once()
    mock_session_service.get_session.assert_not_called()  # Should not be called
    assert mock_request_obj.state.actual_session_id == created_session_id
    assert mock_response_obj.headers['X-Session-ID'] == created_session_id


@pytest.mark.asyncio
async def test_get_or_create_session_finds_existing(
    mock_request_obj: MagicMock,
    mock_response_obj: MagicMock,
    test_agent_config: AgentConfig,
):
    existing_session_id = 'existing-session-123'
    mock_request_obj.state.candidate_session_id = existing_session_id
    mock_session_service = AsyncMock(spec=InMemorySessionService)

    existing_session = ADKSession(
        id=existing_session_id,
        app_name=test_agent_config.app_name,
        user_id=test_agent_config.user_id,
        state={'count': 1},
        events=[],
    )
    mock_session_service.get_session.return_value = existing_session

    mock_request_obj.app.state.session_service = mock_session_service

    session = await get_or_create_session(
        mock_request_obj, mock_response_obj, test_agent_config
    )

    assert session is existing_session
    mock_session_service.get_session.assert_awaited_once_with(
        app_name=test_agent_config.app_name,
        user_id=test_agent_config.user_id,
        session_id=existing_session_id,
    )
    mock_session_service.create_session.assert_not_called()
    assert mock_request_obj.state.actual_session_id == existing_session_id
    assert mock_response_obj.headers['X-Session-ID'] == existing_session_id


@pytest.mark.asyncio
async def test_get_or_create_session_creates_if_not_found(
    mock_request_obj: MagicMock,
    mock_response_obj: MagicMock,
    test_agent_config: AgentConfig,
):
    non_existent_session_id = 'non-existent-session-456'
    mock_request_obj.state.candidate_session_id = non_existent_session_id
    mock_session_service = AsyncMock(spec=InMemorySessionService)

    # Change from SessionNotFoundError to a generic Exception
    mock_session_service.get_session.side_effect = Exception('Session not found')

    created_session_id_after_not_found = non_existent_session_id
    mock_created_session = ADKSession(
        id=created_session_id_after_not_found,
        app_name=test_agent_config.app_name,
        user_id=test_agent_config.user_id,
        state={},
        events=[],
    )
    mock_session_service.create_session.return_value = mock_created_session

    mock_request_obj.app.state.session_service = mock_session_service

    session = await get_or_create_session(
        mock_request_obj, mock_response_obj, test_agent_config
    )

    assert session is mock_created_session
    assert session.id == created_session_id_after_not_found
    mock_session_service.get_session.assert_awaited_once()
    mock_session_service.create_session.assert_awaited_once()
    assert (
        mock_request_obj.state.actual_session_id == created_session_id_after_not_found
    )


def test_get_runner_creates_new_if_not_exists(
    mock_request_obj: MagicMock,
    test_agent_config: AgentConfig,
):
    if hasattr(mock_request_obj.app.state, 'runner'):
        delattr(mock_request_obj.app.state, 'runner')

    mock_session_service = MagicMock(spec=InMemorySessionService)
    mock_request_obj.app.state.session_service = mock_session_service

    with patch('src.routers.root_agent.dependencies.Runner') as MockRunnerClass:
        mock_runner = MagicMock(spec=Runner)
        MockRunnerClass.return_value = mock_runner

        runner = get_runner(mock_request_obj, test_agent_config)

        MockRunnerClass.assert_called_once()
        call_kwargs = MockRunnerClass.call_args.kwargs
        assert call_kwargs['app_name'] == test_agent_config.app_name
        assert call_kwargs['session_service'] == mock_session_service
        # Compare agent names instead of instances to avoid recursion
        assert call_kwargs['agent'].name == root_agent.name

        assert runner is mock_runner
        assert mock_request_obj.app.state.runner is mock_runner


def test_get_runner_returns_existing(
    mock_request_obj: MagicMock, test_agent_config: AgentConfig
):
    existing_runner_instance = MagicMock(spec=Runner)
    mock_request_obj.app.state.runner = existing_runner_instance
    mock_request_obj.app.state.session_service = MagicMock(spec=InMemorySessionService)

    with patch('src.routers.root_agent.dependencies.Runner') as MockRunnerClass:
        runner = get_runner(mock_request_obj, test_agent_config)
        MockRunnerClass.assert_not_called()  # Should not create a new one
        assert runner is existing_runner_instance


def test_get_runner_raises_http_exception_on_creation_failure(
    mock_request_obj: MagicMock, test_agent_config: AgentConfig
):
    if hasattr(mock_request_obj.app.state, 'runner'):
        delattr(mock_request_obj.app.state, 'runner')
    mock_request_obj.app.state.session_service = MagicMock(spec=InMemorySessionService)

    with patch(
        'src.routers.root_agent.dependencies.Runner',
        side_effect=Exception('Creation failed'),
    ) as MockRunnerClass:
        with pytest.raises(HTTPException) as exc_info:
            get_runner(mock_request_obj, test_agent_config)
        assert exc_info.value.status_code == 500
        assert 'Failed to initialize agent runner' in exc_info.value.detail['message']
