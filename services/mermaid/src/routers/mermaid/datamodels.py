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
"""Pydantic models for the Mermaid API.

This module defines the data structures for request and response bodies
used by the /mermaid endpoint.
"""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class MermaidRequest(BaseModel):
    """Represents a mermaid request with a message and optional conversation ID.

    Attributes:
        message: The message content for the mermaid interaction.
        conversation_id: Optional unique ID to track the conversation. If not
                         provided, a new conversation is started.
    """

    message: str = Field(
        ...,
        description="The message content for the mermaid interaction.",
        min_length=1,
        json_schema_extra={"example": "Hello, how are you?"},
    )
    conversation_id: Optional[str] = Field(
        None,
        description=("Unique identifier for the conversation. If not provided, a new conversation is started."),
        json_schema_extra={"example": "conv-1234-abcd-5678-efgh"},
    )


class MermaidResponse(BaseModel):
    """Represents the response from the mermaid endpoint.

    Attributes:
        response: The generated response from the model.
        conversation_id: The unique ID of the conversation.
    """

    response: str = Field(..., description="The generated response from the mermaid model.")
    conversation_id: str = Field(..., description="Unique identifier for the conversation.")
