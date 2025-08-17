#!/usr/bin/env bash

echo "🚀 Starting application from root directory..."
echo "Current directory: $(pwd)"
echo "Port: $PORT"

# Start the application using the root main.py
echo "Starting with: gunicorn main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120"

exec gunicorn main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120
