# Chainfly Render Deployment Script
# This script helps prepare your project for Render deployment

Write-Host "Preparing Chainfly for Render deployment..." -ForegroundColor Green

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Git repository not found. Please initialize git first:" -ForegroundColor Red
    Write-Host "   git init" -ForegroundColor Yellow
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'Initial commit'" -ForegroundColor Yellow
    Write-Host "   git remote add origin <your-github-repo-url>" -ForegroundColor Yellow
    exit 1
}

# Check if backend requirements.txt exists
if (-not (Test-Path "chainfly-backend/requirements.txt")) {
    Write-Host "Backend requirements.txt not found!" -ForegroundColor Red
    exit 1
}

# Check if frontend package.json exists
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "Frontend package.json not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Project structure looks good!" -ForegroundColor Green

# Create .gitignore if it doesn't exist
if (-not (Test-Path ".gitignore")) {
    Write-Host "Creating .gitignore file..." -ForegroundColor Yellow
    $gitignoreContent = @"
# Python
__pycache__/
*.py[cod]
*`$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# Virtual Environment
venv/
env/
ENV/

# Environment variables
.env
.env.local
.env.production

# Node
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
frontend/dist/
frontend/build/

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Uploads (keep this for development, but consider removing for production)
# chainfly-backend/uploads/
"@
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
}

Write-Host "Ready for deployment!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host "   git commit -m 'Ready for Render deployment'" -ForegroundColor Yellow
Write-Host "   git push origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Go to https://render.com and sign up" -ForegroundColor White
Write-Host "3. Connect your GitHub repository" -ForegroundColor White
Write-Host "4. Create a new Web Service for the backend" -ForegroundColor White
Write-Host "5. Create a new Static Site for the frontend" -ForegroundColor White
Write-Host ""
Write-Host "See DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor Cyan 