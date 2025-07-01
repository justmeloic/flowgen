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


from __future__ import annotations

# Standard library imports
import csv
import json
import logging
import os
import pathlib
from typing import Dict, Optional

# Third-party imports
from google import genai
from google.adk.tools import FunctionTool
from google.genai import types
from google.genai.types import Content, FunctionDeclaration, Part, Schema, Type

_logger = logging.getLogger(__name__)


def _process_agreements_impl(prompt: str, role: str, territory: str) -> Dict[str, str]:
    """Process agreement PDFs with Gemini based on role and territory.

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

    client = genai.Client()
    results = {}
    processed_agreements = []

    # Base path to the agreements directory
    agreements_dir = os.path.join(
        os.path.dirname(__file__), '..', '..', '..', 'testdata', 'agreements'
    )
    locals_dir = os.path.join(
        os.path.dirname(__file__), '..', '..', '..', 'testdata', 'locals'
    )

    # Process primary agreement
    if agreement_info['primary_agreement']:
        pdf_path = pathlib.Path(agreements_dir) / agreement_info['primary_agreement']
        if pdf_path.exists():
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=[
                        types.Part.from_bytes(
                            data=pdf_path.read_bytes(),
                            mime_type='application/pdf',
                        ),
                        f'{prompt}\n\nDocument: {agreement_info["primary_agreement"]}',
                    ],
                )
                results['primary_agreement'] = {
                    'filename': agreement_info['primary_agreement'],
                    'response': response.text,
                    'status': 'success',
                }
                processed_agreements.append(agreement_info['primary_agreement'])
            except Exception as e:
                _logger.error(
                    'Error processing primary agreement %s: %s',
                    agreement_info['primary_agreement'],
                    e,
                )
                results['primary_agreement'] = {
                    'filename': agreement_info['primary_agreement'],
                    'error': str(e),
                    'status': 'error',
                }
        else:
            results['primary_agreement'] = {
                'filename': agreement_info['primary_agreement'],
                'error': 'File not found',
                'status': 'not_found',
            }

    # Process subsequent agreements
    if agreement_info['subsequent_agreements']:
        pdf_path = (
            pathlib.Path(agreements_dir) / agreement_info['subsequent_agreements']
        )
        if pdf_path.exists():
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=[
                        types.Part.from_bytes(
                            data=pdf_path.read_bytes(),
                            mime_type='application/pdf',
                        ),
                        (
                            f'{prompt}\n\nDocument: '
                            f'{agreement_info["subsequent_agreements"]}'
                        ),
                    ],
                )
                results['subsequent_agreements'] = {
                    'filename': agreement_info['subsequent_agreements'],
                    'response': response.text,
                    'status': 'success',
                }
                processed_agreements.append(agreement_info['subsequent_agreements'])
            except Exception as e:
                _logger.error(
                    'Error processing subsequent agreement %s: %s',
                    agreement_info['subsequent_agreements'],
                    e,
                )
                results['subsequent_agreements'] = {
                    'filename': agreement_info['subsequent_agreements'],
                    'error': str(e),
                    'status': 'error',
                }
        else:
            results['subsequent_agreements'] = {
                'filename': agreement_info['subsequent_agreements'],
                'error': 'File not found',
                'status': 'not_found',
            }

    # Process local agreements
    if agreement_info['local_agreements']:
        pdf_path = pathlib.Path(locals_dir) / agreement_info['local_agreements']
        if pdf_path.exists():
            try:
                response = client.models.generate_content(
                    model='gemini-2.0-flash-exp',
                    contents=[
                        types.Part.from_bytes(
                            data=pdf_path.read_bytes(),
                            mime_type='application/pdf',
                        ),
                        f'{prompt}\n\nDocument: {agreement_info["local_agreements"]}',
                    ],
                )
                results['local_agreements'] = {
                    'filename': agreement_info['local_agreements'],
                    'response': response.text,
                    'status': 'success',
                }
                processed_agreements.append(agreement_info['local_agreements'])
            except Exception as e:
                _logger.error(
                    'Error processing local agreement %s: %s',
                    agreement_info['local_agreements'],
                    e,
                )
                results['local_agreements'] = {
                    'filename': agreement_info['local_agreements'],
                    'error': str(e),
                    'status': 'error',
                }
        else:
            results['local_agreements'] = {
                'filename': agreement_info['local_agreements'],
                'error': 'File not found',
                'status': 'not_found',
            }

    return {
        'role': role,
        'territory': territory,
        'region': agreement_info['region'],
        'prompt': prompt,
        'results': results,
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
    csv_path = os.path.join(
        os.path.dirname(__file__),
        '..',
        '..',
        '..',
        'testdata',
        'Agreement_Mapping_with_Filenames.csv',
    )

    try:
        with open(csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                if (
                    row['Role'].strip() == role.strip()
                    and row['Territory'].strip() == territory.strip()
                ):
                    primary_agreement = (
                        row['Primary Agreement'].strip()
                        if row['Primary Agreement'].strip()
                        else None
                    )
                    subsequent_agreements = (
                        row['Subsequent Agreements'].strip()
                        if row['Subsequent Agreements'].strip()
                        else None
                    )
                    local_agreements = (
                        row['Local Agreements'].strip()
                        if row['Local Agreements'].strip()
                        else None
                    )
                    region = row['Region'].strip() if row['Region'].strip() else None
                    return {
                        'primary_agreement': primary_agreement,
                        'subsequent_agreements': subsequent_agreements,
                        'local_agreements': local_agreements,
                        'region': region,
                    }

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
    except Exception as e:
        _logger.error('Error reading agreement mapping CSV: %s', e)
        return {
            'primary_agreement': None,
            'subsequent_agreements': None,
            'local_agreements': None,
            'region': None,
        }


# This tells the ADK exactly what the tool looks like, bypassing automatic parsing.
process_agreements_declaration = FunctionDeclaration(
    name='process_agreements',
    description=(
        "Process agreement PDFs with Gemini based on a user's role and "
        'territory to answer their question.'
    ),
    parameters=Schema(
        type=Type.OBJECT,
        properties={
            'prompt': Schema(
                type=Type.STRING,
                description="The user's question or prompt to apply to the documents",
            ),
            'role': Schema(
                type=Type.STRING,
                description="The user's role (e.g., 'Conductor', 'Engineer')",
            ),
            'territory': Schema(
                type=Type.STRING,
                description="The user's territory/location (e.g., 'Calgary', 'Toronto North')",
            ),
        },
        # Specify which arguments are mandatory.
        required=['prompt', 'role', 'territory'],
    ),
)

process_agreements = FunctionTool(
    func=_process_agreements_impl,
    # function_declaration=process_agreements_declaration,
)
if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    from dotenv import load_dotenv

    load_dotenv()

    # Test the agreement filename function
    print('Testing _get_agreement_filenames:')
    result = _get_agreement_filenames('Conductor', 'Calgary')
    print(json.dumps(result, indent=2))

    # Test the Gemini processing function
    print('\nTesting process_agreements:')
    # gemini_result = process_agreements(
    #   'What are the key points about overtime policies in this document?',
    #    'Conductor',
    #    'Calgary',
    # )
    # print(json.dumps(gemini_result, indent=2))
