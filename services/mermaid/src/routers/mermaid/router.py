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
"""Mermaid router module.

This module defines the API router for handling mermaid-related requests.
It uses a pre-initialized Gemini model to generate responses to user messages.
"""

from __future__ import annotations

# Standard library imports
import logging
import uuid
from typing import Any, Optional  # Assuming 'Any' might be needed for the model type

# Third-party imports
import google.generativeai as genai
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

# Application-specific imports
from src.models.model import create_gemini_prompt, get_model
from src.routers.mermaid.datamodels import MermaidRequest, MermaidResponse
from src.utils.processing import process_uploaded_file

_logger = logging.getLogger(__name__)

router = APIRouter(
    tags=["mermaid"],
)


@router.post("/mermaid", response_model=MermaidResponse)
async def handle_mermaid(
    message: str = Form(...),
    engine: str = Form(...),
    conversation_id: Optional[str] = Form(None),
    files: Optional[list[UploadFile]] = File(None),
    model: genai.GenerativeModel = Depends(get_model),
) -> MermaidResponse:
    """Handles mermaid requests and generates responses using a Gemini model.

    This endpoint processes user messages, optionally including uploaded files,
    maintains conversation history via a conversation ID, and uses a
    Gemini model to generate textual responses.

    Args:
        message: The message sent by the user.
        engine: The diagram engine to use (e.g., "mermaid").
        conversation_id: An optional unique ID to track the conversation.
                         If None, a new ID is generated.
        files: An optional list of uploaded files to be included as context.
        model: The generative model instance, injected as a dependency.

    Raises:
        HTTPException: If an error occurs during model processing.

    Returns:
        A MermaidResponse object containing the generated response from the
        model and the conversation ID.
    """
    try:
        current_conversation_id = conversation_id or str(uuid.uuid4())
        _logger.debug(
            "Using conversation ID: %s with engine: %s",
            current_conversation_id,
            engine,
        )

        processed_file_contents = []
        if files:
            for file in files:
                file_content = await process_uploaded_file(file)
                processed_file_contents.append(f"Content from {file.filename}:\n{file_content}")

        if processed_file_contents:
            files_message = "\n".join(processed_file_contents)
            message = f"{message}\nAdditional information from uploaded files:\n{files_message}"

        full_prompt = create_gemini_prompt(message, engine)
        _logger.debug("Prepared full prompt for model using %s engine", engine)

        # Assuming model.generate_content returns an object with a .text attribute
        response_object = model.generate_content(full_prompt)
        _logger.debug("Generated response from model.")

        _logger.info("USER REQUEST (conversation %s): %s", current_conversation_id, message)
        _logger.info("SYSTEM RESPONSE (conversation %s): %s", current_conversation_id, response_object.text)

        return MermaidResponse(
            response=response_object.text,
            conversation_id=current_conversation_id,
        )
    except Exception as e:
        _logger.exception(
            "Error during model processing for conversation ID %s: %s",
            conversation_id or "N/A",  # Use original conversation_id for logging
            e,
        )
        raise HTTPException(status_code=500, detail="An error occurred during processing.") from e
