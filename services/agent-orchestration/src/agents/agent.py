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

This module defines the root agent that coordinates tariff-related queries.
"""

from datetime import date

from google.adk.agents import Agent
from google.genai.types import Content, Part
from .prompts import return_global_instructions, return_root_agent_instructions
from .tools import search_cba_datastore
from .tools import store_tool_result_callback
import json


date_today = date.today()

# Standard library imports
from typing import Optional
import traceback

# Third-party imports
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse


def after_model_callback(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    """Format LLM response and include raw tool results in markdown."""
    try:
        if not llm_response.content or not llm_response.content.parts:
            return None

        active_part = llm_response.content.parts[0]
        if active_part.function_call or llm_response.error_message:
            return None
        
        if "search_cba_datastore_tool_raw_output" not in callback_context.state:
            return None

        original_text = active_part.text if active_part.text else None
        search_cba_datastore_tool_raw_output = callback_context.state.get("search_cba_datastore_tool_raw_output")
        documents = search_cba_datastore_tool_raw_output.get("documents", [])
        summary = search_cba_datastore_tool_raw_output.get("summary", "")
        
        # Delete the search results from state after using them
        #callback_context.state["search_cba_datastore_tool_raw_output"] = None

        documents_text = json.dumps(documents)
        content_with_references = Content(parts=[Part(text=f"{summary}<START_OF_REFERENCE_DOCUMENTS>{documents_text}")])
        return LlmResponse(content=content_with_references)

    except Exception as e:
        print(f"ERROR : {str(e)}")
        print(traceback.format_exc())
        return None


root_agent = Agent(
    name="root_agent",
    model="gemini-2.0-flash",
    description="Supervisor agent that orchestrates CN's CBA query processing system. Coordinates between specialized sub-agents (Context, CBA Retrieval, Policy, and Jargon agents) to provide comprehensive answers about collective bargaining agreements, railway policies, and labor regulations. Manages user interactions, delegates tasks, and synthesizes information from multiple sources into coherent responses.",
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    tools=[search_cba_datastore],
    after_tool_callback=store_tool_result_callback,
    after_model_callback=after_model_callback
)


