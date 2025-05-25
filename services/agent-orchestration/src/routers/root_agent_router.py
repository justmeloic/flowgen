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

import logging
from typing import Dict, Any, Annotated

from fastapi import APIRouter, Depends, Request
from google.adk.runners import Runner  # For type hinting
from google.adk.sessions import Session  # For type hinting

# Modular imports
from routers.datamodels import Query, AgentConfig
from routers.dependencies import get_agent_config, get_or_create_session, get_runner
from routers.agent_handler import process_agent_query


from typing import Dict, Any, Annotated
import os
import logging
import uuid
from datetime import datetime, UTC
from pydantic import BaseModel, Field, field_validator
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from utils.formatters import format_text_response

# Removed Header from fastapi imports as it's not directly used as a dependency type
# from fastapi.responses import JSONResponse # Not explicitly used
from google.adk.sessions import InMemorySessionService, Session
from google.adk.events import Event, EventActions
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request  # Import Request from starlette.requests
from starlette.responses import Response

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

router = APIRouter(
    prefix="/root_agent",
    tags=["root_agent"],
)


@router.post("/", response_model=Dict[str, Any])
async def agent_endpoint(
    request: Request,
    query: Query,  # Validated request body
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session: Annotated[Session, Depends(get_or_create_session)],
    runner: Annotated[Runner, Depends(get_runner)],
) -> Dict[str, Any]:
    """
    Endpoint to process user queries via the root agent.
    Delegates core logic to the agent_handler.
    """
    logger.info(f"Received query for root_agent: {query.text[:50]}...")
    return await process_agent_query(
        request=request,
        query=query,
        config=config,
        session=session,
        runner=runner,
    )
