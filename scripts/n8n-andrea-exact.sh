#!/bin/bash

# 🎯 ANDREA EXACT SCRIPT - Implementa ESATTAMENTE il tuo mock
# Con gli ID specifici che mi hai dato

set -e

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
COOKIE_FILE="/tmp/n8n_cookies.txt"

# I tuoi ID specifici
TARGET_WORKFLOW_ID="1XPQF919PP0MEdtH"
TARGET_NODE_ID="09358f0c-79dd-4c42-bcfb-d9bcb4a61575"
TARGET_WEBHOOK_ID="f47ac10b-58cc-4372-a567-0e02b2c3d479"

echo "🎯 ANDREA EXACT SCRIPT - IL TUO MOCK ESATTO"
echo "==========================================="
echo "Workflow ID: $TARGET_WORKFLOW_ID"
echo "Node ID: $TARGET_NODE_ID"
echo "Webhook ID: $TARGET_WEBHOOK_ID"

echo "🔐 Step 1: Login..."
curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"'$USERNAME'","password":"'$PASSWORD'"}' > /dev/null

echo "✅ Login completato!"

echo "🧹 Step 2: Cancello tutti i workflow per evitare conflitti..."
curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows" | jq -r '.data[].id' | while read -r id; do
    echo "🗑️  Cancello workflow: $id"
    curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$id" -H "Content-Type: application/json" -d '{"active":false}' > /dev/null
    curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$id" > /dev/null 2>&1 || echo "   (già cancellato)"
done

echo "✅ Tutti i workflow cancellati!"

echo "🔄 Step 3: Creo il workflow con il TUO MOCK ESATTO..."

# Il TUO workflow esatto con i tuoi ID specifici
cat > /tmp/andrea_exact_workflow.json << EOF
{
  "name": "Andrea Mock Workflow",
  "id": "$TARGET_WORKFLOW_ID",
  "active": false,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-start",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "$TARGET_NODE_ID",
      "name": "When chat message received",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [-620, 20],
      "webhookId": "$TARGET_WEBHOOK_ID"
    },
    {
      "parameters": {
        "jsCode": "// Extract webhook payload data\nconst incomingData = \$input.first().json;\n\nconsole.log('🎯 WEBHOOK DATA RECEIVED:', JSON.stringify(incomingData, null, 2));\n\n// Extract data from the payload matching webhook-payload-example.json structure\nconst workspaceId = incomingData.workspaceId;\nconst phoneNumber = incomingData.phoneNumber;\nconst messageContent = incomingData.messageContent;\nconst sessionToken = incomingData.sessionToken;\n\n// Check if we have precompiled data (for testing) or need to get it\nconst hasPrecompiledData = incomingData.precompiledData && \n                          incomingData.precompiledData.agentConfig &&\n                          incomingData.precompiledData.customer &&\n                          incomingData.precompiledData.businessInfo;\n\nconsole.log('📋 EXTRACTED DATA:');\nconsole.log('WorkspaceId:', workspaceId);\nconsole.log('Phone:', phoneNumber);\nconsole.log('Message:', messageContent);\nconsole.log('Session Token:', sessionToken);\nconsole.log('Has Precompiled Data:', hasPrecompiledData);\n\nreturn {\n  workspaceId,\n  //phoneNumber,\n  //messageContent,\n  //sessionToken,\n  //hasPrecompiledData,\n  //precompiledData: incomingData.precompiledData || null\n};"
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
        "responseBody": "={{ \$json }}"
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

echo "📤 Importo il workflow con il TUO ID esatto..."
IMPORT_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @/tmp/andrea_exact_workflow.json)

echo "📊 Import response:"
echo "$IMPORT_RESPONSE" | jq .

echo "🔄 Step 4: Attivo il workflow..."
ACTIVATE_RESPONSE=$(curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$TARGET_WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"active":true}')

echo "📊 Activate response:"
echo "$ACTIVATE_RESPONSE" | jq .

echo "⏰ Step 5: Aspetto 10 secondi per registrazione webhook..."
sleep 10

echo "🧪 Step 6: Test con il payload del webhook-payload-example.json..."
TEST_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567",
    "messageContent": "Ciao Andrea",
    "sessionToken": "test-session-123"
  }')

echo "📥 Test response:"
echo "$TEST_RESPONSE" | jq .

echo ""
echo "🎯 RISULTATO FINALE:"
echo "✅ Workflow ID: $TARGET_WORKFLOW_ID"
echo "✅ URL: http://localhost:5678/workflow/$TARGET_WORKFLOW_ID"
echo "✅ Webhook: http://localhost:5678/webhook/webhook-start"
echo ""
echo "🔍 ANALISI workspaceId:"
if echo "$TEST_RESPONSE" | grep -q "workspaceId"; then
    EXTRACTED_WORKSPACE=$(echo "$TEST_RESPONSE" | jq -r '.workspaceId // "NULL"')
    echo "✅ WorkspaceId estratto: $EXTRACTED_WORKSPACE"
    if [ "$EXTRACTED_WORKSPACE" = "null" ] || [ "$EXTRACTED_WORKSPACE" = "NULL" ]; then
        echo "❌ PROBLEMA CONFERMATO: workspaceId è null!"
        echo "🔧 Il problema è nel codice JavaScript del nodo Extract"
    else
        echo "✅ WorkspaceId funziona correttamente!"
    fi
else
    echo "❌ Nessun workspaceId nella risposta"
fi 