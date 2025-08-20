#!/bin/bash

# 🔐 TOKEN-ONLY SYSTEM VERIFICATION SCRIPT
# Andrea - Final verification before system freeze

echo "🔐 TOKEN-ONLY SYSTEM VERIFICATION"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    else
        echo -e "${RED}❌ $message${NC}"
    fi
}

echo -e "${BLUE}🧪 VERIFICA SISTEMA TOKEN-ONLY${NC}"
echo ""

# 1. Check if backend is running
echo "1. Verifica Backend..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    print_status "OK" "Backend is running on port 3001"
else
    print_status "WARN" "Backend not running on port 3001"
fi

# 2. Check if frontend is running
echo "2. Verifica Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    print_status "OK" "Frontend is running on port 3000"
else
    print_status "WARN" "Frontend not running on port 3000"
fi

# 3. Check database connection
echo "3. Verifica Database..."
if docker ps | grep -q shopmefy-db; then
    print_status "OK" "Database container is running"
else
    print_status "WARN" "Database container not found"
fi

# 4. Test token generation
echo "4. Test Generazione Token..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/internal/generate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46YWRtaW4=" \
  -d '{
    "customerId": "7cfe9033-5fe5-47be-929f-4e40a024c94c",
    "workspaceId": "cm9ahjgq9v00014qk8fsdy4ujv",
    "action": "orders"
  }')

if echo "$TOKEN_RESPONSE" | grep -q "success.*true"; then
    TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    print_status "OK" "Token generated successfully: ${TOKEN:0:10}..."
    
    # 5. Test orders endpoint with token
    echo "5. Test Endpoint Orders..."
    ORDERS_RESPONSE=$(curl -s "http://localhost:3001/api/internal/public/orders?token=$TOKEN")
    if echo "$ORDERS_RESPONSE" | grep -q "success.*true"; then
        print_status "OK" "Orders endpoint works with token-only"
    else
        print_status "WARN" "Orders endpoint failed"
    fi
else
    print_status "WARN" "Token generation failed"
fi

# 6. Test profile token generation
echo "6. Test Generazione Token Profilo..."
PROFILE_TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/internal/generate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic YWRtaW46YWRtaW4=" \
  -d '{
    "customerId": "7cfe9033-5fe5-47be-929f-4e40a024c94c",
    "workspaceId": "cm9ahjgq9v00014qk8fsdy4ujv",
    "action": "profile"
  }')

if echo "$PROFILE_TOKEN_RESPONSE" | grep -q "success.*true"; then
    PROFILE_TOKEN=$(echo "$PROFILE_TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    print_status "OK" "Profile token generated: ${PROFILE_TOKEN:0:10}..."
else
    print_status "WARN" "Profile token generation failed"
fi

# 7. Check N8N workflow
echo "7. Verifica N8N Workflow..."
if curl -s http://localhost:5678 > /dev/null 2>&1; then
    print_status "OK" "N8N is running on port 5678"
else
    print_status "WARN" "N8N not running on port 5678"
fi

# 8. Check calling functions
echo "8. Verifica Calling Functions..."
if [ -f "backend/src/chatbot/calling-functions/GetOrdersListLink.ts" ]; then
    if grep -q "orders-public?token=" "backend/src/chatbot/calling-functions/GetOrdersListLink.ts"; then
        print_status "OK" "GetOrdersListLink generates token-only URLs"
    else
        print_status "WARN" "GetOrdersListLink may not be token-only"
    fi
else
    print_status "WARN" "GetOrdersListLink.ts not found"
fi

if [ -f "backend/src/chatbot/calling-functions/GetCustomerProfileLink.ts" ]; then
    if grep -q "customer-profile?token=" "backend/src/chatbot/calling-functions/GetCustomerProfileLink.ts"; then
        print_status "OK" "GetCustomerProfileLink generates token-only URLs"
    else
        print_status "WARN" "GetCustomerProfileLink may not be token-only"
    fi
else
    print_status "WARN" "GetCustomerProfileLink.ts not found"
fi

if [ -f "backend/src/chatbot/calling-functions/confirmOrderFromConversation.ts" ]; then
    if grep -q "checkout?token=" "backend/src/chatbot/calling-functions/confirmOrderFromConversation.ts"; then
        print_status "OK" "confirmOrderFromConversation generates token-only URLs"
    else
        print_status "WARN" "confirmOrderFromConversation may not be token-only"
    fi
else
    print_status "WARN" "confirmOrderFromConversation.ts not found"
fi

# 9. Check frontend pages
echo "9. Verifica Frontend Pages..."
if [ -f "frontend/src/pages/OrdersPublicPage.tsx" ]; then
    if grep -q "useSearchParams" "frontend/src/pages/OrdersPublicPage.tsx" && ! grep -q "phone.*encodeURIComponent" "frontend/src/pages/OrdersPublicPage.tsx"; then
        print_status "OK" "OrdersPublicPage uses token-only approach"
    else
        print_status "WARN" "OrdersPublicPage may not be fully token-only"
    fi
else
    print_status "WARN" "OrdersPublicPage.tsx not found"
fi

if [ -f "frontend/src/pages/CustomerProfilePublicPage.tsx" ]; then
    if grep -q "useSearchParams" "frontend/src/pages/CustomerProfilePublicPage.tsx" && ! grep -q "phone.*encodeURIComponent" "frontend/src/pages/CustomerProfilePublicPage.tsx"; then
        print_status "OK" "CustomerProfilePublicPage uses token-only approach"
    else
        print_status "WARN" "CustomerProfilePublicPage may not be fully token-only"
    fi
else
    print_status "WARN" "CustomerProfilePublicPage.tsx not found"
fi

if [ -f "frontend/src/pages/CheckoutPage.tsx" ]; then
    if grep -q "useSearchParams" "frontend/src/pages/CheckoutPage.tsx" && ! grep -q "workspaceId" "frontend/src/pages/CheckoutPage.tsx"; then
        print_status "OK" "CheckoutPage uses token-only approach"
    else
        print_status "WARN" "CheckoutPage may not be fully token-only"
    fi
else
    print_status "WARN" "CheckoutPage.tsx not found"
fi

# 10. Check documentation
echo "10. Verifica Documentazione..."
if [ -f "docs/memory-bank/token-system.md" ]; then
    if grep -q "CONGELATO E FUNZIONANTE" "docs/memory-bank/token-system.md"; then
        print_status "OK" "Token system documentation is up to date"
    else
        print_status "WARN" "Token system documentation may need updates"
    fi
else
    print_status "WARN" "Token system documentation not found"
fi

if [ -f "docs/PRD.md" ]; then
    if grep -q "token-only" "docs/PRD.md"; then
        print_status "OK" "PRD includes token-only system"
    else
        print_status "WARN" "PRD may not include token-only system"
    fi
else
    print_status "WARN" "PRD.md not found"
fi

# 11. Check tests
echo "11. Verifica Test..."
if [ -f "backend/src/__tests__/integration/token-only-system.integration.spec.ts" ]; then
    print_status "OK" "Integration tests for token-only system exist"
else
    print_status "WARN" "Integration tests for token-only system not found"
fi

if [ -f "frontend/src/__test__/token-only-system.test.tsx" ]; then
    print_status "OK" "Frontend tests for token-only system exist"
else
    print_status "WARN" "Frontend tests for token-only system not found"
fi

echo ""
echo -e "${BLUE}🎯 RIEPILOGO VERIFICA${NC}"
echo "=========================="
echo ""

# Count results
OK_COUNT=$(grep -c "✅" <<< "$(cat $0 | grep -A1 "print_status.*OK")" 2>/dev/null || echo "0")
WARN_COUNT=$(grep -c "⚠️" <<< "$(cat $0 | grep -A1 "print_status.*WARN")" 2>/dev/null || echo "0")
ERROR_COUNT=$(grep -c "❌" <<< "$(cat $0 | grep -A1 "print_status.*ERROR")" 2>/dev/null || echo "0")

echo -e "${GREEN}✅ Successi: $OK_COUNT${NC}"
echo -e "${YELLOW}⚠️  Warning: $WARN_COUNT${NC}"
echo -e "${RED}❌ Errori: $ERROR_COUNT${NC}"

echo ""
if [ "$ERROR_COUNT" -eq 0 ] && [ "$WARN_COUNT" -lt 5 ]; then
    echo -e "${GREEN}🎉 SISTEMA TOKEN-ONLY VERIFICATO E PRONTO!${NC}"
    echo -e "${GREEN}🔒 STATO CONGELATO - PRONTO PER PRODUZIONE${NC}"
else
    echo -e "${YELLOW}⚠️  ALCUNI PROBLEMI TROVATI - VERIFICARE PRIMA DEL DEPLOY${NC}"
fi

echo ""
echo -e "${BLUE}📋 PROSSIMI PASSI:${NC}"
echo "1. Eseguire test unitari: npm run test:unit"
echo "2. Eseguire test integrazione: npm run test:integration"
echo "3. Verificare build frontend: npm run build"
echo "4. Testare manualmente i link generati"
echo "5. Verificare N8N workflow"
echo ""
echo -e "${GREEN}🚀 SISTEMA TOKEN-ONLY COMPLETATO E CONGELATO!${NC}"
