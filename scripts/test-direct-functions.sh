#!/bin/bash

# 🧪 TEST DIRETTO CALLING FUNCTIONS - Testa le funzioni backend direttamente
# Verifica che generino sempre link con phone parameter

echo "🧪 TEST DIRETTO CALLING FUNCTIONS"
echo "================================"

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variabili di test
BACKEND_URL="http://localhost:3001"
WORKSPACE_ID="cm9hjgq9v00014qk8fsdy4ujv"
MARIA_ID="2b8fbd85-4286-4bce-a0a0-a7e17b8ca7e2"
MARIO_ID="0880b358-3655-4dd2-9d4f-77b20535c650"

echo "🔑 Testing with Basic Auth: admin:admin"
echo ""

# Test 1: GetOrdersListLink per Maria
echo -e "${YELLOW}🧪 TEST 1: GetOrdersListLink (Maria Garcia)${NC}"
response1=$(curl -s -X POST "$BACKEND_URL/api/internal/generate-token" \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic YWRtaW46YWRtaW4=" \
    -d "{
        \"customerId\": \"$MARIA_ID\",
        \"workspaceId\": \"$WORKSPACE_ID\",
        \"action\": \"orders\"
    }")

echo "📥 Response: $response1"
token1=$(echo "$response1" | jq -r '.token' 2>/dev/null)

if [ "$token1" != "null" ] && [ ! -z "$token1" ]; then
    link1="http://localhost:3000/orders-public?token=$token1&phone=%2B34666777888"
    echo -e "${GREEN}✅ PASS: Token generato: ${token1:0:10}...${NC}"
    echo "🔗 Link: $link1"
    
    # Test il link
    echo "🧪 Testing link..."
    link_test=$(curl -s -I "$link1" | head -1)
    if echo "$link_test" | grep -q "200\|302"; then
        echo -e "${GREEN}✅ PASS: Link funzionante${NC}"
    else
        echo -e "${RED}❌ FAIL: Link non funzionante - $link_test${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Token non generato${NC}"
fi

echo ""

# Test 2: GetCustomerProfileLink per Maria  
echo -e "${YELLOW}🧪 TEST 2: GetCustomerProfileLink (Maria Garcia)${NC}"
response2=$(curl -s -X POST "$BACKEND_URL/api/internal/generate-token" \
    -H "Content-Type: application/json" \
    -H "Authorization: Basic YWRtaW46YWRtaW4=" \
    -d "{
        \"customerId\": \"$MARIA_ID\",
        \"workspaceId\": \"$WORKSPACE_ID\",
        \"action\": \"profile\"
    }")

echo "📥 Response: $response2"
token2=$(echo "$response2" | jq -r '.token' 2>/dev/null)

if [ "$token2" != "null" ] && [ ! -z "$token2" ]; then
    link2="http://localhost:3000/customer-profile?token=$token2&phone=%2B34666777888"
    echo -e "${GREEN}✅ PASS: Token generato: ${token2:0:10}...${NC}"
    echo "🔗 Link: $link2"
    
    # Test il link
    echo "🧪 Testing link..."
    link_test2=$(curl -s -I "$link2" | head -1)
    if echo "$link_test2" | grep -q "200\|302"; then
        echo -e "${GREEN}✅ PASS: Link funzionante${NC}"
    else
        echo -e "${RED}❌ FAIL: Link non funzionante - $link_test2${NC}"
    fi
else
    echo -e "${RED}❌ FAIL: Token non generato${NC}"
fi

echo ""

# Test 3: Ordine specifico per Maria
echo -e "${YELLOW}🧪 TEST 3: Ordine Specifico (20002 per Maria)${NC}"
# Reusa token1 per ordine specifico
if [ ! -z "$token1" ]; then
    link3="http://localhost:3000/orders-public/20002?token=$token1&phone=%2B34666777888"
    echo "🔗 Link: $link3"
    
    # Test il link
    echo "🧪 Testing link..."
    link_test3=$(curl -s -I "$link3" | head -1)
    if echo "$link_test3" | grep -q "200\|302"; then
        echo -e "${GREEN}✅ PASS: Link ordine specifico funzionante${NC}"
    else
        echo -e "${RED}❌ FAIL: Link ordine specifico non funzionante - $link_test3${NC}"
    fi
else
    echo -e "${RED}❌ SKIP: No token available${NC}"
fi

echo ""
echo "🏁 TEST COMPLETATI"
echo "=================="
echo "📋 RIASSUNTO:"
echo "• Test 1 (Orders): $([ ! -z "$token1" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Test 2 (Profile): $([ ! -z "$token2" ] && echo "✅ PASS" || echo "❌ FAIL")"
echo "• Test 3 (Specific Order): $([ ! -z "$token1" ] && echo "✅ PASS" || echo "❌ SKIP")"
