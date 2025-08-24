# Copyright 2025 Loïc Muhirwa
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

"""Callbacks for AI agent lifecycle events."""

import json
from typing import Any, Dict, Optional

from google.adk.agents.callback_context import CallbackContext
from google.adk.models.llm_response import LlmResponse
from google.adk.tools.base_tool import BaseTool
from google.adk.tools.tool_context import ToolContext
from google.genai.types import Content, Part
from loguru import logger as _logger


def store_tool_result_callback(
    tool: BaseTool,
    args: Dict[str, Any],
    tool_context: ToolContext,
    tool_response: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Stores the raw response from tools in the agent state."""
    try:
        if tool.name == 'generate_architecture_diagram':
            tool_context.state['architecture_diagram_tool_raw_output'] = tool_response
            _logger.info(
                '[store_tool_result_callback] Stored response for tool %s',
                tool.name,
            )
        return None
    except Exception as e:
        _logger.error('Error in store_tool_result_callback: %s', e)
        return None


def before_model_callback(
    callback_context: CallbackContext, llm_request: Any
) -> Optional[LlmResponse]:
    """Intercepts diagram generation requests and returns direct response."""
    try:
        # Check if we have a stored diagram generation result
        diagram_tool_raw_output = callback_context.state.get(
            'architecture_diagram_tool_raw_output'
        )

        if diagram_tool_raw_output:
            # Clear the state to prevent reuse in subsequent turns
            callback_context.state['architecture_diagram_tool_raw_output'] = None

            # Extract the description from the diagram tool output
            description = diagram_tool_raw_output.get(
                'description', 'Architecture diagram generated'
            )

            # Create the response text with the diagram data
            diagram_data_text = json.dumps(diagram_tool_raw_output)
            final_text = f'{description}<START_OF_DIAGRAM_DATA>{diagram_data_text}'

            _logger.info(
                'Before model callback: Intercepting with diagram response '
                f'for description: {description}'
            )

            # Return an LlmResponse to skip the actual LLM call
            return LlmResponse(
                content=Content(role='model', parts=[Part(text=final_text)])
            )

        # Return None to allow normal LLM processing
        return None

    except Exception as e:
        _logger.error('Error in before_model_callback: %s', e)
        return None
