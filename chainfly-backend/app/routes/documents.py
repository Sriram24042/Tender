# documents.py - Document-related endpoints will be defined here.

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Query
import os
from app.services.file_service import save_file_to_mongodb, list_all_files, get_file_metadata, delete_file, get_file_content
from typing import List, Dict
import stat
from sqlalchemy.orm import Session
from app.models.schemas import DownloadHistory, DownloadHistoryCreate
from app.services.compliance import get_db
import json
import datetime
from fastapi.responses import StreamingResponse
import io

router = APIRouter()

@router.post("/upload")
async def upload_document(
    tender_id: str = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    store_in_gridfs: bool = Query(False, description="Store file content in MongoDB GridFS instead of filesystem")
):
    try:
        result = await save_file_to_mongodb(file, tender_id, document_type, store_in_gridfs)
        return {"message": "File uploaded successfully", "file_data": result}
    except Exception as e:
        # Log the error to console
        print(f"\u274c Error while uploading file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list")
async def list_all_documents():
    """List all documents from MongoDB"""
    try:
        documents = await list_all_files()
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

# MongoDB-based file operations
@router.get("/{file_id}")
async def get_document_metadata(file_id: str):
    """Get document metadata by file ID"""
    try:
        metadata = await get_file_metadata(file_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="File not found")
        return metadata
    except Exception as e:
        print(f"Error getting document metadata: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{file_id}/download")
async def download_document(file_id: str):
    """Download document by file ID"""
    try:
        metadata = await get_file_metadata(file_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_content = await get_file_content(file_id)
        if not file_content:
            raise HTTPException(status_code=404, detail="File content not found")
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=metadata.get("content_type", "application/pdf"),
            headers={"Content-Disposition": f"attachment; filename={metadata['original_filename']}"}
        )
    except Exception as e:
        print(f"Error downloading document: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{file_id}")
async def delete_document(file_id: str):
    """Delete document by file ID"""
    try:
        success = await delete_file(file_id)
        if not success:
            raise HTTPException(status_code=404, detail="File not found")
        return {"status": "success", "message": "File deleted successfully"}
    except Exception as e:
        print(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
