"""Main FastAPI application entry point."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google.adk.sessions import InMemorySessionService
from loguru import logger

from src.app.api.v1.endpoints import api_router
from src.app.core.config import settings
from src.app.core.logging import setup_logging
from src.app.middleware.session_middleware import SessionMiddleware


def configure_gcp_environment() -> None:
    """Configure Google Cloud Platform environment variables."""
    load_dotenv()

    if not all([settings.GOOGLE_CLOUD_PROJECT, settings.GOOGLE_CLOUD_LOCATION]):
        raise ValueError(
            'Missing required GCP env vars: GOOGLE_CLOUD_PROJECT and/or '
            'GOOGLE_CLOUD_LOCATION'
        )
    os.environ['GOOGLE_CLOUD_PROJECT'] = settings.GOOGLE_CLOUD_PROJECT
    os.environ['GOOGLE_CLOUD_LOCATION'] = settings.GOOGLE_CLOUD_LOCATION


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    setup_logging()
    logger.info('Starting Agent Orchestration API...')
    configure_gcp_environment()
    app.state.session_service = InMemorySessionService()
    yield
    logger.info('Shutting down Agent Orchestration API...')


app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    docs_url='/docs',
    redoc_url='/redoc',
    lifespan=lifespan,
)

# Set up CORS
app.add_middleware(CORSMiddleware, **settings.cors.model_dump())
app.add_middleware(SessionMiddleware)

# Set up API routes
api_v1_router = APIRouter(prefix='/api/v1')

api_v1_router.include_router(api_router)
app.include_router(api_v1_router)


# Health check endpoint - must be before catch-all route
@app.get('/health')
async def health_check():
    """Health check endpoint."""
    return {'status': 'healthy', 'version': settings.API_VERSION}


# Set up static frontend files
static_files_dir = Path(__file__).parent.parent.parent / 'build/static_frontend'

if static_files_dir.exists():
    # Mount Next.js static assets
    next_assets_path = static_files_dir / '_next'
    if next_assets_path.exists():
        app.mount(
            '/_next', StaticFiles(directory=next_assets_path), name='next-static-assets'
        )

    @app.get('/{full_path:path}', response_class=FileResponse)
    async def serve_frontend_app(full_path: str) -> FileResponse:
        """Serves frontend files or index.html for client-side routing."""
        file_path = static_files_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)

        index_html_path = static_files_dir / 'index.html'
        if index_html_path.exists():
            return FileResponse(index_html_path)

        raise HTTPException(status_code=404, detail='Not Found')

    @app.get('/', response_class=FileResponse, include_in_schema=False)
    async def serve_frontend_root() -> FileResponse:
        """Serves the frontend's index.html from the root path."""
        index_path = static_files_dir / 'index.html'
        if not index_path.exists():
            raise HTTPException(status_code=404, detail='Frontend index.html not found')
        return FileResponse(index_path)
else:

    @app.get('/')
    async def root():
        """Root endpoint for health check when no frontend is available."""
        return {
            'message': 'Agent Orchestration API is running',
            'title': settings.API_TITLE,
            'version': settings.API_VERSION,
            'status': 'healthy',
        }
