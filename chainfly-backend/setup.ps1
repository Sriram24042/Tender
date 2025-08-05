# Setup script for Chainfly Backend
Write-Host "Setting up Chainfly Backend..." -ForegroundColor Green

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& "venv\Scripts\Activate.ps1"

# Install requirements
Write-Host "Installing requirements..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create uploads directory if it doesn't exist
if (-not (Test-Path "uploads")) {
    Write-Host "Creating uploads directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "uploads"
}

# Create database and tables
Write-Host "Setting up database..." -ForegroundColor Yellow
python -c "
from app.services.compliance import engine
from app.models.schemas import Base, Reminder, DownloadHistory, ReminderHistory
Base.metadata.create_all(bind=engine)
print('Database tables created successfully!')
"

Write-Host "Setup complete! You can now run the backend with: python -m uvicorn app.main:app --reload" -ForegroundColor Green 