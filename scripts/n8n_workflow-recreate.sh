#!/bin/bash

# Andrea's N8N Workflow Recreation Script
# Obiettivo: Ricreare workflow con credenziali embedded

set -e

echo "🔧 N8N WORKFLOW RECREATION - Final Solution"
echo "==========================================="

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"

# Load environment variables
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ] && [ -f "../backend/.env" ]; then
    ENV_FILE="../backend/.env"
fi

if [ -f "$ENV_FILE" ]; then
    echo "📄 Carico OPENROUTER_API_KEY da $ENV_FILE..."
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
    echo "✅ API Key caricata: ${OPENROUTER_API_KEY:0:20}..."
else
    echo "❌ File .env non trovato"
    exit 1
fi

# Login
echo "🔐 Login su N8N..."
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies_recreate.txt -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Errore login: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ Login riuscito!"

# Get credentials
echo "🔑 Recupero credenziali esistenti..."
CREDS=$(curl -s -b /tmp/n8n_cookies_recreate.txt "$N8N_URL/rest/credentials")
BACKEND_CRED_ID=$(echo "$CREDS" | jq -r '.data[] | select(.type == "httpBasicAuth" and (.name | contains("Backend"))) | .id' | head -1)
OPENROUTER_CRED_ID=$(echo "$CREDS" | jq -r '.data[] | select(.type == "openRouterApi") | .id' | head -1)

echo "   Backend API Credential ID: $BACKEND_CRED_ID"
echo "   OpenRouter API Credential ID: $OPENROUTER_CRED_ID"

# Get current workflow and delete it
echo "📋 Recupero e elimino workflow esistente..."
WORKFLOWS=$(curl -s -b /tmp/n8n_cookies_recreate.txt "$N8N_URL/rest/workflows")
WORKFLOW_ID=$(echo "$WORKFLOWS" | jq -r '.data[0].id')
echo "   Workflow ID trovato: $WORKFLOW_ID"

DELETE_RESPONSE=$(curl -s -b /tmp/n8n_cookies_recreate.txt -X DELETE "$N8N_URL/rest/workflows/$WORKFLOW_ID")
echo "✅ Workflow eliminato"

# Create new workflow with embedded credentials using the original JSON
echo "🏗️  Creo nuovo workflow con credenziali embedded..."

# Read the original workflow JSON and inject credentials
ORIGINAL_WORKFLOW_JSON="n8n/workflows/shopme-whatsapp-workflow.json"
if [ ! -f "$ORIGINAL_WORKFLOW_JSON" ]; then
    echo "❌ File workflow originale non trovato: $ORIGINAL_WORKFLOW_JSON"
    exit 1
fi

# Create new workflow with credentials injected
NEW_WORKFLOW=$(cat "$ORIGINAL_WORKFLOW_JSON" | jq --arg backend_id "$BACKEND_CRED_ID" --arg openrouter_id "$OPENROUTER_CRED_ID" '
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

# Create the new workflow (setting active=true directly)
echo "📤 Creo nuovo workflow..."
NEW_WORKFLOW_WITH_ACTIVE=$(echo "$NEW_WORKFLOW" | jq '. + {"active": true}')

IMPORT_RESPONSE=$(curl -s -b /tmp/n8n_cookies_recreate.txt -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d "$NEW_WORKFLOW_WITH_ACTIVE")

echo "   📋 Import response length: $(echo "$IMPORT_RESPONSE" | wc -c)"
echo "   📋 First 200 chars: $(echo "$IMPORT_RESPONSE" | head -c 200)"

if echo "$IMPORT_RESPONSE" | grep -q "\"error\":\|\"code\":[^0]\|CONSTRAINT.*failed"; then
    echo "❌ Errore creazione workflow: $IMPORT_RESPONSE"
    exit 1
fi

NEW_WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.id // .id')
echo "✅ Nuovo workflow creato con ID: $NEW_WORKFLOW_ID"

# Verify credentials
echo "🔍 Verifico assegnazione credenziali..."
VERIFY_WORKFLOW=$(curl -s -b /tmp/n8n_cookies_recreate.txt "$N8N_URL/rest/workflows/$NEW_WORKFLOW_ID")
OPENROUTER_NODE_CREDS=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "5d58d00e-d63a-4063-8969-ec550395c814") | .credentials.openRouterApi.id // "MISSING"')

echo "📊 Risultati verifica:"
echo "   🤖 OpenRouter Chat Model: $OPENROUTER_NODE_CREDS"

if [ "$OPENROUTER_NODE_CREDS" != "MISSING" ] && [ "$OPENROUTER_NODE_CREDS" != "null" ]; then
    echo "🎉 SUCCESSO! Credenziali OpenRouter assegnate correttamente!"
    echo "🔗 Webhook URL: $N8N_URL/webhook/webhook-start"
    echo "⚙️ Admin Panel: $N8N_URL"
else
    echo "❌ Credenziali OpenRouter ancora mancanti"
fi

echo "✅ Ricreazione workflow completata!" 