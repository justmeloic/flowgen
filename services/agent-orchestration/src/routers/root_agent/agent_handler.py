# src/routers/agent_handler.py
import logging
import time
import uuid
from typing import Any, Dict

from fastapi import HTTPException, Request
from google.adk.events import Event, EventActions
from google.adk.runners import Runner
from google.adk.sessions import Session
from google.genai import (
    types as genai_types,
)  # Renamed to avoid conflict with 'types' module

# External package modules
from src.agents.agent import root_agent
from src.utils.formatters import format_text_response

# Internal modules
from .datamodels import AgentConfig, Query

logger = logging.getLogger(__name__)


async def process_agent_query(
    request: Request,  # For session_service and app_state
    query: Query,
    config: AgentConfig,
    session: Session,
    runner: Runner,
) -> Dict[str, Any]:
    """Handles the interaction with the agent for a given query."""
    try:
        session_service = (
            request.app.state.session_service
        )  # Get session service from app state

        user_content = genai_types.Content(
            role='user', parts=[genai_types.Part(text=query.text)]
        )
        user_event = Event(
            author=root_agent.name,
            content=user_content,
            timestamp=time.time(),
            actions=EventActions(
                state_delta={
                    'last_query': query.text,
                    'last_query_ts': time.time(),
                    'query_count': session.state.get('query_count', 0) + 1,
                }
            ),
            invocation_id=str(uuid.uuid4()),
        )
        await session_service.append_event(session, user_event)

        final_response_text = 'Agent did not produce a final response.'
        references_json = {}

        if not session:  # Should be guaranteed by get_or_create_session dependency
            raise HTTPException(
                status_code=500, detail='Failed to load or create session (handler)'
            )

        logger.info(
            f"Running agent for session '{request.state.actual_session_id}' with query: '{query.text[:100]}...'"
        )

        async for event in runner.run_async(
            user_id=config.user_id,
            session_id=request.state.actual_session_id,
            new_message=user_content,
        ):
            await session_service.append_event(session, event)

            if event.is_final_response():
                if event.content and event.content.parts:
                    response_text = event.content.parts[0].text
                    final_response_text, references_json = format_text_response(
                        response_text=response_text, request=request
                    )

                    state_changes = {
                        'last_response': final_response_text,
                        'last_interaction_ts': time.time(),
                        # Query count already updated with user_event, or update here if preferred
                    }
                    state_update_event = Event(
                        author=root_agent.name,
                        actions=EventActions(state_delta=state_changes),
                        timestamp=time.time(),
                        invocation_id=str(uuid.uuid4()),
                    )
                    await session_service.append_event(session, state_update_event)

        logger.info(
            f"Successfully processed agent query for session '{request.state.actual_session_id}'. Response: '{final_response_text[:100]}...'"
        )
        return {'response': final_response_text, 'references': references_json}

    except Exception as e:
        logger.exception(
            f'Error processing agent query for session {getattr(request.state, "actual_session_id", "UNKNOWN")}: {str(e)}'
        )
        # Consider specific error types for more granular HTTPExceptions
        raise HTTPException(
            status_code=500,
            detail={'message': 'Error processing agent query', 'error': str(e)},
        )
