import datetime as dt
import json
import logging
from typing import Any

from typing_extensions import override


LOG_RECORD_BUILTIN_ATTRS = [  # Attributes to include in log records
    "args",
    "asctime",
    "created",
    "exc_info",
    "filename",
    "funcName",
    "levelname",
    "levelno",
    "lineno",
    "module",
    "msecs",
    "message",
    "msg",
    "name",
    "pathname",
    "process",
    "processName",
    "relativeCreated",
    "stack_info",
    "thread",
    "threadName",
]


class MyJSONFormatter(logging.Formatter):
    """
    A custom JSON formatter for log records.

    This formatter converts log records into JSON strings. It allows for
    the inclusion of both standard log record attributes and user-defined
    fields. The output JSON includes a message, timestamp, and optionally,
    exception and stack information.
    """

    def __init__(
        self,
        *,
        fmt_keys: dict[str, str] | None = None,
    ) -> None:
        """
        Initializes the MyJSONFormatter.

        Args:
            fmt_keys (dict[str, str], optional): A mapping from keys in the
                final JSON output to attributes of the log record. This allows
                for renaming or including specific attributes in the output.
                Defaults to an empty dictionary, which will include only the
                default fields ('message', 'timestamp', 'exc_info', 'stack_info').
        """
        super().__init__()
        self.fmt_keys = fmt_keys if fmt_keys is not None else {}

    @override
    def format(self, record: logging.LogRecord) -> str:
        """
        Formats a log record as a JSON string.

        Args:
            record (logging.LogRecord): The log record to format.

        Returns:
            str: A JSON string representation of the log record.
        """
        message = self._prepare_log_dict(record)
        return json.dumps(message, default=str)  # Convert to JSON string

    def _prepare_log_dict(self, record: logging.LogRecord) -> dict[str, Any]:
        """
        Prepares a dictionary representing the log record for JSON serialization.

        The dictionary includes the formatted message, timestamp, and optionally,
        exception and stack information. It applies any custom field mappings
        specified during the formatter's initialization.

        Args:
            record (logging.LogRecord): The log record to prepare.

        Returns:
            dict[str, Any]: A dictionary representing the log record.
        """
        always_fields = {
            "message": record.getMessage(),
            "timestamp": dt.datetime.fromtimestamp(
                record.created, tz=dt.UTC
            ).isoformat(),
        }

        if record.exc_info is not None:
            always_fields["exc_info"] = self.formatException(record.exc_info)

        if record.stack_info is not None:
            always_fields["stack_info"] = self.formatStack(record.stack_info)

        message = {  # Apply formatting keys
            key: (
                msg_val
                if (msg_val := always_fields.pop(val, None)) is not None
                else getattr(record, val)
            )
            for key, val in self.fmt_keys.items()
        }

        message.update(always_fields)  # Add remaining fields

        return message


class DataFilter(logging.Filter):
    """
    A filter that allows only log records starting with "[data]" through. This is for training data.
    """

    def filter(self, record):
        """
        Determines if the specified record is to be logged.

        Returns True if the record's message starts with "[data]", False otherwise.
        """
        return record.getMessage().startswith("[data]")


class AutoStartQueueListener(logging.handlers.QueueListener):
    """
    A QueueListener subclass that automatically starts the listener thread upon initialization.
    """

    def __init__(self, queue, *handlers, respect_handler_level=False):
        """
        Initializes the AutoStartQueueListener and immediately starts its thread.

        Args:
            queue: The queue from which to receive log records.
            *handlers: Handlers to use for processing log records.
            respect_handler_level: Whether to respect the level of the handlers.
        """
        super().__init__(queue, *handlers, respect_handler_level=respect_handler_level)
        # Start the listener immediately.
        self.start()
