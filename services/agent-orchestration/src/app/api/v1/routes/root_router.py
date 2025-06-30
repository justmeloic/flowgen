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
"""Root Agent Router Module.

This module handles the routing and execution of the root agent's conversation
endpoints. It manages session state purely through ADK's SessionService and
handles agent interactions through FastAPI endpoints.
"""

from __future__ import annotations

# Standard library imports
import logging
from typing import Annotated

# Third-party imports
from fastapi import APIRouter, Depends, Request
from google.adk.runners import Runner
from google.adk.sessions import Session

# Application-specific imports
from src.app.models import AgentConfig
from src.app.schemas import AgentResponse, Query
from src.app.services.agent_service import agent_service
from src.app.utils.dependencies import (
    get_agent_config,
    get_or_create_session,
    get_runner,
)

_logger = logging.getLogger(__name__)

router = APIRouter(
    tags=['root_agent'],
)


@router.post('/', response_model=AgentResponse)
async def agent_endpoint(
    request: Request,
    query: Query,
    config: Annotated[AgentConfig, Depends(get_agent_config)],
    session: Annotated[Session, Depends(get_or_create_session)],
    runner: Annotated[Runner, Depends(get_runner)],
) -> AgentResponse:
    """Processes a user query via the root agent.

    Args:
        request: The incoming FastAPI request object.
        query: The validated request body containing the user's query text.
        config: The agent configuration, injected as a dependency.
        session: The user's session, created or retrieved as a dependency.
        runner: The ADK runner instance, injected as a dependency.

    Returns:
        An AgentResponse object containing the agent's response and metadata.
    """
    _logger.info('Received query for root_agent: %s...', query.text[:50])
    return await agent_service.process_query(
        request=request,
        query=query,
        config=config,
        session=session,
        runner=runner,
    )
