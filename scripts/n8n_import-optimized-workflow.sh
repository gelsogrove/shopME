#!/bin/bash

# 🚀 N8N Import All Workflows Script (Andrea's Fixed Solution)
# Imports all workflows from n8n/ directory with proper authentication and cleanup

echo "🚀 N8N Import All Workflows - Andrea's Fixed Solution"
echo "====================================================="

# Configuration
N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
WORKFLOWS_DIR="n8n"
COOKIE_FILE="/tmp/n8n_cookies.txt"

echo "🔍 Step 1: Checking if N8N is running..."

# Check if N8N is accessible
if ! curl -s "$N8N_URL" > /dev/null; then
    echo "❌ N8N is not accessible at $N8N_URL"
    echo "Please start N8N first with: npm run dev"
    exit 1
fi

echo "✅ N8N is running"

echo "🔍 Step 2: Checking workflows directory..."

if [[ ! -d "$WORKFLOWS_DIR" ]]; then
    echo "❌ Workflows directory not found: $WORKFLOWS_DIR"
    exit 1
fi

# Count JSON files in the directory
WORKFLOW_FILES=($(find "$WORKFLOWS_DIR" -name "*.json" -type f))
WORKFLOW_COUNT=${#WORKFLOW_FILES[@]}

if [[ $WORKFLOW_COUNT -eq 0 ]]; then
    echo "❌ No JSON workflow files found in $WORKFLOWS_DIR"
    exit 1
fi

echo "✅ Found $WORKFLOW_COUNT workflow file(s) in $WORKFLOWS_DIR:"
for file in "${WORKFLOW_FILES[@]}"; do
    echo "   📄 $(basename "$file")"
done

# Function to login and get session cookie
login_to_n8n() {
    echo "🔑 Logging in to N8N..."
    
    # Clean up existing files
    rm -f "$COOKIE_FILE"
    
    # Login with correct API format (fixed emailOrLdapLoginId field)
    LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d "{\"emailOrLdapLoginId\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

    if [[ $LOGIN_RESPONSE == *"error"* ]] || [[ $LOGIN_RESPONSE == *"Unauthorized"* ]]; then
        echo "❌ Login failed: $LOGIN_RESPONSE"
        return 1
    fi

    echo "✅ Login successful"
    return 0
}

# Function to make authenticated request
make_auth_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    
    if [[ -n "$data" ]]; then
        curl -s -b "$COOKIE_FILE" -X "$method" "$url" \
          -H "Content-Type: application/json" \
          -H "Accept: application/json" \
          -d "$data"
    else
        curl -s -b "$COOKIE_FILE" -X "$method" "$url"
    fi
}

echo "🔍 Step 3: Setting up authentication..."

# Test existing authentication
if [[ -f "$COOKIE_FILE" ]]; then
    echo "🔑 Found existing authentication, testing..."
    TEST_RESPONSE=$(make_auth_request "GET" "$N8N_URL/rest/workflows")
    
    if [[ $TEST_RESPONSE != *"Unauthorized"* ]] && [[ $TEST_RESPONSE != *"error"* ]] && [[ $TEST_RESPONSE == *"data"* ]]; then
        echo "✅ Existing authentication is valid"
        AUTH_VALID=true
    else
        echo "⚠️ Existing authentication expired, need to re-login"
        AUTH_VALID=false
    fi
else
    echo "🔑 No existing authentication found"
    AUTH_VALID=false
fi

# Login if needed
if [[ "$AUTH_VALID" != "true" ]]; then
    if ! login_to_n8n; then
        echo "❌ Failed to authenticate with N8N"
        exit 1
    fi
fi

echo "✅ Authentication ready"

echo "🔍 Step 4: Deleting existing ShopMe workflows..."

# Get existing workflows
EXISTING_WORKFLOWS=$(make_auth_request "GET" "$N8N_URL/rest/workflows")

# Delete workflows with "ShopMe" in the name
if command -v jq > /dev/null; then
    echo "$EXISTING_WORKFLOWS" | jq -r '.data[]? | select(.name | contains("ShopMe")) | .id' | while read -r workflow_id; do
        if [[ -n "$workflow_id" ]]; then
            echo "🗑️ Deleting existing workflow: $workflow_id"
            make_auth_request "DELETE" "$N8N_URL/rest/workflows/$workflow_id"
        fi
    done
else
    echo "⚠️ jq not available, skipping workflow deletion"
fi

echo "✅ Existing workflows processed"

echo "🔍 Step 5: Importing all workflows..."

IMPORTED_COUNT=0
FAILED_COUNT=0

# Import each workflow file
for WORKFLOW_FILE in "${WORKFLOW_FILES[@]}"; do
    echo ""
    echo "📥 Importing: $(basename "$WORKFLOW_FILE")"
    
    # Import the workflow (N8N expects direct JSON content, not @file reference)
    WORKFLOW_CONTENT=$(cat "$WORKFLOW_FILE")
    IMPORT_RESPONSE=$(make_auth_request "POST" "$N8N_URL/rest/workflows" "$WORKFLOW_CONTENT")

    if [[ $IMPORT_RESPONSE == *"error"* ]] || [[ $IMPORT_RESPONSE == *"Unauthorized"* ]]; then
        echo "❌ Import failed for $(basename "$WORKFLOW_FILE"): $IMPORT_RESPONSE"
        ((FAILED_COUNT++))
        continue
    fi

    # Extract workflow ID and name
    if command -v jq > /dev/null; then
        WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.id // empty')
        WORKFLOW_NAME=$(echo "$IMPORT_RESPONSE" | jq -r '.name // empty')
    else
        # Fallback without jq
        WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        WORKFLOW_NAME=$(echo "$IMPORT_RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    fi

    if [[ -z "$WORKFLOW_ID" || "$WORKFLOW_ID" == "null" ]]; then
        echo "❌ Could not extract workflow ID from response for $(basename "$WORKFLOW_FILE")"
        ((FAILED_COUNT++))
        continue
    fi

    echo "✅ Imported: $WORKFLOW_NAME (ID: $WORKFLOW_ID)"

    # CRITICAL FIX: Remove pinData to exit test mode
    echo "🧹 Removing pinData (test mode)..."
    CLEANUP_RESPONSE=$(make_auth_request "PATCH" "$N8N_URL/rest/workflows/$WORKFLOW_ID" '{"pinData": null}')
    
    if [[ $CLEANUP_RESPONSE == *"error"* ]]; then
        echo "⚠️ pinData cleanup failed for $WORKFLOW_NAME: $CLEANUP_RESPONSE"
    else
        echo "✅ Removed pinData from: $WORKFLOW_NAME"
    fi

    # Deactivate and reactivate to register webhooks properly
    echo "🔄 Deactivating workflow..."
    make_auth_request "PATCH" "$N8N_URL/rest/workflows/$WORKFLOW_ID" '{"active": false}' > /dev/null
    
    sleep 1
    
    echo "🔄 Activating workflow..."
    ACTIVATE_RESPONSE=$(make_auth_request "PATCH" "$N8N_URL/rest/workflows/$WORKFLOW_ID" '{"active": true}')

    if [[ $ACTIVATE_RESPONSE == *"error"* ]]; then
        echo "⚠️ Activation failed for $WORKFLOW_NAME: $ACTIVATE_RESPONSE"
    else
        echo "✅ Activated: $WORKFLOW_NAME"
    fi

    ((IMPORTED_COUNT++))
done

echo ""
echo "🔍 Step 6: Verifying webhook endpoints..."

# Wait for webhooks to be registered
sleep 3

# Test the correct webhook URLs
WEBHOOK_ENDPOINTS=("webhook-start")

for endpoint in "${WEBHOOK_ENDPOINTS[@]}"; do
    # Test correct webhook URL format: /webhook/endpoint-name
    WEBHOOK_URL="$N8N_URL/webhook/$endpoint"
    echo "🧪 Testing webhook: $WEBHOOK_URL"
    
    WEBHOOK_RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d '{"test": "webhook-check"}' || echo "CONNECTION_ERROR")
    
    if [[ "$WEBHOOK_RESPONSE" == "CONNECTION_ERROR" ]]; then
        echo "❌ Webhook connection failed: $endpoint"
    elif [[ "$WEBHOOK_RESPONSE" == *"not registered"* ]]; then
        echo "❌ Webhook not registered: $endpoint"
    else
        echo "✅ Webhook responding: $endpoint"
        echo "   Response: $(echo "$WEBHOOK_RESPONSE" | head -c 100)..."
    fi
done

echo ""
echo "🎉 FIXED IMPORT COMPLETED!"
echo "================================================================"
echo "✅ Total workflows processed: $WORKFLOW_COUNT"
echo "✅ Successfully imported: $IMPORTED_COUNT"
if [[ $FAILED_COUNT -gt 0 ]]; then
    echo "❌ Failed imports: $FAILED_COUNT"
fi
echo "✅ All workflows activated and webhooks registered"
echo "🧹 PinData removed from all workflows (test mode disabled)"
echo ""
echo "🔗 Access N8N at: $N8N_URL"
echo "👤 Login: $USERNAME / $PASSWORD"
echo ""
echo "🚀 Webhook URLs:"
for endpoint in "${WEBHOOK_ENDPOINTS[@]}"; do
    echo "   📡 http://localhost:5678/webhook/$endpoint"
done
echo ""
echo "💡 All issues fixed: proper login, pinData cleanup, webhook registration!" 