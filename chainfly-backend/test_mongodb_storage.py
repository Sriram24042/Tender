#!/usr/bin/env python3
"""
MongoDB GridFS Storage Test Script
Test if files are being stored in MongoDB GridFS
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
import io

# Load environment variables
load_dotenv()

async def test_mongodb_storage():
    """Test MongoDB GridFS storage functionality"""
    
    # Get MongoDB URI from environment
    uri = os.environ.get("MONGODB_URI")
    db_name = os.environ.get("MONGODB_DB", "tender_db")
    
    if not uri:
        print("❌ MONGODB_URI environment variable is not set")
        return False
    
    print(f"🔗 Testing MongoDB GridFS storage...")
    print(f"📊 Database: {db_name}")
    
    try:
        # Create client
        client = AsyncIOMotorClient(uri)
        db = client[db_name]
        
        # Test connection
        await db.command("ping")
        print("✅ MongoDB connection successful!")
        
        # Create GridFS bucket
        fs = AsyncIOMotorGridFSBucket(db)
        print("✅ GridFS bucket created!")
        
        # Test file upload to GridFS
        test_filename = "test_document.pdf"
        test_content = b"This is a test PDF content for GridFS storage"
        
        print(f"📤 Uploading test file: {test_filename}")
        file_id = await fs.upload_from_stream(
            test_filename,
            test_content,
            metadata={
                "tender_id": "test_tender_123",
                "document_type": "test_document",
                "original_filename": test_filename
            }
        )
        print(f"✅ File uploaded to GridFS! File ID: {file_id}")
        
        # Test file download from GridFS
        print(f"📥 Downloading test file...")
        download_stream = await fs.open_download_stream(file_id)
        downloaded_content = await download_stream.read()
        
        if downloaded_content == test_content:
            print("✅ File download successful! Content matches.")
        else:
            print("❌ File download failed! Content doesn't match.")
            return False
        
        # Test metadata retrieval
        print(f"📋 Checking file metadata...")
        file_info = await fs.find_one({"_id": file_id})
        if file_info:
            print(f"✅ File metadata found!")
            print(f"   - Filename: {file_info.filename}")
            print(f"   - Length: {file_info.length} bytes")
            print(f"   - Metadata: {file_info.metadata}")
        else:
            print("❌ File metadata not found!")
            return False
        
        # Test file deletion
        print(f"🗑️  Deleting test file...")
        await fs.delete(file_id)
        print("✅ Test file deleted successfully!")
        
        # Check if file is actually deleted
        try:
            await fs.open_download_stream(file_id)
            print("❌ File still exists after deletion!")
            return False
        except Exception:
            print("✅ File successfully deleted from GridFS!")
        
        # Test files collection
        print(f"📊 Checking files collection...")
        files_count = await db.files.count_documents({})
        print(f"✅ Files collection accessible! Document count: {files_count}")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ MongoDB GridFS test failed: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

async def test_file_upload_simulation():
    """Simulate the file upload process"""
    
    uri = os.environ.get("MONGODB_URI")
    db_name = os.environ.get("MONGODB_DB", "tender_db")
    
    if not uri:
        print("❌ MONGODB_URI not set")
        return False
    
    try:
        client = AsyncIOMotorClient(uri)
        db = client[db_name]
        fs = AsyncIOMotorGridFSBucket(db)
        
        # Simulate file upload like the app does
        tender_id = "TENDER_001"
        document_type = "proposal"
        original_filename = "sample_proposal.pdf"
        stored_filename = f"{tender_id}_{document_type}_{original_filename}"
        
        # Create test file content
        file_content = b"This is a sample PDF proposal document content"
        
        print(f"📤 Simulating file upload...")
        print(f"   - Tender ID: {tender_id}")
        print(f"   - Document Type: {document_type}")
        print(f"   - Original Filename: {original_filename}")
        print(f"   - Stored Filename: {stored_filename}")
        
        # Upload to GridFS
        gridfs_file_id = await fs.upload_from_stream(
            stored_filename,
            file_content,
            metadata={
                "tender_id": tender_id,
                "document_type": document_type,
                "original_filename": original_filename
            }
        )
        
        # Save metadata to files collection
        file_metadata = {
            "_id": "test_file_123",
            "tender_id": tender_id,
            "document_type": document_type,
            "original_filename": original_filename,
            "stored_filename": stored_filename,
            "content_type": "application/pdf",
            "file_size": len(file_content),
            "storage_type": "gridfs",
            "gridfs_file_id": str(gridfs_file_id),
            "status": "uploaded"
        }
        
        result = await db.files.insert_one(file_metadata)
        print(f"✅ File metadata saved to MongoDB! Inserted ID: {result.inserted_id}")
        
        # Verify the file is accessible
        file_doc = await db.files.find_one({"_id": "test_file_123"})
        if file_doc:
            print("✅ File metadata retrieved successfully!")
            print(f"   - Storage Type: {file_doc['storage_type']}")
            print(f"   - GridFS File ID: {file_doc['gridfs_file_id']}")
            print(f"   - File Size: {file_doc['file_size']} bytes")
        
        # Test file download
        download_stream = await fs.open_download_stream(gridfs_file_id)
        downloaded_content = await download_stream.read()
        
        if downloaded_content == file_content:
            print("✅ File download test successful!")
        else:
            print("❌ File download test failed!")
            return False
        
        # Cleanup
        await fs.delete(gridfs_file_id)
        await db.files.delete_one({"_id": "test_file_123"})
        print("✅ Test cleanup completed!")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ File upload simulation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 MongoDB GridFS Storage Test")
    print("=" * 50)
    
    # Test basic GridFS functionality
    print("\n📋 Test 1: Basic GridFS Functionality")
    print("-" * 40)
    success1 = asyncio.run(test_mongodb_storage())
    
    # Test file upload simulation
    print("\n📋 Test 2: File Upload Simulation")
    print("-" * 40)
    success2 = asyncio.run(test_file_upload_simulation())
    
    if success1 and success2:
        print("\n🎉 All tests PASSED!")
        print("✅ MongoDB GridFS storage is working correctly")
        print("✅ Files will be stored in MongoDB when uploaded through your app")
    else:
        print("\n💥 Some tests FAILED!")
        print("❌ Please check your MongoDB configuration")
