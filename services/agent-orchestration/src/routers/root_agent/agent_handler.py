# Copyright 2025 Google LLC
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
"""Core logic handler for processing queries via the root agent.

This module orchestrates the interaction with the ADK runner,
processes events, and formats the final response.
"""

from __future__ import annotations

# Standard library imports
import logging
import time
import uuid
from typing import Any

# Third-party imports
from fastapi import HTTPException, Request
from google.adk.events import Event, EventActions
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService, Session
from google.genai import types as genai_types

# Application-specific imports
from src.agents.agent import root_agent
from src.routers.root_agent.datamodels import AgentConfig, Query
from src.utils.formatters import format_text_response

_logger = logging.getLogger(__name__)


async def _create_and_log_user_event(
    session_service: InMemorySessionService, session: Session, query_text: str
) -> genai_types.Content:
    """Creates the user event, appends it to the session, and returns the content."""
    user_content = genai_types.Content(
        role='user', parts=[genai_types.Part(text=query_text)]
    )
    user_event = Event(
        author=root_agent.name,
        content=user_content,
        timestamp=time.time(),
        actions=EventActions(
            state_delta={
                'last_query': query_text,
                'last_query_ts': time.time(),
                'query_count': session.state.get('query_count', 0) + 1,
            }
        ),
        invocation_id=str(uuid.uuid4()),
    )
    await session_service.append_event(session, user_event)
    return user_content


async def _process_agent_events(
    request: Request,
    session_service: InMemorySessionService,
    runner: Runner,
    session: Session,
    config: AgentConfig,
    user_content: genai_types.Content,
) -> tuple[str, dict]:
    """Runs the agent and processes the resulting event stream."""
    final_response_text = 'Agent did not produce a final response.'
    references_json = {}

    async for event in runner.run_async(
        user_id=config.user_id,
        session_id=session.id,
        new_message=user_content,
    ):
        await session_service.append_event(session, event)

        if event.is_final_response() and event.content and event.content.parts:
            response_text = event.content.parts[0].text
            final_response_text, references_json = format_text_response(
                response_text=response_text, request=request
            )

            state_changes = {
                'last_response': final_response_text,
                'last_interaction_ts': time.time(),
            }
            state_update_event = Event(
                author=root_agent.name,
                actions=EventActions(state_delta=state_changes),
                timestamp=time.time(),
                invocation_id=str(uuid.uuid4()),
            )
            await session_service.append_event(session, state_update_event)

    return final_response_text, references_json


async def process_agent_query(
    request: Request,
    query: Query,
    config: AgentConfig,
    session: Session,
    runner: Runner,
) -> dict[str, Any]:
    """Handles the full lifecycle of an interaction with the agent.

    Args:
        request: The incoming FastAPI request object.
        query: The user's query.
        config: The agent configuration.
        session: The active user session.
        runner: The ADK runner instance.

    Raises:
        HTTPException: If an unexpected error occurs during processing.

    Returns:
        A dictionary containing the final response and any references.
    """
    session_id = getattr(request.state, 'actual_session_id', 'UNKNOWN')
    try:
        session_service = request.app.state.session_service
        _logger.info(
            "Running agent for session '%s' with query: '%s...'",
            session_id,
            query.text[:100],
        )

        user_content = await _create_and_log_user_event(
            session_service, session, query.text
        )

        final_response_text, references_json = await _process_agent_events(
            request, session_service, runner, session, config, user_content
        )

        _logger.info(
            "Successfully processed query for session '%s'. Response: '%s...'",
            session_id,
            final_response_text[:100],
        )
        return {'response': final_response_text, 'references': references_json}

    except Exception as e:
        _logger.exception(
            "Error processing agent query for session '%s': %s", session_id, e
        )
        raise HTTPException(
            status_code=500,
            detail={'message': 'Error processing agent query', 'error': str(e)},
        )
