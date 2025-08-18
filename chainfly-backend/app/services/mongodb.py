from typing import Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

mongo_client: Optional[AsyncIOMotorClient] = None
mongo_db: Optional[AsyncIOMotorDatabase] = None


def _get_mongo_uri() -> str:
	uri = os.environ.get("MONGODB_URI")
	if not uri:
		raise RuntimeError("MONGODB_URI environment variable is not set")
	return uri


def _get_database_name() -> str:
	# Default DB name if not provided
	return os.environ.get("MONGODB_DB", "chainfly")


async def connect_to_mongo() -> None:
	global mongo_client, mongo_db
	if mongo_client is not None:
		return
	uri = _get_mongo_uri()
	
	try:
		# Configure client with SSL settings for MongoDB Atlas
		mongo_client = AsyncIOMotorClient(
			uri, 
			serverSelectionTimeoutMS=10000,
			connectTimeoutMS=10000,
			socketTimeoutMS=10000,
			tls=True,
			tlsAllowInvalidCertificates=False,
			tlsAllowInvalidHostnames=False,
			retryWrites=True,
			w="majority"
		)
		
		# Ensure we can talk to the cluster
		await mongo_client.admin.command("ping")
		mongo_db = mongo_client[_get_database_name()]
		print("✅ MongoDB connected successfully!")
		
	except Exception as e:
		print(f"⚠️  MongoDB connection failed: {e}")
		print("📝 The app will start without MongoDB. File uploads will use local filesystem only.")
		mongo_client = None
		mongo_db = None


async def close_mongo_connection() -> None:
	global mongo_client, mongo_db
	if mongo_client is not None:
		mongo_client.close()
	mongo_client = None
	mongo_db = None


def get_mongo_db() -> AsyncIOMotorDatabase:
	if mongo_db is None:
		raise RuntimeError("MongoDB is not initialized. Ensure connect_to_mongo() ran on startup.")
	return mongo_db


async def ping_mongo() -> dict:
	if mongo_client is None:
		raise RuntimeError("MongoDB client not initialized")
	return await mongo_client.admin.command("ping") 