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

"""
Authentication models for the Architecture Designer API.

This module defines the Pydantic models used for authentication endpoints
including login requests and responses.
"""

from pydantic import BaseModel, Field, field_validator


class LoginRequest(BaseModel):
    """Model for login request data."""

    secret: str = Field(..., min_length=1, description='Authentication secret')
    email: str = Field(..., min_length=1, description='User email address')

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Validate email format."""
        import re

        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v.strip().lower()):
            raise ValueError('Invalid email format')

        return v.strip().lower()


class LoginResponse(BaseModel):
    """Model for login response data."""

    success: bool = Field(..., description='Whether login was successful')
    message: str = Field(..., description='Response message')
    session_id: str = Field(..., description='Session ID for authenticated user')


class LogoutResponse(BaseModel):
    """Model for logout response data."""

    success: bool = Field(..., description='Whether logout was successful')
    message: str = Field(..., description='Response message')
