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
echo "🗄️  Verifico database e N8N..."
if ! docker ps | grep -q "shop_db"; then
    echo "   Avvio container database e N8N..."
    docker compose up -d
    echo "   Aspetto che il database sia pronto..."
    sleep 15
else
    echo "✅ Database e N8N già attivi!"
fi

# Step 2.5: Database reset e seed per situazione aggiornata
echo "🔄 Database reset e seed..."
cd backend
echo "   Eseguo reset database e seed completo..."
npm run seed > ../database-seed.log 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database reset e seed completato!"
else
    echo "❌ Errore nel seed! Controlla database-seed.log"
fi
cd ..

# Step 3: Pulisci processi esistenti
echo "🛑 Pulisco eventuali processi esistenti..."
npx kill-port 3000 >/dev/null 2>&1 || true
npx kill-port 3001 >/dev/null 2>&1 || true
pkill -f "ts-node-dev" >/dev/null 2>&1 || true
pkill -f "vite" >/dev/null 2>&1 || true
pkill -f "concurrently" >/dev/null 2>&1 || true

sleep 2

# Step 4: Setup N8N DEFINITIVO SINCRONIZZATO  
echo "🧹 N8N Database Reset + Import SINCRONIZZATO..."
echo "   Reset completo database N8N..."
./scripts/n8n_full-cleanup.sh > n8n-cleanup.log 2>&1

echo "   Aspetto che N8N sia completamente pronto..."
sleep 10

echo "   Import di tutti i workflow dalla cartella n8n/ (FIXED VERSION)..."
./scripts/n8n_import-optimized-workflow.sh > n8n-setup.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ N8N setup definitivo completato!"
    echo "   📡 Webhook attivo: http://localhost:5678/webhook/webhook-start"
else
    echo "❌ Errore nell'import N8N! Controlla n8n-setup.log"
fi

echo ""
echo "🎉 AVVIO SERVIZI CON LOG INTEGRATI!"
echo "========================================"
echo "🌐 Frontend: http://localhost:3000"
echo "   Login: admin@shopme.com / venezia44"
echo ""
echo "🤖 N8N: http://localhost:5678"
echo "   Login: admin@shopme.com / Venezia44"
echo ""
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "📊 Stato Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "📋 LOGS IN TEMPO REALE (premi Ctrl+C per fermare tutto):"
echo "========================================"

# Function per gestire cleanup al Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    npx kill-port 3000 >/dev/null 2>&1 || true
    npx kill-port 3001 >/dev/null 2>&1 || true
    pkill -f "ts-node-dev" >/dev/null 2>&1 || true
    pkill -f "vite" >/dev/null 2>&1 || true
    rm -f .backend.pid .frontend.pid
    echo "✅ Tutti i servizi sono stati fermati!"
    exit 0
}

# Gestisce SIGINT (Ctrl+C)
trap cleanup SIGINT

# Step 5: Avvia tutto con concurrently per log integrati
npx concurrently \
    --names "BACKEND,FRONTEND" \
    --prefix-colors "green,cyan" \
    --prefix "[{name}]" \
    --kill-others-on-fail \
    "cd backend && npm run dev" \
    "cd frontend && npm run dev"

# Se concurrently termina, esegui cleanup
cleanup 