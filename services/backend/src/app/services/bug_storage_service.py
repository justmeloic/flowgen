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

"""Bug storage service supporting both local and Google Cloud Storage."""

from __future__ import annotations

import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any

from loguru import logger as _logger

from src.lib.config import settings


class BugStorageBackend(ABC):
    """Abstract base class for bug storage backends."""

    @abstractmethod
    async def save_bug(self, bug_data: dict[str, Any]) -> None:
        """Save a bug report."""
        pass

    @abstractmethod
    async def list_bugs(self) -> list[dict[str, Any]]:
        """List all bug reports."""
        pass

    @abstractmethod
    async def get_bug(self, bug_id: str) -> dict[str, Any] | None:
        """Get a specific bug report by ID."""
        pass


class LocalBugStorage(BugStorageBackend):
    """Local file system storage for bug reports."""

    def __init__(self, bugs_dir: str = 'bugs'):
        """Initialize local bug storage.

        Args:
            bugs_dir: Directory to store bug reports
        """
        self.bugs_dir = Path(bugs_dir)
        self.bugs_dir.mkdir(exist_ok=True)
        self.bugs_file = self.bugs_dir / 'bug_reports.jsonl'
        _logger.info(f'Initialized local bug storage at {self.bugs_file}')

    async def save_bug(self, bug_data: dict[str, Any]) -> None:
        """Save a bug report to local JSONL file.

        Args:
            bug_data: Bug report data to save
        """
        try:
            with self.bugs_file.open('a', encoding='utf-8') as f:
                f.write(json.dumps(bug_data, ensure_ascii=False) + '\n')
            _logger.info(f'Saved bug report {bug_data.get("bug_id")} locally')
        except Exception as e:
            _logger.error(f'Failed to save bug to local storage: {e}')
            raise

    async def list_bugs(self) -> list[dict[str, Any]]:
        """List all bug reports from local JSONL file.

        Returns:
            List of bug report dictionaries
        """
        bug_reports = []

        if not self.bugs_file.exists():
            return bug_reports

        try:
            with self.bugs_file.open('r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    try:
                        line = line.strip()
                        if not line:
                            continue
                        bug_data = json.loads(line)
                        bug_reports.append(bug_data)
                    except json.JSONDecodeError as e:
                        _logger.warning(
                            f'Error parsing line {line_num} in bug reports: {e}'
                        )
                        continue
        except Exception as e:
            _logger.error(f'Failed to list bugs from local storage: {e}')
            raise

        return bug_reports

    async def get_bug(self, bug_id: str) -> dict[str, Any] | None:
        """Get a specific bug report by ID from local storage.

        Args:
            bug_id: Bug report ID

        Returns:
            Bug report data or None if not found
        """
        if not self.bugs_file.exists():
            return None

        try:
            with self.bugs_file.open('r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        bug_data = json.loads(line)
                        if bug_data.get('bug_id') == bug_id:
                            return bug_data
                    except json.JSONDecodeError:
                        continue
        except Exception as e:
            _logger.error(f'Failed to get bug from local storage: {e}')
            raise

        return None


class GCSBugStorage(BugStorageBackend):
    """Google Cloud Storage backend for bug reports."""

    def __init__(self, bucket_name: str = 'flowgen', bugs_path: str = 'bugs'):
        """Initialize GCS bug storage.

        Args:
            bucket_name: GCS bucket name
            bugs_path: Path within the bucket for bug reports
        """
        from google.cloud import storage

        self.bucket_name = bucket_name
        self.bugs_path = bugs_path.strip('/')
        self.bugs_file = f'{self.bugs_path}/bug_reports.jsonl'

        # Initialize GCS client
        self.client = storage.Client()
        self.bucket = self.client.bucket(bucket_name)
        _logger.info(
            f'Initialized GCS bug storage at gs://{bucket_name}/{self.bugs_file}'
        )

    async def save_bug(self, bug_data: dict[str, Any]) -> None:
        """Save a bug report to GCS.

        Args:
            bug_data: Bug report data to save
        """
        try:
            blob = self.bucket.blob(self.bugs_file)

            # Read existing content if file exists
            existing_content = ''
            if blob.exists():
                existing_content = blob.download_as_text()

            # Append new bug report
            new_line = json.dumps(bug_data, ensure_ascii=False) + '\n'
            updated_content = existing_content + new_line

            # Upload updated content
            blob.upload_from_string(updated_content, content_type='application/jsonl')
            _logger.info(
                f'Saved bug report {bug_data.get("bug_id")} to GCS '
                f'gs://{self.bucket_name}/{self.bugs_file}'
            )
        except Exception as e:
            _logger.error(f'Failed to save bug to GCS: {e}')
            raise

    async def list_bugs(self) -> list[dict[str, Any]]:
        """List all bug reports from GCS.

        Returns:
            List of bug report dictionaries
        """
        bug_reports = []

        try:
            blob = self.bucket.blob(self.bugs_file)

            if not blob.exists():
                return bug_reports

            content = blob.download_as_text()

            for line_num, line in enumerate(content.splitlines(), 1):
                line = line.strip()
                if not line:
                    continue
                try:
                    bug_data = json.loads(line)
                    bug_reports.append(bug_data)
                except json.JSONDecodeError as e:
                    _logger.warning(
                        f'Error parsing line {line_num} in bug reports from GCS: {e}'
                    )
                    continue
        except Exception as e:
            _logger.error(f'Failed to list bugs from GCS: {e}')
            raise

        return bug_reports

    async def get_bug(self, bug_id: str) -> dict[str, Any] | None:
        """Get a specific bug report by ID from GCS.

        Args:
            bug_id: Bug report ID

        Returns:
            Bug report data or None if not found
        """
        try:
            blob = self.bucket.blob(self.bugs_file)

            if not blob.exists():
                return None

            content = blob.download_as_text()

            for line in content.splitlines():
                line = line.strip()
                if not line:
                    continue
                try:
                    bug_data = json.loads(line)
                    if bug_data.get('bug_id') == bug_id:
                        return bug_data
                except json.JSONDecodeError:
                    continue
        except Exception as e:
            _logger.error(f'Failed to get bug from GCS: {e}')
            raise

        return None


def get_bug_storage() -> BugStorageBackend:
    """Get the appropriate bug storage backend based on configuration.

    Returns:
        Bug storage backend instance
    """
    if settings.USE_GCS_FOR_BUGS:
        _logger.info('Using Google Cloud Storage for bug reports')
        return GCSBugStorage(
            bucket_name=settings.GCS_BUGS_BUCKET, bugs_path=settings.GCS_BUGS_PATH
        )
    else:
        _logger.info('Using local file system for bug reports')
        return LocalBugStorage(bugs_dir=settings.BUGS_DIR)


_bug_storage: BugStorageBackend | None = None


def get_bug_storage_instance() -> BugStorageBackend:
    """Get or create the singleton bug storage instance.

    Returns:
        Bug storage backend instance
    """
    global _bug_storage
    if _bug_storage is None:
        _bug_storage = get_bug_storage()
    return _bug_storage
