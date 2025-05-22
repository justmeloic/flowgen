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
sets up CORS middleware, and includes the necessary routers.
"""

import logging
import signal
import sys
from typing import NoReturn, Optional, Dict
from contextlib import asynccontextmanager

import uvicorn
from absl import app as absl_app, flags
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers.root_agent_router import router as root_agent_router, SessionMiddleware

# Configure logging
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
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
        raise ValueError(f"Invalid log level: {log_level}")
    logging.getLogger().setLevel(numeric_level)


def signal_handler(signum: int, frame: Optional[object]) -> None:
    """Handle shutdown signals.

    Args:
        signum: Signal number
        frame: Current stack frame
    """
    logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
    sys.exit(0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events.

    Args:
        app: FastAPI application instance
    """
    # Startup
    logger.info("Starting up application...")
    yield
    # Shutdown
    logger.info("Shutting down application...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application instance
    """
    # Ensure flags are parsed before accessing them
    if not FLAGS.is_parsed():
        FLAGS(sys.argv)

    settings = get_settings()

    # Initialize FastAPI app
    app = FastAPI(
        title=settings["api"]["title"],
        description=settings["api"]["description"],
        version=settings["api"]["version"],
        lifespan=lifespan,
    )

    # Configure CORS first - order matters!
    app.add_middleware(CORSMiddleware, **settings["cors"])

    # Add session middleware after CORS
    app.add_middleware(SessionMiddleware)

    @app.get("/")
    async def root() -> Dict[str, str]:
        """Root endpoint that provides API information.

        Returns:
            Dict[str, str]: Basic API information
        """
        return {
            "title": settings["api"]["title"],
            "description": settings["api"]["description"],
            "version": settings["api"]["version"],
            "status": "healthy",
            "docs_url": "/docs",
            "redoc_url": "/redoc",
            "api_v1_url": "/api/v1",
        }

    # Create API v1 router
    api_v1_router = APIRouter(prefix="/api/v1")

    # Register routers under API v1
    try:
        api_v1_router.include_router(root_agent_router)
        app.include_router(api_v1_router)
        logger.info("Successfully registered all routers")
    except Exception as e:
        logger.error(f"Failed to register routers: {str(e)}")
        raise

    return app


def run_server(app: FastAPI, host: str, port: int) -> None:
    """Run the uvicorn server.

    Args:
        app: FastAPI application instance
        host: Server host
        port: Server port
    """
    try:
        uvicorn.run(app, host=host, port=port, log_level=FLAGS.log_level.lower())
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
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
    settings = get_settings()

    # Create and run application
    app = create_app()
    run_server(app, host=settings["server"]["host"], port=settings["server"]["port"])


# Create the FastAPI application instance for use by other modules
if __name__ == "__main__":
    # Let absl.app handle flag parsing and then call main()
    absl_app.run(main)
else:
    # When imported as a module (e.g. by tests), ensure flags are parsed
    if not FLAGS.is_parsed():
        FLAGS(sys.argv)
    app = create_app()
