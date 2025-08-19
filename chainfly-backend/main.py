from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Import routes directly (since we're in the same directory)
from app.routes import tenders, documents, reminders

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
    "https://tender-jade-sigma.vercel.app/", # Your Vercel domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tender-jade-sigma.vercel.app/"],  # Add your Vercel domain here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Chainfly API! Visit /docs for interactive API documentation.",
        "environment": ENVIRONMENT,
        "port": PORT
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

if __name__ == "__main__":
    import uvicorn
    print("Chainfly API server is starting...")
    print(f"Environment: {ENVIRONMENT}")
    print(f"Port: {PORT}")
    print(f"API Documentation available at: http://127.0.0.1:{PORT}/docs")
    print(f"API Base URL: http://127.0.0.1:{PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
