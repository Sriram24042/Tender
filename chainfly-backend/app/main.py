from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import datetime
from app.routes import tenders, documents, reminders
from dotenv import load_dotenv
from app.services.mongodb import connect_to_mongo, close_mongo_connection, ping_mongo, _get_database_name

load_dotenv()

app = FastAPI(
    title="Chainfly Tender & Document API",
    description="Backend API for managing tenders, documents, and reminders",
    version="1.0.0"
)

# Get environment variables for deployment
PORT = int(os.environ.get("PORT", 8000))
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

# Add CORS middleware with dynamic origins
allowed_origins = [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174", 
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5178",
    "https://tendermanagementsystem.vercel.app",
    "https://tender-n6vxitrmo-srirams-projects-1bbca8cb.vercel.app",  # Your Vercel domain
    "https://tender-jade-sigma.vercel.app",  # Add your current Vercel domain
    "https://*.vercel.app",
    "https://*.vercel.app/*",
    "https://*.onrender.com",  # Render domains
    "https://tender-management-system-frontend.vercel.app",  # Add your current Vercel frontend
    "https://tender-management-system.vercel.app",  # Alternative Vercel domain
]

# Add production origins if available
if ENVIRONMENT == "production":
    # Add your production domain here
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def _startup() -> None:
    await connect_to_mongo()

@app.on_event("shutdown")
async def _shutdown() -> None:
    await close_mongo_connection()

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Chainfly API! Visit /docs for interactive API documentation.",
        "environment": ENVIRONMENT,
        "port": PORT
    }

@app.get("/health/mongo")
async def mongo_health():
    try:
        result = await ping_mongo()
        return {
            "status": "ok", 
            "ping": result, 
            "mongo_available": True,
            "database": _get_database_name(),
            "connection_pool": "active"
        }
    except Exception as e:
        return {
            "status": "error", 
            "message": str(e), 
            "mongo_available": False,
            "error_type": type(e).__name__,
            "database": _get_database_name() if 'mongo_db' in globals() and mongo_db else "unknown"
        }

@app.get("/health")
async def health_check():
    """Simple health check endpoint"""
    return {
        "status": "ok", 
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "environment": ENVIRONMENT
    }

# Mount static files for uploads
uploads_dir = os.path.join(os.getcwd(), "uploads")
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# Register all routes with appropriate prefixes
app.include_router(tenders.router, prefix="/tenders", tags=["Tenders"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(reminders.router, prefix="/reminders", tags=["Reminders"])

# File download endpoint
@app.get("/files/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(uploads_dir, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    else:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="File not found")

# MongoDB file download endpoint
@app.get("/files/mongo/{file_id}")
async def download_file_by_id(file_id: str):
    """Download file by MongoDB file ID"""
    try:
        from app.services.file_service import get_file_content, get_file_metadata
        import io
        from fastapi.responses import StreamingResponse
        
        file_content = await get_file_content(file_id)
        if not file_content:
            raise HTTPException(status_code=404, detail="File not found")
        
        metadata = await get_file_metadata(file_id)
        if not metadata:
            raise HTTPException(status_code=404, detail="File metadata not found")
        
        return StreamingResponse(
            io.BytesIO(file_content),
            media_type=metadata.get("content_type", "application/pdf"),
            headers={"Content-Disposition": f"attachment; filename={metadata['original_filename']}"}
        )
    except Exception as e:
        print(f"Error downloading file by ID: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("Chainfly API server is starting...")
    print(f"Environment: {ENVIRONMENT}")
    print(f"Port: {PORT}")
    print(f"API Documentation available at: http://127.0.0.1:{PORT}/docs")
    print(f"API Base URL: http://127.0.0.1:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
