"""
Main module for the FastAPI application. Creates and configures the FastAPI application.

This module sets up the FastAPI application, configures middleware,
includes routers, and starts the Uvicorn server.
"""

import logging
import os

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import mermaid_router
from routers import landing_router
from utils.config import setup_logging


def create_app() -> FastAPI:
    """
    Creates and configures the FastAPI application.
    """
    logger = logging.getLogger()
    try:
        load_dotenv()
        logger.info("Loaded environment variables from .env file.")
    except FileNotFoundError:
        logger.error("'.env' file not found. Please create one for environment variables.")
        raise RuntimeError("'.env' file not found. Please create one for environment variables.") from None

    app = FastAPI(
        title="Mermaid API",
        description="API for interacting with a Gemini based Mermaid Model.",
        version="0.1.0",
    )

    logger.info("FastAPI application created.")

    # Configure CORS
    origins = ["*"]  # Allow all origins

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info("CORS middleware configured.")

    # Register application routers
    app.include_router(mermaid_router.router, prefix="/api/v1")
    logger.info("Mermaid router included.")
    app.include_router(landing_router.router, prefix="/api/v1")
    logger.info("Landing router included.")

    return app


if __name__ == "__main__":
    # --- CONFIGURE LOGGER ---
    setup_logging(
        path=os.path.join(os.path.dirname(__file__), "config/logging_config.yaml")
    )  # Note, is the working directory is understood and controlled we can use an absolute path here: setup_logging(path=os.path.abspath("src/config/logging_config.yaml"))
    logger = logging.getLogger()
    logger.debug("Logger configured.")
    app = create_app()
    logger.info("Starting Uvicorn server...")
    uvicorn.run(app, host="0.0.0.0", port=8080)
    logger.info("Uvicorn server stopped.")
