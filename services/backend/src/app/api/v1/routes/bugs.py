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

"""Bug Report Module.

This module handles bug report submissions from the frontend.
Bug reports are stored either locally or in Google Cloud Storage
based on the USE_GCS_FOR_BUGS configuration.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, HTTPException

from src.app.schemas.bug_report_request import BugReportRequest
from src.app.schemas.response import BugReportResponse
from src.app.services.bug_storage_service import get_bug_storage_instance

router = APIRouter()


@router.post('/report', response_model=BugReportResponse)
async def submit_bug_report(report: BugReportRequest) -> BugReportResponse:
    """
    Submit a bug report.

    Args:
        report: The bug report data containing description and context

    Returns:
        BugReportResponse with success status and bug ID

    Raises:
        HTTPException: If the bug report cannot be saved
    """
    try:
        # Get storage backend
        storage = get_bug_storage_instance()

        # Generate unique bug ID
        bug_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # Extract user name from the report (will be sent by frontend)
        user_name = getattr(report, 'user_name', 'Anonymous')

        # Prepare bug report data
        bug_data = {
            'bug_id': bug_id,
            'timestamp': timestamp,
            'submitted_at': report.timestamp or timestamp,
            'user_name': user_name,
            'description': report.description,
            'url': report.url,
            'user_agent': report.userAgent,
            'diagram': report.diagram.model_dump() if report.diagram else None,
            'chat_history': (
                [msg.model_dump() for msg in report.chatHistory]
                if report.chatHistory
                else None
            ),
            'status': 'new',
        }

        # Save using the appropriate storage backend
        await storage.save_bug(bug_data)

        return BugReportResponse(
            success=True, bug_id=bug_id, message='Bug report submitted successfully'
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to save bug report: {str(e)}'
        )


@router.get('/list')
async def list_bug_reports() -> dict[str, Any]:
    """
    List all bug reports (for admin/debugging purposes).

    Returns:
        Dictionary containing list of bug reports with basic info
    """
    try:
        storage = get_bug_storage_instance()
        all_bugs = await storage.list_bugs()

        # Format bug reports for list view
        bug_reports = []
        for bug_data in all_bugs:
            description = bug_data.get('description', '')
            truncated_desc = (
                description[:100] + '...' if len(description) > 100 else description
            )
            bug_reports.append(
                {
                    'bug_id': bug_data.get('bug_id'),
                    'timestamp': bug_data.get('timestamp'),
                    'user_name': bug_data.get('user_name', 'Anonymous'),
                    'description': truncated_desc,
                    'status': bug_data.get('status', 'unknown'),
                    'has_diagram': bug_data.get('diagram') is not None,
                    'chat_messages_count': len(bug_data.get('chat_history', [])),
                }
            )

        # Sort by timestamp (most recent first)
        bug_reports.sort(key=lambda x: x.get('timestamp', ''), reverse=True)

        return {
            'success': True,
            'total_reports': len(bug_reports),
            'reports': bug_reports,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to list bug reports: {str(e)}'
        )


@router.get('/{bug_id}')
async def get_bug_report(bug_id: str) -> dict[str, Any]:
    """
    Get a specific bug report by ID.

    Args:
        bug_id: The unique bug report ID

    Returns:
        Dictionary containing the full bug report data

    Raises:
        HTTPException: If the bug report is not found or cannot be read
    """
    try:
        storage = get_bug_storage_instance()
        bug_data = await storage.get_bug(bug_id)

        if bug_data is None:
            raise HTTPException(
                status_code=404, detail=f'Bug report with ID {bug_id} not found'
            )

        return {'success': True, 'bug_report': bug_data}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to retrieve bug report: {str(e)}'
        )
