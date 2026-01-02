#!/bin/bash
echo "===== Application Startup at $(date) ====="

cd /app

uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

sleep 3

cd frontend
BACKEND_URL=http://localhost:8000 npm start &
FRONTEND_PID=$!

shutdown() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap shutdown SIGTERM SIGINT

wait $BACKEND_PID $FRONTEND_PID