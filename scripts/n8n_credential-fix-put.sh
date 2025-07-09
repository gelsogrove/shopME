#!/bin/bash

# Andrea's N8N Credential Fix Script - PUT Method
# Obiettivo: Assegnare credenziali tramite PUT completo

set -e

echo "🔧 N8N CREDENTIAL FIX - PUT Method"
echo "=================================="

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
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies_put.txt -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Errore login: $LOGIN_RESPONSE"
    exit 1
fi
echo "✅ Login riuscito!"

# Get workflows
echo "📋 Recupero lista workflow..."
WORKFLOWS=$(curl -s -b /tmp/n8n_cookies_put.txt "$N8N_URL/rest/workflows")
WORKFLOW_ID=$(echo "$WORKFLOWS" | jq -r '.data[0].id')
echo "✅ Workflow trovato: $WORKFLOW_ID"

# Get credentials
echo "🔑 Recupero credenziali esistenti..."
CREDS=$(curl -s -b /tmp/n8n_cookies_put.txt "$N8N_URL/rest/credentials")
BACKEND_CRED_ID=$(echo "$CREDS" | jq -r '.data[] | select(.type == "httpBasicAuth" and (.name | contains("Backend"))) | .id' | head -1)
OPENROUTER_CRED_ID=$(echo "$CREDS" | jq -r '.data[] | select(.type == "openRouterApi") | .id' | head -1)

echo "   Backend API Credential ID: $BACKEND_CRED_ID"
echo "   OpenRouter API Credential ID: $OPENROUTER_CRED_ID"

# Get current workflow
echo "📖 Leggo workflow corrente..."
WORKFLOW_DATA=$(curl -s -b /tmp/n8n_cookies_put.txt "$N8N_URL/rest/workflows/$WORKFLOW_ID")

# Create complete workflow with credentials
echo "🔧 Creo workflow completo con credenziali..."
UPDATED_WORKFLOW=$(echo "$WORKFLOW_DATA" | jq --arg backend_id "$BACKEND_CRED_ID" --arg openrouter_id "$OPENROUTER_CRED_ID" '
    .data.nodes = (.data.nodes | map(
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

# Apply update using PUT method (full replacement)
echo "📤 Sostituisco workflow completo con metodo PUT..."
UPDATE_RESPONSE=$(curl -s -b /tmp/n8n_cookies_put.txt -X PUT "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_WORKFLOW")

echo "   📋 Response length: $(echo "$UPDATE_RESPONSE" | wc -c)"
echo "   📋 First 200 chars: $(echo "$UPDATE_RESPONSE" | head -c 200)"

if echo "$UPDATE_RESPONSE" | jq -r '.data.id' | grep -q "$WORKFLOW_ID"; then
    echo "✅ Workflow sostituito con successo!"
else
    echo "❌ Errore nella sostituzione del workflow"
    echo "Response: $UPDATE_RESPONSE"
    exit 1
fi

# Verify credentials
echo "🔍 Verifico assegnazione credenziali..."
VERIFY_WORKFLOW=$(curl -s -b /tmp/n8n_cookies_put.txt "$N8N_URL/rest/workflows/$WORKFLOW_ID")
OPENROUTER_NODE_CREDS=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "5d58d00e-d63a-4063-8969-ec550395c814") | .credentials.openRouterApi.id // "MISSING"')

echo "📊 Risultati verifica:"
echo "   🤖 OpenRouter Chat Model: $OPENROUTER_NODE_CREDS"

if [ "$OPENROUTER_NODE_CREDS" != "MISSING" ]; then
    echo "✅ Credenziali OpenRouter assegnate correttamente!"
else
    echo "❌ Credenziali OpenRouter ancora mancanti"
fi

echo "✅ Test PUT completato!" 