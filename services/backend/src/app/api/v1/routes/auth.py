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
Authentication endpoints for the Architecture Designer API.

This module provides endpoints for user authentication including login and logout
functionality. It uses session-based authentication integrated with the existing
session middleware.
"""

import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from google.adk.events import Event, EventActions
from google.adk.sessions import Session
from loguru import logger as _logger

from src.app.models.login import LoginRequest, LoginResponse, LogoutResponse
from src.app.utils.dependencies import get_or_create_session, get_session_service
from src.lib.config import settings

router = APIRouter()


@router.post('/login', response_model=LoginResponse)
async def login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    session: Session = Depends(get_or_create_session),
) -> LoginResponse:
    """
    Authenticate user with secret and create authenticated session.

    Args:
        login_data: Login credentials including secret and optional name
        request: FastAPI request object containing session information
        response: FastAPI response object to set headers
        session: The active user session

    Returns:
        LoginResponse: Authentication result with session information

    Raises:
        HTTPException: If authentication fails or session issues occur
    """
    try:
        # Validate the secret
        if login_data.secret != settings.AUTH_SECRET:
            _logger.warning('Failed login attempt with invalid secret from session')
            raise HTTPException(status_code=401, detail='Invalid access code')

        # Validate the email is authorized
        user_email = login_data.email.lower()
        authorized_emails = settings.authorized_emails_list

        if not authorized_emails:
            # If no authorized emails are configured, deny access
            _logger.warning(
                f'Login attempt with email {user_email} but no authorized emails '
                'configured'
            )
            raise HTTPException(status_code=403, detail='Access not authorized')

        if user_email not in authorized_emails:
            _logger.warning(f'Login attempt with unauthorized email: {user_email}')
            raise HTTPException(
                status_code=403, detail='Email not authorized for access'
            )

        # Set authentication flag in session state using proper ADK mechanism
        session_service = get_session_service(request)
        current_time = time.time()

        # Create state changes for authentication
        auth_state_changes = {
            'authenticated': True,
            'user_email': user_email,
            'login_timestamp': str(__import__('datetime').datetime.now()),
        }

        # Create event with state delta to properly persist changes
        auth_event = Event(
            invocation_id=f'login_{session.id}_{int(current_time)}',
            author='system',
            actions=EventActions(state_delta=auth_state_changes),
            timestamp=current_time,
        )

        # Persist the authentication state via append_event
        await session_service.append_event(session, auth_event)

        _logger.info(
            f"Successful login for user '{user_email}' with session {session.id}"
        )

        # Make sure the session ID is set in the response header
        response.headers['X-Session-ID'] = session.id

        return LoginResponse(
            success=True,
            message='Authentication successful',
            session_id=session.id,
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        _logger.error(f'Unexpected error during login: {e}')
        raise HTTPException(
            status_code=500, detail='Internal server error during authentication'
        )


@router.post('/logout', response_model=LogoutResponse)
async def logout(
    request: Request,
    session: Session = Depends(get_or_create_session),
) -> LogoutResponse:
    """
    Logout user by clearing authentication from session.

    Args:
        request: FastAPI request object containing session information
        session: The active user session

    Returns:
        LogoutResponse: Logout result
    """
    try:
        user_email = session.state.get('user_email', 'Unknown')
        _logger.info(f"Logging out user '{user_email}' with session {session.id}")

        # Clear authentication using proper ADK mechanism
        session_service = get_session_service(request)
        current_time = time.time()

        # Create state changes for logout
        logout_state_changes = {
            'authenticated': False,
            'logout_timestamp': str(__import__('datetime').datetime.now()),
        }

        # Create event with state delta to properly persist changes
        logout_event = Event(
            invocation_id=f'logout_{session.id}_{int(current_time)}',
            author='system',
            actions=EventActions(state_delta=logout_state_changes),
            timestamp=current_time,
        )

        # Persist the logout state via append_event
        await session_service.append_event(session, logout_event)

        return LogoutResponse(success=True, message='Logout successful')

    except Exception as e:
        _logger.error(f'Error during logout: {e}')
        # Return success anyway - logout should be forgiving
        return LogoutResponse(success=True, message='Logout completed')


@router.get('/status')
async def auth_status(
    session: Session = Depends(get_or_create_session),
) -> dict:
    """
    Check current authentication status.

    Args:
        session: The active user session

    Returns:
        dict: Authentication status information
    """
    try:
        return {
            'authenticated': session.state.get('authenticated', False),
            'session_id': session.id,
            'user_email': session.state.get('user_email', None),
            'login_timestamp': session.state.get('login_timestamp', None),
        }

    except Exception as e:
        _logger.error(f'Error checking auth status: {e}')
        return {
            'authenticated': False,
            'session_id': None,
            'user_email': None,
            'error': 'Status check failed',
        }
