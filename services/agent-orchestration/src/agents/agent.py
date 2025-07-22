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

# Standard library imports
import asyncio
import csv
import json
import logging
from difflib import SequenceMatcher
from pathlib import Path
from typing import Dict, Optional

# Third-party imports
from dotenv import load_dotenv
from google import genai
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from google.genai import types
from loguru import logger as _logger

# Application-specific imports
try:
    # from .tools.document_understanding import process_agreements

    from ..app.core.config import settings
    from .callbacks import (
        before_model_callback,
        store_tool_result_callback,
    )
    from .system_instructions import (
        return_document_processing_instructions,
        return_global_instructions,
        return_root_agent_instructions,
    )
except ImportError:
    # Handle direct script execution (for quick testing)
    # from tools.document_understanding import process_agreements
    from callbacks import (
        before_model_callback,
        store_tool_result_callback,
    )
    from system_instructions import (
        return_document_processing_instructions,
        return_global_instructions,
        return_root_agent_instructions,
    )

    from src.app.core.config import settings


# Load environment variables
load_dotenv()


def _normalize_text(text: str) -> str:
    """Normalize text for fuzzy matching by removing extra spaces and case."""
    if not text:
        return ''
    # Remove extra whitespace, convert to lowercase
    normalized = ' '.join(text.strip().split()).lower()
    return normalized


def _fuzzy_match(input_text: str, target_text: str, threshold: float = 0.8) -> bool:
    """
    Perform fuzzy string matching between input and target text.

    Args:
        input_text: The user-provided text to match
        target_text: The canonical text to match against
        threshold: Minimum similarity score (0.0 to 1.0) to consider a match

    Returns:
        True if the texts match above the threshold, False otherwise
    """
    if not input_text or not target_text:
        return False

    # Normalize both strings
    norm_input = _normalize_text(input_text)
    norm_target = _normalize_text(target_text)

    # Exact match after normalization
    if norm_input == norm_target:
        return True

    # Calculate similarity using SequenceMatcher
    similarity = SequenceMatcher(None, norm_input, norm_target).ratio()

    # Also check if input is contained in target or vice versa (for abbreviations)
    contains_match = (
        norm_input in norm_target
        or norm_target in norm_input
        or
        # Handle cases like "north toronto" vs "toronto north"
        all(word in norm_target for word in norm_input.split())
        or all(word in norm_input for word in norm_target.split())
    )

    return similarity >= threshold or contains_match


def _find_best_match(
    input_text: str, valid_options: list, threshold: float = 0.8
) -> Optional[str]:
    """
    Find the best matching option from a list of valid choices.

    Args:
        input_text: The user input to match
        valid_options: List of valid options to match against
        threshold: Minimum similarity threshold

    Returns:
        The best matching option, or None if no good match is found
    """
    if not input_text or not valid_options:
        return None

    best_match = None
    best_score = 0

    for option in valid_options:
        if _fuzzy_match(input_text, option, threshold):
            # Calculate exact score for ranking
            norm_input = _normalize_text(input_text)
            norm_option = _normalize_text(option)
            score = SequenceMatcher(None, norm_input, norm_option).ratio()

            if score > best_score:
                best_score = score
                best_match = option

    return best_match


# ======================= START:WORKAROUND FOR FUNCTION CALLING =======================
"""
NOTE[Loïc]:

ISSUE: Automatic schema generation for function tools sometimes fails with error:
"Automatic function calling works best with simpler function signature schema, 
consider manually parsing your function declaration for function"

SYMPTOMS:
- Occurs when function signatures are complex or contain certain type hints
- May happen even without 'Any' types in signatures
- Prevents automatic function calling from working properly

SOLUTIONS:
1. Define FunctionDeclaration manually (implemented below)
   - Explicitly specify the function schema using FunctionDeclaration
   - Bypasses automatic schema generation entirely
   - More verbose but guaranteed to work

2. Alternative: Simplify function signatures
   - Use basic types (str, int, bool) instead of complex types
   - Avoid Union types, Optional with complex defaults, etc.

TODO: Investigate if explicitly passing schema parameter resolves this issue
"""


def _process_agreements_impl(prompt: str, role: str, territory: str) -> Dict[str, str]:
    """Process agreement PDFs with Gemini based on role and territory in parallel.

    Args:
        prompt (str): The prompt to apply to the PDF documents
        role (str): The role (e.g., 'Conductor', 'Engineer', 'Yard Coordinator')
        territory (str): The territory/location (e.g., 'Calgary', 'Toronto North')

    Returns:
        Dict[str, str]: A dictionary containing the responses from Gemini for
        each applicable agreement, along with metadata about which agreements
        were processed.
    """
    # Get the agreement filenames for this role and territory
    agreement_info = _get_agreement_filenames(role, territory)

    if not any(
        [
            agreement_info['primary_agreement'],
            agreement_info['subsequent_agreements'],
            agreement_info['local_agreements'],
        ]
    ):
        return {
            'error': (
                f'No agreements found for role "{role}" and territory "{territory}"'
            ),
            'role': role,
            'territory': territory,
            'processed_agreements': [],
        }

    # Check if we're already in an async context
    # This is because our application might ve already
    # running in an async context (FastAPI/uvicorn),
    # so we shouldn't try to create a new event loop with asyncio.run().

    try:
        asyncio.get_running_loop()
        # We're in an async context, create a task
        import concurrent.futures

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future = executor.submit(
                lambda: asyncio.run(
                    _process_documents_async(prompt, role, territory, agreement_info)
                )
            )
            return future.result()
    except RuntimeError:
        # No running loop, safe to use asyncio.run()
        return asyncio.run(
            _process_documents_async(prompt, role, territory, agreement_info)
        )


async def _process_documents_async(
    prompt: str, role: str, territory: str, agreement_info: Dict[str, Optional[str]]
) -> Dict[str, str]:
    """Process multiple agreement documents in parallel using asyncio."""
    client = genai.Client()

    # Base paths
    testdata_dir = settings.TESTDATA_DIR
    base_dir = Path(__file__).parent.parent.parent
    agreements_dir = base_dir / testdata_dir / 'agreements'
    locals_dir = base_dir / testdata_dir / 'locals'

    # Define agreement types to process
    agreement_types = [
        {
            'key': 'primary_agreement',
            'base_dir': agreements_dir,
            'model': settings.GEMINI_MODEL,
        },
        {
            'key': 'subsequent_agreements',
            'base_dir': agreements_dir,
            'model': settings.GEMINI_MODEL,
        },
        {
            'key': 'local_agreements',
            'base_dir': locals_dir,
            'model': settings.GEMINI_MODEL,
        },
    ]

    async def process_document(agreement_type):
        """Process a single document asynchronously."""
        key = agreement_type['key']
        filename = agreement_info[key]

        if not filename:
            return None

        pdf_path = Path(agreement_type['base_dir']) / filename

        if not pdf_path.exists():
            return {
                'key': key,
                'filename': filename,
                'error': 'File not found',
                'status': 'not_found',
            }

        try:
            # Run Gemini API call in thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: client.models.generate_content(
                    model=agreement_type['model'],
                    config=types.GenerateContentConfig(
                        system_instruction=return_document_processing_instructions()
                    ),
                    contents=[
                        types.Part.from_bytes(
                            data=pdf_path.read_bytes(),
                            mime_type='application/pdf',
                        ),
                        f'{prompt}\n\nDocument: {filename}',
                    ],
                ),
            )

            return {
                'key': key,
                'filename': filename,
                'response': response.text,
                'status': 'success',
            }

        except (IOError, OSError) as e:
            # File reading errors
            _logger.error(
                'Error reading file %s for %s: %s',
                filename,
                key.replace('_', ' '),
                e,
            )
            return {
                'key': key,
                'filename': filename,
                'error': f'File reading error: {str(e)}',
                'status': 'error',
            }
        except (ValueError, TypeError) as e:
            # API configuration or data type errors
            _logger.error(
                'Error processing %s %s (configuration/data error): %s',
                key.replace('_', ' '),
                filename,
                e,
            )
            return {
                'key': key,
                'filename': filename,
                'error': f'Configuration error: {str(e)}',
                'status': 'error',
            }
        except Exception as e:
            # Catch-all for unexpected errors (re-raising context preserved)
            _logger.error(
                'Unexpected error processing %s %s: %s',
                key.replace('_', ' '),
                filename,
                e,
            )
            return {
                'key': key,
                'filename': filename,
                'error': f'Unexpected error: {str(e)}',
                'status': 'error',
            }

    # Execute all tasks in parallel
    tasks = [process_document(at) for at in agreement_types]
    results = await asyncio.gather(*tasks)

    # Process results
    final_results = {}
    processed_agreements = []

    for result in results:
        if result and result['status'] == 'success':
            final_results[result['key']] = {
                'filename': result['filename'],
                'response': result['response'],
                'status': 'success',
            }
            processed_agreements.append(result['filename'])
        elif result:
            final_results[result['key']] = {
                'filename': result['filename'],
                'error': result.get('error', 'Unknown error'),
                'status': result['status'],
            }

    return {
        'role': role,
        'territory': territory,
        'region': agreement_info['region'],
        'prompt': prompt,
        'results': final_results,
        'processed_agreements': processed_agreements,
    }


def _get_agreement_filenames(role: str, territory: str) -> Dict[str, Optional[str]]:
    """Gets agreement filenames for a given role and territory from the CSV mapping.

    Args:
        role: The role (e.g., 'Conductor', 'Engineer', 'Yard Coordinator')
        territory: The territory/location (e.g., 'Calgary', 'Toronto North', 'Montreal')

    Returns:
        A dictionary containing the primary agreement, subsequent agreements,
        and local agreements filenames. Returns None values if no match is found
        or if the agreement field is empty.
    """
    base_dir = Path(__file__).parent.parent.parent
    csv_path = base_dir / settings.TESTDATA_DIR / settings.AGREEMENT_MAPPING_CSV

    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            rows = list(reader)

            # First, try exact matching (for performance)
            for row in rows:
                if (
                    row['Role'].strip() == role.strip()
                    and row['Territory'].strip() == territory.strip()
                ):
                    return _extract_agreement_data(row)

            # If no exact match, try fuzzy matching
            for row in rows:
                role_match = _fuzzy_match(role, row['Role'].strip())
                territory_match = _fuzzy_match(territory, row['Territory'].strip())

                if role_match and territory_match:
                    _logger.info(
                        'Fuzzy match found: "%s" -> "%s", "%s" -> "%s"',
                        role,
                        row['Role'].strip(),
                        territory,
                        row['Territory'].strip(),
                    )
                    return _extract_agreement_data(row)

        _logger.warning(
            'No agreement mapping found for role "%s" and territory "%s"',
            role,
            territory,
        )
        return {
            'primary_agreement': None,
            'subsequent_agreements': None,
            'local_agreements': None,
            'region': None,
        }

    except FileNotFoundError:
        _logger.error('Agreement mapping CSV file not found at: %s', csv_path)
        return {
            'primary_agreement': None,
            'subsequent_agreements': None,
            'local_agreements': None,
            'region': None,
        }
    except (csv.Error, IOError, UnicodeDecodeError) as e:
        _logger.error('Error reading agreement mapping CSV: %s', e)
        return {
            'primary_agreement': None,
            'subsequent_agreements': None,
            'local_agreements': None,
            'region': None,
        }


def _extract_agreement_data(row: Dict[str, str]) -> Dict[str, Optional[str]]:
    """Extract agreement data from a CSV row."""
    primary_agreement = (
        row['Primary Agreement'].strip() if row['Primary Agreement'].strip() else None
    )
    subsequent_agreements = (
        row['Subsequent Agreements'].strip()
        if row['Subsequent Agreements'].strip()
        else None
    )
    local_agreements = (
        row['Local Agreements'].strip() if row['Local Agreements'].strip() else None
    )
    region = row['Region'].strip() if row['Region'].strip() else None
    return {
        'primary_agreement': primary_agreement,
        'subsequent_agreements': subsequent_agreements,
        'local_agreements': local_agreements,
        'region': region,
    }


def get_valid_roles_and_territories() -> Dict[str, list]:
    """Get all valid roles and territories from the CSV mapping file.

    Returns:
        Dictionary with 'roles' and 'territories' keys containing lists of valid values
    """
    base_dir = Path(__file__).parent.parent.parent
    csv_path = base_dir / settings.TESTDATA_DIR / settings.AGREEMENT_MAPPING_CSV

    roles = set()
    territories = set()

    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if row['Role'].strip():
                    roles.add(row['Role'].strip())
                if row['Territory'].strip():
                    territories.add(row['Territory'].strip())
    except (FileNotFoundError, csv.Error, IOError, UnicodeDecodeError) as e:
        _logger.error('Error reading valid roles/territories from CSV: %s', e)

    return {'roles': sorted(list(roles)), 'territories': sorted(list(territories))}


def suggest_closest_matches(role: str, territory: str) -> Dict[str, Optional[str]]:
    """Suggest the closest valid matches for role and territory.

    Args:
        role: The input role to match
        territory: The input territory to match

    Returns:
        Dictionary with suggested 'role' and 'territory' matches, or None if no match
    """
    valid_data = get_valid_roles_and_territories()

    suggested_role = _find_best_match(role, valid_data['roles'], threshold=0.6)
    suggested_territory = _find_best_match(
        territory, valid_data['territories'], threshold=0.6
    )

    return {'role': suggested_role, 'territory': suggested_territory}


# ======================== END:WORKAROUND FOR FUNCTION CALLING ========================


root_agent = Agent(
    name='root_agent',
    model=settings.GEMINI_MODEL,
    description=(
        'An agent that answers CN employee questions about their '
        'Collective Bargaining Agreements (CBAs). It gathers user '
        'context (role and territory), analyzes relevant CBA documents, '
        'and provides accurate, evidence-based responses.'
    ),
    instruction=return_global_instructions(),
    global_instruction=return_root_agent_instructions(),
    output_key='last_agent_response',
    tools=[FunctionTool(func=_process_agreements_impl)],
    after_tool_callback=store_tool_result_callback,
    before_model_callback=before_model_callback,
)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    from dotenv import load_dotenv

    load_dotenv()

    # Test the fuzzy matching function
    print('Testing fuzzy matching:')
    test_cases = [
        ('north toronto', 'Toronto North'),
        ('eng', 'Engineer'),
        ('conductor', 'Conductor'),
        ('calgary', 'Calgary'),
        ('yard coord', 'Yard Coordinator'),
    ]

    for input_text, target_text in test_cases:
        match = _fuzzy_match(input_text, target_text)
        print(f'  "{input_text}" -> "{target_text}": {match}')

    # Test the agreement filename function with fuzzy matching
    print('\nTesting _get_agreement_filenames with fuzzy matching:')
    result = _get_agreement_filenames('eng', 'north toronto')
    print(json.dumps(result, indent=2))

    # Test suggestion function
    print('\nTesting suggest_closest_matches:')
    suggestions = suggest_closest_matches('eng', 'north toronto')
    print(json.dumps(suggestions, indent=2))

    # Test the Gemini processing function
    print('\nTesting process_agreements:')
    gemini_result = _process_agreements_impl(
        'Please summarize the CBA.',
        'Engineer',
        'Edmonton',
    )
    print(json.dumps(gemini_result, indent=2))
