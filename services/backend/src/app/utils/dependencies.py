# Copyright 2025 Loïc Muhirwa
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Dependency injection module for the root agent router."""

from __future__ import annotations

import logging
import time
import uuid
from functools import lru_cache
from typing import Annotated

from fastapi import Depends, HTTPException, Request, Response
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session

from src.agents.agent import root_agent
from src.app.models import AgentConfig

_logger = logging.getLogger(__name__)


@lru_cache
def get_agent_config() -> AgentConfig:
    """Gets and caches the agent configuration from application settings.

    Returns:
        The agent configuration object.
    """
    return AgentConfig(
        app_name='agent_app',  # You can add this to settings if needed
        user_id='default_user',  # You can add this to settings if needed
    )


def get_session_service(request: Request) -> InMemorySessionService:
    """Gets the session service instance from the application state.

    Args:
        request: The incoming FastAPI request object.

    Returns:
        An instance of InMemorySessionService.
    """
    return request.app.state.session_service


async def get_or_create_session(
    request: Request,
    response: Response,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
) -> Session:
    """Gets an existing session or creates a new one.

    It retrieves the session ID from the request state (set by middleware),
    and ensures the final session ID is set in the response headers.

    Args:
        request: The incoming FastAPI request object.
        response: The outgoing FastAPI response object.
        config: The agent configuration.

    Returns:
        An active ADK session object.
    """
    session_service = get_session_service(request)
    candidate_session_id = request.state.candidate_session_id
    _logger.info('Processing request with session ID: %s', candidate_session_id)

    session = None
    if candidate_session_id:
        # get_session returns None if not found; it does not raise an exception.
        session = await session_service.get_session(
            app_name=config.app_name,
            user_id=config.user_id,
            session_id=candidate_session_id,
        )

    if session:
        _logger.info('Found existing session: %s', session.id)
    else:
        if candidate_session_id:
            _logger.info('Session not found, creating new: %s', candidate_session_id)
        session_id = candidate_session_id or str(uuid.uuid4())
        _logger.info('Creating new session with ID: %s', session_id)
        initial_state = {
            'app_name': config.app_name,
            'user_id': config.user_id,
            'created_at': time.time(),
            'query_count': 0,
        }
        session = await session_service.create_session(
            app_name=config.app_name,
            user_id=config.user_id,
            session_id=session_id,
            state=initial_state,
        )

    request.state.actual_session_id = session.id
    response.headers['X-Session-ID'] = session.id
    response.headers['Access-Control-Expose-Headers'] = 'X-Session-ID'
    _logger.info('Using session ID: %s', session.id)

    return session


def get_runner(
    request: Request,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
) -> Runner:
    """Gets or creates the singleton agent Runner instance.

    Args:
        request: The incoming FastAPI request object.
        config: The agent configuration.

    Raises:
        HTTPException: If the runner fails to initialize.

    Returns:
        The singleton Runner instance.
    """
    if not hasattr(request.app.state, 'runner'):
        try:
            request.app.state.runner = Runner(
                agent=root_agent,
                app_name=config.app_name,
                session_service=request.app.state.session_service,
            )
            _logger.info('Created new Runner instance')
        except Exception as e:
            _logger.error('Failed to create runner: %s', e)
            raise HTTPException(
                status_code=500,
                detail={
                    'message': 'Failed to initialize agent runner',
                    'error': str(e),
                },
            )
    return request.app.state.runner
