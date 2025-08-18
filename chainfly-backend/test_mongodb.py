#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Run this to test your MongoDB Atlas connection before deploying
"""

import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

async def test_mongodb_connection():
    """Test MongoDB connection with detailed error reporting"""
    
    # Get MongoDB URI from environment
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        print("❌ MONGODB_URI environment variable is not set")
        return False
    
    print(f"🔗 Testing MongoDB connection...")
    print(f"📝 URI format: {'mongodb+srv://' in uri or 'mongodb://' in uri}")
    print(f"🔒 Has authentication: {'@' in uri}")
    
    try:
        # Create client with optimized settings
        client = AsyncIOMotorClient(
            uri,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
            maxPoolSize=5,
            minPoolSize=1,
            retryWrites=True,
            w="majority",
            tls=True,
            tlsAllowInvalidCertificates=False,
            tlsAllowInvalidHostnames=False,
            maxIdleTimeMS=30000,
            heartbeatFrequencyMS=10000,
            appName="MongoDB-Test-Script"
        )
        
        # Test connection
        print("🔄 Testing connection...")
        await client.admin.command("ping")
        print("✅ Connection successful!")
        
        # Test database access
        db_name = os.environ.get("MONGODB_DB", "chainfly")
        db = client[db_name]
        await db.command("ping")
        print(f"✅ Database '{db_name}' accessible!")
        
        # Test collection operations
        collection = db.files
        count = await collection.count_documents({})
        print(f"✅ Collection 'files' accessible! Document count: {count}")
        
        # Test write operation
        test_doc = {"test": True, "timestamp": "2024-01-01"}
        result = await collection.insert_one(test_doc)
        print(f"✅ Write operation successful! Inserted ID: {result.inserted_id}")
        
        # Clean up test document
        await collection.delete_one({"_id": result.inserted_id})
        print("✅ Cleanup successful!")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        
        # Provide specific guidance based on error type
        if "authentication" in str(e).lower():
            print("💡 Authentication error - check username/password in URI")
        elif "ssl" in str(e).lower():
            print("💡 SSL error - check network connectivity and firewall")
        elif "timeout" in str(e).lower():
            print("💡 Timeout error - check network connectivity")
        elif "dns" in str(e).lower():
            print("💡 DNS error - check cluster hostname")
        
        return False

if __name__ == "__main__":
    print("🚀 MongoDB Connection Test")
    print("=" * 40)
    
    success = asyncio.run(test_mongodb_connection())
    
    if success:
        print("\n🎉 MongoDB connection test PASSED!")
        print("✅ Your MongoDB Atlas cluster is properly configured")
    else:
        print("\n💥 MongoDB connection test FAILED!")
        print("❌ Please check your MongoDB URI and network connectivity") 