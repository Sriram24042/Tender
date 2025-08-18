from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.routes import tenders, documents, reminders
from dotenv import load_dotenv
from app.services.mongodb import connect_to_mongo, close_mongo_connection, ping_mongo

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
    result = await ping_mongo()
    return {"status": "ok", "ping": result}

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

if __name__ == "__main__":
    import uvicorn
    print("Chainfly API server is starting...")
    print(f"Environment: {ENVIRONMENT}")
    print(f"Port: {PORT}")
    print(f"API Documentation available at: http://127.0.0.1:{PORT}/docs")
    print(f"API Base URL: http://127.0.0.1:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
