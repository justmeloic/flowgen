"""
Main FastAPI application entry point.

This module contains the core FastAPI application setup for the Agent Orchestration service.
It handles application configuration, middleware setup, routing, and serves both API endpoints
and static frontend files. The application integrates with Google Cloud Platform services
and provides session management capabilities.

Features:
- RESTful API endpoints for agent orchestration
- Static file serving for frontend applications
- CORS middleware for cross-origin requests
- Session management with in-memory storage
- Health check endpoints
- Comprehensive logging setup
- GCP environment configuration
"""

import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.adk.sessions import InMemorySessionService
from loguru import logger

from src.app.api.v1.endpoints import api_router
from src.app.core.config import settings
from src.app.core.logging import setup_logging
from src.app.middleware.session_middleware import SessionMiddleware
from src.app.staticfrontend.router import register_frontend_routes


def configure_gcp_environment() -> None:
    """
    Configure Google Cloud Platform environment variables.

    This configuration is essential when GOOGLE_GENAI_USE_VERTEXAI=TRUE as the
    VertexAI service will be accessed through the GCP platform.
    """
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
    """
    Handle application startup and shutdown events.

    This async context manager manages the application lifecycle, performing
    necessary setup during startup and cleanup during shutdown. It configures
    logging, validates GCP environment, and initializes the session service.

    Args:
        app (FastAPI): The FastAPI application instance.

    Yields:
        None: Control is yielded back to the application during its runtime.

    Note:
        This function is called automatically by FastAPI during application
        startup and shutdown phases.
    """
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

# Set up middleware
app.add_middleware(CORSMiddleware, **settings.cors.model_dump())
app.add_middleware(SessionMiddleware)

# Set up API routes
api_v1_router = APIRouter(prefix='/api/v1')

api_v1_router.include_router(api_router)
app.include_router(api_v1_router)


# Health check endpoint - must be before catch-all route
@app.get('/health')
async def health_check():
    """
    Health check endpoint for application monitoring.

    Provides a simple health status check that can be used by load balancers,
    monitoring systems, or deployment pipelines to verify that the application
    is running and responsive.

    Returns:
        dict: A dictionary containing the application status and version.
            - status (str): Always "healthy" when the endpoint is reachable
            - version (str): The current API version from settings

    Example:
        GET /health
        Response: {"status": "healthy", "version": "1.0.0"}
    """
    return {'status': 'healthy', 'version': settings.API_VERSION}


# Register frontend routes
register_frontend_routes(app)
