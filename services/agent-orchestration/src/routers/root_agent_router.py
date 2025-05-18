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
It manages session state and handles agent interactions through FastAPI endpoints.
"""

from typing import Dict, Any, Annotated, Optional
import os
import json
import logging
import uuid
from datetime import datetime, UTC
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Header, Request, Response
from fastapi.responses import JSONResponse
from google.adk.sessions import InMemorySessionService, Session
from google.adk.runners import Runner
from google.genai import types
from functools import lru_cache
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.types import Message

from agents.agent import root_agent
from config import get_settings

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
        raise ValueError("Missing required Google Cloud environment variables")
except Exception as e:
    logger.error(f"Environment configuration error: {str(e)}")
    raise


# Request model
class Query(BaseModel):
    """Query model for agent requests."""
    text: str = Field(..., min_length=1)

    @field_validator('text')
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        """Validate that text is not empty or just whitespace."""
        if not v.strip():
            raise ValueError('Text must not be empty or just whitespace')
        return v.strip()


class AgentConfig(BaseModel):
    """Configuration for agent services."""
    app_name: str = Field(default="agent_app")
    user_id: str = Field(default="default_user")


# Global session service to maintain state
_session_service = InMemorySessionService()
_sessions: Dict[str, Dict[str, Any]] = {}


class SessionMiddleware(BaseHTTPMiddleware):
    """Middleware to handle session management."""
    
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        session_id = request.headers.get("X-Session-ID", str(uuid.uuid4()))
        request.state.session_id = session_id
        
        response = await call_next(request)
        
        # Add session ID to response headers
        response.headers["X-Session-ID"] = session_id
        return response


@lru_cache
def get_agent_config() -> AgentConfig:
    """Get agent configuration with caching."""
    settings = get_settings()
    return AgentConfig(
        app_name=settings.get("app_name", "agent_app"),
        user_id=settings.get("user_id", "default_user")
    )


def get_session_service() -> InMemorySessionService:
    """Dependency for session service."""
    return _session_service


async def get_or_create_session(
    request: Request,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session_service: Annotated[InMemorySessionService, Depends(get_session_service)]
) -> Session:
    """Get existing session or create a new one."""
    try:
        session_id = request.state.session_id
        session_data = _sessions.get(session_id)
        
        if session_data and session_data.get("session"):
            logger.info(f"Using existing session: {session_id}")
            return session_data["session"]
        
        # Create new session
        session = session_service.create_session(
            app_name=config.app_name,
            user_id=config.user_id,
            session_id=session_id
        )
        
        _sessions[session_id] = {
            "session": session,
            "created_at": datetime.now(UTC),
            "last_used": datetime.now(UTC)
        }
        
        logger.info(f"Created new session: {session_id}")
        return session
        
    except Exception as e:
        logger.error(f"Failed to get/create session: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to initialize session",
                "error": str(e)
            }
        )


def get_runner(
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session_service: Annotated[InMemorySessionService, Depends(get_session_service)]
) -> Runner:
    """Dependency for runner."""
    try:
        return Runner(
            agent=root_agent,
            app_name=config.app_name,
            session_service=session_service,
        )
    except Exception as e:
        logger.error(f"Failed to create runner: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to initialize agent runner",
                "error": str(e)
            }
        )


# Define router with prefix and tags
router = APIRouter(
    prefix="/root_agent",
    tags=["root_agent"],
)


@router.post("/", response_model=Dict[str, Any])
async def agent_endpoint(
    request: Request,
    response: Response,
    query: Query,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session: Annotated[Session, Depends(get_or_create_session)],
    runner: Annotated[Runner, Depends(get_runner)]
) -> Dict[str, Any]:
    """
    Process user queries through the agent.

    Args:
        request (Request): FastAPI request object.
        response (Response): FastAPI response object.
        query (Query): The user's query containing the text to process.
        config (AgentConfig): Agent configuration.
        session (Session): Current session.
        runner (Runner): Agent runner instance.

    Returns:
        Dict[str, Any]: A dictionary containing the agent's response and references.

    Raises:
        HTTPException: If there's an error processing the request.
    """
    try:
        # Update session last used time
        session_id = request.state.session_id
        if session_id in _sessions:
            _sessions[session_id]["last_used"] = datetime.now(UTC)

        content = types.Content(role="user", parts=[types.Part(text=query.text)])
        final_response_text = "Agent did not produce a final response."
        references_json = {}

        async for event in runner.run_async(
            user_id=config.user_id,
            session_id=session_id,
            new_message=content
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    response_text = event.content.parts[0].text
                    if "<START_OF_REFERENCE_DOCUMENTS>" in response_text:
                        final_response_text = response_text.split("<START_OF_REFERENCE_DOCUMENTS>")[0].strip()
                        references_text = response_text.split("<START_OF_REFERENCE_DOCUMENTS>")[1].strip()
                        try:
                            references_list = json.loads(references_text)
                            references_json = {
                                str(i + 1): {
                                    "title": ref.get("title", ""),
                                    "link": ref.get("link", ""),
                                    "text": ref.get("text", "")
                                }
                                for i, ref in enumerate(references_list)
                                if isinstance(ref, dict)
                            }
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse references JSON: {str(e)}")
                            references_json = {}
                    else:
                        final_response_text = response_text
                        references_json = {}

                elif event.actions and event.actions.escalate:
                    final_response_text = f"Agent escalated: {event.error_message or 'No specific message.'}"
                break

        logger.info(f"Successfully processed agent query for session {session_id}")
        return {
            "response": final_response_text,
            "references": references_json
        }

    except Exception as e:
        logger.error(f"Error processing agent query: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Error processing agent query",
                "error": str(e)
            }
        )
