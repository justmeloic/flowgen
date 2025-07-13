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
