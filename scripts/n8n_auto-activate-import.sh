#!/bin/bash

# 🚀 N8N AUTO-ACTIVATE IMPORT - Andrea's Perfect Solution
# Import + Auto-Activation in one script

set -e

echo "🚀 N8N AUTO-ACTIVATE IMPORT - Andrea's Perfect Solution"
echo "======================================================="

WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"
N8N_URL="http://localhost:5678"
COOKIES_FILE="/tmp/n8n_cookies_auto.txt"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📁 Workflow file found: $WORKFLOW_FILE"

# Function to make authenticated requests with better error handling
make_authenticated_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    
    echo "🔄 $description..."
    
    if [ -n "$data" ]; then
        RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -b "$COOKIES_FILE" \
            -d "$data" \
            "$N8N_URL$endpoint")
    else
        RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -b "$COOKIES_FILE" \
            "$N8N_URL$endpoint")
    fi
    
    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
        echo "✅ $description successful"
        echo "$BODY"
    else
        echo "⚠️ $description warning (Status: $HTTP_STATUS)"
        echo "$BODY"
        echo "$BODY"  # Return body anyway for parsing
    fi
}

# Step 1: Login to N8N
echo "🔐 Step 1: Login to N8N..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@shopme.com", "password": "Venezia44"}' \
    "$N8N_URL/rest/login")

if echo "$LOGIN_RESPONSE" | grep -q "error"; then
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"

# Step 2: Clean up existing workflows
echo "🗑️ Step 2: Clean up existing workflows..."
WORKFLOWS_RESPONSE=$(make_authenticated_request "GET" "/rest/workflows" "" "Get existing workflows")
WORKFLOW_IDS=$(echo "$WORKFLOWS_RESPONSE" | jq -r '.data[]?.id // empty' 2>/dev/null || echo "")

if [ -n "$WORKFLOW_IDS" ]; then
    for id in $WORKFLOW_IDS; do
        echo "🗑️ Deleting workflow: $id"
        make_authenticated_request "DELETE" "/rest/workflows/$id" "" "Delete workflow $id" > /dev/null
    done
fi

# Step 3: Import workflow directly (correct endpoint)
echo "📤 Step 3: Import workflow with auto-activation..."

# Read workflow and set it as active
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE" | jq '.active = true')

# Create the workflow (correct N8N API endpoint)
IMPORT_RESPONSE=$(make_authenticated_request "POST" "/rest/workflows" "$WORKFLOW_JSON" "Create workflow")
WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.id' 2>/dev/null || echo "")

if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
    echo "❌ Failed to extract workflow ID from: $IMPORT_RESPONSE"
    
    # Try to get workflow ID from list
    echo "🔍 Trying to find imported workflow..."
    WORKFLOWS_RESPONSE=$(make_authenticated_request "GET" "/rest/workflows" "" "Get workflows after import")
    WORKFLOW_ID=$(echo "$WORKFLOWS_RESPONSE" | jq -r '.data[0]?.id // empty' 2>/dev/null || echo "")
fi

if [ -z "$WORKFLOW_ID" ] || [ "$WORKFLOW_ID" = "null" ]; then
    echo "❌ Could not determine workflow ID"
    exit 1
fi

echo "✅ Workflow ID: $WORKFLOW_ID"

# Step 4: Force activation (multiple methods)
echo "🔄 Step 4: Force workflow activation..."

# Method 1: PATCH with active true
echo "🔄 Method 1: PATCH activation..."
PATCH_RESPONSE=$(make_authenticated_request "PATCH" "/rest/workflows/$WORKFLOW_ID" '{"active": true}' "PATCH activate")

# Method 2: PUT full workflow with active true
echo "🔄 Method 2: PUT activation..."
WORKFLOW_DATA=$(make_authenticated_request "GET" "/rest/workflows/$WORKFLOW_ID" "" "Get workflow data")
UPDATED_WORKFLOW=$(echo "$WORKFLOW_DATA" | jq '.active = true' 2>/dev/null || echo '{"active": true}')
PUT_RESPONSE=$(make_authenticated_request "PUT" "/rest/workflows/$WORKFLOW_ID" "$UPDATED_WORKFLOW" "PUT activate")

# Step 5: Verify activation
echo "🧪 Step 5: Verify activation..."
sleep 3

# Test webhook endpoint
WEBHOOK_TEST=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
    -H "Content-Type: application/json" \
    -d '{"test": "activation_check", "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv"}')

echo "🔍 Webhook test response: $WEBHOOK_TEST"

if echo "$WEBHOOK_TEST" | grep -q "not registered"; then
    echo "⚠️ Webhook not yet active, checking workflow status..."
    
    # Check workflow status
    STATUS_RESPONSE=$(make_authenticated_request "GET" "/rest/workflows/$WORKFLOW_ID" "" "Check workflow status")
    IS_ACTIVE=$(echo "$STATUS_RESPONSE" | jq -r '.active // false' 2>/dev/null || echo "false")
    
    echo "📊 Workflow active status: $IS_ACTIVE"
    
    if [ "$IS_ACTIVE" = "true" ]; then
        echo "✅ Workflow is marked as active in database"
        echo "⏳ Webhook may need a moment to register..."
    else
        echo "❌ Workflow is not active, manual activation required"
    fi
else
    echo "🎉 SUCCESS! Webhook is active and responding!"
fi

# Step 6: Final status report
echo "📊 Step 6: Final status report..."
FINAL_WORKFLOWS=$(make_authenticated_request "GET" "/rest/workflows" "" "Get final workflow list")
ACTIVE_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
TOTAL_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '.data | length' 2>/dev/null || echo "0")

echo "📈 Final status:"
echo "   Total workflows: $TOTAL_COUNT"
echo "   Active workflows: $ACTIVE_COUNT"
echo "   Workflow ID: $WORKFLOW_ID"

# Cleanup
rm -f "$COOKIES_FILE"

if [ "$ACTIVE_COUNT" -gt 0 ]; then
    echo "🎉 SUCCESS! N8N workflow imported and activated!"
    echo "🚀 Ready for chatbot testing with 'ciao mozzarella'!"
    echo "📋 Test URL: $N8N_URL/webhook/webhook-start"
else
    echo "⚠️ Import completed but activation may need manual verification"
    echo "📋 Check N8N interface: $N8N_URL"
fi

echo "=======================================================" 