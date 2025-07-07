#!/bin/bash

# 🚀 GENERATE EMBEDDINGS SCRIPT
# Genera tutti gli embeddings necessari per il funzionamento del RAG

set -e

WORKSPACE_ID="cm9hjgq9v00014qk8fsdy4ujv"
BACKEND_URL="http://localhost:3001"

# Get auth token
echo "🔐 Getting auth token..."
AUTH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@shopme.com", "password": "Venezia44"}')

# Extract token from cookies (assuming it's returned in Set-Cookie header)
echo "🔍 Getting fresh auth token..."
TOKEN=$(curl -s -c /tmp/cookies.txt -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@shopme.com", "password": "Venezia44"}' | \
  jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get auth token"
  exit 1
fi

echo "✅ Auth token obtained"

# Use cookie-based authentication
echo ""
echo "🚀 Starting embedding generation for workspace: $WORKSPACE_ID"
echo "================================================="

# 1. Generate FAQ embeddings
echo ""
echo "📝 1. Generating FAQ embeddings..."
FAQ_RESULT=$(curl -s -b /tmp/cookies.txt -X POST \
  "$BACKEND_URL/api/workspaces/$WORKSPACE_ID/faqs/generate-embeddings" \
  -H "Content-Type: application/json")
echo "FAQ Result: $FAQ_RESULT"

# 2. Generate Product embeddings  
echo ""
echo "🛒 2. Generating Product embeddings..."
PRODUCT_RESULT=$(curl -s -b /tmp/cookies.txt -X POST \
  "$BACKEND_URL/api/workspaces/$WORKSPACE_ID/products/generate-embeddings" \
  -H "Content-Type: application/json")
echo "Product Result: $PRODUCT_RESULT"

# 3. Generate Service embeddings
echo ""
echo "🛎️ 3. Generating Service embeddings..."
SERVICE_RESULT=$(curl -s -b /tmp/cookies.txt -X POST \
  "$BACKEND_URL/api/workspaces/$WORKSPACE_ID/services/generate-embeddings" \
  -H "Content-Type: application/json")
echo "Service Result: $SERVICE_RESULT"

# 4. Generate Document embeddings
echo ""
echo "📄 4. Generating Document embeddings..."
DOCUMENT_RESULT=$(curl -s -b /tmp/cookies.txt -X POST \
  "$BACKEND_URL/api/workspaces/$WORKSPACE_ID/documents/generate-embeddings" \
  -H "Content-Type: application/json")
echo "Document Result: $DOCUMENT_RESULT"

echo ""
echo "🎉 Embedding generation completed!"
echo "=================================="

# Test RAG search
echo ""
echo "🧪 Testing RAG search with delivery question..."
TEST_RESULT=$(curl -s -X POST "$BACKEND_URL/api/internal/rag-search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46YWRtaW4=" \
  -d '{
    "query": "quanto ci vuole per far arrivare il mio ordine",
    "workspaceId": "'$WORKSPACE_ID'",
    "customerId": "test-customer-123"
  }')
echo "RAG Test Result: $TEST_RESULT"

# Cleanup
rm -f /tmp/cookies.txt

echo ""
echo "✅ All done! The chatbot should now find FAQ information correctly." 