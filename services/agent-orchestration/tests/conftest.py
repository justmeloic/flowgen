import asyncio
import os
import sys
import tempfile
from pathlib import Path
from typing import Generator
from unittest.mock import AsyncMock, patch

import pytest
from absl import flags
from fastapi import FastAPI
from fastapi.testclient import TestClient
from google.adk.events import Event, EventActions
from google.adk.runners import Runner

# ADK imports (ensure these are the correct paths for your ADK version)
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

from src.agents.agent import root_agent  # Your actual agent instance

# Application-specific imports
from src.app import create_app  # Your application factory

# Corrected import based on your project structure
from src.routers.root_agent.datamodels import AgentConfig

# --- Global Test Configuration & Fixtures ---


@pytest.fixture(scope='session')
def event_loop_policy():
    """Set the asyncio event loop policy for the test session."""
    # Required by pytest-asyncio for session-scoped async fixtures
    return asyncio.get_event_loop_policy()


@pytest.fixture(scope='session', autouse=True)
def setup_test_environment_and_flags():
    """
    Set up test-specific environment variables and ABSL flags ONCE per test session.
    This runs before the 'app' fixture due to autouse=True.
    """
    # 1. Set environment variables needed by configure_gcp_environment()
    os.environ['GOOGLE_CLOUD_PROJECT'] = os.getenv(
        'TEST_GOOGLE_CLOUD_PROJECT', 'test-gcp-project-conftest'
    )
    os.environ['GOOGLE_CLOUD_LOCATION'] = os.getenv(
        'TEST_GOOGLE_CLOUD_LOCATION', 'test-gcp-location-conftest'
    )
    # Optionally load a specific .env.test if you have one and it's not handled by load_dotenv() in app
    # from dotenv import load_dotenv
    # load_dotenv(dotenv_path=".env.test", override=True)

    # 2. Set ABSL flag default values for tests.
    f = flags.FLAGS

    # Ensure flags are defined before setting them (they are defined in src/config.py)
    # If flags might be parsed by module import, unparsing first can help reset.
    # However, directly setting values if they exist is usually fine.
    try:
        # Check if already parsed, to avoid errors if re-setting defaults in some pytest setups.
        # A simple way to handle this is to just set the values.
        # If a flag is already parsed, setting its value directly is the way.
        # If it's not parsed, f.name = value works like f.set_default (if flag already defined by DEFINE_string etc).
        f.host = '127.0.0.1'  # Test server host
        f.port = 8080  # Test server port
        f.frontend_url = 'http://testhost:9000'  # Test frontend URL for CORS
        f.log_level = 'WARNING'  # Reduce log noise during tests; use DEBUG for verbose troubleshooting
        f.api_title = 'Test Agent API (Pytest)'
        f.api_description = 'API under test by pytest'
        f.api_version = '1.0.test'
        f.gemini_model = 'test-gemini-model-version'
        # Add any other flags your application uses from src/config.py
    except flags.FlagsError as e:
        print(f'Warning: Error setting flag value during test setup in conftest: {e}')
        # This might happen if a flag isn't defined, which shouldn't be the case if src/config.py is imported.

    # 3. Ensure flags are parsed before the app uses them if not already parsed.
    if not f.is_parsed():
        try:
            # Pass only the program name (pytest execution) to avoid parsing pytest args as app flags
            f([sys.argv[0]])
        except flags.FlagsError as e:
            # It's possible flags were parsed by an import somewhere else.
            # If the error is about flags already being parsed, that's okay.
            if 'flags were parsed' not in str(e).lower():
                print(f'Warning: Flags parsing issue in conftest setup: {e}')
    yield


@pytest.fixture(scope='session')
def mock_static_files_dir():
    """Creates a temporary directory for static files testing."""
    with tempfile.TemporaryDirectory(prefix='test_static_') as temp_dir:
        # Create the temp directory first
        os.makedirs(temp_dir, exist_ok=True)

        # Create a dummy index.html for testing
        index_path = os.path.join(temp_dir, 'index.html')
        with open(index_path, 'w') as f:
            f.write('<html><body>Test Frontend</body></html>')

        # Patch the STATIC_FILES_DIR in app.py
        with patch.object(Path, 'parent', return_value=Path(temp_dir).parent):
            yield temp_dir


@pytest.fixture(scope='session')
def app(setup_test_environment_and_flags, mock_static_files_dir) -> FastAPI:
    """
    Create a FastAPI application instance for the test session.
    Depends on setup_test_environment_and_flags and mock_static_files_dir.
    """
    # create_app() will use the flags and env vars set by setup_test_environment_and_flags
    # and the patched STATIC_FILES_DIR from mock_static_files_dir.
    _app = create_app()
    return _app


@pytest.fixture(scope='function')
def client(app: FastAPI) -> Generator[TestClient, None, None]:
    """
    Create a TestClient instance for making HTTP requests to the app.
    Function-scoped for better test isolation.
    """
    with TestClient(app) as c:
        yield c


# --- Common Mock Fixtures ---


@pytest.fixture
def test_agent_config() -> AgentConfig:
    """Provides a standard AgentConfig for tests, can be overridden by specific tests if needed."""
    # This can use values from flags if desired, or fixed test values.
    # get_agent_config in dependencies.py reads from settings (which come from flags).
    # For direct use in tests where we pass AgentConfig, we can define one.
    return AgentConfig(app_name='conftest_test_app', user_id='conftest_test_user')


@pytest.fixture
def mock_adk_session_service() -> InMemorySessionService:
    """
    Provides a mock ADK session service.
    Using the real InMemorySessionService for simplicity here, as its state is in-memory.
    If more control is needed (e.g., asserting calls without actual logic), use AsyncMock.
    """
    return (
        InMemorySessionService()
    )  # Or your detailed MockADKSessionService if preferred


@pytest.fixture
def mock_adk_runner(
    mock_adk_session_service: InMemorySessionService,  # Use the simpler fixture for consistency
    test_agent_config: AgentConfig,
) -> AsyncMock:  # Return an AsyncMock for more control over run_async
    """
    Provides a mock ADK runner.
    Using AsyncMock to easily define the behavior of run_async.
    """
    runner = AsyncMock(spec=Runner)  # Use spec for type safety

    # Default behavior for run_async (can be overridden in tests)
    async def default_run_async_behavior(*args, **kwargs):
        # Simulate yielding a simple final response
        yield Event(
            author=root_agent.name,  # Or a mocked agent name
            content=genai_types.Content(
                parts=[genai_types.Part(text='Default mock runner response')]
            ),
            actions=EventActions(
                finish_agent_turn=True
            ),  # Example to make it a final response
        )

    runner.run_async = default_run_async_behavior
    return runner
