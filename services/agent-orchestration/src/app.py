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

"""
Application Entry Point Module

This module initializes and configures the FastAPI application,
sets up CORS middleware, includes the necessary routers,
and serves the static frontend application.
"""

import logging
import os
import signal
import sys
from contextlib import asynccontextmanager
from typing import Dict, NoReturn, Optional

import uvicorn
from absl import app as absl_app
from absl import flags
from dotenv import load_dotenv  # Add this import at the top
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google.adk.sessions import InMemorySessionService

from config import get_settings
from middleware.session_middleware import SessionMiddleware
from routers.root_agent_router import router as root_agent_router

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Define flags
FLAGS = flags.FLAGS


def setup_logging(log_level: str) -> None:
    """Set up logging configuration.

    Args:
        log_level: The logging level to use
    """
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f'Invalid log level: {log_level}')
    logging.getLogger().setLevel(numeric_level)


def configure_gcp_environment() -> None:
    """
    Configure environment variables and Google Cloud settings.
    Raises ValueError if required Google Cloud variables are missing.
    """
    # Load environment variables
    load_dotenv()

    # Configure Google Cloud environment
    try:
        os.environ['GOOGLE_CLOUD_PROJECT'] = os.getenv('GOOGLE_CLOUD_PROJECT', '')
        os.environ['GOOGLE_CLOUD_LOCATION'] = os.getenv('GOOGLE_CLOUD_LOCATION', '')
        if not all(
            [os.environ['GOOGLE_CLOUD_PROJECT'], os.environ['GOOGLE_CLOUD_LOCATION']]
        ):
            # Kept original behavior of raising an error.
            # If local testing without these is desired, change to logger.warning.
            raise ValueError(
                'Missing required Google Cloud environment variables: GOOGLE_CLOUD_PROJECT and/or GOOGLE_CLOUD_LOCATION'
            )
    except Exception as e:
        logger.error(f'Environment configuration error: {str(e)}')
        raise


def signal_handler(signum: int, frame: Optional[object]) -> None:
    """Handle shutdown signals.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    logger.info(f'Received signal {signum}. Initiating graceful shutdown...')
    sys.exit(0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup
    logger.info('Starting up application...')
    # Create and store session service in app state
    app.state.session_service = InMemorySessionService()
    yield
    # Cleanup
    logger.info('Shutting down application...')
    if hasattr(app.state, 'session_service'):
        try:
            await app.state.session_service.cleanup()
        except Exception as e:
            logger.error(f'Error cleaning up session service: {e}')

    # Runner doesn't have cleanup, so we'll just remove it
    if hasattr(app.state, 'runner'):
        try:
            delattr(app.state, 'runner')
        except Exception as e:
            logger.error(f'Error removing runner: {e}')


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application instance
    """
    # Ensure flags are parsed before accessing them
    if not FLAGS.is_parsed():
        FLAGS(sys.argv)

    # Configure environment before creating the app
    configure_gcp_environment()

    settings = get_settings()

    # Initialize FastAPI app
    app = FastAPI(
        title=settings['api']['title'],
        description=settings['api']['description'],
        version=settings['api']['version'],
        lifespan=lifespan,
    )

    # Configure CORS first - order matters!
    app.add_middleware(CORSMiddleware, **settings['cors'])

    # Add session middleware after CORS
    app.add_middleware(SessionMiddleware)

    # --- API Routes ---
    # Create API v1 router
    api_v1_router = APIRouter(prefix='/api/v1')

    # (Optional) Move old root API info to a dedicated API endpoint
    @api_v1_router.get('/status', tags=['Server Info'])
    async def api_status() -> Dict[str, str]:
        """Provides API information."""
        return {
            'title': settings['api']['title'],
            'description': settings['api']['description'],
            'version': settings['api']['version'],
            'status': 'healthy',
        }

    # Register your API routers under API v1
    try:
        api_v1_router.include_router(root_agent_router)
        # Add other API routers to api_v1_router if you have them
        app.include_router(api_v1_router)
        logger.info('Successfully registered all API routers under /api/v1')
    except Exception as e:
        logger.error(f'Failed to register API routers: {str(e)}')
        raise

    # --- Static Frontend Files Configuration ---
    # app.py is in services/agent-orchestration/src
    # static_frontend is in services/agent-orchestration/static_frontend
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    STATIC_FILES_DIR = os.path.join(BASE_DIR, '..', 'static_frontend')

    if not os.path.exists(STATIC_FILES_DIR):
        logger.warning(
            f'Frontend static files directory not found at: {STATIC_FILES_DIR}'
        )
        logger.warning("Frontend will not be served. Ensure 'static_frontend' exists.")
    else:
        logger.info(f'Serving frontend static files from: {STATIC_FILES_DIR}')

        # Mount Next.js's internal static assets (e.g., /_next/static/...)
        next_assets_path = os.path.join(STATIC_FILES_DIR, '_next')
        if os.path.exists(next_assets_path):
            app.mount(
                '/_next',
                StaticFiles(directory=next_assets_path),
                name='next-static-assets',
            )
            logger.info(f'Mounted Next.js static assets from: {next_assets_path}')
        else:
            logger.warning(
                f"Next.js '_next' assets directory not found at: {next_assets_path}. Critical frontend assets might be missing."
            )

        # Catch-all route to serve index.html for client-side routing,
        # or other static files from the root of STATIC_FILES_DIR (e.g., favicon.ico)
        # This MUST be defined AFTER API routes and specific static mounts like /_next.
        @app.get('/{full_path:path}')
        async def serve_frontend_app(full_path: str):
            file_path = os.path.join(STATIC_FILES_DIR, full_path)

            # If the requested path is a file, serve it directly
            if os.path.isfile(file_path):
                return FileResponse(file_path)

            # If not a direct file, it's likely a client-side route. Serve index.html.
            index_html_path = os.path.join(STATIC_FILES_DIR, 'index.html')
            if os.path.exists(index_html_path):
                return FileResponse(index_html_path)

            logger.warning(
                f"Requested path '{full_path}' not found as a file, and index.html is missing from {STATIC_FILES_DIR}."
            )
            raise HTTPException(status_code=404, detail='Not Found')

        # Ensure root path serves index.html if it exists
        # The catch-all above handles this, but this can be an explicit check.
        @app.get('/')
        async def serve_root_index():
            index_html_path = os.path.join(STATIC_FILES_DIR, 'index.html')
            if os.path.exists(index_html_path):
                return FileResponse(index_html_path)
            logger.warning(
                f'index.html not found at root in {STATIC_FILES_DIR}. API status might be served if no frontend is present.'
            )
            # Fallback if you want to show API status if index.html isn't found AT ALL.
            # However, the goal is usually to serve the frontend or 404.
            # The catch-all route above will typically handle this better with a 404 if index.html is missing.
            # This explicit @app.get("/") here might become redundant or conflict depending on exact registration order
            # with the catch-all. It's generally safer to rely on the catch-all for SPA behavior.
            # For clarity, relying on the catch-all is better. I'll comment this explicit root out.
            raise HTTPException(
                status_code=404, detail='Frontend index.html not found.'
            )

    return app


def run_server(
    app_instance: FastAPI, host: str, port: int
) -> None:  # Renamed app to app_instance to avoid conflict
    """Run the uvicorn server.

    Args:
        app_instance: FastAPI application instance
        host: Server host
        port: Server port
    """
    try:
        uvicorn.run(
            app_instance, host=host, port=port, log_level=FLAGS.log_level.lower()
        )
    except Exception as e:
        logger.error(f'Failed to start server: {str(e)}')
        raise


def main(argv) -> NoReturn:
    """Main function to run the application.

    Args:
        argv: Command line arguments
    """
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    # Set up logging
    setup_logging(FLAGS.log_level)

    # Get settings
    settings = (
        get_settings()
    )  # settings is already fetched here, can be passed if needed

    # Create and run application
    # Renamed 'app' variable to 'fastapi_app' in this scope to avoid confusion
    fastapi_app = create_app()
    run_server(
        fastapi_app, host=settings['server']['host'], port=settings['server']['port']
    )


# Create the FastAPI application instance for use by other modules
if __name__ == '__main__':
    # Let absl.app handle flag parsing and then call main()
    absl_app.run(main)
else:
    # When imported as a module (e.g. by tests), ensure flags are parsed
    if not FLAGS.is_parsed():
        FLAGS(sys.argv)  # Pass sys.argv for flag parsing
    # Renamed 'app' variable to 'application' to avoid potential global/local scope issues
    # or conflict if 'app' is expected to be a specific instance by importers.
    application = create_app()
