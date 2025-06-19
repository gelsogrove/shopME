#!/bin/bash

echo "🧪 Testing Simple N8N Webhook"
echo "=============================="

# Login to N8N
curl -s -X POST http://localhost:5678/rest/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"admin@shopme.com","password":"Venezia44"}' \
  -c /tmp/n8n_cookies.txt > /dev/null

# Create a very simple test workflow
echo "📋 Creating simple test workflow..."
SIMPLE_WORKFLOW='{
  "name": "Simple Test Webhook",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "test-webhook",
        "options": {}
      },
      "id": "webhook-start",
      "name": "Test Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [200, 300],
      "webhookId": "test-webhook"
    },
    {
      "parameters": {
        "jsCode": "return { message: \"Webhook received!\", data: $input.all() };"
      },
      "id": "simple-response",
      "name": "Simple Response",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [400, 300]
    }
  ],
  "connections": {
    "Test Webhook": {
      "main": [[{"node": "Simple Response", "type": "main", "index": 0}]]
    }
  },
  "settings": {
    "executionOrder": "v1"
  }
}'

# Import the simple workflow
RESULT=$(curl -s -X POST http://localhost:5678/rest/workflows \
  -H "Content-Type: application/json" \
  -b /tmp/n8n_cookies.txt \
  -d "$SIMPLE_WORKFLOW")

WORKFLOW_ID=$(echo "$RESULT" | jq -r '.data.id')

if [ "$WORKFLOW_ID" != "null" ]; then
    echo "✅ Simple workflow created with ID: $WORKFLOW_ID"
    
    # Test the webhook
    echo "🧪 Testing simple webhook..."
    TEST_RESPONSE=$(curl -s -X POST http://localhost:5678/webhook/test-webhook \
      -H "Content-Type: application/json" \
      -d '{"test":"data","message":"hello"}')
    
    echo "📨 Response: $TEST_RESPONSE"
    
    if [[ $TEST_RESPONSE == *"Webhook received"* ]]; then
        echo "✅ Simple webhook works!"
        echo ""
        echo "The issue is with the complex workflow, not N8N itself."
        echo "The problem is likely in the credential configuration or HTTP request nodes."
    else
        echo "❌ Simple webhook failed too."
        echo "N8N has a fundamental issue."
    fi
else
    echo "❌ Failed to create simple workflow"
    echo "Response: $RESULT"
fi

echo "==============================" 