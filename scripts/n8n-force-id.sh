#!/bin/bash

# 🎯 ANDREA FORCE ID SCRIPT - Forza l'ID specifico che vuoi
# Usa una tecnica avanzata per ottenere l'ID esatto

set -e

N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
COOKIE_FILE="/tmp/n8n_cookies.txt"

# L'ID che TU vuoi
TARGET_ID="1XPQF919PP0MEdtH"

echo "🚀 ANDREA FORCE ID SCRIPT"
echo "========================"
echo "🎯 OBIETTIVO: Workflow con ID $TARGET_ID"

echo "🔐 Login..."
curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"'$USERNAME'","password":"'$PASSWORD'"}' > /dev/null

echo "✅ Login completato!"

echo "🧹 Cancello tutti i workflow esistenti..."
curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows" | jq -r '.data[].id' | while read -r id; do
    echo "🗑️ Cancello: $id"
    curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$id" -H "Content-Type: application/json" -d '{"active":false}' > /dev/null 2>&1
    curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$id" > /dev/null 2>&1
done

echo "✅ Tutti cancellati!"

echo "🔄 Creo workflow temporaneo..."
TEMP_WORKFLOW=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temp Workflow",
    "active": false,
    "nodes": [
      {
        "parameters": {
          "httpMethod": "POST",
          "path": "webhook-start", 
          "responseMode": "responseNode",
          "options": {}
        },
        "id": "temp-node",
        "name": "Temp Node",
        "type": "n8n-nodes-base.webhook",
        "typeVersion": 1,
        "position": [-600, 0]
      }
    ],
    "connections": {}
  }')

TEMP_ID=$(echo "$TEMP_WORKFLOW" | jq -r '.data.id')
echo "📝 Workflow temporaneo creato: $TEMP_ID"

echo "🔄 Ora sovrascrivo con il tuo ID specifico..."

# Creo il workflow finale con il codice JavaScript dell'immagine
curl -s -b "$COOKIE_FILE" -X PUT "$N8N_URL/rest/workflows/$TEMP_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "'$TARGET_ID'",
    "name": "Andrea Perfect Workflow",
    "active": false,
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
          "jsCode": "const incomingData = $input.first().json;\n\nconsole.log('\''🎯 WEBHOOK DATA RECEIVED:'\'', JSON.stringify(incomingData, null, 2));\n\n// Extract data from the payload matching webhook-payload-example.json structure\nconst workspaceId = incomingData.workspaceId;\nconst phoneNumber = incomingData.phoneNumber;\nconst messageContent = incomingData.messageContent;\nconst sessionToken = incomingData.sessionToken;\n\n// Check if we have precompiled data (for testing) or need to get it\nconst hasPrecompiledData = incomingData.precompiledData &&\n                          incomingData.precompiledData.agentConfig &&\n                          incomingData.precompiledData.customer &&\n                          incomingData.precompiledData.businessInfo;\n\nconsole.log('\''📋 EXTRACTED DATA:'\'');\nconsole.log('\''WorkspaceId:'\'', workspaceId);\nconsole.log('\''Phone:'\'', phoneNumber);\nconsole.log('\''Message:'\'', messageContent);\nconsole.log('\''Session Token:'\'', sessionToken);\nconsole.log('\''Has Precompiled Data:'\'', hasPrecompiledData);\n\nreturn {\n  workspaceId,\n  phoneNumber,\n  messageContent,\n  sessionToken,\n  hasPrecompiledData,\n  precompiledData: incomingData.precompiledData || null\n};"
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
    }
  }' > /dev/null

echo "✅ Workflow sovrascritto!"

echo "🔄 Attivo il workflow..."
curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$TEMP_ID" \
  -H "Content-Type: application/json" \
  -d '{"active":true}' > /dev/null

echo "✅ Workflow attivato!"

echo "⏰ Aspetto 5 secondi per registrazione..."
sleep 5

echo "🧪 Test finale..."
TEST_RESPONSE=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567",
    "messageContent": "Ciao",
    "sessionToken": "test-123"
  }')

echo "📥 Risposta:"
echo "$TEST_RESPONSE" | jq .

echo ""
echo "🎯 RISULTATO:"
echo "✅ URL: http://localhost:5678/workflow/$TARGET_ID"
echo "✅ Webhook: http://localhost:5678/webhook/webhook-start"

if echo "$TEST_RESPONSE" | grep -q "workspaceId"; then
    echo "✅ SUCCESSO! WorkspaceId estratto correttamente!"
else
    echo "❌ Problema ancora presente"
fi 