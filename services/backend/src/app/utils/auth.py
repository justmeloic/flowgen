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
Authentication dependency for protecting routes.

This module provides authentication dependencies for protecting API routes
that require user authentication.
"""

from fastapi import Depends, HTTPException, status
from google.adk.sessions import Session

from src.app.utils.dependencies import get_or_create_session


def require_authentication(
    session: Session = Depends(get_or_create_session),
) -> Session:
    """
    Dependency that requires user authentication.

    Args:
        session: The active user session

    Returns:
        Session: The authenticated session

    Raises:
        HTTPException: If user is not authenticated
    """
    if not session.state.get('authenticated', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail='Authentication required'
        )
    return session
