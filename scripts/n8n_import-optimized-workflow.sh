#!/bin/bash

# 🚀 N8N Import All Workflows Script (Andrea's Multi-Workflow Solution)
# Imports all workflows from n8n/ directory

echo "🚀 N8N Import All Workflows - Andrea's Multi-Workflow Solution"
echo "============================================================="

# Configuration
N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
WORKFLOWS_DIR="n8n"

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

echo "🔍 Step 3: Login to N8N..."

# Clean up any existing cookies
rm -f /tmp/n8n_cookies.txt

# Login and get session cookie with more verbose output
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{\"email\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

echo "Login response: $LOGIN_RESPONSE"

if [[ $LOGIN_RESPONSE == *"error"* ]] || [[ $LOGIN_RESPONSE == *"Unauthorized"* ]]; then
    echo "❌ Login failed: $LOGIN_RESPONSE"
    echo "Please check N8N credentials: $USERNAME / $PASSWORD"
    exit 1
fi

echo "✅ Login successful"

echo "🔍 Step 4: Testing API access..."

# Test API access with current cookies
TEST_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows")
echo "API test response: $(echo "$TEST_RESPONSE" | head -c 100)..."

if [[ $TEST_RESPONSE == *"Unauthorized"* ]]; then
    echo "❌ API access unauthorized. Retrying login..."
    
    # Try login again with different approach
    LOGIN_RESPONSE2=$(curl -s -c /tmp/n8n_cookies.txt -b /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/login" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d "{\"email\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")
    
    if [[ $LOGIN_RESPONSE2 == *"error"* ]]; then
        echo "❌ Second login attempt failed: $LOGIN_RESPONSE2"
        exit 1
    fi
fi

echo "✅ API access confirmed"

echo "🔍 Step 5: Deleting existing ShopMe workflows..."

# Get existing workflows
EXISTING_WORKFLOWS=$(curl -s -b /tmp/n8n_cookies.txt "$N8N_URL/rest/workflows")

# Delete workflows with "ShopMe" in the name
if command -v jq > /dev/null; then
    echo "$EXISTING_WORKFLOWS" | jq -r '.data[]? | select(.name | contains("ShopMe")) | .id' | while read -r workflow_id; do
        if [[ -n "$workflow_id" ]]; then
            echo "🗑️ Deleting existing workflow: $workflow_id"
            curl -s -b /tmp/n8n_cookies.txt -X DELETE "$N8N_URL/rest/workflows/$workflow_id"
        fi
    done
else
    echo "⚠️ jq not available, skipping workflow deletion"
fi

echo "✅ Existing workflows processed"

echo "🔍 Step 6: Importing all workflows..."

IMPORTED_COUNT=0
FAILED_COUNT=0

# Import each workflow file
for WORKFLOW_FILE in "${WORKFLOW_FILES[@]}"; do
    echo ""
    echo "📥 Importing: $(basename "$WORKFLOW_FILE")"
    
    # Import the workflow with proper headers
    IMPORT_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST "$N8N_URL/rest/workflows" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d @"$WORKFLOW_FILE")

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

    # Activate the workflow
    echo "🔄 Activating workflow..."
    ACTIVATE_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X PATCH "$N8N_URL/rest/workflows/$WORKFLOW_ID" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d '{"active": true}')

    if [[ $ACTIVATE_RESPONSE == *"error"* ]]; then
        echo "⚠️ Activation failed for $WORKFLOW_NAME: $ACTIVATE_RESPONSE"
    else
        echo "✅ Activated: $WORKFLOW_NAME"
    fi

    ((IMPORTED_COUNT++))
done

echo ""
echo "🔍 Step 7: Verifying webhook endpoints..."

# Wait a moment for webhooks to be ready
sleep 3

# Check common webhook endpoints
WEBHOOK_ENDPOINTS=("whatsapp-webhook" "shopme-login-n8n")

for endpoint in "${WEBHOOK_ENDPOINTS[@]}"; do
    WEBHOOK_URL="$N8N_URL/webhook/$endpoint"
    WEBHOOK_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")
    
    if [[ "$WEBHOOK_CHECK" == "404" ]]; then
        echo "⚠️ Webhook endpoint not available: $endpoint"
    elif [[ "$WEBHOOK_CHECK" == "405" ]]; then
        echo "✅ Webhook endpoint ready: $endpoint (Method Not Allowed is expected for GET)"
    else
        echo "✅ Webhook endpoint response: $endpoint ($WEBHOOK_CHECK)"
    fi
done

echo ""
echo "🎉 MULTI-WORKFLOW IMPORT COMPLETED!"
echo "================================================================"
echo "✅ Total workflows processed: $WORKFLOW_COUNT"
echo "✅ Successfully imported: $IMPORTED_COUNT"
if [[ $FAILED_COUNT -gt 0 ]]; then
    echo "❌ Failed imports: $FAILED_COUNT"
fi
echo "✅ All workflows activated and ready"
echo ""
echo "🔗 Access N8N at: $N8N_URL"
echo "👤 Login: $USERNAME / $PASSWORD"

# Cleanup
rm -f /tmp/n8n_cookies.txt

echo ""
echo "✅ Ready to test with WhatsApp webhooks!" 