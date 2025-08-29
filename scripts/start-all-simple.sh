#!/bin/bash

echo "🚀 ShopMe - Avvio TUTTO in un comando!"
echo "========================================"

# Step 1: Verifica Docker
echo "🐳 Verifico Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker non è attivo!"
    echo "   Avvio Docker Desktop..."
    open -a Docker
    echo "   Aspettando che Docker si avvii..."
    sleep 45
fi

echo "✅ Docker è attivo!"

# Step 2: Avvia i container se non sono già attivi
echo "🗄️  Verifico database..."
if ! docker ps | grep -q "shop_db"; then
    echo "   Avvio container database..."
    docker compose up -d
    echo "   Aspetto che il database sia pronto..."
    sleep 15
else
    echo "✅ Database già attivo!"
fi

# Step 3: Pulisci processi esistenti
echo "🛑 Pulisco eventuali processi esistenti..."
npx kill-port 3000 >/dev/null 2>&1 || true
npx kill-port 3001 >/dev/null 2>&1 || true
pkill -f "ts-node-dev" >/dev/null 2>&1 || true
pkill -f "vite" >/dev/null 2>&1 || true
pkill -f "concurrently" >/dev/null 2>&1 || true

sleep 2

echo ""
echo "🎉 AVVIO SERVIZI CON LOG INTEGRATI!"
echo "========================================"
echo "🌐 Frontend: http://localhost:3000"
echo "   Login: admin@shopme.com / venezia44"
echo ""
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "🗄️  Database: localhost:5434"
echo "   User: shopmefy / shopmefy"
echo ""
echo "🚀 Avvio backend e frontend..."
echo ""

# Step 4: Avvia backend e frontend
concurrently \
  --names "backend,frontend" \
  --prefix-colors "blue,green" \
  --kill-others \
  "cd backend && npm run dev" \
  "cd frontend && npm run dev"

echo ""
echo "✅ Tutti i servizi sono stati avviati!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001" 