#!/bin/bash

# Andrea's FIXED N8N Simple Workflow Script
# OBIETTIVO: Workflow che riceve payload e restituisce SOLO il prompt text

set -e

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
WORKFLOW_ID="5lbTwPUliRkFXSPN"
COOKIE_FILE="/tmp/n8n_cookies.txt"

echo "🚀 N8N ULTIMATE SIMPLE SCRIPT - Andrea's Perfect Solution"
echo "========================================================="
echo "🎯 OBIETTIVO: UN SOLO WORKFLOW CHE FUNZIONA SEMPRE!"

echo "🔍 Step 1: Verifico che N8N sia attivo..."
if ! curl -s "$N8N_URL" > /dev/null; then
    echo "❌ N8N non è raggiungibile su $N8N_URL"
    exit 1
fi
echo "✅ N8N è attivo!"

echo "🔐 Step 2: Login amministratore..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Login fallito: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ Login amministratore completato!"

echo "🧹 Step 3: CANCELLO TUTTI I WORKFLOW VECCHI (METODO DEFINITIVO)..."

# Metodo 1: Provo con jq se disponibile
if command -v jq >/dev/null 2>&1; then
    echo "   Usando jq per parsing JSON..."
    WORKFLOWS=$(curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows")
    if echo "$WORKFLOWS" | jq -e '.data[]' >/dev/null 2>&1; then
        echo "$WORKFLOWS" | jq -r '.data[].id' | while read -r workflow_id; do
            if [ -n "$workflow_id" ] && [ "$workflow_id" != "null" ]; then
                echo "🗑️  Cancello workflow: $workflow_id"
                curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$workflow_id" > /dev/null
            fi
        done
    elif echo "$WORKFLOWS" | jq -e '.[]' >/dev/null 2>&1; then
        echo "$WORKFLOWS" | jq -r '.[].id' | while read -r workflow_id; do
            if [ -n "$workflow_id" ] && [ "$workflow_id" != "null" ]; then
                echo "🗑️  Cancello workflow: $workflow_id"
                curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$workflow_id" > /dev/null
            fi
        done
    fi
else
    # Metodo 2: Se jq non c'è, uso grep/sed per estrarre ID
    echo "   jq non disponibile, uso metodo alternativo..."
    WORKFLOWS=$(curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows")
    
    # Estraggo tutti gli ID usando grep e sed
    echo "$WORKFLOWS" | grep -o '"id":"[^"]*"' | sed 's/"id":"\([^"]*\)"/\1/g' | while read -r workflow_id; do
        if [ -n "$workflow_id" ] && [ "$workflow_id" != "null" ]; then
            echo "🗑️  Cancello workflow: $workflow_id"
            curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$workflow_id" > /dev/null
        fi
    done
fi

echo "✅ Tutti i workflow vecchi cancellati!"

# Verifica che non ci siano più workflow
echo "🔍 Verifico che non ci siano più workflow..."
REMAINING=$(curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows")
if echo "$REMAINING" | grep -q '"id"'; then
    echo "⚠️  Attenzione: alcuni workflow potrebbero essere rimasti"
else
    echo "✅ Nessun workflow rimasto - database pulito!"
fi

echo "🔄 Step 4: Importo il workflow di Andrea..."

# Usa il file workflow di Andrea
WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/shopme-whatsapp-workflow.json"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ File workflow non trovato: $WORKFLOW_FILE"
    exit 1
fi

echo "📤 Importo il workflow da: $WORKFLOW_FILE"
IMPORT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @"$WORKFLOW_FILE")

if echo "$IMPORT_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Errore import workflow: $IMPORT_RESPONSE"
    exit 1
fi

# Estraggo l'ID del workflow dalla risposta
if command -v jq >/dev/null 2>&1; then
    WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.id // .data.id // empty')
else
    WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"\([^"]*\)"/\1/')
fi

echo "✅ Workflow importato con ID: $WORKFLOW_ID"

echo "🔄 Step 5: Attivo il workflow..."
curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"active": true}' > /dev/null

echo "✅ Workflow attivato!"

echo "🧪 Step 6: Test automatico..."
sleep 3

cat > /tmp/test_payload.json << 'EOF'
{
  "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
  "phoneNumber": "393451234567",
  "messageContent": "Ciao", 
  "precompiledData": {
    "agentConfig": {
      "prompt": "Questo è il prompt di test di Andrea! Funziona perfettamente!"
    }
  }
}
EOF

echo "📤 Invio test payload..."
TEST_RESPONSE=$(curl -s -X POST "http://localhost:5678/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d @/tmp/test_payload.json)

echo "📥 Risposta del test:"
echo "$TEST_RESPONSE"

if echo "$TEST_RESPONSE" | grep -q "prompt di test di Andrea"; then
    echo ""
    echo "🎉🎉🎉 SUCCESS! FUNZIONA PERFETTAMENTE! 🎉🎉🎉"
    echo ""
    echo "✅ Workflow ID: $WORKFLOW_ID"
    echo "✅ Webhook URL: http://localhost:5678/webhook/webhook-start"
    echo "✅ Admin Panel: http://localhost:5678/workflow/$WORKFLOW_ID"
    echo ""
else
    echo "❌ Test fallito. Risposta: $TEST_RESPONSE"
fi

# Cleanup
rm -f "$COOKIE_FILE" /tmp/test_payload.json

echo "🎯 SCRIPT COMPLETATO!" 