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

"""Bug Report Request Module."""

from __future__ import annotations

from pydantic import BaseModel


class DiagramData(BaseModel):
    """Diagram data structure."""

    diagram_code: str
    diagram_type: str
    title: str
    description: str


class ChatMessage(BaseModel):
    """Chat message structure."""

    role: str
    content: str


class BugReportRequest(BaseModel):
    """Bug report request model."""

    description: str
    diagram: DiagramData | None = None
    chatHistory: list[ChatMessage] | None = None
    userAgent: str | None = None
    timestamp: str | None = None
    url: str | None = None
    user_name: str | None = None
