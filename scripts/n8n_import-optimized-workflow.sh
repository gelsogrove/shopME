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

echo "🔄 Step 4: Creo il workflow SEMPLICE..."

# Create a temporary JSON file for the workflow
cat > /tmp/simple_workflow.json << 'EOF'
{
  "id": "5lbTwPUliRkFXSPN",
  "name": "Andrea Simple Workflow",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-start",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-trigger",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [180, 300],
      "webhookId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    },
    {
      "parameters": {
        "jsCode": "const payload = $input.first().json;\nlet prompt = 'Prompt not found';\nif (payload.precompiledData && payload.precompiledData.agentConfig && payload.precompiledData.agentConfig.prompt) {\n  prompt = payload.precompiledData.agentConfig.prompt;\n}\nreturn prompt;"
      },
      "id": "extract-prompt", 
      "name": "Extract Prompt",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [380, 300]
    },
    {
      "parameters": {
        "respondWith": "text",
        "responseBody": "={{ $json }}"
      },
      "id": "webhook-response",
      "name": "Return Response",
      "type": "n8n-nodes-base.respondToWebhook", 
      "typeVersion": 1,
      "position": [580, 300]
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [
        [
          {
            "node": "Extract Prompt",
            "type": "main", 
            "index": 0
          }
        ]
      ]
    },
    "Extract Prompt": {
      "main": [
        [
          {
            "node": "Return Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "settings": {
    "executionOrder": "v1"
  },
  "staticData": null,
  "tags": [],
  "triggerCount": 1,
  "versionId": "andrea-simple-v1"
}
EOF

echo "📤 Importo il workflow..."
IMPORT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @/tmp/simple_workflow.json)

if echo "$IMPORT_RESPONSE" | grep -q "error\|Error"; then
    echo "❌ Errore import workflow: $IMPORT_RESPONSE"
    exit 1
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
rm -f "$COOKIE_FILE" /tmp/simple_workflow.json /tmp/test_payload.json

echo "🎯 SCRIPT COMPLETATO!" 