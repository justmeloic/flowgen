"""
Authentication endpoints for the Agent Orchestration API.

This module provides endpoints for user authentication including login and logout
functionality. It uses session-based authentication integrated with the existing
session middleware.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from google.adk.sessions import Session
from loguru import logger

from src.app.core.config import settings
from src.app.models.login import LoginRequest, LoginResponse, LogoutResponse
from src.app.utils.dependencies import get_or_create_session

router = APIRouter(prefix='/auth', tags=['authentication'])


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
            logger.warning('Failed login attempt with invalid secret from session')
            raise HTTPException(status_code=401, detail='Invalid access code')

        # Set authentication flag in session state
        session.state['authenticated'] = True
        session.state['user_name'] = (
            login_data.name.strip() if login_data.name else 'Anonymous'
        )
        session.state['login_timestamp'] = str(__import__('datetime').datetime.now())

        logger.info(
            f"Successful login for user '{session.state['user_name']}' with session {session.id}"
        )

        return LoginResponse(
            success=True,
            message='Authentication successful',
            session_id=session.id,
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f'Unexpected error during login: {e}')
        raise HTTPException(
            status_code=500, detail='Internal server error during authentication'
        )


@router.post('/logout', response_model=LogoutResponse)
async def logout(
    session: Session = Depends(get_or_create_session),
) -> LogoutResponse:
    """
    Logout user by clearing authentication from session.

    Args:
        session: The active user session

    Returns:
        LogoutResponse: Logout result
    """
    try:
        user_name = session.state.get('user_name', 'Unknown')
        logger.info(f"Logging out user '{user_name}' with session {session.id}")

        # Clear authentication but keep session for potential re-login
        session.state['authenticated'] = False
        session.state['logout_timestamp'] = str(__import__('datetime').datetime.now())

        return LogoutResponse(success=True, message='Logout successful')

    except Exception as e:
        logger.error(f'Error during logout: {e}')
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
            'user_name': session.state.get('user_name', None),
            'login_timestamp': session.state.get('login_timestamp', None),
        }

    except Exception as e:
        logger.error(f'Error checking auth status: {e}')
        return {
            'authenticated': False,
            'session_id': None,
            'user_name': None,
            'error': 'Status check failed',
        }
