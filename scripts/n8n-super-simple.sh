#!/bin/bash

# 🎯 ANDREA SUPER SIMPLE SCRIPT - Zero errori garantito
# Creiamo tutto step by step

set -e

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
COOKIE_FILE="/tmp/n8n_cookies.txt"

echo "🚀 ANDREA SUPER SIMPLE SCRIPT"
echo "=============================="

echo "🔐 Step 1: Login e verifica..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"'$USERNAME'","password":"'$PASSWORD'"}')

echo "Login response: $LOGIN_RESPONSE"

echo "🧹 Step 2: Lista workflow esistenti..."
WORKFLOWS=$(curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows")
echo "Workflow esistenti:"
echo "$WORKFLOWS" | jq -r '.data[] | "\(.id) - \(.name) - Active: \(.active)"'

echo "🔄 Step 3: Creo workflow semplicissimo..."

# Workflow ultra-semplice senza ID fisso (lasciamo che N8N ne generi uno)
cat > /tmp/simple_workflow.json << 'EOF'
{
  "name": "Andrea Simple Test",
  "active": false,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-start",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "webhook-node",
      "name": "When chat message received",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        -620,
        20
      ]
    },
    {
      "parameters": {
        "jsCode": "// Estrae il workspaceId dal payload\nconst data = $input.first().json;\nconsole.log('📥 Received:', JSON.stringify(data, null, 2));\n\n// Estrae workspaceId\nconst workspaceId = data.workspaceId || 'MISSING_WORKSPACE_ID';\n\nconsole.log('🎯 WorkspaceId extracted:', workspaceId);\n\nreturn {\n  success: true,\n  extracted_workspaceId: workspaceId,\n  original_data: data\n};"
      },
      "id": "extract-node",
      "name": "Extract Data Simple",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -420,
        20
      ]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      },
      "id": "response-node",
      "name": "Return Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        -220,
        20
      ]
    }
  ],
  "connections": {
    "When chat message received": {
      "main": [
        [
          {
            "node": "Extract Data Simple",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Data Simple": {
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
  }
}
EOF

echo "📤 Importo il workflow..."
IMPORT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @/tmp/simple_workflow.json)

echo "Import response:"
echo "$IMPORT_RESPONSE" | jq .

# Estraggo l'ID del workflow creato
WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.id')
echo "🆔 Workflow ID generato: $WORKFLOW_ID"

echo "🔄 Step 4: Attivo il workflow..."
ACTIVATE_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"active":true}')

echo "Activate response:"
echo "$ACTIVATE_RESPONSE" | jq .

echo "⏰ Step 5: Aspetto 5 secondi per la registrazione..."
sleep 5

echo "🧪 Step 6: Test del webhook..."
TEST_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567", 
    "messageContent": "Ciao Andrea test"
  }')

echo "📥 Test response:"
echo "$TEST_RESPONSE" | jq .

echo ""
echo "🎯 RISULTATO FINALE:"
echo "Workflow ID: $WORKFLOW_ID"
echo "URL: http://localhost:5678/workflow/$WORKFLOW_ID"
echo "Webhook: http://localhost:5678/webhook/webhook-start" 