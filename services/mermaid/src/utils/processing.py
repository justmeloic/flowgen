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
"""Utilities for processing uploaded files and extracting text content."""

from __future__ import annotations

# Standard library imports
import logging
import os
from io import BytesIO

# Third-party imports
import chardet
import docx2txt
import PyPDF2
from fastapi import HTTPException, UploadFile

_logger = logging.getLogger(__name__)

# Supported text-based file extensions that can be decoded directly
_TEXT_DECODE_EXTENSIONS = {".md", ".json", ".yaml", ".yml", ".txt"}


async def _extract_text_from_pdf(content: bytes) -> str:
    """Extracts text from PDF content."""
    pdf_file = BytesIO(content)
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    text_parts = [page.extract_text() for page in pdf_reader.pages if page.extract_text()]
    return "\n".join(text_parts)


async def _decode_text_content(content: bytes) -> str:
    """Detects encoding and decodes byte content to text."""
    detected_encoding = chardet.detect(content)["encoding"]
    encoding_to_use = detected_encoding if detected_encoding else "utf-8"
    try:
        return content.decode(encoding_to_use)
    except UnicodeDecodeError:
        _logger.warning(
            "Failed to decode content with detected encoding %s, falling back to utf-8 with error handling.",
            encoding_to_use,
        )
        return content.decode("utf-8", errors="replace")  # Fallback with replacement


async def process_uploaded_file(file: UploadFile) -> str:
    """Processes an uploaded file and extracts its text content.

    Supports PDF, DOCX, and various plain text file types (txt, md, json, yaml).
    It attempts to detect encoding for text files.

    Args:
        file: The `fastapi.UploadFile` object representing the uploaded file.

    Returns:
        The extracted text content from the file as a string.

    Raises:
        HTTPException: If the file type is unsupported or if processing fails.
    """
    _logger.info("Processing file: %s", file.filename)

    try:
        content = await file.read()
        # Ensure filename is not None before processing
        filename = file.filename if file.filename else ""
        file_extension = os.path.splitext(filename.lower())[1]

        if not content:
            _logger.warning("File %s is empty.", filename)
            return ""

        if file_extension == ".pdf":
            return await _extract_text_from_pdf(content)
        elif file_extension == ".docx":
            doc_file = BytesIO(content)
            return docx2txt.process(doc_file)
        elif file_extension in _TEXT_DECODE_EXTENSIONS:
            return await _decode_text_content(content)
        else:
            _logger.warning("Unsupported file type: %s for file %s", file_extension, filename)
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {file_extension}",
            )

    except HTTPException:  # Re-raise HTTPException directly
        raise
    except Exception as e:
        _logger.exception("Error processing file %s:", filename)  # Use .exception for traceback
        raise HTTPException(
            status_code=500,
            detail=f"Error processing file {filename}: {str(e)}",
        ) from e
