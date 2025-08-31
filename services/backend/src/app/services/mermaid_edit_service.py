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

"""Mermaid diagram editing service using Gemini AI."""

from __future__ import annotations

import textwrap
from typing import Optional

from loguru import logger

from src.app.models.mermaid_edit import DiagramType
from src.app.services.gemini_service import GeminiService
from src.lib.config import settings


class MermaidEditService:
    """Service for Mermaid diagram editing using Gemini AI."""

    def __init__(self):
        """Initialize mermaid edit service."""
        self.gemini_service = GeminiService()

    def _build_edit_prompt(
        self,
        content: str,
        instructions: str,
        diagram_type: DiagramType,
        diagram_title: Optional[str] = None,
        additional_context: Optional[str] = None,
    ) -> str:
        """Build editing prompt for Gemini AI.

        Args:
            content: Mermaid diagram code
            instructions: Editing instructions
            diagram_type: Type of diagram
            diagram_title: Title of the diagram
            additional_context: Additional context

        Returns:
            str: Formatted prompt
        """
        title_str = f'Title: {diagram_title}\n\n' if diagram_title else ''
        if additional_context:
            context_str = f'Additional context: {additional_context}\n\n'
        else:
            context_str = ''

        prompt = f"""
            You are an expert Mermaid diagram editor specializing in \\
            {diagram_type.value} diagrams.

            Please edit the following Mermaid diagram according to \\
            these instructions: {instructions}

            {title_str}{context_str}Current Mermaid diagram code:
            ```mermaid
            {content}
            ```

            Requirements:
            1. Return ONLY valid Mermaid syntax
            2. Maintain proper diagram structure and relationships
            3. Ensure all nodes and connections are properly defined
            4. Use appropriate Mermaid syntax for {diagram_type.value} diagrams
            5. Do not include explanations, code blocks, or metadata
            6. Preserve important architectural relationships unless \\
            specifically asked to change them

            Return only the edited Mermaid code:
        """
        return textwrap.dedent(prompt).strip()

    async def edit_mermaid_diagram(
        self,
        content: str,
        instructions: str,
        diagram_type: DiagramType = DiagramType.FLOWCHART,
        diagram_title: Optional[str] = None,
        additional_context: Optional[str] = None,
    ) -> str:
        """Edit Mermaid diagram using Gemini AI.

        Args:
            content: Mermaid diagram code to edit
            instructions: Editing instructions
            diagram_type: Type of diagram
            diagram_title: Title of the diagram
            additional_context: Additional context

        Returns:
            str: Edited Mermaid diagram code
        """
        try:
            logger.info(f'Editing {diagram_type.value} Mermaid diagram')

            prompt = self._build_edit_prompt(
                content=content,
                instructions=instructions,
                diagram_type=diagram_type,
                diagram_title=diagram_title,
                additional_context=additional_context,
            )

            # Use GeminiService to generate content
            response = await self.gemini_service.generate_content(
                content=prompt,
                model=settings.GEMINI_MODEL,  # Use fast model for diagram editing
                response_modalities=['TEXT'],
            )

            edited_content = response.candidates[0].content.parts[0].text

            # Clean up the response to ensure it's valid Mermaid code
            edited_content = self._clean_mermaid_response(edited_content)

            logger.info('Mermaid diagram editing completed')
            return edited_content.strip()

        except Exception as e:
            logger.error(f'Mermaid diagram editing failed: {str(e)}')
            raise Exception(f'Mermaid diagram editing failed: {str(e)}')

    def _clean_mermaid_response(self, response: str) -> str:
        """Clean the AI response to extract valid Mermaid code.

        Args:
            response: Raw AI response

        Returns:
            str: Cleaned Mermaid code
        """
        # Remove code block markers if present
        response = response.strip()

        # Remove ```mermaid and ``` markers
        if response.startswith('```mermaid'):
            response = response[10:]
        elif response.startswith('```'):
            response = response[3:]

        if response.endswith('```'):
            response = response[:-3]

        # Remove any leading/trailing whitespace
        return response.strip()
