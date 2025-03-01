"""
Module for configuring and managing the application's logging system.

This module provides functionality to set up logging based on a YAML configuration file.
It supports customizing log file names with unique session IDs and ensures that the
log directory exists. It also demonstrates how to incorporate asynchronous
logging using a queue and a dedicated listener thread.
"""

import atexit
import logging
import logging.config
import os
import uuid

import yaml


def setup_logging(path: str = "src/config/logging_config.yaml"):
    """
    Sets up the application's logging system using a YAML configuration file.

    Reads a logging configuration from a YAML file, creates a unique session ID,
    customizes log file names to include the session ID, and applies the configuration.
    If asynchronous logging via a queue is enabled in the config, it initializes
    and starts a `QueueListener` to handle log records from the queue.

    Args:
        path (str, optional): Path to the YAML logging configuration file.
                              Defaults to 'src/config/logging_config.yaml'.

    Raises:
        FileNotFoundError: If the specified configuration file does not exist.
        yaml.YAMLError: If there is an error parsing the YAML configuration.
        Exception: For any other errors encountered during setup.
    """
    try:
        with open(path) as f:
            config = yaml.safe_load(f)

        # Extract directory from log file path and create if it doesn't exist
        log_file_path = config["handlers"]["logfile"]["filename"]
        log_dir = os.path.dirname(log_file_path)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)

        session_id = str(uuid.uuid4())

        config["handlers"]["logfile"]["filename"] = config["handlers"]["logfile"][
            "filename"
        ].replace("session", f"session_{session_id}")

        logging.config.dictConfig(config)  # Configure logging

        queue_handler = logging.getHandlerByName("queue_handler")
        if queue_handler:
            queue_handler.listener.start()  # Manually starting the thread or else it won't happen automatically
            atexit.register(queue_handler.listener.stop)

    except FileNotFoundError:
        print(f"Error: Logging configuration file not found at {path}")
        raise  # Re-raise the exception to be handled by the caller
    except yaml.YAMLError as e:
        print(f"Error parsing logging configuration: {e}")
        raise  # Re-raise the exception to be handled by the caller
    except Exception as e:
        print(f"An unexpected error occurred during logging setup: {e}")
        raise  # Re-raise the exception to be handled by the caller
