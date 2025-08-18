import os
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import UploadFile, HTTPException
from motor.motor_asyncio import AsyncIOMotorGridFSBucket
from app.services.mongodb import get_mongo_db
import shutil

# Set the base path to "uploads" folder inside your project directory
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")

# Allowed file types - only PDF
ALLOWED_EXTENSIONS = {'.pdf'}

def validate_file_type(filename: str) -> bool:
    """Validate that the file is a PDF"""
    file_extension = os.path.splitext(filename.lower())[1]
    return file_extension in ALLOWED_EXTENSIONS

async def save_file_to_mongodb(
    upload_file: UploadFile, 
    tender_id: str, 
    document_type: str,
    store_in_gridfs: bool = False
) -> Dict[str, Any]:
    """
    Save file metadata to MongoDB and optionally store file content in GridFS
    """
    # Validate file type
    if not validate_file_type(upload_file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Only PDF files are allowed. Received: {upload_file.filename}"
        )
    
    try:
        db = get_mongo_db()
        mongo_available = True
    except RuntimeError:
        mongo_available = False
        print("⚠️  MongoDB not available, using filesystem only")
    
    # Generate unique file ID
    file_id = str(uuid.uuid4())
    
    # Create filename for storage
    filename = f"{tender_id}_{document_type}_{upload_file.filename}"
    
    # File metadata
    file_metadata = {
        "_id": file_id,
        "tender_id": tender_id,
        "document_type": document_type,
        "original_filename": upload_file.filename,
        "stored_filename": filename,
        "content_type": upload_file.content_type,
        "file_size": 0,  # Will be updated after saving
        "uploaded_at": datetime.utcnow(),
        "storage_type": "filesystem",  # Default to filesystem
        "file_path": None,  # Will be set for filesystem storage
        "gridfs_file_id": None,  # Will be set for GridFS storage
        "status": "uploaded"
    }
    
    if mongo_available and store_in_gridfs:
        # Store file content in GridFS
        fs = AsyncIOMotorGridFSBucket(db)
        
        # Read file content
        file_content = await upload_file.read()
        file_metadata["file_size"] = len(file_content)
        
        # Store in GridFS
        gridfs_file_id = await fs.upload_from_stream(
            filename,
            file_content,
            metadata={
                "tender_id": tender_id,
                "document_type": document_type,
                "original_filename": upload_file.filename
            }
        )
        file_metadata["gridfs_file_id"] = str(gridfs_file_id)
        file_metadata["storage_type"] = "gridfs"
        
    else:
        # Store file on filesystem (backward compatibility)
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        # Save file to filesystem
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        file_metadata["file_size"] = file_size
        file_metadata["file_path"] = file_path
    
    # Save metadata to MongoDB if available
    if mongo_available:
        try:
            result = await db.files.insert_one(file_metadata)
            print(f"✅ File metadata saved to MongoDB: {file_id}")
        except Exception as e:
            print(f"⚠️  Failed to save metadata to MongoDB: {e}")
    
    return {
        "file_id": file_id,
        "tender_id": tender_id,
        "document_type": document_type,
        "filename": upload_file.filename,
        "stored_filename": filename,
        "file_size": file_metadata["file_size"],
        "uploaded_at": file_metadata["uploaded_at"].isoformat(),
        "storage_type": file_metadata["storage_type"],
        "status": "success",
        "mongo_available": mongo_available
    }

async def get_file_metadata(file_id: str) -> Optional[Dict[str, Any]]:
    """Get file metadata from MongoDB"""
    try:
        db = get_mongo_db()
        file_doc = await db.files.find_one({"_id": file_id})
        if file_doc:
            file_doc["uploaded_at"] = file_doc["uploaded_at"].isoformat()
        return file_doc
    except RuntimeError:
        print("⚠️  MongoDB not available for metadata retrieval")
        return None

async def list_files_by_tender(tender_id: str) -> List[Dict[str, Any]]:
    """List all files for a specific tender"""
    try:
        db = get_mongo_db()
        cursor = db.files.find({"tender_id": tender_id}).sort("uploaded_at", -1)
        files = []
        async for file_doc in cursor:
            file_doc["uploaded_at"] = file_doc["uploaded_at"].isoformat()
            files.append(file_doc)
        return files
    except RuntimeError:
        print("⚠️  MongoDB not available for file listing")
        return []

async def list_all_files() -> List[Dict[str, Any]]:
    """List all files in the database"""
    try:
        db = get_mongo_db()
        cursor = db.files.find().sort("uploaded_at", -1)
        files = []
        async for file_doc in cursor:
            file_doc["uploaded_at"] = file_doc["uploaded_at"].isoformat()
            files.append(file_doc)
        return files
    except RuntimeError:
        print("⚠️  MongoDB not available for file listing")
        return []

async def delete_file(file_id: str) -> bool:
    """Delete file from MongoDB and storage"""
    db = get_mongo_db()
    
    # Get file metadata
    file_doc = await db.files.find_one({"_id": file_id})
    if not file_doc:
        return False
    
    # Delete from storage
    if file_doc["storage_type"] == "gridfs":
        # Delete from GridFS
        fs = AsyncIOMotorGridFSBucket(db)
        await fs.delete(file_doc["gridfs_file_id"])
    else:
        # Delete from filesystem
        if file_doc.get("file_path") and os.path.exists(file_doc["file_path"]):
            os.remove(file_doc["file_path"])
    
    # Delete metadata from MongoDB
    await db.files.delete_one({"_id": file_id})
    return True

async def get_file_content(file_id: str) -> Optional[bytes]:
    """Get file content from storage"""
    file_doc = await get_file_metadata(file_id)
    if not file_doc:
        return None
    
    if file_doc["storage_type"] == "gridfs":
        # Get from GridFS
        db = get_mongo_db()
        fs = AsyncIOMotorGridFSBucket(db)
        gridfs_out = await fs.open_download_stream(file_doc["gridfs_file_id"])
        return await gridfs_out.read()
    else:
        # Get from filesystem
        if file_doc.get("file_path") and os.path.exists(file_doc["file_path"]):
            with open(file_doc["file_path"], "rb") as f:
                return f.read()
    
    return None 