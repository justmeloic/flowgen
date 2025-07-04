"""Utility Router Module.

This module provides utility endpoints for development and PoC purposes.
These endpoints are not intended for production use and should be used with caution.
"""

import subprocess

from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post('/restart')
async def restart_server():
    """
    Restarts the Uvicorn server by executing an external shell script.
    **Warning:** For internal PoC use only. Not secure for production.
    """
    try:
        subprocess.Popen(['./scripts/restart-server.sh'])
        return {'message': 'Server is restarting...'}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f'Failed to execute restart script: {e}',
        )
