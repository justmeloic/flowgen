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

"""Request schemas for the root agent API.

This module defines the Pydantic models for validating incoming API requests.
"""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field, field_validator
from typing_extensions import Literal


class Query(BaseModel):
    """Represents a query from a user to the agent."""

    text: str = Field(..., min_length=1, description="The user's query text")
    model: Optional[str] = Field(
        default=None,
        description='Model to use for this query. If not provided, uses default',
    )
    platform: Optional[Literal['aws', 'gcp', 'azure', 'general']] = Field(
        default=None,
        description='Target cloud platform for provider-specific guidance',
    )
    file_artifacts: Optional[List[str]] = Field(
        default=None,
        description='List of artifact IDs for files uploaded with this message',
    )

    @field_validator('text')
    @classmethod
    def text_must_not_be_empty(cls, v: str) -> str:
        """Validates that text is not empty or just whitespace."""
        if not v.strip():
            raise ValueError('Text must not be empty or just whitespace')
        return v.strip()

    @field_validator('model')
    @classmethod
    def validate_model(cls, v: Optional[str]) -> Optional[str]:
        """Validates that the model is supported if provided."""
        if v is not None:
            # Import here to avoid circular imports
            from src.lib.config import settings

            if v not in settings.AVAILABLE_MODELS:
                available = list(settings.AVAILABLE_MODELS.keys())
                raise ValueError(
                    f'Model "{v}" not supported. Available models: {available}'
                )
        return v

    @field_validator('platform')
    @classmethod
    def validate_platform(
        cls, v: Optional[str]
    ) -> Optional['Literal["aws","gcp","azure","general"]']:
        """Normalizes and validates platform value if provided."""
        if v is None:
            return None
        v_norm = v.lower().strip()
        if v_norm not in {'aws', 'gcp', 'azure', 'general'}:
            raise ValueError('platform must be one of: aws, gcp, azure, general')
        return v_norm  # type: ignore[return-value]

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            'example': {
                'text': 'What are the latest developments in AI?',
                'model': 'gemini-2.5-pro',
                'platform': 'general',
            }
        }
