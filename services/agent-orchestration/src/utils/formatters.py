import json
import logging
import re

from dotenv import load_dotenv
from fastapi import Request

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


def format_text_response(response_text: str, request: Request):
    if "<START_OF_REFERENCE_DOCUMENTS>" in response_text:
        parts = response_text.split("<START_OF_REFERENCE_DOCUMENTS>", 1)
        final_response_text = parts[0].strip()
        if len(parts) > 1:
            references_text = parts[1].strip()
            try:
                references_list = json.loads(references_text)
                references_json = {
                    str(i + 1): {
                        "title": ref.get("title", ""),
                        "link": ref.get("link", ""),
                        "text": ref.get("text", ""),
                    }
                    for i, ref in enumerate(references_list)
                    if isinstance(ref, dict)
                }
            except json.JSONDecodeError as e:
                logger.error(
                    f"Failed to parse references JSON for session {request.state.actual_session_id}: {str(e)}\nContent: {references_text[:200]}"
                )
                references_json = {}
        else:
            references_json = {}
    else:
        final_response_text = response_text.strip()
        references_json = {}

    citation_pattern = r"(\[[0-9,\s]+\])"  # inline citation pattern
    final_response_text_bold_citation = re.sub(
        citation_pattern, r"**\1**", final_response_text
    )

    return (final_response_text_bold_citation, references_json)
