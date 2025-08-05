# documents.py - Document-related endpoints will be defined here.

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import os
from app.utils.file_utils import save_uploaded_file
from typing import List, Dict
import stat
from sqlalchemy.orm import Session
from app.models.schemas import DownloadHistory, DownloadHistoryCreate
from app.services.compliance import get_db
import json
import datetime

router = APIRouter()

@router.post("/upload")
async def upload_document(
    tender_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_path = save_uploaded_file(file, tender_id, document_type)
        return {"message": "File uploaded successfully", "file_path": file_path}
    except Exception as e:
        # Log the error to console
        print(f"\u274c Error while uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_all_documents():
    """List all documents in the uploads folder"""
    try:
        uploads_dir = os.path.join(os.getcwd(), "uploads")
        if not os.path.exists(uploads_dir):
            return {"documents": []}
        
        documents = []
        for filename in os.listdir(uploads_dir):
            file_path = os.path.join(uploads_dir, filename)
            if os.path.isfile(file_path):
                # Get file stats
                file_stat = os.stat(file_path)
                
                # Parse filename to extract tender_id and document_type
                # Format: {tender_id}_{document_type}_{original_filename}
                parts = filename.split('_', 2)
                tender_id = parts[0] if len(parts) > 0 else "Unknown"
                document_type = parts[1] if len(parts) > 1 else "Unknown"
                
                # Try to extract original filename (remove the prefix)
                original_filename = filename
                if len(parts) > 2:
                    original_filename = parts[2]
                
                document = {
                    "id": filename,  # Use filename as ID for existing files
                    "filename": original_filename,
                    "saved_filename": filename,
                    "tender_id": tender_id,
                    "document_type": document_type,
                    "file_path": file_path,
                    "file_size": file_stat.st_size,
                    "uploaded_at": file_stat.st_mtime,  # Unix timestamp
                    "status": "completed"
                }
                documents.append(document)
        
        return {"documents": documents}
    except Exception as e:
        print(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/download-history")
async def add_download_history(download: DownloadHistoryCreate, db: Session = Depends(get_db)):
    """Add a download history record"""
    try:
        db_download = DownloadHistory(
            zip_name=download.zip_name,
            download_date=download.download_date,
            documents_json=json.dumps(download.documents)
        )
        db.add(db_download)
        db.commit()
        db.refresh(db_download)
        return {"status": "success", "message": "Download history added"}
    except Exception as e:
        db.rollback()
        print(f"Error adding download history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/download-history")
async def get_download_history(db: Session = Depends(get_db)):
    """Get all download history records"""
    try:
        downloads = db.query(DownloadHistory).order_by(DownloadHistory.download_date.desc()).all()
        download_records = []
        
        for download in downloads:
            try:
                documents = json.loads(download.documents_json)
            except json.JSONDecodeError:
                documents = []
            
            download_records.append({
                "id": str(download.id),
                "zipName": download.zip_name,
                "downloadDate": download.download_date.isoformat(),
                "documents": documents
            })
        
        return {"downloads": download_records}
    except Exception as e:
        print(f"Error getting download history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/download-history")
async def clear_download_history(db: Session = Depends(get_db)):
    """Clear all download history records"""
    try:
        db.query(DownloadHistory).delete()
        db.commit()
        return {"status": "success", "message": "Download history cleared"}
    except Exception as e:
        db.rollback()
        print(f"Error clearing download history: {e}")
        raise HTTPException(status_code=500, detail=str(e))
