import os
from fastapi import UploadFile, HTTPException
import shutil

# Set the base path to "uploads" folder inside your project directory
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")  # will point to chainfly-backend\uploads

# Allowed file types - only PDF
ALLOWED_EXTENSIONS = {'.pdf'}

def validate_file_type(filename: str) -> bool:
    """Validate that the file is a PDF"""
    file_extension = os.path.splitext(filename.lower())[1]
    return file_extension in ALLOWED_EXTENSIONS

def save_uploaded_file(upload_file: UploadFile, tender_id: str, document_type: str) -> str:
    # Validate file type
    if not validate_file_type(upload_file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Only PDF files are allowed. Received: {upload_file.filename}"
        )
    
    # Create the uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    filename = f"{tender_id}_{document_type}_{upload_file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)

    return file_path
