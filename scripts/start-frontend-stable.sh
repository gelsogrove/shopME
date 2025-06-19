#!/bin/bash

echo "⚛️  Starting Frontend (Stable Mode)"

# Kill any existing frontend processes
echo "🛑 Stopping any existing frontend processes..."
npx kill-port 3000 >/dev/null 2>&1 || true
pkill -f "vite" >/dev/null 2>&1 || true
pkill -f "npm.*dev" >/dev/null 2>&1 || true

# Wait a moment for processes to fully stop
sleep 2

# Check if port is actually free
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is still in use, force killing..."
    lsof -ti:3000 | xargs kill -9 >/dev/null 2>&1 || true
    sleep 2
fi

echo "✅ Port 3000 is free"

# Navigate to frontend directory and start
echo "🚀 Starting frontend on port 3000..."
cd frontend

# Use different approach to avoid "Killed: 9"
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

echo "✅ Frontend started successfully" 