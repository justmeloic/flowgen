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
"""Defines the root agent for the application.

This module configures and instantiates the primary agent responsible for
coordinating responses to user queries about Collective Bargaining Agreements
(CBAs). It includes callback functions to process data before and after
interacting with the LLM.
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
from src.agents.prompts import (
    return_global_instructions,
    return_root_agent_instructions,
)
from src.agents.tools import search_cba_datastore, store_tool_result_callback

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


root_agent = Agent(
    name='root_agent',
    model=os.getenv('GEMINI_MODEL'),
    description=(
        'An agent that answers CN employee questions about their Collective '
        'Bargaining Agreements (CBAs). It gathers user context, searches '
        'internal documents, and provides accurate, evidence-based responses.'
    ),
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    output_key='last_agent_response',
    tools=[search_cba_datastore],
    after_tool_callback=store_tool_result_callback,
    before_model_callback=before_model_callback,
)
