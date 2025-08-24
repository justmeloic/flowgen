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

"""Tools for AI agents."""

from typing import Any, Dict


def generate_architecture_diagram(description: str) -> Dict[str, Any]:
    """Generate a mermaid architecture diagram based on the description.

    Use this tool when the user asks for system architecture visualization,
    workflow diagrams, or wants to see how components interact. The tool
    creates a Mermaid diagram showing system flow and relationships.

    Args:
        description: Description of the system or workflow to diagram

    Returns:
        A dictionary with status and diagram information.
        On success: {'status': 'success', 'diagram_code': '...',
                     'diagram_type': 'mermaid', ...}
        On error: {'status': 'error', 'error_message': 'Description of the error'}
    """
    try:
        if not description or not description.strip():
            return {'status': 'error', 'error_message': 'Description cannot be empty'}

        # Mock implementation - create a simple mermaid diagram based on description
        diagram_code = """graph TD
    A[User Input] --> B[Processing Engine]
    B --> C[Analysis Module]
    C --> D[Response Generation]
    D --> E[Output]"""

        return {
            'status': 'success',
            'diagram_code': diagram_code,
            'diagram_type': 'mermaid',
            'description': description,
            'title': 'System Architecture Diagram',
        }
    except Exception as e:
        return {
            'status': 'error',
            'error_message': f'Failed to generate diagram: {str(e)}',
        }
