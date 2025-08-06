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

"""Response schemas for the root agent API.

This module defines the Pydantic models for API responses.
"""

from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class AgentReference(BaseModel):
    """Represents a reference used by the agent in its response."""

    source: str = Field(..., description='Source of the reference')
    page: Optional[int] = Field(None, description='Page number if applicable')
    section: Optional[str] = Field(None, description='Section reference')
    url: Optional[str] = Field(None, description='URL reference')


class AgentResponse(BaseModel):
    """Represents the agent's response to a user query."""

    response: str = Field(..., description="The agent's text response")
    references: Dict[str, Any] = Field(
        default_factory=dict, description='References and sources used by the agent'
    )
    session_id: Optional[str] = Field(None, description='Session identifier')
    confidence: Optional[float] = Field(
        None, ge=0.0, le=1.0, description='Confidence score of the response'
    )

    class Config:
        """Pydantic configuration."""

        json_schema_extra = {
            'example': {
                'response': (
                    'According to your CBA, overtime is paid at 1.5x the regular rate '
                    'for hours worked over 8 in a day or 40 in a week.'
                ),
                'references': {
                    'section_12_3': 'CBA Section 12.3 - Overtime Compensation'
                },
                'session_id': 'abc123-def456-ghi789',
                'confidence': 0.95,
            }
        }
