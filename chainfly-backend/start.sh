#!/usr/bin/env bash

# Start the FastAPI application with Gunicorn
exec gunicorn app.main:app --bind 0.0.0.0:$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --timeout 120
