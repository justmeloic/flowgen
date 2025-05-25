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

import logging
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)


class SessionMiddleware(BaseHTTPMiddleware):
    """Middleware to manage session IDs."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        # --- BEGIN ADDED PATH SCOPING ---
        if not request.url.path.startswith("/api/v1/"):
            # Not an API path that needs session management, pass through directly
            # logger.debug(f"Skipping session middleware for non-API path: {request.url.path}") # Optional debug log
            response = await call_next(request)
            return response
        # --- END ADDED PATH SCOPING ---

        # Get candidate session ID from header
        candidate_session_id = request.headers.get("X-Session-ID")

        # If no session ID provided, generate a new one
        if not candidate_session_id:
            candidate_session_id = str(uuid.uuid4())
            logger.info(
                f"Generated new session ID: {candidate_session_id} for API path: {request.url.path}"
            )
        else:
            logger.info(
                f"Using existing session ID: {candidate_session_id} for API path: {request.url.path}"
            )

        # Store the session ID on the request state
        request.state.candidate_session_id = candidate_session_id

        # Call next middleware/route handler
        response = await call_next(request)

        # Ensure session ID is in response headers (only if it's an API path, which it is if we reached here)
        actual_session_id = getattr(
            request.state, "actual_session_id", candidate_session_id
        )
        response.headers["X-Session-ID"] = actual_session_id

        # Explicitly set CORS headers for the session ID
        # This might be needed for any path that sets X-Session-ID, so keep it inside the API path logic.
        # NOTE: Crucially, we will add X-Session-ID to the Access-Control-Expose-Headers header.
        # This allows the frontend JavaScript to actually read the X-Session-ID header
        # from the response. Without this, the browser would hide it for security reasons.
        # TODO: This can also be configured globally in your main CORS middleware setup.
        current_exposed_headers = response.headers.get("Access-Control-Expose-Headers")
        if current_exposed_headers:
            if "X-Session-ID" not in current_exposed_headers.split(", "):
                response.headers["Access-Control-Expose-Headers"] = (
                    f"{current_exposed_headers}, X-Session-ID"
                )
        else:
            response.headers["Access-Control-Expose-Headers"] = "X-Session-ID"

        logger.info(
            f"Set session ID in response headers: {actual_session_id} for API path: {request.url.path}"
        )
        return response
