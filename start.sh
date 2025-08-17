#!/usr/bin/env bash

echo "🚀 Starting application from root directory..."
echo "Current directory: $(pwd)"
echo "Python path: $PYTHONPATH"
echo "Port: $PORT"

# Ensure we're in the right directory
cd /opt/render/project/src

# Start the application using the correct module path
echo "Starting with: gunicorn chainfly-backend.app.main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120"

exec gunicorn chainfly-backend.app.main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120
