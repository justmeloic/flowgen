"""Main API router for v1."""

from fastapi import APIRouter

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
