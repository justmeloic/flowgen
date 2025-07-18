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
"""Defines tools for the agent, including CBA datastore search.

This module provides the core tool for searching Collective Bargaining
Agreements (CBAs) using Google Cloud's Vertex AI Search. It also includes
a callback function to handle the results of tool calls.
"""
# NOTE: Intentionally not using "from __future__ import annotations" here
# as a test for ADK's introspection capabilities.

# Standard library imports
import json
import logging
import os
import traceback
from typing import Any, Dict, Optional

# Third-party imports
from google.adk.tools import FunctionTool
from google.adk.tools.base_tool import BaseTool
from google.adk.tools.tool_context import ToolContext
from google.cloud import discoveryengine_v1beta as discoveryengine
from loguru import logger as _logger

# Local imports
from .tools import _process_agreements_with_gemini

# Create the FunctionTool for process_agreements_with_gemini
_process_agreements_with_gemini.__name__ = 'process_agreements_with_gemini'
process_agreements_with_gemini = FunctionTool(func=_process_agreements_with_gemini)


def store_tool_result_callback(
    tool: BaseTool,
    args: Dict[str, Any],  # Using typing.Dict
    tool_context: ToolContext,
    tool_response: Dict[str, Any],  # Using typing.Dict
) -> Optional[Dict[str, Any]]:  # Using typing.Dict
    """Stores the raw response from the search tool in the agent state."""
    try:
        if tool.name == 'search_cba_datastore':
            tool_context.state['search_cba_datastore_tool_raw_output'] = tool_response
            _logger.info(
                '[store_tool_result_callback] Stored response for tool %s',
                tool.name,
            )
        return None
    except Exception as e:
        _logger.error('Error in store_tool_result_callback: %s', e)
        _logger.error(traceback.format_exc())
        return None


def _build_search_request(
    serving_config: str, query: str
) -> discoveryengine.SearchRequest:
    """Constructs the Vertex AI Search request object."""
    summary_result_count = int(os.getenv('SUMMARY_RESULT_COUNT', 5))
    content_search_spec = discoveryengine.SearchRequest.ContentSearchSpec(
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=summary_result_count,
            include_citations=True,
        ),
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True
        ),
    )
    # TODO(your-user): Replace 'YOUR_UNIQUE_USER_ID' with a real, unique
    # user identifier for analytics and billing.
    return discoveryengine.SearchRequest(
        serving_config=serving_config,
        query=query,
        page_size=5,
        content_search_spec=content_search_spec,
        user_pseudo_id='YOUR_UNIQUE_USER_ID',
    )


def _parse_search_response(
    response: discoveryengine.SearchResponse,
) -> Dict[str, Any]:  # Using typing.Dict
    """Parses the raw search response into a structured dictionary."""
    documents = []
    if response.results:
        for doc_result in response.results:
            doc = doc_result.document
            documents.append(
                {
                    'id': doc.id,
                    'name': doc.name,
                    'title': doc.derived_struct_data.get('title', 'N/A'),
                    'link': doc.derived_struct_data.get('link', 'N/A'),
                }
            )

    return {
        'summary': response.summary.summary_text if response.summary else None,
        'documents': documents,
    }


def _search_cba_datastore_impl(query: str) -> Dict[str, Any]:  # Using typing.Dict
    """Searches CN's Collective Bargaining Agreements (CBAs).

    Args:
        query: The search query string to find relevant CBA information.

    Returns:
        A dictionary containing the query, an optional summary, a list of
        document references, and an optional error message.
    """
    try:
        project_id = os.getenv('GOOGLE_CLOUD_PROJECT')
        data_store_id = os.getenv('DATA_STORE_ID', 'cn-cba_1747357876332')

        client = discoveryengine.SearchServiceClient()
        serving_config = client.serving_config_path(
            project=project_id,
            location='global',
            data_store=data_store_id,
            serving_config='default_search',
        )

        request = _build_search_request(serving_config, query)
        response = client.search(request)

        parsed_response = _parse_search_response(response)
        return {'query': query, **parsed_response}

    except Exception as e:
        _logger.error('Vertex AI Search failed for query "%s": %s', query, e)
        return {'query': query, 'error': str(e), 'summary': None, 'documents': []}


_search_cba_datastore_impl.__name__ = 'search_cba_datastore'
search_cba_datastore = FunctionTool(func=_search_cba_datastore_impl)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    from dotenv import load_dotenv

    load_dotenv()

    # Test the Gemini processing function
    print('Testing _process_agreements_with_gemini:')
    gemini_result = _process_agreements_with_gemini(
        'What are the key points about overtime policies in this document?',
        'Conductor',
        'Calgary',
    )
    print(json.dumps(gemini_result, indent=2))
