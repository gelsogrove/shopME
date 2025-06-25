#!/bin/bash

echo "🚀 SUPER SIMPLE WORKFLOW - SOLO PER TEST"

N8N_URL="http://localhost:5678"
COOKIE_FILE="/tmp/n8n_cookies.txt"

# Login
curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"admin@shopme.com","password":"Venezia44"}' > /dev/null

# Delete ALL workflows
curl -s -b "$COOKIE_FILE" "$N8N_URL/rest/workflows" | jq -r '.data[].id' | while read -r id; do
    curl -s -b "$COOKIE_FILE" -X DELETE "$N8N_URL/rest/workflows/$id" > /dev/null
done

# Create SUPER SIMPLE workflow
cat > /tmp/super_simple.json << 'EOF'
{
  "name": "SUPER SIMPLE TEST",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "webhook-start",
        "responseMode": "responseNode"
      },
      "id": "webhook1",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [100, 200]
    },
    {
      "parameters": {
        "respondWith": "text",
        "responseBody": "CIAO ANDREA! FUNZIONA!"
      },
      "id": "response1",
      "name": "Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [300, 200]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
EOF

# Import workflow
RESPONSE=$(curl -s -b "$COOKIE_FILE" -X POST "$N8N_URL/rest/workflows" \
  -H "Content-Type: application/json" \
  -d @/tmp/super_simple.json)

WORKFLOW_ID=$(echo "$RESPONSE" | jq -r '.data.id')
echo "✅ Workflow creato: $WORKFLOW_ID"

# Activate workflow
curl -s -b "$COOKIE_FILE" -X PATCH "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
  -H "Content-Type: application/json" \
  -d '{"active": true}' > /dev/null

sleep 2

# Test
echo "🧪 TEST:"
curl -X POST "http://localhost:5678/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{"test":"ciao"}'

rm -f /tmp/super_simple.json "$COOKIE_FILE" 