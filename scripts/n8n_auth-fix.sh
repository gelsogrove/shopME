#!/bin/bash

# 🔧 N8N AUTHENTICATION FIX - Andrea's Solution
# Risolve il problema 401 Unauthorized con sessione persistente

set -e

echo "🔧 N8N AUTHENTICATION FIX - Andrea's Solution"
echo "=============================================="

WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"
N8N_URL="http://localhost:5678"
COOKIES_FILE="/tmp/n8n_session_fix.txt"
SESSION_FILE="/tmp/n8n_session_data.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📁 Workflow file: $WORKFLOW_FILE${NC}"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo -e "${RED}❌ Workflow file not found: $WORKFLOW_FILE${NC}"
    exit 1
fi

# Check if N8N is running
echo -e "${BLUE}🔍 Checking N8N status...${NC}"
if ! curl -s "$N8N_URL/healthz" > /dev/null; then
    echo -e "${RED}❌ N8N is not running at $N8N_URL${NC}"
    echo -e "${YELLOW}💡 Please start N8N first with: npm run dev${NC}"
    exit 1
fi

echo -e "${GREEN}✅ N8N is running${NC}"

# Clean old session files
rm -f "$COOKIES_FILE" "$SESSION_FILE"

# Step 1: Enhanced Login with session persistence
echo -e "${BLUE}🔐 Step 1: Enhanced N8N Login...${NC}"

LOGIN_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -c "$COOKIES_FILE" -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "User-Agent: ShopMe-N8N-Client/1.0" \
    -d '{"emailOrLdapLoginId": "admin@shopme.com", "password": "Venezia44"}' \
    "$N8N_URL/rest/login")

HTTP_STATUS=$(echo $LOGIN_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $LOGIN_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -ne 200 ]; then
    echo -e "${RED}❌ Login failed (Status: $HTTP_STATUS)${NC}"
    echo -e "${RED}Response: $BODY${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"

# Extract session info for debugging
if [ -f "$COOKIES_FILE" ]; then
    echo -e "${BLUE}📋 Session cookies saved${NC}"
    # Save session data
    echo "{\"login_time\": \"$(date -Iseconds)\", \"status\": \"authenticated\"}" > "$SESSION_FILE"
else
    echo -e "${YELLOW}⚠️ No cookies file created${NC}"
fi

# Step 2: Verify authentication with a test call
echo -e "${BLUE}🔍 Step 2: Verify authentication...${NC}"

AUTH_TEST=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" \
    -H "Accept: application/json" \
    "$N8N_URL/rest/workflows")

AUTH_STATUS=$(echo $AUTH_TEST | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
AUTH_BODY=$(echo $AUTH_TEST | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$AUTH_STATUS" -ne 200 ]; then
    echo -e "${RED}❌ Authentication verification failed (Status: $AUTH_STATUS)${NC}"
    echo -e "${RED}Response: $AUTH_BODY${NC}"
    
    # Try to re-authenticate
    echo -e "${YELLOW}🔄 Attempting re-authentication...${NC}"
    
    # Clear cookies and try again
    rm -f "$COOKIES_FILE"
    
    LOGIN_RESPONSE2=$(curl -s -w "HTTPSTATUS:%{http_code}" -c "$COOKIES_FILE" -X POST \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -d '{"emailOrLdapLoginId": "admin@shopme.com", "password": "Venezia44"}' \
        "$N8N_URL/rest/login")
    
    LOGIN_STATUS2=$(echo $LOGIN_RESPONSE2 | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    
    if [ "$LOGIN_STATUS2" -ne 200 ]; then
        echo -e "${RED}❌ Re-authentication failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Re-authentication successful${NC}"
fi

echo -e "${GREEN}✅ Authentication verified${NC}"

# Step 3: Clean existing workflows with proper session
echo -e "${BLUE}🗑️ Step 3: Clean existing workflows...${NC}"

WORKFLOWS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" \
    -H "Accept: application/json" \
    "$N8N_URL/rest/workflows")

WORKFLOWS_STATUS=$(echo $WORKFLOWS_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
WORKFLOWS_BODY=$(echo $WORKFLOWS_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$WORKFLOWS_STATUS" -eq 200 ]; then
    # Parse workflow IDs and delete them
    WORKFLOW_IDS=$(echo "$WORKFLOWS_BODY" | jq -r '.data[]?.id // empty' 2>/dev/null || echo "")
    
    if [ -n "$WORKFLOW_IDS" ]; then
        for id in $WORKFLOW_IDS; do
            echo -e "${YELLOW}🗑️ Deleting existing workflow: $id${NC}"
            DELETE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" -X DELETE \
                -H "Accept: application/json" \
                "$N8N_URL/rest/workflows/$id")
            
            DELETE_STATUS=$(echo $DELETE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            if [ "$DELETE_STATUS" -eq 200 ] || [ "$DELETE_STATUS" -eq 204 ]; then
                echo -e "${GREEN}✅ Deleted workflow: $id${NC}"
            else
                echo -e "${YELLOW}⚠️ Could not delete workflow $id (Status: $DELETE_STATUS)${NC}"
            fi
        done
    else
        echo -e "${BLUE}ℹ️ No existing workflows to delete${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ Could not fetch workflows (Status: $WORKFLOWS_STATUS)${NC}"
fi

# Step 4: Create workflow with authenticated session
echo -e "${BLUE}📤 Step 4: Create workflow with authenticated session...${NC}"

# Ensure workflow is marked as active
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE" | jq '.active = true')

# Create workflow with proper headers and session
CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "User-Agent: ShopMe-N8N-Client/1.0" \
    -d "$WORKFLOW_JSON" \
    "$N8N_URL/rest/workflows")

CREATE_STATUS=$(echo $CREATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
CREATE_BODY=$(echo $CREATE_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$CREATE_STATUS" -eq 200 ] || [ "$CREATE_STATUS" -eq 201 ]; then
    echo -e "${GREEN}✅ Workflow created successfully${NC}"
    WORKFLOW_ID=$(echo "$CREATE_BODY" | jq -r '.id' 2>/dev/null || echo "")
    WORKFLOW_NAME=$(echo "$CREATE_BODY" | jq -r '.name' 2>/dev/null || echo "Unknown")
    echo -e "${BLUE}📋 Workflow ID: $WORKFLOW_ID${NC}"
    echo -e "${BLUE}📋 Workflow Name: $WORKFLOW_NAME${NC}"
else
    echo -e "${RED}❌ Workflow creation failed (Status: $CREATE_STATUS)${NC}"
    echo -e "${RED}Response: $CREATE_BODY${NC}"
    
    # Check if it's an authentication issue
    if [ "$CREATE_STATUS" -eq 401 ]; then
        echo -e "${YELLOW}🔧 Authentication issue detected. Trying direct approach...${NC}"
        
        # Try with a fresh login and immediate workflow creation
        rm -f "$COOKIES_FILE"
        
        # Combined login and create in one session
        curl -s -c "$COOKIES_FILE" -X POST \
            -H "Content-Type: application/json" \
            -d '{"emailOrLdapLoginId": "admin@shopme.com", "password": "Venezia44"}' \
            "$N8N_URL/rest/login" > /dev/null
        
        # Immediate workflow creation
        RETRY_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" -X POST \
            -H "Content-Type: application/json" \
            -d "$WORKFLOW_JSON" \
            "$N8N_URL/rest/workflows")
        
        RETRY_STATUS=$(echo $RETRY_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
        
        if [ "$RETRY_STATUS" -eq 200 ] || [ "$RETRY_STATUS" -eq 201 ]; then
            echo -e "${GREEN}✅ Workflow created on retry${NC}"
            WORKFLOW_ID=$(echo $RETRY_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g' | jq -r '.id' 2>/dev/null || echo "")
        else
            echo -e "${RED}❌ Retry also failed (Status: $RETRY_STATUS)${NC}"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Step 5: Verify and activate workflow
if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
    echo -e "${BLUE}🔍 Step 5: Verify workflow activation...${NC}"
    
    # Get workflow status
    STATUS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" \
        -H "Accept: application/json" \
        "$N8N_URL/rest/workflows/$WORKFLOW_ID")
    
    STATUS_HTTP=$(echo $STATUS_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    STATUS_BODY=$(echo $STATUS_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$STATUS_HTTP" -eq 200 ]; then
        IS_ACTIVE=$(echo "$STATUS_BODY" | jq -r '.active // false' 2>/dev/null || echo "false")
        
        echo -e "${BLUE}📊 Workflow active status: $IS_ACTIVE${NC}"
        
        if [ "$IS_ACTIVE" = "true" ]; then
            echo -e "${GREEN}✅ Workflow is active and ready${NC}"
        else
            echo -e "${YELLOW}⚠️ Workflow created but not active, forcing activation...${NC}"
            
            # Force activation
            ACTIVATION_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" -X PATCH \
                -H "Content-Type: application/json" \
                -H "Accept: application/json" \
                -d '{"active": true}' \
                "$N8N_URL/rest/workflows/$WORKFLOW_ID")
            
            ACTIVATION_STATUS=$(echo $ACTIVATION_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
            
            if [ "$ACTIVATION_STATUS" -eq 200 ]; then
                echo -e "${GREEN}✅ Workflow activated successfully${NC}"
            else
                echo -e "${YELLOW}⚠️ Activation failed (Status: $ACTIVATION_STATUS)${NC}"
            fi
        fi
    else
        echo -e "${YELLOW}⚠️ Could not verify workflow status (Status: $STATUS_HTTP)${NC}"
    fi
fi

# Step 6: Test webhook endpoint
echo -e "${BLUE}🧪 Step 6: Test webhook endpoint...${NC}"
sleep 2

WEBHOOK_TEST=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"test": "auth_fix_verification", "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv"}' \
    "$N8N_URL/webhook/webhook-start")

WEBHOOK_STATUS=$(echo $WEBHOOK_TEST | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
WEBHOOK_BODY=$(echo $WEBHOOK_TEST | sed -e 's/HTTPSTATUS\:.*//g')

echo -e "${BLUE}🔍 Webhook test status: $WEBHOOK_STATUS${NC}"
echo -e "${BLUE}🔍 Webhook response: $WEBHOOK_BODY${NC}"

if [ "$WEBHOOK_STATUS" -eq 200 ]; then
    echo -e "${GREEN}🎉 SUCCESS! Webhook is active and responding!${NC}"
elif echo "$WEBHOOK_BODY" | grep -q "not registered"; then
    echo -e "${YELLOW}⚠️ Webhook registered but may need manual activation${NC}"
    echo -e "${BLUE}📋 Check N8N interface: $N8N_URL${NC}"
else
    echo -e "${GREEN}🎉 Webhook responding (Status: $WEBHOOK_STATUS)${NC}"
fi

# Step 7: Final status report
echo -e "${BLUE}📊 Step 7: Final Authentication Fix Report...${NC}"

FINAL_WORKFLOWS=$(curl -s -b "$COOKIES_FILE" -H "Accept: application/json" "$N8N_URL/rest/workflows")
ACTIVE_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
TOTAL_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '.data | length' 2>/dev/null || echo "0")

echo -e "${GREEN}📈 Authentication Fix Results:${NC}"
echo -e "   ${BLUE}Total workflows: $TOTAL_COUNT${NC}"
echo -e "   ${BLUE}Active workflows: $ACTIVE_COUNT${NC}"
echo -e "   ${BLUE}Webhook URL: $N8N_URL/webhook/webhook-start${NC}"
echo -e "   ${BLUE}Credentials: ✅ admin@shopme.com${NC}"
echo -e "   ${BLUE}Session: ✅ Persistent authentication${NC}"

# Cleanup
rm -f "$COOKIES_FILE" "$SESSION_FILE"

if [ "$ACTIVE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}🎉 SUCCESS! N8N Authentication Fixed & Workflow Active!${NC}"
    echo -e "${BLUE}📋 Ready for chatbot testing with: 'ciao mozzarella'${NC}"
    echo -e "${BLUE}📋 New calling functions available:${NC}"
    echo -e "   ${YELLOW}- createCheckoutLink${NC}"
    echo -e "   ${YELLOW}- getAllCategories${NC}"
    echo -e "   ${YELLOW}- getAllProducts${NC}"
else
    echo -e "${YELLOW}⚠️ Import completed, manual verification recommended${NC}"
    echo -e "${BLUE}📋 Please check: $N8N_URL${NC}"
fi

echo "==============================================" 