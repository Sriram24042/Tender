#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process from root directory..."

# Navigate to backend directory and run build
cd chainfly-backend
chmod +x build.sh

# Install dependencies
pip install -r requirements.txt

# Create uploads directory if it doesn't exist
mkdir -p uploads

# Set permissions for uploads directory
chmod 755 uploads

echo "✅ Build completed successfully!"
