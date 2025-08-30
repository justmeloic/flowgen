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

"""Mermaid diagram edit API schemas."""

from typing import Optional

from pydantic import BaseModel, Field, field_validator

from src.app.models.mermaid_edit import DiagramType


class MermaidEditRequest(BaseModel):
    """Mermaid diagram edit request schema."""

    content: str = Field(
        ...,
        description='Mermaid diagram code to edit',
        min_length=1,
        max_length=50000,
    )
    instructions: str = Field(
        ...,
        description='Editing instructions',
        min_length=1,
        max_length=1000,
    )
    diagram_type: DiagramType = Field(
        default=DiagramType.FLOWCHART,
        description='Type of Mermaid diagram',
    )
    diagram_title: Optional[str] = Field(
        default=None,
        description='Title of the diagram',
        max_length=200,
    )
    additional_context: Optional[str] = Field(
        default=None,
        description='Additional context for editing',
        max_length=1000,
    )

    @field_validator('content')
    def validate_content(cls, v: str) -> str:
        """
        Validates that the content is not empty or just whitespace.

        Args:
            v: The content string.

        Returns:
            The stripped content string.

        Raises:
            ValueError: If the content is empty.
        """
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v.strip()

    @field_validator('instructions')
    def validate_instructions(cls, v: str) -> str:
        """
        Validates that the instructions are not empty or just whitespace.

        Args:
            v: The instructions string.

        Returns:
            The stripped instructions string.

        Raises:
            ValueError: If the instructions are empty.
        """
        if not v.strip():
            raise ValueError('Instructions cannot be empty')
        return v.strip()


class MermaidEditResponse(BaseModel):
    """Mermaid diagram edit response schema."""

    success: bool = Field(
        ...,
        description='Whether the editing was successful',
    )
    content: str = Field(
        ...,
        description='Edited Mermaid diagram code',
    )
    diagram_type: DiagramType = Field(
        ...,
        description='Type of Mermaid diagram',
    )
