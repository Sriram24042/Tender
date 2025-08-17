#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting build process from root directory..."

# Navigate to backend directory and run build
cd chainfly-backend
chmod +x build.sh
./build.sh

echo "✅ Build completed successfully!"
