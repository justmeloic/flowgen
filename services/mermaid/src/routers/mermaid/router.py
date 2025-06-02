"""
Mermaid router module.

This module defines the API router for handling mermaid-related requests.
It uses a pre-initialized Gemini model to generate responses to user messages.
"""

import logging
import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

#
from src.models.model import get_model, create_gemini_prompt
from src.utils.processing import process_uploaded_file

from .datamodels import MermaidRequest, MermaidResponse

logger = logging.getLogger()


# Define router
router = APIRouter(
    tags=["mermaid"],
)
logger.debug("Mermaid router defined.")


@router.post("/mermaid", response_model=MermaidResponse)
async def handle_mermaid(
    message: str = Form(...),
    engine: str = Form(...),
    conversation_id: Optional[str] = Form(None),
    files: Optional[List[UploadFile]] = File(None),
    model=Depends(get_model),
) -> MermaidResponse:
    """
    Handles mermaid requests by generating responses using a Gemini model and maintains conversation history.

    Args:
        message: The message sent by the user.
        engine: The diagram engine to use (e.g., "mermaid").
        conversation_id: An optional unique ID to track the conversation.
        files: Optional list of uploaded files.


    Raises:
        HTTPException: If an error occurs during model processing or Redis interaction.

    Returns:
        MermaidResponse: The generated response from the model and the conversation ID.
    """

    try:
        # Get or create conversation ID
        conversation_id = conversation_id or str(uuid.uuid4())
        logger.debug(f"Using conversation ID: {conversation_id} with engine: {engine}")

        # Process the uploaded files if any
        file_contents = []
        if files:
            for file in files:
                file_content = await process_uploaded_file(file)
                file_contents.append(f"Content from {file.filename}:\n{file_content}")

        if file_contents:
            files_message = "\n".join(file_contents)
            message = f"{message}\nAdditional information from uploaded files:\n{files_message}"

        # Add engine information to the prompt
        full_prompt = create_gemini_prompt(message, engine)  # Update create_gemini_prompt to accept engine parameter
        logger.debug(f"Prepared full prompt for model using {engine} engine")

        response = model.generate_content(full_prompt)
        logger.debug("Generated response from model.")

        logger.info(f"USER REQUEST: {message}")
        logger.info(f"SYSTEM RESPONSE: {response.text}")

        return MermaidResponse(response=response.text, conversation_id=conversation_id)

    except Exception as e:
        print(f"Error during model processing or Redis interaction: {e}")
        raise HTTPException(status_code=500, detail="An error occurred during processing.") from e
