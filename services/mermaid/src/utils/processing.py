import PyPDF2
from io import BytesIO
import docx2txt
import chardet


import logging
import os
from fastapi import HTTPException, UploadFile

logger = logging.getLogger()


async def process_uploaded_file(file: UploadFile) -> str:
    """
    Process different types of files and extract text content.

    Args:
        file: The uploaded file object

    Returns:
        str: Extracted text content from the file

    Raises:
        HTTPException: If file processing fails
    """
    logger.info(f"Processing file: {file.filename}")

    try:
        content = await file.read()
        file_extension = os.path.splitext(file.filename.lower())[1]

        if file_extension == ".pdf":
            pdf_file = BytesIO(content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text

        elif file_extension == ".txt":
            # Detect encoding
            detected = chardet.detect(content)
            encoding = detected["encoding"] if detected["encoding"] else "utf-8"
            return content.decode(encoding)

        elif file_extension == ".docx":
            doc_file = BytesIO(content)
            return docx2txt.process(doc_file)

        elif file_extension in [".md", ".json", ".yaml", ".yml"]:
            # Detect encoding
            detected = chardet.detect(content)
            encoding = detected["encoding"] if detected["encoding"] else "utf-8"
            return content.decode(encoding)

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_extension}")

    except Exception as e:
        logger.error(f"Error processing file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
