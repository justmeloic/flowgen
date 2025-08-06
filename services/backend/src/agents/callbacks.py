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

"""Defines tools for the agent, including CBA datastore search.

This module provides the core tool for searching Collective Bargaining
Agreements (CBAs) using Google Cloud's Vertex AI Search. It also includes
a callback function to handle the results of tool calls.
"""

from __future__ import annotations

import json
import logging
import traceback
from typing import Any, Dict, Optional

from google.adk.agents.callback_context import CallbackContext
from google.adk.models import LlmRequest, LlmResponse

from google.adk.tools.base_tool import BaseTool
from google.adk.tools.tool_context import ToolContext
from google.genai.types import Content, Part
from loguru import logger as _logger

from src.app.utils.sse import sse_manager


def store_tool_result_callback(
    tool: BaseTool,
    args: Dict[str, Any],  # Using typing.Dict
    tool_context: ToolContext,
    tool_response: Dict[str, Any],  # Using typing.Dict
) -> Optional[Dict[str, Any]]:  # Using typing.Dict
    """Stores the raw response from the search tool in the agent state."""
    try:
        # Get session ID from context if available
        session_id = getattr(tool_context, 'session_id', None)

        # Send tool completion notification
        if session_id:
            import asyncio

            try:
                asyncio.create_task(
                    sse_manager.send_tool_complete(session_id, tool.name)
                )
            except Exception as e:
                _logger.warning(f'Could not send tool completion SSE: {e}')

        if tool.name == 'search_cba_datastore':
            tool_context.state['search_cba_datastore_tool_raw_output'] = tool_response
            _logger.info(
                '[store_tool_result_callback] Stored response for tool %s',
                tool.name,
            )
        elif tool.name == '_process_agreements_impl':
            tool_context.state['process_agreements_tool_raw_output'] = tool_response
            _logger.info(
                '[store_tool_result_callback] Stored response for tool %s',
                tool.name,
            )
        return None
    except Exception as e:
        _logger.error('Error in store_tool_result_callback: %s', e)
        _logger.error(traceback.format_exc())
        return None


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
        # Check for search tool output
        search_cba_datastore_tool_raw_output = callback_context.state.get(
            'search_cba_datastore_tool_raw_output'
        )
        if search_cba_datastore_tool_raw_output:
            # Clear the state to prevent reuse in subsequent turns.
            callback_context.state['search_cba_datastore_tool_raw_output'] = None

            documents = search_cba_datastore_tool_raw_output.get('documents', [])
            summary = search_cba_datastore_tool_raw_output.get('summary', '')
            documents_text = json.dumps(documents)

            # Combine summary and references using a special token for later parsing.
            final_text = f'{summary}<START_OF_REFERENCE_DOCUMENTS>{documents_text}'
            content_with_references = Content(parts=[Part(text=final_text)])

            return LlmResponse(content=content_with_references)

        # Check for process agreements tool output
        process_agreements_tool_raw_output = callback_context.state.get(
            'process_agreements_tool_raw_output'
        )
        if process_agreements_tool_raw_output:
            # Clear the state to prevent reuse in subsequent turns.
            callback_context.state['process_agreements_tool_raw_output'] = None

            # Aggregate all responses from the results into a summary
            results = process_agreements_tool_raw_output.get('results', {})
            responses = []

            for agreement_type, agreement_data in results.items():
                if (
                    agreement_data.get('status') == 'success'
                    and 'response' in agreement_data
                ):
                    responses.append(
                        f'**{agreement_data["filename"]}:**\n{agreement_data["response"]}'
                    )

            summary = '\n\n'.join(responses)
            processed_agreements = process_agreements_tool_raw_output.get(
                'processed_agreements', []
            )
            processed_agreements_text = json.dumps(processed_agreements)

            # Combine summary and processed agreements using a special token for
            # later parsing.
            final_text = (
                f'{summary}<START_OF_REFERENCE_DOCUMENTS>{processed_agreements_text}'
            )
            content_with_references = Content(parts=[Part(text=final_text)])

            return LlmResponse(content=content_with_references)

        return None

    except Exception as e:
        _logger.error('Error in before_model_callback: %s', e)
        _logger.error(traceback.format_exc())
        return None


def after_model_callback(
    callback_context: CallbackContext, llm_response: LlmResponse
) -> Optional[LlmResponse]:
    # --- Inspection ---
    original_llm_text = ''
    if llm_response.content and llm_response.content.parts:
        # Assuming simple text response
        if llm_response.content.parts[0].text:
            original_llm_text = llm_response.content.parts[0].text
            print(
                f"[Callback] Inspected original response text: '{original_llm_text[:100]}...'"
            )  # Log snippet
        elif llm_response.content.parts[0].function_call:
            print(
                f"[Callback] Inspected response: Contains function call '{llm_response.content.parts[0].function_call.name}'. No text modification."
            )
            return None  # Don't modify tool calls in this example
        else:
            print('[Callback] Inspected response: No text content found.')
            return None
    elif llm_response.error_message:
        print(
            f"[Callback] Inspected response: Contains error '{llm_response.error_message}'. No modification."
        )
        return None
    else:
        print('[Callback] Inspected response: Empty LlmResponse.')
        return None  # Nothing to modify

    # Check for process agreements tool output
    process_agreements_tool_raw_output = callback_context.state.get(
        'process_agreements_tool_raw_output'
    )
    if process_agreements_tool_raw_output:
        # Clear the state to prevent reuse in subsequent turns.
        callback_context.state['process_agreements_tool_raw_output'] = None

        # Aggregate all responses from the results into a summary
        results = process_agreements_tool_raw_output.get('results', {})
        responses = []

        for agreement_type, agreement_data in results.items():
            if (
                agreement_data.get('status') == 'success'
                and 'response' in agreement_data
            ):
                responses.append(
                    f'**{agreement_data["filename"]}:**\n{agreement_data["response"]}'
                )

        orginal_detailed_summary = '\n\n'.join(responses)

        processed_agreements = process_agreements_tool_raw_output.get(
            'processed_agreements', []
        )
        processed_agreements_text = json.dumps(processed_agreements)

        # Combine original text and processed agreements using a special token for
        # later parsing.
        final_text = f'{original_llm_text}<START_OF_REFERENCE_DOCUMENTS>{processed_agreements_text}'
        content_with_references = Content(parts=[Part(text=final_text)])

        return LlmResponse(
            content=content_with_references,
            grounding_metadata=llm_response.grounding_metadata,
        )
    return None
