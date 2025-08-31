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
Bug reports are stored in a single JSONL file in the bugs/ folder.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

from src.app.schemas.bug_report_request import BugReportRequest
from src.app.schemas.response import BugReportResponse

# Create bugs directory if it doesn't exist
BUGS_DIR = Path('bugs')
BUGS_DIR.mkdir(exist_ok=True)
BUGS_FILE = BUGS_DIR / 'bug_reports.jsonl'

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
        # Generate unique bug ID
        bug_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # Prepare bug report data
        bug_data = {
            'bug_id': bug_id,
            'timestamp': timestamp,
            'submitted_at': report.timestamp or timestamp,
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

        # Append to JSONL file (create if doesn't exist)
        with BUGS_FILE.open('a', encoding='utf-8') as f:
            f.write(json.dumps(bug_data, ensure_ascii=False) + '\n')

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
        bug_reports = []

        # Read from JSONL file if it exists
        if BUGS_FILE.exists():
            with BUGS_FILE.open('r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        line = line.strip()
                        if not line:
                            continue

                        bug_data = json.loads(line)
                        description = bug_data.get('description', '')
                        truncated_desc = (
                            description[:100] + '...'
                            if len(description) > 100
                            else description
                        )
                        bug_reports.append(
                            {
                                'bug_id': bug_data.get('bug_id'),
                                'timestamp': bug_data.get('timestamp'),
                                'description': truncated_desc,
                                'status': bug_data.get('status', 'unknown'),
                                'has_diagram': bug_data.get('diagram') is not None,
                                'chat_messages_count': len(
                                    bug_data.get('chat_history', [])
                                ),
                            }
                        )
                    except json.JSONDecodeError as e:
                        print(f'Error parsing line {line_num} in bug reports: {e}')
                        continue

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
        if not BUGS_FILE.exists():
            raise HTTPException(status_code=404, detail='No bug reports found')

        with BUGS_FILE.open('r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    line = line.strip()
                    if not line:
                        continue

                    bug_data = json.loads(line)
                    if bug_data.get('bug_id') == bug_id:
                        return {'success': True, 'bug_report': bug_data}
                except json.JSONDecodeError as e:
                    print(f'Error parsing line {line_num} in bug reports: {e}')
                    continue

        raise HTTPException(
            status_code=404, detail=f'Bug report with ID {bug_id} not found'
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f'Failed to retrieve bug report: {str(e)}'
        )
