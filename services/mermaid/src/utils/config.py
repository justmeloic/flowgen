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
"""Module for configuring and managing the application's logging system.

This module provides functionality to set up logging based on a YAML
configuration file. It supports customizing log file names with unique session
IDs and ensures that the log directory exists. It also demonstrates how to
incorporate asynchronous logging using a queue and a dedicated listener thread.
"""

from __future__ import annotations

# Standard library imports
import atexit
import logging
import logging.config
import os
import uuid

# Third-party imports
import yaml

# Note: A module-level _logger is not defined here as this module's primary
# purpose is to configure logging. Errors during setup are logged using the
# standard logging module directly, assuming a basic configuration might exist
# or to ensure messages are output even if full configuration fails.


def setup_logging(config_path: str = "src/config/logging_config.yaml") -> None:
    """Sets up application logging from a YAML configuration file.

    Reads a logging configuration, creates a unique session ID, customizes log
    file names to include this session ID, and applies the configuration.
    If asynchronous logging via a queue handler is defined in the config,
    it initializes and starts its listener.

    Args:
        config_path: Path to the YAML logging configuration file.

    Raises:
        FileNotFoundError: If the specified configuration file does not exist.
        yaml.YAMLError: If there is an error parsing the YAML configuration.
        Exception: For other errors encountered during logging setup.
    """
    try:
        with open(config_path, encoding="utf-8") as f:
            config = yaml.safe_load(f)

        # Ensure log directory exists for file handlers
        if "logfile" in config.get("handlers", {}):
            log_file_path = config["handlers"]["logfile"].get("filename")
            if log_file_path:
                log_dir = os.path.dirname(log_file_path)
                if log_dir and not os.path.exists(log_dir):
                    os.makedirs(log_dir)
                    logging.info("Created log directory: %s", log_dir)

                # Customize log file name with a unique session ID
                # Assumes "session" is a placeholder in the configured filename.
                session_id = str(uuid.uuid4())
                config["handlers"]["logfile"]["filename"] = log_file_path.replace("session", f"session_{session_id}")

        logging.config.dictConfig(config)

        # If a QueueHandler and its listener are used, start the listener.
        # The listener must be started manually after dictConfig.
        queue_handler = logging.getHandlerByName("queue_handler")
        if queue_handler and hasattr(queue_handler, "listener"):
            queue_handler.listener.start()
            atexit.register(queue_handler.listener.stop)
            logging.info("QueueListener started for asynchronous logging.")

    except FileNotFoundError:
        logging.error("Logging configuration file not found at %s", config_path)
        raise
    except yaml.YAMLError as e:
        logging.error("Error parsing logging configuration from %s: %s", config_path, e)
        raise
    except Exception as e:
        logging.exception(
            "An unexpected error occurred during logging setup from %s:",
            config_path,
        )
        raise
