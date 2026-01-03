#!/bin/bash
echo "===== Application Startup at $(date) ====="

cd /app

echo "Starting FastAPI backend on port 8000..."
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 5

echo "Testing backend connectivity..."
curl -f http://localhost:8000/health || echo "Backend health check failed"

echo "Starting Next.js frontend on port 7860..."
cd frontend
npm start &
FRONTEND_PID=$!

shutdown() {
    echo "Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap shutdown SIGTERM SIGINT

wait $BACKEND_PID $FRONTEND_PID