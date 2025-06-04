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
"""Defines the specialized search agent for CBA document retrieval.

This agent is responsible for taking search queries, interacting with the
CBA datastore via the search tool, and formatting the results for the
supervisor agent.
"""

from __future__ import annotations

# Standard library imports
import json
import logging
import os
import traceback
from typing import Any, Optional

# Third-party imports
from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmRequest, LlmResponse
from google.genai.types import Content, Part

# Application-specific imports
# Note: This agent reuses the tools and callbacks defined at the higher agents level.
from src.agents.tools import search_cba_datastore, store_tool_result_callback
from src.agents.sub_agents.search_agent.prompts import (
    return_search_agent_instructions,
)

_logger = logging.getLogger(__name__)


def before_model_callback(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmResponse]:
    """Injects raw tool output into the final response content.

    This callback checks the agent's state for raw tool output. If found,
    it formats this data into a structured string and returns it as an
    LlmResponse, bypassing the normal model call. This is used to pipe
    reference documents directly to the formatter.

    Args:
        callback_context: The context for the current agent callback.
        llm_request: The request that would be sent to the LLM.

    Returns:
        An LlmResponse containing the formatted tool output, or None to
        continue with the normal execution flow.
    """
    try:
        search_cba_datastore_tool_raw_output = callback_context.state.get(
            'search_cba_datastore_tool_raw_output'
        )
        if not search_cba_datastore_tool_raw_output:
            return None

        # Clear the state to prevent reuse in subsequent turns.
        callback_context.state['search_cba_datastore_tool_raw_output'] = None

        documents = search_cba_datastore_tool_raw_output.get('documents', [])
        summary = search_cba_datastore_tool_raw_output.get('summary', '')
        documents_text = json.dumps(documents)

        # Combine summary and references using a special token for later parsing.
        final_text = f'{summary}<START_OF_REFERENCE_DOCUMENTS>{documents_text}'
        content_with_references = Content(parts=[Part(text=final_text)])

        return LlmResponse(content=content_with_references)

    except Exception as e:
        _logger.error('Error in before_model_callback: %s', e)
        _logger.error(traceback.format_exc())
        return None


search_agent = Agent(
    name='search_agent',
    model=os.getenv(
        'GEMINI_MODEL', 'gemini-1.5-flash'
    ),  # Original was gemini-2.0-flash, using model from main agent
    description=(
        "Specialized agent that searches through CN's CBA documents using "
        'Vertex AI Search. Processes search queries and returns relevant '
        'information to the supervisor agent. Formats search results with '
        'summaries and document references for easy consumption by the '
        'supervisor agent.'
    ),
    instruction=return_search_agent_instructions(),
    tools=[search_cba_datastore],
    after_tool_callback=store_tool_result_callback,
    before_model_callback=before_model_callback,
)
