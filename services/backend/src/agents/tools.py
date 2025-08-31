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

import os
from typing import Any, Dict, Optional

from loguru import logger

try:  # Local imports when running inside the service
    from src.lib.config import settings
    from src.lib.mermaid_utils import (
        create_fallback_mermaid,
        extract_mermaid,
        sanitize_mermaid,
    )

    from .system_instructions import get_diagram_generator_instructions
except ImportError:  # Fallback for direct execution
    from system_instructions import get_diagram_generator_instructions  # type: ignore

    from src.lib.config import settings  # type: ignore
    from src.lib.mermaid_utils import (  # type: ignore
        create_fallback_mermaid,
        extract_mermaid,
        sanitize_mermaid,
    )

try:
    # google-genai SDK
    from google import genai
    from google.genai import types as genai_types
except Exception as _e:  # pragma: no cover - import errors handled via fallback
    genai = None  # type: ignore
    genai_types = None  # type: ignore
    logger.warning(
        'google-genai not available; diagram tool will use a simple fallback if needed'
    )


_CLIENT: Optional[Any] = None


def _get_genai_client() -> Optional[Any]:
    """Return a cached Google GenAI client if available and configured."""
    global _CLIENT
    if _CLIENT is not None:
        return _CLIENT

    if genai is None:
        return None

    # The client picks up GOOGLE_API_KEY automatically if set.
    try:
        _CLIENT = genai.Client()
        return _CLIENT
    except Exception as e:  # pragma: no cover - network/config dependent
        logger.error(f'Failed to initialize genai client: {e}')
        return None


def _extract_mermaid(text: str) -> str:
    """Extract Mermaid code from a response, stripping fences if present.

    Handles patterns like ```mermaid ... ``` or ``` ... ``` and falls back
    to returning the raw text.
    """
    return extract_mermaid(text)


def _fallback_mermaid(description: str) -> str:
    """Return a minimal, valid Mermaid diagram as a safe fallback."""
    return create_fallback_mermaid(description)


def _sanitize_mermaid(code: str) -> str:
    """Best-effort cleanup to improve Mermaid parse success."""
    return sanitize_mermaid(code)


def generate_architecture_diagram(
    description: str, platform: Optional[str] = None
) -> Dict[str, Any]:
    """Generate a Mermaid architecture diagram from a free-text description.

    Uses Gemini Pro with thinking enabled and a dedicated system instruction to
    produce high-quality Mermaid code. Falls back to a simple template when the
    model is unavailable or misconfigured (e.g., missing API key).

    Args:
        description: Description of the system or workflow to diagram

    Returns:
        Dictionary with status and diagram information.
    """
    try:
        if not description or not description.strip():
            return {'status': 'error', 'error_message': 'Description cannot be empty'}

        model_name = getattr(settings, 'GEMINI_MODEL_PRO', 'gemini-2.5-pro')
        client = _get_genai_client()

        # If client or API key isn't available, return a deterministic fallback
        if client is None or not os.getenv('GOOGLE_API_KEY'):
            logger.info('Using fallback Mermaid generation (no client/API key)')
            code = _fallback_mermaid(description)
            return {
                'status': 'success',
                'diagram_code': code,
                'diagram_type': 'mermaid',
                'description': description,
                'title': 'System Architecture Diagram',
                'model_used': 'fallback',
                'platform': (platform or None),
            }

        system_instruction = get_diagram_generator_instructions(platform)

        # Build generation config; thinking is on by default for 2.5 Pro
        if genai_types is not None:
            gen_config = genai_types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.1,
            )
        else:
            gen_config = None

        logger.debug(
            f'Requesting Mermaid diagram from {model_name} with temperature=0.1'
        )

        kwargs: Dict[str, Any] = {'model': model_name, 'contents': [description]}
        if gen_config is not None:
            kwargs['config'] = gen_config
        response = client.models.generate_content(**kwargs)

        text = getattr(response, 'text', '') or ''
        diagram_code = _extract_mermaid(text)
        diagram_code = _sanitize_mermaid(diagram_code)

        if not diagram_code:
            # If the model responded but didn't produce code, fallback gracefully
            logger.warning('Empty Mermaid code from model; using fallback')
            diagram_code = _fallback_mermaid(description)

        return {
            'status': 'success',
            'diagram_code': diagram_code,
            'diagram_type': 'mermaid',
            'description': description,
            'title': 'System Architecture Diagram',
            'model_used': model_name,
            'platform': (platform or None),
        }
    except Exception as e:
        logger.exception('Failed to generate diagram with Gemini Pro')
        return {
            'status': 'error',
            'error_message': f'Failed to generate diagram: {str(e)}',
        }
