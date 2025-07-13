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

"""Main API router for v1."""

from fastapi import APIRouter

from src.app.api.v1 import auth
from src.app.api.v1.routes import root_router
from src.app.core.config import settings

api_router = APIRouter()


# Status endpoint for API v1
@api_router.get('/status', tags=['Server Info'])
async def api_status() -> dict[str, str]:
    """Provides API information and health status."""
    return {
        'title': settings.API_TITLE,
        'description': settings.API_DESCRIPTION,
        'version': settings.API_VERSION,
        'status': 'healthy',
    }


# Include route modules
api_router.include_router(root_router.router, prefix='/root_agent', tags=['root-agent'])
api_router.include_router(auth.router)
