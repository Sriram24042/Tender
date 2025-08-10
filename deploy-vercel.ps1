# 🚀 Chainfly Vercel Frontend Deployment Script
# This script helps deploy your frontend to Vercel

Write-Host "🚀 Preparing Chainfly frontend for Vercel deployment..." -ForegroundColor Green

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Please run this script from the frontend directory!" -ForegroundColor Red
    Write-Host "   cd frontend" -ForegroundColor Yellow
    Write-Host "   .\deploy-vercel.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if Vercel CLI is installed
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel CLI not found"
    }
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "   This will open a browser window for configuration" -ForegroundColor Cyan
Write-Host "   Follow the prompts to complete deployment" -ForegroundColor Cyan
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host "📖 See DEPLOYMENT_GUIDE.md for backend deployment options" -ForegroundColor Cyan 