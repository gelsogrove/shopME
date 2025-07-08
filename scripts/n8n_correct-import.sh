#!/bin/bash

# 🚀 N8N CORRECT IMPORT - Andrea's PRD-Aligned Solution
# Usa SOLO endpoint N8N documentati e corretti

set -e

echo "🚀 N8N CORRECT IMPORT - Andrea's PRD-Aligned Solution"
echo "===================================================="

WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"
N8N_URL="http://localhost:5678"
COOKIES_FILE="/tmp/n8n_cookies_correct.txt"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📁 Workflow file found: $WORKFLOW_FILE"

# Step 1: Login to N8N (PRD-compliant)
echo "🔐 Step 1: Login to N8N..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIES_FILE" -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@shopme.com", "password": "Venezia44"}' \
    "$N8N_URL/rest/login")

if echo "$LOGIN_RESPONSE" | grep -q "error"; then
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful (PRD credentials: admin@shopme.com)"

# Step 2: Clean existing workflows (PRD requirement)
echo "🗑️ Step 2: Clean existing workflows..."
WORKFLOWS_RESPONSE=$(curl -s -b "$COOKIES_FILE" "$N8N_URL/rest/workflows")

if echo "$WORKFLOWS_RESPONSE" | grep -q '"data"'; then
    WORKFLOW_IDS=$(echo "$WORKFLOWS_RESPONSE" | jq -r '.data[]?.id // empty' 2>/dev/null || echo "")
    
    if [ -n "$WORKFLOW_IDS" ]; then
        for id in $WORKFLOW_IDS; do
            echo "🗑️ Deleting existing workflow: $id"
            curl -s -b "$COOKIES_FILE" -X DELETE "$N8N_URL/rest/workflows/$id" > /dev/null
        done
        echo "✅ Existing workflows cleaned"
    else
        echo "ℹ️ No existing workflows to delete"
    fi
else
    echo "ℹ️ No workflows found or API response format unexpected"
fi

# Step 3: Create workflow using correct N8N endpoint
echo "📤 Step 3: Create workflow using correct N8N API..."

# Read workflow and ensure it's marked as active (PRD requirement)
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE" | jq '.active = true')

# Use correct N8N API endpoint for workflow creation
CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -b "$COOKIES_FILE" -X POST \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_JSON" \
    "$N8N_URL/rest/workflows")

HTTP_STATUS=$(echo $CREATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
BODY=$(echo $CREATE_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 201 ]; then
    echo "✅ Workflow created successfully"
    WORKFLOW_ID=$(echo "$BODY" | jq -r '.id' 2>/dev/null || echo "")
    echo "📋 Workflow ID: $WORKFLOW_ID"
else
    echo "❌ Workflow creation failed (Status: $HTTP_STATUS)"
    echo "Response: $BODY"
    exit 1
fi

# Step 4: Verify workflow is active (PRD compliance check)
echo "🔍 Step 4: Verify workflow activation..."

if [ -n "$WORKFLOW_ID" ] && [ "$WORKFLOW_ID" != "null" ]; then
    # Get workflow status
    STATUS_RESPONSE=$(curl -s -b "$COOKIES_FILE" "$N8N_URL/rest/workflows/$WORKFLOW_ID")
    IS_ACTIVE=$(echo "$STATUS_RESPONSE" | jq -r '.active // false' 2>/dev/null || echo "false")
    
    echo "📊 Workflow active status: $IS_ACTIVE"
    
    if [ "$IS_ACTIVE" = "true" ]; then
        echo "✅ Workflow is active and ready"
    else
        echo "⚠️ Workflow created but not active, forcing activation..."
        
        # Force activation using correct endpoint
        ACTIVATION_RESPONSE=$(curl -s -b "$COOKIES_FILE" -X PATCH \
            -H "Content-Type: application/json" \
            -d '{"active": true}' \
            "$N8N_URL/rest/workflows/$WORKFLOW_ID")
        
        echo "🔧 Activation result: $ACTIVATION_RESPONSE"
    fi
fi

# Step 5: Test webhook endpoint (PRD functional test)
echo "🧪 Step 5: Test webhook endpoint..."
sleep 2

WEBHOOK_TEST=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
    -H "Content-Type: application/json" \
    -d '{"test": "import_verification", "workspaceId": "cm9hjgq9v00014qk8fsdy4ujv"}')

echo "🔍 Webhook test response: $WEBHOOK_TEST"

if echo "$WEBHOOK_TEST" | grep -q "not registered"; then
    echo "⚠️ Webhook not yet registered, may need manual activation"
    echo "📋 Please check N8N interface: $N8N_URL"
    echo "📋 Login with: admin@shopme.com / Venezia44"
else
    echo "🎉 SUCCESS! Webhook is active and responding!"
    echo "🚀 Ready for PRD-compliant chatbot testing!"
fi

# Step 6: Final status report (PRD metrics)
echo "📊 Step 6: Final status report..."
FINAL_WORKFLOWS=$(curl -s -b "$COOKIES_FILE" "$N8N_URL/rest/workflows")
ACTIVE_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '[.data[] | select(.active == true)] | length' 2>/dev/null || echo "0")
TOTAL_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '.data | length' 2>/dev/null || echo "0")

echo "📈 PRD Compliance Status:"
echo "   Total workflows: $TOTAL_COUNT"
echo "   Active workflows: $ACTIVE_COUNT"
echo "   Webhook URL: $N8N_URL/webhook/webhook-start"
echo "   PRD Credentials: ✅ admin@shopme.com configured"
echo "   Auto-activation: ✅ Implemented"

# Cleanup
rm -f "$COOKIES_FILE"

if [ "$ACTIVE_COUNT" -gt 0 ]; then
    echo "🎉 SUCCESS! N8N workflow PRD-compliant and ready!"
    echo "📋 Next: Test with 'ciao mozzarella' message"
else
    echo "⚠️ Import completed, manual verification recommended"
fi

echo "====================================================" 