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
"""Main module for the FastAPI application, configured and run with Abseil."""

from __future__ import annotations

# Standard library imports
import logging
import os
from typing import Sequence

# Third-party imports
import uvicorn
from absl import app as absl_app
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Application-specific imports
from src.config.api import get_settings
from src.config.api import FLAGS  # Assuming FLAGS are defined here
from src.routers.mermaid.router import router as mermaid_router

# Module-level constants and singletons
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
_logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Creates and configures the FastAPI application using settings from FLAGS.

    Returns:
        A configured FastAPI application instance.
    """
    _logger.info('Creating FastAPI application in "%s" mode...', FLAGS.app_env)

    settings = get_settings()

    # Load .env file ONLY for local development. In production, environment
    # variables should be injected directly (e.g., by Cloud Run).
    if FLAGS.app_env == "development":
        load_dotenv()
        _logger.info("Loaded environment variables from .env file.")

    app = FastAPI(
        title=settings["api"]["title"],
        description=settings["api"]["description"],
        version=settings["api"]["version"],
    )

    # --- Register Middleware ---
    app.add_middleware(CORSMiddleware, **settings["cors"])

    # --- API Routes ---
    app.include_router(mermaid_router, prefix="/api/v1")

    # --- Static Frontend Files Configuration ---
    static_dir = os.path.abspath(FLAGS.static_dir_name)
    _logger.info("Attempting to serve static files from: %s", static_dir)

    if not os.path.isdir(static_dir):
        _logger.warning(
            "Static directory not found at: %s. It will not be mounted.",
            static_dir,
        )
    else:
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
        _logger.info("Successfully mounted static files directory.")

    _logger.info("FastAPI application configured successfully.")

    return app


def main(argv: Sequence[str]) -> None:
    """Main entry point: parses flags, sets up logging, creates app, runs server.

    Args:
        argv: Command-line arguments passed by absl.app.run.
    """
    del argv  # Unused in this main function after Abseil parsing.

    # Configure logging after flags are parsed, so FLAGS.log_level is available.
    # Note: Uvicorn has its own log_level setting for its loggers.
    # This basicConfig is for other application loggers.
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        level=FLAGS.log_level.upper(),  # Use log_level from FLAGS
    )

    app_instance = create_app()

    _logger.info("Starting Uvicorn server on http://%s:%d", FLAGS.host, FLAGS.port)
    uvicorn.run(
        app_instance,
        host=FLAGS.host,
        port=FLAGS.port,
        log_level=FLAGS.log_level.lower(),
    )


if __name__ == "__main__":
    absl_app.run(main)
