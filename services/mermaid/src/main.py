"""
Main module for the FastAPI application.
"""

import logging
import os

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

# These imports should be relative to the project root, NOT 'src'
from src.routers import mermaid_router
from src.routers import landing_router
from src.utils.config import setup_logging

# --- Configure Logging ---
# Do this *before* creating the app, so logging is set up early.
setup_logging(path=os.path.abspath("src/config/logging_config.yaml"))
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """
    Creates and configures the FastAPI application.
    """
    logger.info("Creating FastAPI application...")

    # --- Environment Variables (from Cloud Run or defaults) ---
    app_env = os.environ.get("APP_ENV", "development")

    # Load .env file ONLY if not in production (for local development)
    if app_env != "production":
        try:
            load_dotenv()
            logger.info("Loaded environment variables from .env file.")
        except FileNotFoundError:
            logger.warning(
                "'.env' file not found. Using default environment variables."
            )

    api_key = os.environ.get("API_KEY", "default_api_key")
    database_url = os.environ.get("DATABASE_URL", "default_db_url")

    if app_env == "production" and not api_key:
        logger.error("API_KEY environment variable not set in production.")
        raise HTTPException(status_code=500, detail="API_KEY not configured")

    app = FastAPI(
        title="Mermaid API",
        description="API for interacting with a Gemini based Mermaid Model.",
        version="0.1.0",
    )

    # --- CORS ---
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- Routers ---
    app.include_router(mermaid_router.router, prefix="/api/v1")
    app.include_router(landing_router.router, prefix="/api/v1")

    # --- Static Files ---
    static_dir = os.path.join(os.path.dirname(__file__), "static")
    logger.info(f"Static files directory: {static_dir}")
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

    logger.info("FastAPI application configured successfully.")
    return app


# Create the app instance *outside* the if __name__ == "__main__" block.
app = create_app()

if __name__ == "__main__":
    logger.info("Starting Uvicorn server (local development)...")
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
    logger.info("Uvicorn server stopped.")
