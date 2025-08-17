#!/usr/bin/env bash

echo "🚀 Starting application from root directory..."

# Start the application using the correct module path
exec gunicorn chainfly-backend.app.main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120
