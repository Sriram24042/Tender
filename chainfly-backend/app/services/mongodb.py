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
	print(f"🔗 Attempting to connect to MongoDB...")
	print(f"📝 URI format check: {'mongodb+srv://' in uri or 'mongodb://' in uri}")
	
	try:
		# Configure client with optimized settings for MongoDB Atlas
		mongo_client = AsyncIOMotorClient(
			uri, 
			serverSelectionTimeoutMS=30000,  # Increased timeout
			connectTimeoutMS=30000,
			socketTimeoutMS=30000,
			maxPoolSize=10,
			minPoolSize=1,
			retryWrites=True,
			w="majority",
			# SSL settings for Atlas
			tls=True,
			tlsAllowInvalidCertificates=False,  # Use proper SSL
			tlsAllowInvalidHostnames=False,
			# Connection pooling
			maxIdleTimeMS=30000,
			# Heartbeat settings
			heartbeatFrequencyMS=10000,
			# App name for monitoring
			appName="Chainfly-Tender-App"
		)
		
		# Test the connection
		print("🔄 Testing MongoDB connection...")
		await mongo_client.admin.command("ping")
		
		# Get database
		db_name = _get_database_name()
		mongo_db = mongo_client[db_name]
		
		# Test database access
		await mongo_db.command("ping")
		
		print(f"✅ MongoDB connected successfully!")
		print(f"📊 Database: {db_name}")
		print(f"🔗 Connection pool: {mongo_client.max_pool_size} max connections")
		
	except Exception as e:
		print(f"⚠️  MongoDB connection failed: {e}")
		print(f"🔍 Error type: {type(e).__name__}")
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