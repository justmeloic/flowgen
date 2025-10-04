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

"""Mermaid diagram utilities for sanitization and cleaning."""

import re


def extract_mermaid(text: str) -> str:
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


def _balance_subgraph_ends(lines: list[str]) -> list[str]:
    """Balance subgraph/end statements by removing unmatched 'end' keywords.

    Tracks subgraph depth and removes 'end' statements that don't have
    matching subgraph declarations.

    Args:
        lines: List of mermaid diagram lines

    Returns:
        List of lines with balanced subgraph/end statements
    """
    balanced_lines = []
    subgraph_depth = 0

    for line in lines:
        stripped = line.strip()

        # Track subgraph declarations
        if stripped.startswith('subgraph'):
            subgraph_depth += 1
            balanced_lines.append(line)
        # Only include 'end' if we have an open subgraph
        elif stripped == 'end':
            if subgraph_depth > 0:
                subgraph_depth -= 1
                balanced_lines.append(line)
            # Otherwise skip this 'end' - it's unmatched
        else:
            balanced_lines.append(line)

    return balanced_lines


def sanitize_mermaid(code: str) -> str:
    """Best-effort cleanup to improve Mermaid parse success.

    - Remove newlines within square-bracket node labels: [ ... ]
    - Remove newlines within parentheses (and double-paren shapes): ( ... ), (( ... ))
    - Remove newlines within curly-brace diamond labels: { ... }
    - Remove newlines within quoted labels: " ... "
    - Fix class diagram syntax issues
    - Normalize line endings and trim extraneous fences/whitespace
    """
    if not code:
        return code

    # Normalize problematic Unicode separators/spaces that break Mermaid parser:
    # - U+2028 (LINE SEPARATOR) and U+2029 (PARAGRAPH SEPARATOR)
    # - U+0085 (NEXT LINE)
    # - Non-breaking spaces U+00A0 and U+202F -> regular spaces
    # - Remove zero-width chars: U+200B, U+200C, U+200D, U+FEFF
    code = (
        code.replace('\u2028', '\n')
        .replace('\u2029', '\n')
        .replace('\u0085', '\n')
        .replace('\u00a0', ' ')
        .replace('\u202f', ' ')
        .replace('\u200b', '')
        .replace('\u200c', '')
        .replace('\u200d', '')
        .replace('\ufeff', '')
    )

    s = code.replace('\r\n', '\n').replace('\r', '\n').strip()

    # Remove surrounding markdown fences if present
    if s.startswith('```'):
        s = re.sub(r'^```\s*mermaid\s*\n', '', s, flags=re.IGNORECASE)
        s = re.sub(r'^```\s*\n', '', s)
        s = re.sub(r'\n```\s*$', '', s)
        s = s.strip()

    # Check if this is a class diagram and apply specific fixes
    if 'classDiagram' in s:
        s = _fix_class_diagram_syntax(s)

    # More robust approach: Use regex to handle nested brackets and multi-line labels
    # Replace newlines and excessive whitespace inside brackets with single spaces
    def clean_brackets(match):
        content = match.group(1)
        # Replace newlines and multiple spaces with single space
        cleaned = re.sub(r'\s+', ' ', content.strip())
        return f'[{cleaned}]'

    s = re.sub(r'\[([^\[\]]*?)\]', clean_brackets, s, flags=re.DOTALL)

    # Clean parentheses content (including double parentheses for shapes)
    def clean_parens(match):
        content = match.group(1)
        cleaned = re.sub(r'\s+', ' ', content.strip())
        return f'({cleaned})'

    s = re.sub(r'\(([^()]*?)\)', clean_parens, s, flags=re.DOTALL)

    # Clean curly braces content (for diamond shapes) - but be careful with
    # class diagram syntax
    if 'classDiagram' not in s:

        def clean_braces(match):
            content = match.group(1)
            cleaned = re.sub(r'\s+', ' ', content.strip())
            return f'{{{cleaned}}}'

        s = re.sub(r'\{([^{}]*?)\}', clean_braces, s, flags=re.DOTALL)

    # Clean quoted strings
    def clean_quotes(match):
        content = match.group(1)
        cleaned = re.sub(r'\s+', ' ', content.strip())
        return f'"{cleaned}"'

    s = re.sub(r'"([^"]*?)"', clean_quotes, s, flags=re.DOTALL)

    # Clean up multiple spaces and ensure proper line spacing
    lines = []
    for line in s.split('\n'):
        # Remove extra spaces within lines but preserve indentation
        cleaned_line = re.sub(r'(?<=\S)\s{2,}(?=\S)', ' ', line.rstrip())
        lines.append(cleaned_line)

    # Remove empty lines and ensure diagram starts properly
    lines = [ln for ln in lines if ln.strip()]

    # Ensure the diagram starts at the first mermaid directive line if present
    start_idx = 0
    directive_re = re.compile(
        r'^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2)\b'
    )
    for i, ln in enumerate(lines):
        if directive_re.match(ln.strip()):
            start_idx = i
            break

    # Balance subgraph/end statements to remove unmatched 'end' keywords
    lines = lines[start_idx:]
    lines = _balance_subgraph_ends(lines)

    result = '\n'.join(lines)
    return result.strip()


def _fix_class_diagram_syntax(code: str) -> str:
    """Fix common class diagram syntax issues.

    Args:
        code: Raw class diagram code

    Returns:
        str: Fixed class diagram code
    """
    lines = code.split('\n')
    fixed_lines = []
    inside_class_block = False
    class_block_content = []
    current_class_name = None

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Handle classDiagram directive
        if stripped == 'classDiagram':
            fixed_lines.append(stripped)
            continue

        # Handle class declarations
        if stripped.startswith('class '):
            # If we were in a class block, close it first
            if inside_class_block and current_class_name:
                if class_block_content:
                    fixed_lines.append(f'    class {current_class_name} {{')
                    fixed_lines.extend(
                        [f'        {content}' for content in class_block_content]
                    )
                    fixed_lines.append('    }')
                else:
                    fixed_lines.append(f'    class {current_class_name}')
                class_block_content = []

            # Parse the new class declaration
            class_match = re.match(r'class\s+(\w+)(?:\s*\{)?\s*$', stripped)
            if class_match:
                current_class_name = class_match.group(1)
                inside_class_block = '{' in stripped
                if not inside_class_block:
                    # Simple class declaration without block
                    fixed_lines.append(f'    class {current_class_name}')
                    current_class_name = None
            continue

        # Handle closing braces for class blocks
        if stripped == '}' and inside_class_block:
            if current_class_name:
                if class_block_content:
                    fixed_lines.append(f'    class {current_class_name} {{')
                    fixed_lines.extend(
                        [f'        {content}' for content in class_block_content]
                    )
                    fixed_lines.append('    }')
                else:
                    fixed_lines.append(f'    class {current_class_name}')
            inside_class_block = False
            class_block_content = []
            current_class_name = None
            continue

        # Handle content inside class blocks
        if inside_class_block:
            # Only add valid class member syntax
            if ':' in stripped or stripped.endswith('()'):
                class_block_content.append(stripped)
            continue

        # Handle relationships and other non-class content
        if '-->' in stripped or '--' in stripped or stripped.startswith('%%'):
            fixed_lines.append(f'    {stripped}')
            continue

        # Handle other mermaid syntax
        fixed_lines.append(f'    {stripped}')

    # Handle any remaining open class block
    if inside_class_block and current_class_name:
        if class_block_content:
            fixed_lines.append(f'    class {current_class_name} {{')
            fixed_lines.extend(
                [f'        {content}' for content in class_block_content]
            )
            fixed_lines.append('    }')
        else:
            fixed_lines.append(f'    class {current_class_name}')

    return '\n'.join(fixed_lines)


def create_fallback_mermaid(description: str) -> str:
    """Return a minimal, valid Mermaid diagram as a safe fallback."""
    return (
        'graph TD\n'
        '    A[Start] --> B{Process}\n'
        '    B -->|Analyze| C[Components]\n'
        '    C --> D[Interactions]\n'
        '    D --> E[Output]\n'
        f'    %% Input: {description[:80]}...\n'
    )
