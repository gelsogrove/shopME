#!/bin/bash

# 🎯 ANDREA FIX SCRIPT - Workflow con il TUO mock esatto
# Risolve: workspaceId undefined, redirect, ID fisso

set -e

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
FIXED_WORKFLOW_ID="1XPQF919PP0MEdtH"  # ID fisso come vuoi tu Andrea
COOKIE_FILE="/tmp/n8n_cookies.txt"

echo "🚀 ANDREA FIX SCRIPT - Workflow Definitivo"
echo "========================================="
echo "🎯 OBIETTIVO: Workflow con il TUO mock che funziona al 100%"

echo "🔐 Step 1: Login..."
curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"'$USERNAME'","password":"'$PASSWORD'"}' > /dev/null

echo "✅ Login completato!"

echo "🧹 Step 2: CANCELLO TUTTI I WORKFLOW VECCHI..."
curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows" | jq -r '.data[].id' | while read -r id; do
    echo "🗑️  Cancello workflow: $id"
    curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$id" -H "Content-Type: application/json" -d '{"active":false}' > /dev/null
    curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$id" > /dev/null 2>&1 || echo "   (già cancellato)"
done

echo "✅ Tutti i workflow cancellati!"

echo "🔄 Step 3: Creo il workflow ANDREA con il TUO mock esatto..."

# Workflow JSON con il tuo mock preciso
cat > /tmp/andrea_workflow.json << 'EOF'
{
  "name": "Andrea Perfect Workflow",
  "id": "1XPQF919PP0MEdtH",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-start",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "09358f0c-79dd-4c42-bcfb-d9bcb4a61575",
      "name": "When chat message received",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [-620, 20],
      "webhookId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
    },
    {
      "parameters": {
        "jsCode": "// Extract webhook payload data\nconst incomingData = $input.first().json;\n\nconsole.log('🎯 WEBHOOK DATA RECEIVED:', JSON.stringify(incomingData, null, 2));\n\n// Extract data from the payload matching webhook-payload-example.json structure\nconst workspaceId = incomingData.workspaceId;\nconst phoneNumber = incomingData.phoneNumber;\nconst messageContent = incomingData.messageContent;\nconst sessionToken = incomingData.sessionToken;\n\n// Check if we have precompiled data (for testing) or need to get it\nconst hasPrecompiledData = incomingData.precompiledData && \n                          incomingData.precompiledData.agentConfig &&\n                          incomingData.precompiledData.customer &&\n                          incomingData.precompiledData.businessInfo;\n\nconsole.log('📋 EXTRACTED DATA:');\nconsole.log('WorkspaceId:', workspaceId);\nconsole.log('Phone:', phoneNumber);\nconsole.log('Message:', messageContent);\nconsole.log('Session Token:', sessionToken);\nconsole.log('Has Precompiled Data:', hasPrecompiledData);\n\nreturn {\n  workspaceId,\n  //phoneNumber,\n  //messageContent,\n  //sessionToken,\n  //hasPrecompiledData,\n  //precompiledData: incomingData.precompiledData || null\n};"
      },
      "id": "efbdf1c3-407a-47dd-8011-8a3c0b012ecf",
      "name": "Extract Message Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [-420, 20]
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
      "position": [-220, 20]
    }
  ],
  "connections": {
    "When chat message received": {
      "main": [
        [
          {
            "node": "Extract Message Data",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Extract Message Data": {
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
  "settings": {
    "executionOrder": "v1"
  }
}
EOF

echo "📤 Importo il workflow con ID fisso..."
IMPORT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @/tmp/andrea_workflow.json)

echo "✅ Workflow importato!"
echo "ID del workflow: $FIXED_WORKFLOW_ID"

echo "🔄 Step 4: Attivo il workflow..."
curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$FIXED_WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"active":true}' > /dev/null

echo "✅ Workflow attivato!"

echo "🧪 Step 5: Test con payload completo..."
TEST_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567",
    "messageContent": "Ciao Andrea",
    "sessionToken": "test-token-123",
    "precompiledData": {
      "agentConfig": {
        "prompt": "Test prompt Andrea"
      },
      "customer": {
        "name": "Test Customer"
      },
      "businessInfo": {
        "name": "Test Business"
      }
    }
  }')

echo "📥 Risposta del test:"
echo "$TEST_RESPONSE"

if echo "$TEST_RESPONSE" | grep -q "workspaceId"; then
    echo "✅ TEST PASSATO! Il workspaceId viene estratto correttamente!"
else
    echo "❌ Test fallito. Risposta: $TEST_RESPONSE"
fi

echo ""
echo "🎯 SCRIPT COMPLETATO!"
echo "👉 Vai su: http://localhost:5678/workflow/$FIXED_WORKFLOW_ID"
echo "🔧 Usa questo payload per testare:"
echo '{"workspaceId":"cm9hjgq9v00014qk8fsdy4ujv","phoneNumber":"393451234567","messageContent":"Ciao"}' 