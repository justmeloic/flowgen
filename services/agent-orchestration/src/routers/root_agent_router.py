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

"""
Root Agent Router Module

This module handles the routing and execution of the root agent's conversation endpoints.
It manages session state purely through ADK's SessionService and handles agent
interactions through FastAPI endpoints.
"""

from typing import Dict, Any, Annotated, Optional
import os
import json
import logging
import uuid
from datetime import datetime, UTC
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Request, Response, FastAPI

# Removed Header from fastapi imports as it's not directly used as a dependency type
# from fastapi.responses import JSONResponse # Not explicitly used
from google.adk.sessions import InMemorySessionService, Session

try:
    from google.adk.sessions import SessionNotFoundError
except ImportError:
    logging.warning(
        "google.adk.sessions.SessionNotFoundError not found, using general Exception for session retrieval errors."
    )
    SessionNotFoundError = Exception  # type: ignore

from google.adk.runners import Runner
from google.genai import types  # Assuming types is correctly imported
from functools import lru_cache
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
# from starlette.types import Message # Message was not used

# Assuming these are local project imports - replace with actual paths if necessary
from agents.agent import root_agent  # type: ignore
from config import get_settings  # type: ignore

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configure Google Cloud environment
try:
    os.environ["GOOGLE_CLOUD_PROJECT"] = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    os.environ["GOOGLE_CLOUD_LOCATION"] = os.getenv("GOOGLE_CLOUD_LOCATION", "")
    if not all(
        [os.environ["GOOGLE_CLOUD_PROJECT"], os.environ["GOOGLE_CLOUD_LOCATION"]]
    ):
        # Kept original behavior of raising an error.
        # If local testing without these is desired, change to logger.warning.
        raise ValueError(
            "Missing required Google Cloud environment variables: GOOGLE_CLOUD_PROJECT and/or GOOGLE_CLOUD_LOCATION"
        )
except Exception as e:
    logger.error(f"Environment configuration error: {str(e)}")
    raise


# Request model
class Query(BaseModel):
    """Query model for agent requests."""

    text: str = Field(..., min_length=1)

    @field_validator("text")
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        """Validate that text is not empty or just whitespace."""
        if not v.strip():
            raise ValueError("Text must not be empty or just whitespace")
        return v.strip()


class AgentConfig(BaseModel):
    """Configuration for agent services."""

    app_name: str = Field(default="agent_app")
    user_id: str = Field(default="default_user")


class SessionMiddleware(BaseHTTPMiddleware):
    """Middleware to manage session IDs."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # Get candidate session ID from header
        candidate_session_id = request.headers.get("X-Session-ID")

        # If no session ID provided, generate a new one
        if not candidate_session_id:
            candidate_session_id = str(uuid.uuid4())
            logger.info(f"Generated new session ID: {candidate_session_id}")
        else:
            logger.info(f"Using existing session ID: {candidate_session_id}")

        # Store the session ID on the request state
        request.state.candidate_session_id = candidate_session_id

        # Call next middleware/route handler
        response = await call_next(request)

        # Ensure session ID is in response headers
        actual_session_id = getattr(
            request.state, "actual_session_id", candidate_session_id
        )
        response.headers["X-Session-ID"] = actual_session_id

        # Explicitly set CORS headers for the session ID
        response.headers["Access-Control-Expose-Headers"] = "X-Session-ID"

        logger.info(f"Set session ID in response headers: {actual_session_id}")
        return response


@lru_cache
def get_agent_config() -> AgentConfig:
    """Get agent configuration with caching."""
    settings = get_settings()
    return AgentConfig(
        app_name=settings.get("app_name", "agent_app"),
        user_id=settings.get("user_id", "default_user"),
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
    logger.info(f"Processing request with session ID: {candidate_session_id}")

    session = None
    if candidate_session_id:
        try:
            # Try to get existing session with specific parameters
            session = await request.app.state.session_service.get_session(
                app_name=config.app_name,
                user_id=config.user_id,
                session_id=candidate_session_id,
            )
            logger.info(f"Found existing session: {session.id}")
        except SessionNotFoundError:
            logger.info(f"Session not found: {candidate_session_id}")
            session = None

    if not session:
        # Create new session with specific initial state
        session_id = candidate_session_id or str(uuid.uuid4())
        logger.info(f"Creating new session with ID: {session_id}")
        initial_state = {
            "app_name": config.app_name,
            "user_id": config.user_id,
            "created_at": time.time(),
            "query_count": 0,
        }
        session = await request.app.state.session_service.create_session(
            app_name=config.app_name,
            user_id=config.user_id,
            session_id=session_id,
            state=initial_state,
        )

    # Always set both request state and response headers
    request.state.actual_session_id = session.id
    response.headers["X-Session-ID"] = session.id
    response.headers["Access-Control-Expose-Headers"] = "X-Session-ID"
    logger.info(f"Using session ID: {session.id}")

    return session


def get_runner(
    request: Request,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
) -> Runner:
    """Get or create the singleton runner instance."""
    if not hasattr(request.app.state, "runner"):
        try:
            request.app.state.runner = Runner(
                agent=root_agent,
                app_name=config.app_name,
                session_service=request.app.state.session_service,
            )
            logger.info("Created new Runner instance")
        except Exception as e:
            logger.error(f"Failed to create runner: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail={
                    "message": "Failed to initialize agent runner",
                    "error": str(e),
                },
            )
    return request.app.state.runner


router = APIRouter(
    prefix="/root_agent",
    tags=["root_agent"],
)


from google.adk.events import Event, EventActions
import time


@router.post("/", response_model=Dict[str, Any])
async def agent_endpoint(
    request: Request,
    query: Query,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session: Annotated[Session, Depends(get_or_create_session)],
    runner: Annotated[Runner, Depends(get_runner)],
) -> Dict[str, Any]:
    """Process user queries through the agent."""
    try:
        # Create user message event with state tracking
        user_content = types.Content(role="user", parts=[types.Part(text=query.text)])
        user_event = Event(
            author="user",
            content=user_content,
            timestamp=time.time(),
            actions=EventActions(
                state_delta={
                    "last_query": query.text,
                    "last_query_ts": time.time(),
                    "query_count": session.state.get("query_count", 0) + 1,
                }
            ),
            invocation_id=str(uuid.uuid4()),
        )
        await request.app.state.session_service.append_event(session, user_event)

        final_response_text = "Agent did not produce a final response."
        references_json = {}

        # Ensure session is properly loaded before running
        if not session:
            raise HTTPException(
                status_code=500, detail="Failed to load or create session"
            )

        logger.info(
            f"Running agent for session '{request.state.actual_session_id}' with query: '{query.text[:100]}...'"
        )

        async for event in runner.run_async(
            user_id=config.user_id,
            session_id=request.state.actual_session_id,
            new_message=user_content,
        ):
            # For each event from the runner, append it to maintain state
            await request.app.state.session_service.append_event(session, event)

            if event.is_final_response():
                if event.content and event.content.parts:
                    response_text = event.content.parts[0].text
                    if "<START_OF_REFERENCE_DOCUMENTS>" in response_text:
                        parts = response_text.split("<START_OF_REFERENCE_DOCUMENTS>", 1)
                        final_response_text = parts[0].strip()
                        if len(parts) > 1:
                            references_text = parts[1].strip()
                            try:
                                references_list = json.loads(references_text)
                                references_json = {
                                    str(i + 1): {
                                        "title": ref.get("title", ""),
                                        "link": ref.get("link", ""),
                                        "text": ref.get("text", ""),
                                    }
                                    for i, ref in enumerate(references_list)
                                    if isinstance(ref, dict)
                                }
                            except json.JSONDecodeError as e:
                                logger.error(
                                    f"Failed to parse references JSON for session {request.state.actual_session_id}: {str(e)}\nContent: {references_text[:200]}"
                                )
                                references_json = {}
                        else:
                            references_json = {}
                    else:
                        final_response_text = response_text.strip()
                        references_json = {}

                    # Create a state update event for the final response
                    state_changes = {
                        "last_response": final_response_text,
                        "last_interaction_ts": time.time(),
                        f"user:{config.user_id}:query_count": session.state.get(
                            f"user:{config.user_id}:query_count", 0
                        )
                        + 1,
                    }

                    state_update_event = Event(
                        author="system",
                        actions=EventActions(state_delta=state_changes),
                        timestamp=time.time(),
                        invocation_id=str(uuid.uuid4()),
                    )
                    await request.app.state.session_service.append_event(
                        session, state_update_event
                    )

        logger.info(
            f"Successfully processed agent query for session '{request.state.actual_session_id}'. Response: '{final_response_text[:100]}...'"
        )
        return {"response": final_response_text, "references": references_json}

    except Exception as e:
        logger.exception(
            f"Error processing agent query for session {request.state.actual_session_id}: {str(e)}"
        )
        raise HTTPException(
            status_code=500,
            detail={"message": "Error processing agent query", "error": str(e)},
        )
