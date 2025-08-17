# Render Deployment Script for Windows
# This script helps prepare your application for Render deployment

Write-Host "🚀 Preparing Chainfly Application for Render Deployment..." -ForegroundColor Green

# Check if git is available
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository. Please navigate to your project root." -ForegroundColor Red
    exit 1
}

# Check git status
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  You have uncommitted changes:" -ForegroundColor Yellow
    Write-Host $gitStatus -ForegroundColor Yellow
    Write-Host ""
    $commit = Read-Host "Do you want to commit these changes? (y/n)"
    
    if ($commit -eq "y" -or $commit -eq "Y") {
        $commitMessage = Read-Host "Enter commit message"
        git add .
        git commit -m $commitMessage
        Write-Host "✅ Changes committed successfully!" -ForegroundColor Green
    }
}

# Check if remote origin exists
$remoteOrigin = git remote get-url origin 2>$null
if (-not $remoteOrigin) {
    Write-Host "❌ No remote origin found. Please add your GitHub repository:" -ForegroundColor Red
    $repoUrl = Read-Host "Enter your GitHub repository URL"
    git remote add origin $repoUrl
    Write-Host "✅ Remote origin added!" -ForegroundColor Green
}

# Push to GitHub
Write-Host "📤 Pushing to GitHub..." -ForegroundColor Blue
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://dashboard.render.com/" -ForegroundColor White
    Write-Host "2. Click 'New +' → 'Blueprint'" -ForegroundColor White
    Write-Host "3. Connect your GitHub repository" -ForegroundColor White
    Write-Host "4. Render will automatically detect render.yaml" -ForegroundColor White
    Write-Host "5. Click 'Apply' to deploy both services" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to push to GitHub. Please check your git configuration." -ForegroundColor Red
} 