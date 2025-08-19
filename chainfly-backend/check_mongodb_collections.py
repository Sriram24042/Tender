#!/usr/bin/env python3
"""
Check MongoDB Collections
See what's actually stored in your MongoDB database
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

# Load environment variables
load_dotenv()

async def check_mongodb_collections():
    """Check what's stored in MongoDB collections"""
    
    uri = os.environ.get("MONGODB_URI")
    db_name = os.environ.get("MONGODB_DB", "tender_db")
    
    if not uri:
        print("❌ MONGODB_URI not set")
        return
    
    try:
        client = AsyncIOMotorClient(uri)
        db = client[db_name]
        
        print(f"🔍 Checking MongoDB Database: {db_name}")
        print("=" * 50)
        
        # List all collections
        collections = await db.list_collection_names()
        print(f"📋 Collections found: {collections}")
        print()
        
        # Check files collection (your app's metadata)
        print("📁 Files Collection (App Metadata):")
        print("-" * 30)
        files_count = await db.files.count_documents({})
        print(f"Total documents: {files_count}")
        
        if files_count > 0:
            files = await db.files.find().limit(5).to_list(length=5)
            for i, file_doc in enumerate(files, 1):
                print(f"\n📄 File {i}:")
                print(f"   ID: {file_doc.get('_id')}")
                print(f"   Tender ID: {file_doc.get('tender_id')}")
                print(f"   Document Type: {file_doc.get('document_type')}")
                print(f"   Original Filename: {file_doc.get('original_filename')}")
                print(f"   Storage Type: {file_doc.get('storage_type')}")
                print(f"   File Size: {file_doc.get('file_size')} bytes")
                print(f"   Uploaded: {file_doc.get('uploaded_at')}")
                if file_doc.get('gridfs_file_id'):
                    print(f"   GridFS File ID: {file_doc.get('gridfs_file_id')}")
        
        print()
        
        # Check GridFS files collection
        print("🗄️  GridFS Files Collection:")
        print("-" * 30)
        fs_files_count = await db.fs.files.count_documents({})
        print(f"Total GridFS files: {fs_files_count}")
        
        if fs_files_count > 0:
            fs_files = await db.fs.files.find().limit(5).to_list(length=5)
            for i, fs_file in enumerate(fs_files, 1):
                print(f"\n📦 GridFS File {i}:")
                print(f"   ID: {fs_file.get('_id')}")
                print(f"   Filename: {fs_file.get('filename')}")
                print(f"   Length: {fs_file.get('length')} bytes")
                print(f"   Upload Date: {fs_file.get('uploadDate')}")
                print(f"   Metadata: {fs_file.get('metadata')}")
        
        print()
        
        # Check GridFS chunks collection
        print("🧩 GridFS Chunks Collection:")
        print("-" * 30)
        fs_chunks_count = await db.fs.chunks.count_documents({})
        print(f"Total GridFS chunks: {fs_chunks_count}")
        
        if fs_chunks_count > 0:
            fs_chunks = await db.fs.chunks.find().limit(3).to_list(length=3)
            for i, chunk in enumerate(fs_chunks, 1):
                print(f"\n🧩 Chunk {i}:")
                print(f"   File ID: {chunk.get('files_id')}")
                print(f"   Chunk Number: {chunk.get('n')}")
                print(f"   Data Size: {len(chunk.get('data', b''))} bytes")
        
        print()
        
        # Summary
        print("📊 Summary:")
        print("-" * 30)
        print(f"✅ Files Collection: {files_count} metadata records")
        print(f"✅ GridFS Files: {fs_files_count} files stored")
        print(f"✅ GridFS Chunks: {fs_chunks_count} data chunks")
        
        if files_count > 0 and fs_files_count > 0:
            print("\n🎉 SUCCESS: Files are being stored in MongoDB GridFS!")
            print("✅ Your app is correctly storing files in MongoDB")
        elif files_count > 0:
            print("\n⚠️  PARTIAL: File metadata exists but no GridFS files")
            print("📝 Files might be stored in filesystem only")
        else:
            print("\n❌ NO FILES: No files found in MongoDB")
            print("📝 No files have been uploaded yet")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error checking collections: {e}")

if __name__ == "__main__":
    asyncio.run(check_mongodb_collections())
