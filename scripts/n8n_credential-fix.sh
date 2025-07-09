#!/bin/bash

# Andrea's N8N Credential Fix Script
# Obiettivo: Assegnare credenziali ai nodi corretti del workflow N8N

set -e

echo "🔧 N8N CREDENTIAL FIX - Andrea's Solution"
echo "========================================="

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

# Login to N8N
echo "🔐 Login su N8N..."
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

if echo "$LOGIN_RESPONSE" | grep -q '"id"'; then
    echo "✅ Login riuscito!"
else
    echo "❌ Login fallito: $LOGIN_RESPONSE"
    exit 1
fi

# Get workflows
echo "📋 Recupero lista workflow..."
WORKFLOWS=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows")
WORKFLOW_ID=$(echo "$WORKFLOWS" | jq -r '.data[0].id // .[0].id // empty')

if [ -z "$WORKFLOW_ID" ]; then
    echo "❌ Nessun workflow trovato"
    exit 1
fi

echo "✅ Workflow trovato: $WORKFLOW_ID"

# Get credentials
echo "🔑 Recupero credenziali esistenti..."
CREDENTIALS=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/credentials")
BACKEND_CRED_ID=$(echo "$CREDENTIALS" | jq -r '.data[] | select(.name == "Backend API Basic Auth") | .id // empty' | head -1)
OPENROUTER_CRED_ID=$(echo "$CREDENTIALS" | jq -r '.data[] | select(.name == "OpenRouter API") | .id // empty' | head -1)

echo "   Backend API Credential ID: $BACKEND_CRED_ID"
echo "   OpenRouter API Credential ID: $OPENROUTER_CRED_ID"

if [ -z "$BACKEND_CRED_ID" ] || [ -z "$OPENROUTER_CRED_ID" ]; then
    echo "❌ Credenziali mancanti - esegui prima nuclear cleanup"
    exit 1
fi

# Get current workflow
echo "📖 Leggo workflow corrente..."
WORKFLOW_DATA=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows/$WORKFLOW_ID")

# Check if workflow has .data wrapper
HAS_DATA_WRAPPER=$(echo "$WORKFLOW_DATA" | jq 'has("data")')

echo "📦 Struttura workflow: $([ "$HAS_DATA_WRAPPER" = "true" ] && echo "con .data wrapper" || echo "senza wrapper")"

# Update workflow with credentials
echo "🔧 Aggiorno credenziali nei nodi corretti..."

if [ "$HAS_DATA_WRAPPER" = "true" ]; then
    # Structure with .data wrapper - Use correct OpenRouter credential format
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
else
    # Structure without .data wrapper - Use correct OpenRouter credential format
    UPDATED_WORKFLOW=$(echo "$WORKFLOW_DATA" | jq --arg backend_id "$BACKEND_CRED_ID" --arg openrouter_id "$OPENROUTER_CRED_ID" '
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
fi

# Apply update using PATCH method  
echo "📤 Applico aggiornamento con metodo PATCH..."
UPDATE_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X PATCH "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_WORKFLOW")

# Debug the response
echo "   📋 Response length: $(echo "$UPDATE_RESPONSE" | wc -c)"
echo "   📋 First 200 chars: $(echo "$UPDATE_RESPONSE" | head -c 200)"

# Check if response is valid JSON
if ! echo "$UPDATE_RESPONSE" | jq . >/dev/null 2>&1; then
    echo "❌ Risposta non è JSON valido: $UPDATE_RESPONSE"
    exit 1
fi

# Check if update was successful by checking for error status
ERROR_STATUS=$(echo "$UPDATE_RESPONSE" | jq -r '.status // "success"')
if [ "$ERROR_STATUS" = "error" ]; then
    ERROR_MESSAGE=$(echo "$UPDATE_RESPONSE" | jq -r '.message // "Unknown error"')
    echo "❌ Errore aggiornamento: $ERROR_MESSAGE"
    exit 1
fi

echo "✅ Credenziali aggiornate con successo!"

# Verify credentials were assigned
echo "🔍 Verifico assegnazione credenziali..."
VERIFY_WORKFLOW=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows/$WORKFLOW_ID")

if [ "$HAS_DATA_WRAPPER" = "true" ]; then
    OPENROUTER_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "5d58d00e-d63a-4063-8969-ec550395c814") | .credentials.openRouterApi.id // "MISSING"')
    RAG_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "9194a962-fa10-4e33-95bb-e140344ba816") | .credentials.httpBasicAuth.id // "MISSING"')
    PRODUCTS_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.data.nodes[] | select(.id == "0f33aa9d-9736-4406-947b-d3af2be2ad9b") | .credentials.httpBasicAuth.id // "MISSING"')
else
    OPENROUTER_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.nodes[] | select(.id == "5d58d00e-d63a-4063-8969-ec550395c814") | .credentials.openRouterApi.id // "MISSING"')
    RAG_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.nodes[] | select(.id == "9194a962-fa10-4e33-95bb-e140344ba816") | .credentials.httpBasicAuth.id // "MISSING"')
    PRODUCTS_ASSIGNED=$(echo "$VERIFY_WORKFLOW" | jq -r '.nodes[] | select(.id == "0f33aa9d-9736-4406-947b-d3af2be2ad9b") | .credentials.httpBasicAuth.id // "MISSING"')
fi

echo "📊 Risultati verifica:"
echo "   🤖 OpenRouter Chat Model: $OPENROUTER_ASSIGNED"
echo "   🔍 RagSearch(): $RAG_ASSIGNED"  
echo "   📦 GetAllProducts(): $PRODUCTS_ASSIGNED"

if [ "$OPENROUTER_ASSIGNED" != "MISSING" ] && [ "$RAG_ASSIGNED" != "MISSING" ] && [ "$PRODUCTS_ASSIGNED" != "MISSING" ]; then
    echo ""
    echo "🎉 SUCCESSO! Tutte le credenziali sono state assegnate!"
    echo "✅ Il workflow N8N è pronto per l'uso!"
    echo "🔗 Webhook URL: http://localhost:5678/webhook/webhook-start"
else
    echo ""
    echo "⚠️ Alcune credenziali potrebbero non essere state assegnate correttamente"
fi

# Cleanup
rm -f /tmp/n8n_cookies.txt

echo ""
echo "✅ Credential fix completato!" 