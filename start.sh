#!/bin/bash
set -e

uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

sleep 2

cleanup() {
    echo "Shutting down services..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}

trap cleanup SIGTERM SIGINT EXIT

cd frontend
next start -p ${PORT:-7860} -H 0.0.0.0

