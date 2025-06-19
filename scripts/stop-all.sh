#!/bin/bash

# ShopMefy - Stop All Services Script

echo "🛑 Fermando tutti i servizi ShopMe..."

# Ferma i processi Node.js salvati
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    kill $BACKEND_PID 2>/dev/null && echo "✅ Backend fermato"
    rm .backend.pid
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    kill $FRONTEND_PID 2>/dev/null && echo "✅ Frontend fermato"
    rm .frontend.pid
fi

# Ferma tutte le porte
npx kill-port 3000 >/dev/null 2>&1 && echo "✅ Porta 3000 liberata"
npx kill-port 3001 >/dev/null 2>&1 && echo "✅ Porta 3001 liberata"

# Ferma tutti i processi Node.js residui
pkill -f "ts-node-dev" >/dev/null 2>&1
pkill -f "vite" >/dev/null 2>&1
pkill -f "npm.*dev" >/dev/null 2>&1

echo "✅ Tutti i servizi fermati!"
echo ""
echo "Docker containers rimangono attivi per il prossimo avvio veloce."
echo "Per fermare anche Docker: docker compose down"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Step 1: Kill processes on all ports
echo "🛑 Killing processes on ports..."
PORTS=(3000 3001 5434 5678 8080 8081 9000 4000)
for port in "${PORTS[@]}"; do
    echo "   Killing port $port..."
    if command -v npx >/dev/null 2>&1; then
        npx kill-port $port >/dev/null 2>&1
    fi
    # macOS/Linux method
    if lsof -ti:$port >/dev/null 2>&1; then
        lsof -ti:$port | xargs kill -9 2>/dev/null
        echo "      Process on port $port killed"
    else
        echo "      No process found on port $port"
    fi
done

# Step 2: Stop Docker containers
echo "🐳 Stopping Docker containers..."
cd "$PROJECT_ROOT" || exit 1
docker compose -f docker-compose.yml down
docker compose -f docker-compose-n8n.yml down

# Kill any remaining docker processes
docker ps -q | xargs docker stop 2>/dev/null || true

echo ""
echo "✅ All services stopped!" 