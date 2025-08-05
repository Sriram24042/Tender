from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from app.routes import tenders, documents, reminders

app = FastAPI(
    title="Chainfly Tender & Document API",
    description="Backend API for managing tenders, documents, and reminders",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
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
        "http://127.0.0.1:5178"
    ],  # Vite default ports and common alternatives
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to Chainfly API! Visit /docs for interactive API documentation."}

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

print("Chainfly API server is starting...")
print("API Documentation available at: http://127.0.0.1:8000/docs")
print("API Base URL: http://127.0.0.1:8000")
print("Frontend URL: http://localhost:5173")
