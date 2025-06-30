"""Logging configuration."""

import logging
import sys
from pathlib import Path

from loguru import logger

from src.app.core.config import settings


class InterceptHandler(logging.Handler):
    """Intercept standard logging and route to loguru."""

    def emit(self, record):
        """Emit log record."""
        # Get corresponding Loguru level if it exists
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        # Find caller from where originated the logged message
        frame, depth = logging.currentframe(), 2
        while frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """Setup logging configuration."""
    # Remove default handlers
    logger.remove()

    # Add console handler
    logger.add(
        sys.stdout,
        colorize=True,
        format='<green>{time:YYYY-MM-DD HH:mm:ss}</green> | '
        '<level>{level: <8}</level> | '
        '<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | '
        '<level>{message}</level>',
        level='DEBUG' if settings.DEBUG else settings.LOG_LEVEL,
    )

    # Add file handler for production
    if settings.ENVIRONMENT == 'production':
        # Ensure logs directory exists
        logs_dir = Path('logs')
        logs_dir.mkdir(exist_ok=True)

        logger.add(
            'logs/app.log',
            rotation='500 MB',
            retention='10 days',
            compression='gzip',
            format=(
                '{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | '
                '{name}:{function}:{line} | {message}'
            ),
            level='INFO',
        )

    # Intercept standard logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True)

    # Set up loggers for common libraries
    for logger_name in ['uvicorn', 'uvicorn.error', 'uvicorn.access', 'fastapi']:
        logging.getLogger(logger_name).handlers = [InterceptHandler()]
