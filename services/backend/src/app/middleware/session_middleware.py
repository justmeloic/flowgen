# Copyright 2025 Loïc Muhirwa
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

"""Middleware for managing user session IDs via HTTP headers.

This module provides a Starlette/FastAPI middleware that intercepts requests
to API paths, retrieves or generates a session ID, and makes session data
available to downstream application logic via the request state. It also
ensures the session ID is returned in the response headers.
"""

from __future__ import annotations

import uuid

from loguru import logger as _logger
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response


class SessionMiddleware(BaseHTTPMiddleware):
    """Middleware to manage a session ID for requests.

    This middleware performs the following steps:
    1. For paths under `/api/v1/`: Manages session IDs
    2. Looks for existing session ID in the `X-Session-ID` request header
    3. If no ID is found, generates a new UUIDv4
    4. Stores session data in `request.state` for downstream use
    5. Ensures session ID is present in response headers
    """

    def __init__(self, app):
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        """Handles the middleware logic for a single request.

        Args:
            request: The incoming Starlette request.
            call_next: A function to call the next middleware or endpoint.

        Returns:
            The Starlette response.
        """
        # Handle session ID for all requests
        candidate_session_id = request.headers.get('X-Session-ID')

        if not candidate_session_id:
            candidate_session_id = str(uuid.uuid4())
            _logger.info(
                'Generated new session ID: %s for path: %s',
                candidate_session_id,
                request.url.path,
            )
        else:
            _logger.info(
                'Using existing session ID: %s for path: %s',
                candidate_session_id,
                request.url.path,
            )

        # Store the session ID on the request state for access in dependencies
        request.state.candidate_session_id = candidate_session_id

        response = await call_next(request)

        # Ensure the final session ID from the request lifecycle is in the header
        actual_session_id = getattr(
            request.state, 'actual_session_id', candidate_session_id
        )
        response.headers['X-Session-ID'] = actual_session_id

        # NOTE: To allow a browser's JavaScript to read the `X-Session-ID`
        # header, it must be listed in `Access-Control-Expose-Headers`.
        # TODO: This logic can also be configured globally in the main
        #       FastAPI CORS middleware setup for better centralization.
        current_exposed = response.headers.get('Access-Control-Expose-Headers')
        if current_exposed:
            exposed_set = {h.strip() for h in current_exposed.split(',')}
            if 'X-Session-ID' not in exposed_set:
                exposed_set.add('X-Session-ID')
                response.headers['Access-Control-Expose-Headers'] = ', '.join(
                    sorted(list(exposed_set))
                )
        else:
            response.headers['Access-Control-Expose-Headers'] = 'X-Session-ID'

        _logger.info(
            'Set session ID in response headers: %s for path: %s',
            actual_session_id,
            request.url.path,
        )
        return response
