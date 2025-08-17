#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm install

# Build the application
npm run build

# Create a simple server for static files
echo "Frontend build completed successfully!"
