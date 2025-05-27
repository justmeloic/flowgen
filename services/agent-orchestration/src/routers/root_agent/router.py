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
from typing import Annotated, Any, Dict

from fastapi import APIRouter, Depends, Request
from google.adk.runners import Runner  # For type hinting
from google.adk.sessions import Session  # For type hinting

# Internal modules
from .agent_handler import process_agent_query
from .datamodels import AgentConfig, Query
from .dependencies import get_agent_config, get_or_create_session, get_runner

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix='/root_agent',
    tags=['root_agent'],
)


@router.post('/', response_model=Dict[str, Any])
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
    logger.info(f'Received query for root_agent: {query.text[:50]}...')
    return await process_agent_query(
        request=request,
        query=query,
        config=config,
        session=session,
        runner=runner,
    )
