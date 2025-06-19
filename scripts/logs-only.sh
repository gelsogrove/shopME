#!/bin/bash

echo "📋 ShopMe - LOGS IN TEMPO REALE"
echo "========================================"
echo "Mostrando logs di Backend e Frontend..."
echo "Premi Ctrl+C per uscire"
echo ""

# Verifica che i servizi siano attivi
if ! curl -s http://localhost:3001/health >/dev/null; then
    echo "❌ Backend non è attivo su porta 3001"
    echo "   Avvia prima con: npm run dev"
    exit 1
fi

if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "⚠️  Frontend potrebbe non essere attivo su porta 3000"
fi

echo "✅ Backend attivo su http://localhost:3001"
echo "✅ Frontend attivo su http://localhost:3000"
echo ""
echo "📋 LOGS IN TEMPO REALE:"
echo "========================================"

# Function per gestire cleanup al Ctrl+C
cleanup() {
    echo ""
    echo "👋 Uscita dai logs. I servizi rimangono attivi!"
    exit 0
}

# Gestisce SIGINT (Ctrl+C)
trap cleanup SIGINT

# Mostra i log se esistono, altrimenti informa l'utente
if [[ -f "backend.log" && -f "frontend.log" ]]; then
    npx concurrently \
        --names "BACKEND,FRONTEND" \
        --prefix-colors "green,cyan" \
        --prefix "[{name}]" \
        --timestamp \
        "tail -f backend.log" \
        "tail -f frontend.log"
else
    echo "⚠️  File di log non trovati (backend.log, frontend.log)"
    echo "   I servizi potrebbero essere stati avviati con npm run dev integrato"
    echo "   Usa npm run dev per avviare con log integrati"
fi 