"""Configuration module for the application."""

from absl import flags
from typing import Dict, Any
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Define flags
FLAGS = flags.FLAGS

# Server configuration
flags.DEFINE_string('host', '0.0.0.0', 'Server host')
flags.DEFINE_integer('port', 8000, 'Server port')
flags.DEFINE_string('frontend_url', os.getenv('FRONTEND_URL', 'http://localhost:3000'), 'Frontend URL for CORS')
flags.DEFINE_enum('log_level', 'INFO', ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'], 'Logging level')

# API configuration
flags.DEFINE_string('api_title', 'Tariff Agent API', 'API title')
flags.DEFINE_string('api_description', 'API for interacting with the tariff information agent', 'API description')
flags.DEFINE_string('api_version', '1.0.0', 'API version')

# Model configuration
flags.DEFINE_string('gemini_model', os.getenv('GEMINI_MODEL', 'gemini-2.0-flash'), 'Gemini model version')

def get_settings() -> Dict[str, Any]:
    """Get all application settings.
    
    Returns:
        Dict[str, Any]: Dictionary containing all application settings
    """
    return {
        'server': {
            'host': FLAGS.host,
            'port': FLAGS.port,
            'log_level': FLAGS.log_level,
        },
        'api': {
            'title': FLAGS.api_title,
            'description': FLAGS.api_description,
            'version': FLAGS.api_version,
        },
        'cors': {
            'allow_origins': [FLAGS.frontend_url],
            'allow_credentials': True,
            'allow_methods': ["*"],
            'allow_headers': ["*"],
        },
        'model': {
            'gemini_version': FLAGS.gemini_model,
        }
    } 