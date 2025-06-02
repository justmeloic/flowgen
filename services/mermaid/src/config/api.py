"""
Configuration settings for the FastAPI application using Abseil flags.
"""

import os
from absl import flags
from typing import Any, Dict
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Define Flags for Configuration ---
FLAGS = flags.FLAGS

# --- Server Flags ---
flags.DEFINE_string("host", "0.0.0.0", "The host to bind the server to.")
flags.DEFINE_integer("port", 8080, "The port for the server.", lower_bound=1024)
flags.DEFINE_enum(
    "app_env",
    "development",
    ["development", "production"],
    "The application environment. Determines if .env is loaded.",
)
flags.DEFINE_string(
    "static_dir_name",
    "static",
    "Name of the static files directory relative to the project root.",
)
flags.DEFINE_string(
    "frontend_url",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "Frontend URL for CORS",
)
flags.DEFINE_enum(
    "log_level",
    "INFO",
    ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    "Logging level",
)

# --- API Metadata Flags ---
flags.DEFINE_string("api_title", "Mermaid API", "The title of the API.")
flags.DEFINE_string(
    "api_description",
    "API for interacting with a Gemini based Mermaid Model.",
    "The description of the API.",
)
flags.DEFINE_string("api_version", "0.1.0", "The version of the API.")


# --- Model Configuration Flags ---
flags.DEFINE_string(
    "gemini_model",
    os.getenv("GEMINI_MODEL", "gemini-1.5-flash-preview-0514"),
    "Gemini model version",
)


def get_settings() -> Dict[str, Any]:
    """Get all application settings.

    Returns:
        Dict[str, Any]: Dictionary containing all application settings
    """
    return {
        "server": {
            "host": FLAGS.host,
            "port": FLAGS.port,
            "log_level": FLAGS.log_level,
        },
        "api": {
            "title": FLAGS.api_title,
            "description": FLAGS.api_description,
            "version": FLAGS.api_version,
        },
        "model": {
            "gemini_version": FLAGS.gemini_model,
        },
    }
