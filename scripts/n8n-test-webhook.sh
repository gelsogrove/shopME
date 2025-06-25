#!/bin/bash

echo "🧪 ANDREA TEST WEBHOOK SPECIFICO"
echo "================================"

echo "📤 Test 1: Payload semplice..."
curl -v -X POST "http://localhost:5678/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{"test":"ciao"}'

echo ""
echo "📤 Test 2: Payload completo..."
curl -v -X POST "http://localhost:5678/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567", 
    "messageContent": "Ciao",
    "precompiledData": {
      "agentConfig": {
        "prompt": "PROMPT DI TEST ANDREA!"
      }
    }
  }'

echo ""
echo "📤 Test 3: Webhook differente..."
curl -v -X POST "http://localhost:5678/webhook-test" \
  -H "Content-Type: application/json" \
  -d '{"test":"ciao"}'

echo ""
echo "🔍 Verifico i workflow attivi..."
curl -s -c /tmp/debug_cookies.txt -X POST "http://localhost:5678/rest/login" \
  -H "Content-Type: application/json" \
  -d '{"emailOrLdapLoginId":"admin@shopme.com","password":"Venezia44"}' > /dev/null

curl -s -b /tmp/debug_cookies.txt "http://localhost:5678/rest/workflows" | jq '.data[] | {id, name, active}' 