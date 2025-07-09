#!/bin/bash

# Andrea's NUCLEAR N8N CLEANUP - ULTIMA RATIO!
# OBIETTIVO: AZZERAMENTO TOTALE DEL DATABASE N8N

set -e

echo "🚨 N8N NUCLEAR CLEANUP - Andrea's ULTIMA RATIO"
echo "============================================="
echo "⚠️  QUESTO SCRIPT CANCELLA TUTTO DA N8N DATABASE!"
echo "🎯 OBIETTIVO: TABULA RASA COMPLETA!"

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"

# Load environment variables from backend/.env
ENV_FILE="backend/.env"
# Se lanciato da scripts/ subdirectory, usa path relativo
if [ ! -f "$ENV_FILE" ] && [ -f "../backend/.env" ]; then
    ENV_FILE="../backend/.env"
fi
if [ -f "$ENV_FILE" ]; then
    echo "📄 Carico variabili d'ambiente da $ENV_FILE..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
    echo "✅ Variabili d'ambiente caricate!"
    
    if [ -n "$OPENROUTER_API_KEY" ]; then
        echo "🔑 OPENROUTER_API_KEY trovata e caricata!"
    else
        echo "❌ OPENROUTER_API_KEY non trovata nel file .env!"
        exit 1
    fi
else
    echo "❌ File .env non trovato: $ENV_FILE"
    exit 1
fi

echo ""
echo "🔍 Step 1: Stop N8N container per accesso diretto database..."
docker compose stop n8n || true
echo "✅ N8N fermato!"

echo ""
echo "🗑️ Step 2: NUCLEAR CLEANUP - Cancello database SQLite..."

# Backup e cancellazione completa della cartella N8N
N8N_DATA_DIR="../.n8n"
if [ -d "$N8N_DATA_DIR" ]; then
    echo "📦 Backup cartella N8N esistente..."
    cp -r "$N8N_DATA_DIR" "$N8N_DATA_DIR.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✅ Backup cartella N8N creato!"
    
    echo "💥 CANCELLO COMPLETAMENTE TUTTI I DATI N8N!"
    rm -rf "$N8N_DATA_DIR"
    echo "✅ Cartella N8N completamente cancellata!"
    
    echo "📁 Ricreo cartella N8N vuota..."
    mkdir -p "$N8N_DATA_DIR"
    echo "✅ Cartella N8N ricreata vuota!"
else
    echo "⚠️  Cartella N8N non trovata in $N8N_DATA_DIR"
    echo "📁 Creo cartella N8N vuota..."
    mkdir -p "$N8N_DATA_DIR"
    echo "✅ Cartella N8N creata!"
fi

echo ""
echo "🚀 Step 3: Riavvio N8N con database pulito..."
docker compose up -d n8n
echo "⏳ Attendo che N8N si riavvii..."
sleep 15

# Aspetto che N8N sia accessibile
for i in {1..30}; do
    if curl -s "$N8N_URL" > /dev/null; then
        echo "✅ N8N è accessibile!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ N8N non è ripartito dopo 30 tentativi"
        exit 1
    fi
    echo "   Attendo N8N... (tentativo $i/30)"
    sleep 2
done

echo ""
echo "🔐 Step 4: Setup e Login su N8N pulito..."
sleep 5

# Dopo nuclear cleanup, N8N è sempre in setup mode
echo "🛠️ N8N è in setup mode - procedo con setup automatico..."

# Setup iniziale di N8N
SETUP_RESPONSE=$(curl -s -X POST "$N8N_URL/rest/owner/setup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$USERNAME\",
    \"password\":\"$PASSWORD\",
    \"firstName\":\"Admin\",
    \"lastName\":\"ShopMe\"
  }" || echo "SETUP_FAILED")

if echo "$SETUP_RESPONSE" | grep -q "error\|Error\|SETUP_FAILED"; then
    echo "❌ Setup fallito: $SETUP_RESPONSE"
    exit 1
fi

echo "✅ Setup N8N completato!"

# Ora provo il login
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "error\|Error\|Unauthorized"; then
    echo "❌ Login fallito dopo setup: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login completato!"

echo ""
echo "📊 Step 5: Verifico che N8N sia completamente pulito..."

WORKFLOWS_COUNT=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows" | jq '.data | length' 2>/dev/null || echo "0")
CREDENTIALS_COUNT=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/credentials" | jq '.data | length' 2>/dev/null || echo "0")

echo "📈 Workflow nel database pulito: $WORKFLOWS_COUNT"
echo "🔑 Credenziali nel database pulito: $CREDENTIALS_COUNT"

if [ "$WORKFLOWS_COUNT" -eq 0 ] && [ "$CREDENTIALS_COUNT" -eq 0 ]; then
    echo "✅ PERFETTO! Database completamente pulito!"
else
    echo "⚠️  Database non completamente pulito (workflow: $WORKFLOWS_COUNT, credenziali: $CREDENTIALS_COUNT)"
fi

echo ""
echo "🔄 Step 6: Creo credenziali fresche..."

# Crea la credenziale Backend API Basic Auth
BACKEND_CRED_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/credentials" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend API Basic Auth",
    "type": "httpBasicAuth",
    "data": {
      "user": "admin",
      "password": "admin"
    }
  }')

BACKEND_CRED_ID=$(echo "$BACKEND_CRED_RESPONSE" | jq -r '.id // .data.id // empty' 2>/dev/null || echo "ERROR")
echo "✅ Credenziale Backend API creata con ID: $BACKEND_CRED_ID"

# Crea la credenziale OpenRouter API con chiave dal .env
echo "🔑 Creo credenziale OpenRouter con API key dal file .env..."
OPENROUTER_CRED_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/credentials" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"OpenRouter API\",
    \"type\": \"openRouterApi\",
    \"data\": {
      \"apiKey\": \"$OPENROUTER_API_KEY\"
    }
  }")

OPENROUTER_CRED_ID=$(echo "$OPENROUTER_CRED_RESPONSE" | jq -r '.id // .data.id // empty' 2>/dev/null || echo "ERROR")
echo "✅ Credenziale OpenRouter API creata con ID: $OPENROUTER_CRED_ID"
echo "🔍 API Key utilizzata: ${OPENROUTER_API_KEY:0:20}...${OPENROUTER_API_KEY: -10}"

echo ""
echo "📤 Step 7: Importo IL SOLO E UNICO workflow con credenziali embedded..."

# Determina il path corretto del workflow
WORKFLOW_FILE="n8n/workflows/shopme-whatsapp-workflow.json"
if [ ! -f "$WORKFLOW_FILE" ]; then
    WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"
fi

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ File workflow principale non trovato: $WORKFLOW_FILE"
    exit 1
fi

echo "📄 Leggo workflow originale da: $WORKFLOW_FILE"

# Create new workflow with credentials injected directly in the JSON
echo "🔧 Creo workflow con credenziali embedded..."
NEW_WORKFLOW=$(cat "$WORKFLOW_FILE" | jq --arg backend_id "$BACKEND_CRED_ID" --arg openrouter_id "$OPENROUTER_CRED_ID" '
    . + {"active": true} |
    .nodes = (.nodes | map(
        if .id == "5d58d00e-d63a-4063-8969-ec550395c814" then
            . + {"credentials": {"openRouterApi": {"id": $openrouter_id, "name": "OpenRouter API"}}}
        elif .id == "9194a962-fa10-4e33-95bb-e140344ba816" then
            . + {"credentials": {"httpBasicAuth": {"id": $backend_id, "name": "Backend API Basic Auth"}}}
        elif .id == "0f33aa9d-9736-4406-947b-d3af2be2ad9b" then
            . + {"credentials": {"httpBasicAuth": {"id": $backend_id, "name": "Backend API Basic Auth"}}}
        else
            .
        end
    ))
')

echo "📤 Importo workflow con credenziali..."
IMPORT_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d "$NEW_WORKFLOW")

WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.id // .id // empty' 2>/dev/null || echo "ERROR")
if [ "$WORKFLOW_ID" = "ERROR" ] || [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
    echo "❌ Errore import workflow: $IMPORT_RESPONSE"
    exit 1
fi

echo "✅ Workflow importato con ID: $WORKFLOW_ID e credenziali embedded"

echo ""
echo "🔗 Step 8: Verifico che le credenziali siano già embedded..."

# Verify credentials were properly embedded during import
echo "🔍 Verifico credenziali embedded nel workflow..."
VERIFY_WORKFLOW=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows/$WORKFLOW_ID")

OPENROUTER_NODE_CREDS=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "5d58d00e-d63a-4063-8969-ec550395c814") | .credentials.openRouterApi.id // "MISSING"')
RAG_NODE_CREDS=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "9194a962-fa10-4e33-95bb-e140344ba816") | .credentials.httpBasicAuth.id // "MISSING"')
PRODUCTS_NODE_CREDS=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "0f33aa9d-9736-4406-947b-d3af2be2ad9b") | .credentials.httpBasicAuth.id // "MISSING"')

echo "📊 Verifica credenziali embedded:"
echo "   🤖 OpenRouter Chat Model: $OPENROUTER_NODE_CREDS"
echo "   🔍 RagSearch(): $RAG_NODE_CREDS"
echo "   📦 GetAllProducts(): $PRODUCTS_NODE_CREDS"

if [ "$OPENROUTER_NODE_CREDS" != "MISSING" ] && [ "$RAG_NODE_CREDS" != "MISSING" ] && [ "$PRODUCTS_NODE_CREDS" != "MISSING" ]; then
    echo "✅ Tutte le credenziali sono embedded correttamente!"
else
    echo "❌ Alcune credenziali non sono state embedded correttamente"
    exit 1
fi

echo ""
echo "🔄 Step 9: Workflow già attivo dalla creazione!"

echo ""
echo "📊 Step 9: VERIFICA FINALE - Un solo workflow deve esistere..."

if command -v jq >/dev/null 2>&1; then
    WORKFLOWS_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows")
    FINAL_WORKFLOWS_COUNT=$(echo "$WORKFLOWS_RESPONSE" | jq '.data | length' 2>/dev/null || echo "ERROR")
    ACTIVE_WORKFLOWS_COUNT=$(echo "$WORKFLOWS_RESPONSE" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "ERROR")
else
    WORKFLOWS_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows")
    FINAL_WORKFLOWS_COUNT=$(echo "$WORKFLOWS_RESPONSE" | grep -o '"id":"[^"]*"' | wc -l | tr -d ' ')
    ACTIVE_WORKFLOWS_COUNT=$(echo "$WORKFLOWS_RESPONSE" | grep -c '"active":true' | tr -d ' ')
fi

echo "📈 Workflow totali: $FINAL_WORKFLOWS_COUNT"
echo "🟢 Workflow attivi: $ACTIVE_WORKFLOWS_COUNT"

if [ "$FINAL_WORKFLOWS_COUNT" -eq 1 ] && [ "$ACTIVE_WORKFLOWS_COUNT" -eq 1 ]; then
    echo ""
    echo "🎉🎉🎉 PERFETTO! UN SOLO WORKFLOW ATTIVO! 🎉🎉🎉"
    echo ""
    echo "✅ Workflow ID: $WORKFLOW_ID"
    echo "✅ Webhook URL: http://localhost:5678/webhook/webhook-start"
    echo "✅ Admin Panel: http://localhost:5678/workflow/$WORKFLOW_ID"
    echo "✅ Backend Cred ID: $BACKEND_CRED_ID"
    echo "✅ OpenRouter Cred ID: $OPENROUTER_CRED_ID"
    echo ""
    echo "🎯 GARANZIA ASSOLUTA: NUCLEAR CLEANUP RIUSCITO!"
else
    echo ""
    echo "❌ FALLIMENTO! Ancora troppi workflow:"
    echo "   Totali: $FINAL_WORKFLOWS_COUNT (deve essere 1)"
    echo "   Attivi: $ACTIVE_WORKFLOWS_COUNT (deve essere 1)"
fi

# Cleanup
rm -f /tmp/n8n_cookies.txt

echo ""
echo "💥 NUCLEAR CLEANUP TERMINATO!" 