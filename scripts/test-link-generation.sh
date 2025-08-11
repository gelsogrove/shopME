#!/bin/bash

# Test Link Generation Script
# This script tests why the orders link is still showing app.example.com

echo "🔗 Testing Orders Link Generation"
echo "=================================="

# Test 1: Check if backend is running
echo "1️⃣ Testing backend connectivity..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not running"
    exit 1
fi

# Test 2: Test token generation
echo "2️⃣ Testing token generation..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/internal/generate-token \
    -H "Content-Type: application/json" \
    -u "admin:admin" \
    -d '{
        "customerId": "test-customer-123",
        "action": "orders",
        "workspaceId": "test-workspace-456"
    }')

echo "Token Response: $TOKEN_RESPONSE"

# Extract the link URL
LINK_URL=$(echo "$TOKEN_RESPONSE" | grep -o '"linkUrl":"[^"]*"' | cut -d'"' -f4)
echo "Generated Link: $LINK_URL"

# Test 3: Check if link contains app.example.com
echo "3️⃣ Checking link format..."
if [[ "$LINK_URL" == *"app.example.com"* ]]; then
    echo "❌ Link still contains app.example.com"
    echo "   This means workspace.url is not set or fallback is being used"
else
    echo "✅ Link format looks correct"
fi

# Test 4: Check database for workspace URL
echo "4️⃣ Checking workspace configuration..."
echo "   You should check if workspace.url is set in the database"
echo "   Run: docker exec -it shopmefy-db psql -U shopmefy -d shopmefy -c \"SELECT id, name, url FROM \"Workspace\" WHERE url IS NOT NULL;\""

# Test 5: Test the actual orders API
echo "5️⃣ Testing orders API..."
if [ ! -z "$LINK_URL" ]; then
    TOKEN=$(echo "$LINK_URL" | grep -o 'token=[^&]*' | cut -d'=' -f2)
    ORDERS_RESPONSE=$(curl -s "http://localhost:3001/api/orders?token=$TOKEN")
    echo "Orders API Response: $ORDERS_RESPONSE"
else
    echo "❌ No token generated, cannot test orders API"
fi

echo ""
echo "🔍 Debugging Steps:"
echo "1. Check if workspace.url is set in database"
echo "2. Verify the generateToken function uses workspace.url"
echo "3. Check if fallback to app.example.com is correct"
echo "4. Test with a real workspace that has a URL set"
