from google.cloud import discoveryengine_v1beta as discoveryengine
from dotenv import load_dotenv
import os
from typing import Dict, List, Optional, Any
import traceback

from typing import Optional
from google.adk.tools.tool_context import ToolContext
from google.adk.tools.base_tool import BaseTool
from typing import Dict, Any



def store_tool_result_callback(
    tool: BaseTool,
    args: Dict[str, Any],
    tool_context: ToolContext,
    tool_response: Dict[str, Any],
) -> Optional[Dict[str, Any]]:
    """Store raw results from google_search tool calls."""
    try:
        if tool.name == "search_cba_datastore":
            tool_context.state["search_cba_datastore_tool_raw_output"] = tool_response
            print(f"[store_tool_result_callback] Stored response for tool search_cba_datastore")
        return None
    except Exception as e:
        print(f"ERROR in store_tool_result_callback: {str(e)}")
        print(traceback.format_exc())
        return None

def search_cba_datastore(
    query: str
) -> Dict[str, Any]:
    """Search CN's Collective Bargaining Agreements (CBAs) using Vertex AI Search.

    This function searches through CBA documents using Google Cloud's Vertex AI Search
    (formerly Enterprise Search) and returns both a generated summary and individual
    document references. It requires proper Google Cloud authentication and environment
    variables to be set.

    Args:
        query: The search query string to find relevant CBA information.

    Returns:
        Dict[str, Any]: A dictionary containing:
            - query (str): The original search query
            - summary (Optional[str]): A generated summary of the relevant documents,
              or None if no summary could be generated
            - documents (List[Dict]): List of relevant documents, each containing:
                - id (str): Document ID
                - name (str): Full resource name
                - title (str): Document title
                - link (str): Document link/path
            - error (Optional[str]): Error message if an error occurred, otherwise not present

    Required Environment Variables:
        - GOOGLE_CLOUD_PROJECT: Google Cloud project ID
        - DATA_STORE_ID: Vertex AI Search datastore ID (defaults to "cn-cba_1747357876332")
    """
    load_dotenv()

    project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    location = "global"
    data_store_id = os.getenv("DATA_STORE_ID", "cn-cba_1747357876332")  
    summary_result_count = os.getenv("SUMMARY_RESULT_COUNT", 5)
    
    client = discoveryengine.SearchServiceClient()

    # Serving config format
    serving_config = client.serving_config_path(
        project=project_id,
        location=location,
        data_store=data_store_id,
        serving_config="default_search",  # Or your specific serving config ID
    )

    # Content search spec for summary and citations
    content_search_spec = discoveryengine.SearchRequest.ContentSearchSpec(
        summary_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec(
            summary_result_count=int(summary_result_count),  # Number of results to use for the summary
            include_citations=True,
            # You can customize the prompt if needed
            # model_prompt_spec=discoveryengine.SearchRequest.ContentSearchSpec.SummarySpec.ModelPromptSpec(
            #     preamble="Given the following documents, please summarize..."
            # )
        ),
        snippet_spec=discoveryengine.SearchRequest.ContentSearchSpec.SnippetSpec(
            return_snippet=True
        ),
        # Optional: if you want extractive answers in addition to summary
        # extractive_content_spec=discoveryengine.SearchRequest.ContentSearchSpec.ExtractiveContentSpec(
        #    max_extractive_answer_count=3
        # )
    )

    request = discoveryengine.SearchRequest(
        serving_config=serving_config,
        query=query,
        page_size=5,  # Number of search results to return
        content_search_spec=content_search_spec,
        # Ensure that user pseudo ID is set for analytics and billing.
        # This can be any unique identifier for the end user.
        # NOTE: This might be something we can use to associate a user with their user profile.
        user_pseudo_id="YOUR_UNIQUE_USER_ID", # Replace with a unique user identifier
    )

    try:
        response = client.search(request)
        
        result = {
            "query": query,
            "summary": None,
            "documents": []
        }

        if response.summary and response.summary.summary_text:
            result["summary"] = response.summary.summary_text

        if response.results:
            for doc_result in response.results:
                doc = doc_result.document
                document_info = {
                    "id": doc.id,
                    "name": doc.name,
                    "title": doc.derived_struct_data.get("title", "N/A"),
                    "link": doc.derived_struct_data.get("link", "N/A")
                }
                result["documents"].append(document_info)

        return result

    except Exception as e:
        return {
            "query": query,
            "error": str(e),
            "summary": None,
            "documents": []
        }

if __name__ == "__main__":
    # --- CONFIGURATION ---
    USER_QUERY = "What are the main topics in these documents?" # Replace with your query

    result = search_cba_datastore(
        query=USER_QUERY
    )

    # Pretty print the result
    import json
    print(json.dumps(result, indent=2))






































    


