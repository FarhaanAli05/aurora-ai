#!/bin/bash
echo "===== Application Startup at $(date) ====="

cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

cd ../frontend
npm start &
FRONTEND_PID=$!

wait $BACKEND_PID $FRONTEND_PID