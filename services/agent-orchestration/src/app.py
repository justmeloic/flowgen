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
"""Application Entry Point Module.

This module initializes and configures the FastAPI application,
sets up CORS middleware, includes the necessary routers,
and serves the static frontend application.
"""

from __future__ import annotations

# Standard library imports
import logging
import os
import signal
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional, Sequence

# Third-party imports
import uvicorn
from absl import app as absl_app
from absl import flags
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from google.adk.sessions import InMemorySessionService

# Application-specific imports
from src.config.api import get_settings
from src.middleware.session_middleware import SessionMiddleware
from src.routers.root_agent.router import router as root_agent_router

# Module-level constants and singletons
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
_logger = logging.getLogger(__name__)
FLAGS = flags.FLAGS


def setup_logging(log_level: str) -> None:
    """Sets up the logging configuration for the application.

    Args:
        log_level: The logging level to use (e.g., 'INFO', 'DEBUG').
    """
    numeric_level = getattr(logging, log_level.upper(), None)
    if not isinstance(numeric_level, int):
        raise ValueError(f'Invalid log level: {log_level}')
    logging.getLogger().setLevel(numeric_level)


def configure_gcp_environment() -> None:
    """Configures environment variables for Google Cloud Platform.

    Loads environment variables from a .env file and ensures that
    GCP-specific variables are set.

    Raises:
        ValueError: If required Google Cloud environment variables are missing.
    """
    load_dotenv()

    try:
        os.environ['GOOGLE_CLOUD_PROJECT'] = os.getenv('GOOGLE_CLOUD_PROJECT', '')
        os.environ['GOOGLE_CLOUD_LOCATION'] = os.getenv('GOOGLE_CLOUD_LOCATION', '')
        if not all(
            [
                os.environ['GOOGLE_CLOUD_PROJECT'],
                os.environ['GOOGLE_CLOUD_LOCATION'],
            ]
        ):
            raise ValueError(
                'Missing required GCP env vars: GOOGLE_CLOUD_PROJECT and/or'
                ' GOOGLE_CLOUD_LOCATION'
            )
    except Exception as e:
        _logger.error('Environment configuration error: %s', e)
        raise


def _signal_handler(signum: int, frame: Optional[object]) -> None:
    """Handles shutdown signals for graceful termination.

    Args:
        signum: The signal number received.
        frame: The current stack frame.
    """
    _logger.info('Received signal %d. Initiating graceful shutdown...', signum)
    sys.exit(0)


@asynccontextmanager
async def lifespan(app: FastAPI) -> None:
    """Manages the application's startup and shutdown events.

    Args:
        app: The FastAPI application instance.

    Yields:
        None, after startup logic is complete.
    """
    _logger.info('Starting up application...')
    app.state.session_service = InMemorySessionService()
    yield
    _logger.info('Shutting down application...')
    if hasattr(app.state, 'runner'):
        try:
            delattr(app.state, 'runner')
        except Exception as e:
            _logger.error('Error removing runner: %s', e)


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application instance.

    Returns:
        A configured FastAPI application instance.
    """
    configure_gcp_environment()
    settings = get_settings()

    app = FastAPI(
        title=settings['api']['title'],
        description=settings['api']['description'],
        version=settings['api']['version'],
        lifespan=lifespan,
    )

    app.add_middleware(CORSMiddleware, **settings['cors'])
    app.add_middleware(SessionMiddleware)

    # --- API Routes ---
    api_v1_router = APIRouter(prefix='/api/v1')

    @api_v1_router.get('/status', tags=['Server Info'])
    async def api_status() -> dict[str, str]:
        """Provides API information and health status."""
        return {
            'title': settings['api']['title'],
            'description': settings['api']['description'],
            'version': settings['api']['version'],
            'status': 'healthy',
        }

    try:
        api_v1_router.include_router(root_agent_router)
        app.include_router(api_v1_router)
        _logger.info('Successfully registered all API routers under /api/v1')
    except Exception as e:
        _logger.error('Failed to register API routers: %s', e)
        raise

    # --- Static Frontend Files Configuration ---
    static_files_dir = Path(__file__).parent.parent / 'static_frontend'

    if not static_files_dir.exists():
        _logger.warning(
            'Frontend static files directory not found at: %s', static_files_dir
        )
        _logger.warning("Frontend will not be served. Ensure 'static_frontend' exists.")
    else:
        _logger.info('Serving frontend static files from: %s', static_files_dir)
        next_assets_path = static_files_dir / '_next'
        if next_assets_path.exists():
            app.mount(
                '/_next',
                StaticFiles(directory=next_assets_path),
                name='next-static-assets',
            )
            _logger.info('Mounted Next.js static assets from: %s', next_assets_path)
        else:
            _logger.warning(
                "Next.js '_next' assets directory not found at: %s. Critical"
                ' frontend assets might be missing.',
                next_assets_path,
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

            _logger.warning(
                "Requested path '%s' not found, and index.html is missing.",
                full_path,
            )
            raise HTTPException(status_code=404, detail='Not Found')

        @app.get('/', response_class=FileResponse, include_in_schema=False)
        async def serve_frontend_root() -> FileResponse:
            """Serves the frontend's index.html from the root path."""
            index_path = static_files_dir / 'index.html'
            if not index_path.exists():
                raise HTTPException(
                    status_code=404, detail='Frontend index.html not found'
                )
            return FileResponse(index_path)

    return app


def run_server(app_instance: FastAPI, host: str, port: int) -> None:
    """Runs the Uvicorn server.

    Args:
        app_instance: The FastAPI application instance to run.
        host: The server host to bind to.
        port: The server port to bind to.
    """
    try:
        uvicorn.run(
            app_instance,
            host=host,
            port=port,
            log_level=FLAGS.log_level.lower(),
        )
    except Exception as e:
        _logger.error('Failed to start server: %s', e)
        raise


def main(argv: Sequence[str]) -> None:
    """Main function to create and run the application.

    This function is called by `absl.app.run`, which handles flag parsing.
    """
    del argv  # Unused by main.
    signal.signal(signal.SIGINT, _signal_handler)
    signal.signal(signal.SIGTERM, _signal_handler)

    # Functions that depend on FLAGS can now be called safely.
    setup_logging(FLAGS.log_level)
    app = create_app()
    settings = get_settings()  # Settings are needed here for run_server
    run_server(app, host=settings['server']['host'], port=settings['server']['port'])


if __name__ == '__main__':
    # When run as a script, absl.app will parse flags and then call main().
    absl_app.run(main)
else:
    # When imported as a module (e.g., by an ASGI server like Uvicorn),
    # flags are not parsed by default. We must parse them here to ensure
    # that the `application` object can be created correctly.
    if not FLAGS.is_parsed():
        # Pass sys.argv to allow flag overrides from the command line, e.g.:
        # uvicorn src.app:application -- --port=9090
        FLAGS(sys.argv)
    application = create_app()
