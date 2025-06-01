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
Root Agent Module

This module defines the root agent that coordinates CBA-related queries.
"""

# Standard library imports
import os
import json
import logging
import traceback
from datetime import date
from typing import Optional
from dotenv import load_dotenv
from google.adk.agents import Agent
from google.genai.types import Content, Part

# Internal modules
from .tools import search_cba_datastore, store_tool_result_callback
from .prompts import return_global_instructions, return_root_agent_instructions
from .sub_agents import search_agent

# Third-party imports
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmRequest, LlmResponse

load_dotenv()
date_today = date.today()

logger = logging.getLogger(__name__)


def before_model_callback(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmRequest]:
    """Format LLM response and include raw tool results in markdown."""
    try:
        if 'search_cba_datastore_tool_raw_output' not in callback_context.state:
            return None

        if not callback_context.state['search_cba_datastore_tool_raw_output']:
            return None

        search_cba_datastore_tool_raw_output = callback_context.state.get(
            'search_cba_datastore_tool_raw_output'
        )
        callback_context.state['search_cba_datastore_tool_raw_output'] = None
        documents = search_cba_datastore_tool_raw_output.get('documents', [])
        summary = search_cba_datastore_tool_raw_output.get('summary', '')

        documents_text = json.dumps(documents)
        content_with_references = Content(
            parts=[
                Part(text=f'{summary}<START_OF_REFERENCE_DOCUMENTS>{documents_text}')
            ]
        )
        return LlmResponse(content=content_with_references)

    except Exception as e:
        logger.error(f'Error in before_model_callback: {str(e)}')
        logger.error(traceback.format_exc())
        return None


root_agent = Agent(
    name='root_agent',
    model=os.getenv('GEMINI_MODEL', 'gemini-2.5-flash-preview-05-20'),
    description='An agent that answers CN employee questions about their Collective Bargaining Agreements (CBAs). It gathers user context, searches internal documents, and provides accurate, evidence-based responses.',
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    output_key='last_agent_response',
    tools=[search_cba_datastore],
    after_tool_callback=store_tool_result_callback,
    before_model_callback=before_model_callback,
)
