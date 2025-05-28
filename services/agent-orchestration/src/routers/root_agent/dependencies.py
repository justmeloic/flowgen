import logging
import time
import uuid
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException, Request, Response
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session

# External package modules
from src.agents.agent import root_agent
from src.config.api import get_settings

# Internal modules
from .datamodels import AgentConfig

logger = logging.getLogger(__name__)


@lru_cache
def get_agent_config() -> AgentConfig:
    """Get agent configuration with caching."""
    settings = get_settings()
    return AgentConfig(
        app_name=settings.get('app_name', 'agent_app'),
        user_id=settings.get('user_id', 'default_user'),
    )


def get_session_service(request: Request) -> InMemorySessionService:
    """Dependency for session service."""
    return request.app.state.session_service


async def get_or_create_session(
    request: Request,
    response: Response,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
) -> Session:
    """Gets or creates a session and ensures proper header handling."""
    candidate_session_id = request.state.candidate_session_id
    logger.info(f'Processing request with session ID: {candidate_session_id}')

    session = None
    if candidate_session_id:
        try:
            # Try to get existing session with specific parameters
            session = await request.app.state.session_service.get_session(
                app_name=config.app_name,
                user_id=config.user_id,
                session_id=candidate_session_id,
            )
            logger.info(f'Found existing session: {session.id}')
        except Exception as e:
            logger.error(f'Session retrieval error: {e}')
            logger.info(f'Session not found: {candidate_session_id}')
            session = None

    if not session:
        # Create new session with specific initial state
        session_id = candidate_session_id or str(uuid.uuid4())
        logger.info(f'Creating new session with ID: {session_id}')
        initial_state = {
            'app_name': config.app_name,
            'user_id': config.user_id,
            'created_at': time.time(),
            'query_count': 0,
        }
        session = await request.app.state.session_service.create_session(
            app_name=config.app_name,
            user_id=config.user_id,
            session_id=session_id,
            state=initial_state,
        )

    # Always set both request state and response headers
    request.state.actual_session_id = session.id
    response.headers['X-Session-ID'] = session.id
    response.headers['Access-Control-Expose-Headers'] = 'X-Session-ID'
    logger.info(f'Using session ID: {session.id}')

    return session


def get_runner(
    request: Request,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
) -> Runner:
    """Get or create the singleton runner instance."""
    if not hasattr(request.app.state, 'runner'):
        try:
            request.app.state.runner = Runner(
                agent=root_agent,
                app_name=config.app_name,
                session_service=request.app.state.session_service,
            )
            logger.info('Created new Runner instance')
        except Exception as e:
            logger.error(f'Failed to create runner: {str(e)}')
            raise HTTPException(
                status_code=500,
                detail={
                    'message': 'Failed to initialize agent runner',
                    'error': str(e),
                },
            )
    return request.app.state.runner
