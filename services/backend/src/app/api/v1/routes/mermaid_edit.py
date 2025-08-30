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

"""
Defines the API endpoint for Mermaid diagram editing.

This endpoint receives Mermaid diagram content and editing instructions,
processes them using the Gemini AI service, and returns the
edited Mermaid code.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from loguru import logger

from src.app.schemas.mermaid_edit import (
    MermaidEditRequest,
    MermaidEditResponse,
)
from src.app.services.mermaid_edit_service import MermaidEditService
from src.app.utils.dependencies import get_mermaid_edit_service

router = APIRouter()


@router.post('/edit', response_model=MermaidEditResponse)
async def edit_mermaid_diagram(
    request: MermaidEditRequest,
    service: MermaidEditService = Depends(get_mermaid_edit_service),
) -> MermaidEditResponse:
    """
    Edit a Mermaid diagram using Gemini AI.

    Args:
        request: Mermaid edit request containing diagram code and edit instructions
        service: Mermaid edit service dependency

    Returns:
        MermaidEditResponse: Edited Mermaid diagram code

    Raises:
        HTTPException: If Mermaid diagram editing fails
    """
    try:
        logger.info(
            'Processing Mermaid edit request for %s diagram with %s characters',
            request.diagram_type,
            len(request.content),
        )

        edited_content = await service.edit_mermaid_diagram(
            content=request.content,
            instructions=request.instructions,
            diagram_type=request.diagram_type,
            diagram_title=request.diagram_title,
            additional_context=request.additional_context,
        )

        logger.info('Mermaid diagram editing completed successfully')

        return MermaidEditResponse(
            success=True,
            content=edited_content,
            diagram_type=request.diagram_type,
        )

    except Exception as e:
        logger.error('Mermaid diagram editing failed: %s', e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Mermaid diagram editing failed: {str(e)}',
        )
