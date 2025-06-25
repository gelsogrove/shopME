#!/bin/bash

echo "🧪 Test SEMPLICE del workflow N8N"
echo "=================================="

# Test payload semplice
curl -X POST "http://localhost:5678/webhook/webhook-start" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv",
    "phoneNumber": "393451234567",
    "messageContent": "Ciao",
    "sessionToken": "test-session-123",
    "precompiledData": {
      "agentConfig": {
        "prompt": "Questo è il prompt di test di Andrea! Se vedi questo messaggio, il workflow funziona perfettamente! 🎉"
      }
    }
  }'

echo ""
echo "Test completato!" 