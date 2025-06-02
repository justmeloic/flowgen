"""
Main module for the FastAPI application, configured and run with Abseil.
"""

import os
import logging
from typing import Sequence

import uvicorn
from absl import app
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.routers.mermaid.router import router as mermaid_router
from src.config.api import FLAGS  # Import configuration flags

# Configure logging
logging.basicConfig(format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """
    Creates and configures the FastAPI application using settings from FLAGS.
    """
    logger.info('Creating FastAPI application in "%s" mode...', FLAGS.app_env)

    # --- Environment Variables ---
    # Load .env file ONLY for local development. In production, environment
    # variables should be injected directly (e.g., by Cloud Run).
    if FLAGS.app_env == "development":
        load_dotenv()
        logger.info("Loaded environment variables from .env file.")

    app = FastAPI(
        title="Mermaid API",
        description="API for interacting with a Gemini based Mermaid Model.",
        version="0.1.0",
    )

    # --- CORS ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Or use a flag for more specific origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Routers ---
    app.include_router(mermaid_router, prefix="/api/v1")

    # --- Static Files ---
    static_dir = os.path.abspath(FLAGS.static_dir_name)
    logger.info("Attempting to serve static files from: %s", static_dir)

    if not os.path.isdir(static_dir):
        logger.warning("Static directory not found at: %s. It will not be mounted.", static_dir)
    else:
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
        logger.info("Successfully mounted static files directory.")

    logger.info("FastAPI application configured successfully.")
    return app


def main(argv: Sequence[str]) -> None:
    """
    The main entry point for the application.
    Parses flags, creates the app, and starts the Uvicorn server.
    """
    fastapi_app = create_app()

    logger.info("Starting Uvicorn server on http://%s:%d", FLAGS.host, FLAGS.port)
    uvicorn.run(fastapi_app, host=FLAGS.host, port=FLAGS.port, log_level=FLAGS.log_level.lower())


if __name__ == "__main__":
    app.run(main)
