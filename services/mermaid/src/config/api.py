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
"""Configuration settings for the FastAPI application using Abseil flags.

This module defines all command-line flags that can be used to configure
the application, such as server settings, API metadata, and model parameters.
It also provides a function to retrieve these settings as a dictionary.
"""

from __future__ import annotations

# Standard library imports
import os
from typing import Any

# Third-party imports
from absl import flags
from dotenv import load_dotenv

# Load environment variables from .env file at module import time.
# This ensures that os.getenv() calls within flags.DEFINE_xxx functions
# can pick up values from a .env file if present, especially useful
# for default values during development.
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
    "The application environment. Determines if .env is loaded by main.py.",
)
flags.DEFINE_string(
    "static_dir_name",
    "static",
    "Name of the static files directory relative to the project root.",
)
flags.DEFINE_string(
    "frontend_url",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "Frontend URL for CORS configuration.",
)
flags.DEFINE_enum(
    "log_level",
    "INFO",
    ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"],
    "Logging level for the application.",
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
    "Gemini model version to be used.",
)


def get_settings() -> dict[str, Any]:
    """Retrieves all application settings derived from the parsed FLAGS.

    It's assumed that Abseil flags have been parsed before this function is
    called (e.g., via `absl.app.run()`).

    Returns:
        A dictionary containing structured application settings.
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
