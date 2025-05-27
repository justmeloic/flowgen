import time
from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException, Request
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService

# ADK and other necessary imports
from google.adk.sessions import Session as ADKSession

# Assuming root_agent is importable for author field (or use a mock string)
from src.routers.root_agent.agent_handler import process_agent_query

# Corrected import for models
from src.routers.root_agent.datamodels import AgentConfig, Query


@pytest.fixture
def mock_handler_request() -> MagicMock:
    request = MagicMock(spec=Request)
    request.app = MagicMock()
    request.app.state = MagicMock()
    request.state = MagicMock()
    request.state.actual_session_id = 'handler-test-session-id-actual'
    return request


@pytest.fixture
def mock_handler_session(
    test_agent_config: AgentConfig,
) -> ADKSession:  # Uses test_agent_config from conftest
    return ADKSession(
        id='handler-test-session-id-actual',  # Should match actual_session_id for consistency
        app_name=test_agent_config.app_name,
        user_id=test_agent_config.user_id,
        state={'query_count': 0, 'created_at': time.time()},  # Initial state
        events=[],
    )


@pytest.mark.asyncio
async def test_process_agent_query_runner_raises_exception(
    mock_handler_request: MagicMock,
    test_agent_config: AgentConfig,
    mock_handler_session: ADKSession,
):
    query = Query(text='This will cause an error')
    mock_session_service = AsyncMock(spec=InMemorySessionService)
    mock_handler_request.app.state.session_service = mock_session_service

    mock_runner_instance = AsyncMock(spec=Runner)
    error_message = 'Simulated runner explosion'
    mock_runner_instance.run_async.side_effect = Exception(error_message)

    with pytest.raises(HTTPException) as exc_info:
        await process_agent_query(
            request=mock_handler_request,
            query=query,
            config=test_agent_config,
            session=mock_handler_session,
            runner=mock_runner_instance,
        )

    assert exc_info.value.status_code == 500
    assert 'Error processing agent query' in exc_info.value.detail['message']
    assert error_message in exc_info.value.detail['error']
    # User event should still have been appended
    mock_session_service.append_event.assert_called_once()
