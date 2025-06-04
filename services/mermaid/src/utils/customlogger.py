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
"""Custom logging formatters and filters for structured logging."""

from __future__ import annotations

# Standard library imports
import datetime as dt
import json
import logging
import logging.handlers  # For QueueListener
from typing import Any, Optional

# Third-party imports
from typing_extensions import override  # For Python <3.12

# List of LogRecord attributes that are built-in.
# Used by MyJSONFormatter to differentiate standard fields from custom extras.
LOG_RECORD_BUILTIN_ATTRS: list[str] = [
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
    """Custom logging.Formatter to output log records as JSON strings.

    This formatter converts log records into JSON strings, allowing for structured
    logging. It includes standard log record attributes and can incorporate
    user-defined fields through `fmt_keys`.
    """

    def __init__(
        self,
        *,
        fmt_keys: Optional[dict[str, str]] = None,
    ) -> None:
        """Initializes the MyJSONFormatter.

        Args:
            fmt_keys: A mapping from keys in the final JSON output to attributes
                of the LogRecord. This allows for renaming or selecting specific
                attributes. Defaults to an empty dict, resulting in a default
                set of fields ('message', 'timestamp', etc.).
        """
        super().__init__()
        self.fmt_keys = fmt_keys if fmt_keys is not None else {}

    @override
    def format(self, record: logging.LogRecord) -> str:
        """Formats a LogRecord as a JSON string.

        Args:
            record: The log record to format.

        Returns:
            A JSON string representation of the log record.
        """
        message_dict = self._prepare_log_dict(record)
        return json.dumps(message_dict, default=str)

    def _prepare_log_dict(self, record: logging.LogRecord) -> dict[str, Any]:
        """Prepares a dictionary from a LogRecord for JSON serialization.

        Includes the formatted message, timestamp, and optionally, exception
        and stack information. Applies custom field mappings if provided.

        Args:
            record: The LogRecord to prepare.

        Returns:
            A dictionary representing the log record.
        """
        log_dict = {
            "message": record.getMessage(),
            "timestamp": dt.datetime.fromtimestamp(
                record.created,
                tz=dt.timezone.utc,  # Use dt.timezone.utc
            ).isoformat(),
        }

        if record.exc_info:
            log_dict["exc_info"] = self.formatException(record.exc_info)
        if record.stack_info:
            log_dict["stack_info"] = self.formatStack(record.stack_info)

        # Apply custom formatting keys and include other record attributes
        # that are not standard built-in ones (extras).
        for key, val_attr_name in self.fmt_keys.items():
            if hasattr(record, val_attr_name):
                log_dict[key] = getattr(record, val_attr_name)

        # Add any extra fields passed to the logger that aren't built-in
        # and aren't already mapped by fmt_keys.
        for key, value in record.__dict__.items():
            if key not in LOG_RECORD_BUILTIN_ATTRS and key not in log_dict:
                # Check if any fmt_key resulted in this 'key'
                # This logic for extras could be refined further based on desired behavior
                # with fmt_keys potentially overwriting extras or vice-versa.
                # Current simple approach: if not already added by fmt_keys, add it.
                is_already_mapped_by_fmt_keys_value = False
                for fmt_val in self.fmt_keys.values():
                    if fmt_val == key:
                        is_already_mapped_by_fmt_keys_value = True
                        break
                if not is_already_mapped_by_fmt_keys_value:
                    log_dict[key] = value
        return log_dict


class DataFilter(logging.Filter):
    """A filter that allows only log records starting with "[data]".

    This can be used to route specific log messages, such as those containing
    training data, to particular handlers.
    """

    def filter(self, record: logging.LogRecord) -> bool:
        """Determines if the specified record should be logged.

        Args:
            record: The log record to check.

        Returns:
            True if the record's message starts with "[data]", False otherwise.
        """
        return record.getMessage().startswith("[data]")


class AutoStartQueueListener(logging.handlers.QueueListener):
    """A QueueListener subclass that starts its thread upon initialization.

    This simplifies setup by removing the need to manually call `start()`
    on the listener instance after creating it.
    """

    def __init__(
        self,
        queue: Any,  # Typically queue.Queue
        *handlers: logging.Handler,
        respect_handler_level: bool = False,
    ) -> None:
        """Initializes and starts the AutoStartQueueListener.

        Args:
            queue: The queue from which to receive log records.
            *handlers: A variable number of logging.Handler instances to process
                       records from the queue.
            respect_handler_level: Whether to respect the log level set on
                                   individual handlers. Defaults to False.
        """
        super().__init__(queue, *handlers, respect_handler_level=respect_handler_level)
        self.start()  # Start the listener thread immediately.
