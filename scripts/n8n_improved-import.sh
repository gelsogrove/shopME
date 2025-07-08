#!/bin/bash

# 🚀 N8N IMPROVED IMPORT SCRIPT - Andrea's Solution
# Risolve i problemi di: credenziali perse, workflow disattivato, duplicati

set -e

echo "🚀 N8N IMPROVED IMPORT - Andrea's Final Solution"
echo "================================================"

WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"
N8N_URL="http://localhost:5678"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📁 Workflow file found: $WORKFLOW_FILE"

# Function to make authenticated requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -b /tmp/n8n_cookies.txt \
            -d "$data" \
            "$N8N_URL$endpoint"
    else
        curl -s -X "$method" \
            -H "Content-Type: application/json" \
            -b /tmp/n8n_cookies.txt \
            "$N8N_URL$endpoint"
    fi
}

# Step 1: Login to N8N
echo "🔐 Step 1: Login to N8N..."
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@shopme.com", "password": "Venezia44"}' \
    "$N8N_URL/rest/login")

if echo "$LOGIN_RESPONSE" | grep -q "error"; then
    echo "❌ Login failed: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful!"

# Step 2: Delete ALL existing workflows (clean slate)
echo "🗑️ Step 2: Delete ALL existing workflows..."
WORKFLOWS=$(make_request "GET" "/rest/workflows")
WORKFLOW_IDS=$(echo "$WORKFLOWS" | jq -r '.data[]?.id // empty')

if [ -n "$WORKFLOW_IDS" ]; then
    for id in $WORKFLOW_IDS; do
        echo "🗑️ Deleting workflow: $id"
        make_request "DELETE" "/rest/workflows/$id"
    done
    echo "✅ All workflows deleted"
else
    echo "ℹ️ No existing workflows to delete"
fi

# Step 3: Delete ALL existing credentials (clean slate)
echo "🗑️ Step 3: Delete ALL existing credentials..."
CREDENTIALS=$(make_request "GET" "/rest/credentials")
CREDENTIAL_IDS=$(echo "$CREDENTIALS" | jq -r '.data[]?.id // empty')

if [ -n "$CREDENTIAL_IDS" ]; then
    for id in $CREDENTIAL_IDS; do
        echo "🗑️ Deleting credential: $id"
        make_request "DELETE" "/rest/credentials/$id"
    done
    echo "✅ All credentials deleted"
else
    echo "ℹ️ No existing credentials to delete"
fi

# Step 4: Create fresh credentials
echo "🔐 Step 4: Create fresh credentials..."

# Create Backend API Basic Auth
BACKEND_CRED=$(make_request "POST" "/rest/credentials" '{
    "name": "Backend API Basic Auth",
    "type": "httpBasicAuth",
    "data": {
        "user": "admin",
        "password": "admin"
    }
}')
echo "🔍 Backend credential response: $BACKEND_CRED"
BACKEND_CRED_ID=$(echo "$BACKEND_CRED" | jq -r '.id')
echo "✅ Backend API credential created: $BACKEND_CRED_ID"

# Create OpenRouter API credential
OPENROUTER_API_KEY=$(grep OPENROUTER_API_KEY /Users/gelso/workspace/AI/shop/backend/.env | cut -d= -f2 | tr -d '"')
OPENROUTER_CRED=$(make_request "POST" "/rest/credentials" "{
    \"name\": \"OpenRouter account\",
    \"type\": \"openRouterApi\",
    \"data\": {
        \"apiKey\": \"$OPENROUTER_API_KEY\"
    }
}")
OPENROUTER_CRED_ID=$(echo "$OPENROUTER_CRED" | jq -r '.id')
echo "✅ OpenRouter API credential created: $OPENROUTER_CRED_ID"

# Step 5: Read and modify workflow JSON
echo "📝 Step 5: Prepare workflow with fresh credentials..."
WORKFLOW_JSON=$(cat "$WORKFLOW_FILE")

# Assign credentials to nodes
WORKFLOW_JSON=$(echo "$WORKFLOW_JSON" | jq \
    --arg backend_id "$BACKEND_CRED_ID" \
    --arg openrouter_id "$OPENROUTER_CRED_ID" \
    '
    .nodes |= map(
        if .name == "RagSearch()" then
            .credentials = {"httpBasicAuth": {"id": $backend_id, "name": "Backend API Basic Auth"}}
        elif .name == "GetAllProducts()" then
            .credentials = {"httpBasicAuth": {"id": $backend_id, "name": "Backend API Basic Auth"}}
        elif .name == "OpenRouter Chat Model" then
            .credentials = {"openRouterApi": {"id": $openrouter_id, "name": "OpenRouter account"}}
        else
            .
        end
    ) |
    .active = true
    ')

# Step 6: Import workflow
echo "📤 Step 6: Import workflow..."
IMPORT_RESPONSE=$(make_request "POST" "/rest/workflows/import" "$WORKFLOW_JSON")
WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.id')

if [ "$WORKFLOW_ID" = "null" ] || [ -z "$WORKFLOW_ID" ]; then
    echo "❌ Workflow import failed: $IMPORT_RESPONSE"
    exit 1
fi

echo "✅ Workflow imported successfully: $WORKFLOW_ID"

# Step 7: Activate workflow (ANDREA'S AUTO-ACTIVATION)
echo "🔄 Step 7: Activate workflow..."
ACTIVATION_RESPONSE=$(make_request "PATCH" "/rest/workflows/$WORKFLOW_ID" '{"active": true}')

if echo "$ACTIVATION_RESPONSE" | grep -q "error"; then
    echo "⚠️ Activation warning: $ACTIVATION_RESPONSE"
    # Try alternative activation method
    echo "🔄 Trying alternative activation method..."
    ALT_ACTIVATION=$(make_request "POST" "/rest/workflows/$WORKFLOW_ID/activate" '{}')
    if echo "$ALT_ACTIVATION" | grep -q "error"; then
        echo "⚠️ Alternative activation also failed: $ALT_ACTIVATION"
    else
        echo "✅ Workflow activated via alternative method!"
    fi
else
    echo "✅ Workflow activated successfully!"
fi

# Step 7.5: Verify activation with webhook test
echo "🧪 Step 7.5: Test webhook activation..."
sleep 2
WEBHOOK_TEST=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
    -H "Content-Type: application/json" \
    -d '{"test": "activation_check"}')

if echo "$WEBHOOK_TEST" | grep -q "not registered"; then
    echo "⚠️ Webhook still not active, forcing activation..."
    # Force activation via direct API
    FORCE_ACTIVATION=$(make_request "PUT" "/rest/workflows/$WORKFLOW_ID" "{\"id\": \"$WORKFLOW_ID\", \"active\": true}")
    echo "🔧 Force activation result: $FORCE_ACTIVATION"
else
    echo "✅ Webhook is active and responding!"
fi

# Step 8: Final verification
echo "📊 Step 8: Final verification..."
FINAL_WORKFLOWS=$(make_request "GET" "/rest/workflows")
ACTIVE_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '[.data[] | select(.active == true)] | length')
TOTAL_COUNT=$(echo "$FINAL_WORKFLOWS" | jq '.data | length')

echo "📈 Final status:"
echo "   Total workflows: $TOTAL_COUNT"
echo "   Active workflows: $ACTIVE_COUNT"
echo "   Backend credentials: $BACKEND_CRED_ID"
echo "   OpenRouter credentials: $OPENROUTER_CRED_ID"

if [ "$TOTAL_COUNT" = "1" ] && [ "$ACTIVE_COUNT" = "1" ]; then
    echo "🎉 SUCCESS! Perfect N8N state achieved!"
    echo "✅ Single active workflow with fresh credentials"
    
    # Final webhook test (Andrea's verification)
    echo "🧪 Final webhook test..."
    FINAL_TEST=$(curl -s -X POST "$N8N_URL/webhook/webhook-start" \
        -H "Content-Type: application/json" \
        -d '{"workspaceId": "cm9hjgq9v00014qk8fsdy4ujv", "phoneNumber": "+39123456789", "messageContent": "test import", "sessionToken": "test"}')
    
    if echo "$FINAL_TEST" | grep -q "not registered"; then
        echo "❌ FINAL TEST FAILED: Webhook still not responding"
        echo "📋 Manual activation required via N8N interface"
    else
        echo "🎉 FINAL TEST PASSED: Webhook is fully active!"
        echo "🚀 Ready for chatbot testing!"
    fi
else
    echo "⚠️ Warning: Expected 1 total and 1 active workflow"
fi

# Cleanup
rm -f /tmp/n8n_cookies.txt

echo "🚀 N8N Improved Import completed!"
echo "================================================" 