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
Search Agent Module

This module defines the search agent that handles CBA document searches.
"""

from datetime import date

from google.adk.agents import Agent
from google.genai.types import Content, Part
from .prompts import return_search_agent_instructions
from .tools import search_cba_datastore
from .tools import store_tool_result_callback
import json

date_today = date.today()

# Standard library imports
from typing import Optional
import traceback

# Third-party imports
from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmResponse, LlmRequest


def before_model_callback(
    callback_context: CallbackContext, llm_request: LlmRequest
) -> Optional[LlmRequest]:
    """Format LLM response and include raw tool results in markdown."""
    try:
        if "search_cba_datastore_tool_raw_output" not in callback_context.state:
            return None
        
        if not callback_context.state["search_cba_datastore_tool_raw_output"]:
            return None
        
        search_cba_datastore_tool_raw_output = callback_context.state.get("search_cba_datastore_tool_raw_output")
        documents = search_cba_datastore_tool_raw_output.get("documents", [])
        summary = search_cba_datastore_tool_raw_output.get("summary", "")
        
        documents_text = json.dumps(documents)
        content_with_references = Content(parts=[Part(text=f"{summary}<START_OF_REFERENCE_DOCUMENTS>{documents_text}")])
        return LlmResponse(content=content_with_references)

    except Exception as e:
        print(f"ERROR : {str(e)}")
        print(traceback.format_exc())
        return None



search_agent = Agent(
    name="search_agent",
    model="gemini-2.0-flash",
    description="Specialized agent that searches through CN's CBA documents using Vertex AI Search. Processes search queries and returns relevant information to the supervisor agent. Formats search results with summaries and document references for easy consumption by the supervisor agent.",
    instruction=return_search_agent_instructions(),
    tools=[search_cba_datastore],
    after_tool_callback=store_tool_result_callback,
    before_model_callback=before_model_callback
)


