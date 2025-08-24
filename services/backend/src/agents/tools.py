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
import re
from typing import Any, Dict, Optional

from loguru import logger

try:  # Local imports when running inside the service
    from src.lib.config import settings

    from .system_instructions import get_diagram_generator_instructions
except ImportError:  # Fallback for direct execution
    from system_instructions import get_diagram_generator_instructions  # type: ignore

    from src.lib.config import settings  # type: ignore

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
    if not text:
        return text

    # Prefer fenced code with mermaid language hint
    m = re.search(r'```\s*mermaid\s*\n(?P<code>[\s\S]*?)\n```', text, re.IGNORECASE)
    if m:
        return m.group('code').strip()

    # Generic fenced code block
    m = re.search(r'```\s*\n(?P<code>[\s\S]*?)\n```', text)
    if m:
        return m.group('code').strip()

    # No fences; return as-is
    return text.strip()


def _fallback_mermaid(description: str) -> str:
    """Return a minimal, valid Mermaid diagram as a safe fallback."""
    return (
        'graph TD\n'
        '  A[Start] --> B{Process}\n'
        '  B -->|Analyze| C[Components]\n'
        '  C --> D[Interactions]\n'
        '  D --> E[Output]\n'
        f'  %% Input: {description[:80]}...\n'
    )


def _sanitize_mermaid(code: str) -> str:
    """Best-effort cleanup to improve Mermaid parse success.

    - Remove newlines within square-bracket node labels: [ ... ]
    - Remove newlines within parentheses (and double-paren shapes): ( ... ), (( ... ))
    - Remove newlines within curly-brace diamond labels: { ... }
    - Remove newlines within quoted labels: " ... "
    - Normalize line endings and trim extraneous fences/whitespace
    """
    if not code:
        return code

    s = code.replace('\r\n', '\n').replace('\r', '\n').strip()

    # Remove surrounding markdown fences if present
    if s.startswith('```'):
        s = re.sub(r'^```\s*mermaid\s*\n', '', s, flags=re.IGNORECASE)
        s = re.sub(r'^```\s*\n', '', s)
        s = re.sub(r'\n```\s*$', '', s)
        s = s.strip()

    # Collapse newlines inside [...] blocks
    out_chars: list[str] = []
    bracket_depth = 0
    for ch in s:
        if ch == '[':
            bracket_depth += 1
            out_chars.append(ch)
            continue
        if ch == ']':
            if bracket_depth > 0:
                bracket_depth -= 1
            out_chars.append(ch)
            continue
        if bracket_depth > 0 and ch == '\n':
            out_chars.append(' ')
            continue
        out_chars.append(ch)
    s = ''.join(out_chars)

    # Collapse newlines inside parentheses (...) including double-paren shapes
    out_chars = []
    paren_depth = 0
    for ch in s:
        if ch == '(':
            paren_depth += 1
            out_chars.append(ch)
            continue
        if ch == ')':
            if paren_depth > 0:
                paren_depth -= 1
            out_chars.append(ch)
            continue
        if paren_depth > 0 and ch == '\n':
            out_chars.append(' ')
            continue
        out_chars.append(ch)
    s = ''.join(out_chars)

    # Collapse newlines inside curly braces {...} (e.g., decision diamonds)
    out_chars = []
    brace_depth = 0
    for ch in s:
        if ch == '{':
            brace_depth += 1
            out_chars.append(ch)
            continue
        if ch == '}':
            if brace_depth > 0:
                brace_depth -= 1
            out_chars.append(ch)
            continue
        if brace_depth > 0 and ch == '\n':
            out_chars.append(' ')
            continue
        out_chars.append(ch)
    s = ''.join(out_chars)

    # Collapse newlines inside double-quoted labels (e.g., id("..."))
    out_chars = []
    in_quote = False
    prev = ''
    for ch in s:
        if ch == '"' and prev != '\\':
            in_quote = not in_quote
            out_chars.append(ch)
        elif in_quote and ch == '\n':
            out_chars.append(' ')
        else:
            out_chars.append(ch)
        prev = ch
    s = ''.join(out_chars)

    # Trim excessive blank lines
    lines = [ln.rstrip() for ln in s.split('\n')]
    # Ensure the diagram starts at the first mermaid directive line if present later
    start_idx = 0
    directive_re = re.compile(
        r'^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2)\b'
    )
    for i, ln in enumerate(lines):
        if directive_re.match(ln.strip()):
            start_idx = i
            break
    s = '\n'.join(ln for ln in lines[start_idx:] if ln is not None)
    return s.strip()


def generate_architecture_diagram(description: str) -> Dict[str, Any]:
    """Generate a Mermaid architecture diagram from a free-text description.

    Uses Gemini Pro with thinking enabled and a dedicated system instruction to
    produce high-quality Mermaid code. Falls back to a simple template when the
    model is unavailable or misconfigured (e.g., missing API key).

    Args:
        description: Description of the system or workflow to diagram

    Returns:
    A dictionary with status and diagram information.
    On success: {'status': 'success', 'diagram_code': '...',
             'diagram_type': 'mermaid', ...}
    On error: {'status': 'error', 'error_message': '...'}
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
            }

        system_instruction = get_diagram_generator_instructions()

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
        }
    except Exception as e:
        logger.exception('Failed to generate diagram with Gemini Pro')
        return {
            'status': 'error',
            'error_message': f'Failed to generate diagram: {str(e)}',
        }
