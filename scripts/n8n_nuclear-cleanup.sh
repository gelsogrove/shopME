#!/bin/bash

echo "🚀 N8N NUCLEAR CLEANUP - Andrea's Perfect Solution"
echo "=================================================="

# Configuration
N8N_URL="http://localhost:5678"
OWNER_EMAIL="admin@shopme.com"
OWNER_PASSWORD="Venezia44"
WORKFLOW_FILE="n8n/workflows/shopme-whatsapp-workflow.json"
COOKIES_FILE="/tmp/n8n_nuclear_cookies.txt"

echo "📁 Workflow file: $WORKFLOW_FILE"

# Step 1: Nuclear cleanup - Delete N8N database
echo "🗑️ Step 1: Nuclear cleanup - Deleting N8N database..."
docker exec shopme_n8n rm -f /home/node/.n8n/database.sqlite
echo "✅ N8N database deleted"

# Step 2: Restart N8N
echo "🔄 Step 2: Restarting N8N..."
docker restart shopme_n8n
echo "✅ N8N restarted"

# Step 3: Wait for N8N to be ready
echo "⏳ Step 3: Waiting for N8N to be ready..."
sleep 15

# Step 4: Setup owner
echo "👤 Step 4: Setting up owner..."
setup_payload='{
  "email": "'$OWNER_EMAIL'",
  "password": "'$OWNER_PASSWORD'",
  "firstName": "Admin",
  "lastName": "ShopMe"
}'

setup_response=$(curl -s -X POST -H "Content-Type: application/json" -d "$setup_payload" "$N8N_URL/rest/owner/setup")
echo "✅ Owner setup completed"

# Step 5: Login
echo "🔐 Step 5: Logging in..."
login_response=$(curl -s -c "$COOKIES_FILE" -X POST -H "Content-Type: application/json" -d '{"emailOrLdapLoginId":"'$OWNER_EMAIL'","password":"'$OWNER_PASSWORD'"}' "$N8N_URL/rest/login")
echo "✅ Login completed"

# Step 6: Create credentials
echo "🔑 Step 6: Creating credentials..."

# Backend API Basic Auth
backend_payload='{
  "name": "Backend API Basic Auth",
  "type": "httpBasicAuth",
  "data": {
    "user": "admin",
    "password": "admin"
  }
}'
backend_response=$(curl -s -b "$COOKIES_FILE" -X POST -H "Content-Type: application/json" -d "$backend_payload" "$N8N_URL/rest/credentials")
backend_id=$(echo "$backend_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Backend credential created: $backend_id"

# OpenRouter API
or_payload='{
  "name": "OpenRouter API",
  "type": "openRouterApi",
  "data": {
    "apiKey": "'${OPENROUTER_API_KEY:-}'"
  }
}'
or_response=$(curl -s -b "$COOKIES_FILE" -X POST -H "Content-Type: application/json" -d "$or_payload" "$N8N_URL/rest/credentials")
or_id=$(echo "$or_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ OpenRouter credential created: $or_id"

# Step 7: Import workflow
echo "📤 Step 7: Importing workflow..."
if [ -f "$WORKFLOW_FILE" ]; then
  # Read and modify workflow to inject credentials
  workflow_content=$(cat "$WORKFLOW_FILE")
  
  # Inject credentials into workflow
  workflow_content=$(echo "$workflow_content" | sed 's/"id":"[^"]*","name":"Backend API Basic Auth"/"id":"'$backend_id'","name":"Backend API Basic Auth"/g')
  workflow_content=$(echo "$workflow_content" | sed 's/"id":"[^"]*","name":"OpenRouter API"/"id":"'$or_id'","name":"OpenRouter API"/g')
  
  # Set workflow as active
  workflow_content=$(echo "$workflow_content" | sed 's/"active":false/"active":true/g')
  workflow_content=$(echo "$workflow_content" | sed 's/"active":null/"active":true/g')
  
  # Import workflow
  import_response=$(curl -s -b "$COOKIES_FILE" -X POST -H "Content-Type: application/json" -d "$workflow_content" "$N8N_URL/rest/workflows")
  workflow_id=$(echo "$import_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "✅ Workflow imported with ID: $workflow_id"
else
  echo "❌ Workflow file not found: $WORKFLOW_FILE"
  exit 1
fi

# Step 8: Verify activation
echo "🔍 Step 8: Verifying activation..."
sleep 2
status_response=$(curl -s -b "$COOKIES_FILE" "$N8N_URL/rest/workflows/$workflow_id")
is_active=$(echo "$status_response" | grep -o '"active":true')
if [ -n "$is_active" ]; then
  echo "✅ Workflow is active"
else
  echo "⚠️ Workflow may not be active, checking..."
  # Try to activate manually
  activate_response=$(curl -s -b "$COOKIES_FILE" -X PATCH -H "Content-Type: application/json" -d '{"active":true}' "$N8N_URL/rest/workflows/$workflow_id")
  echo "✅ Workflow activation attempted"
fi

# Cleanup
rm -f "$COOKIES_FILE"

echo "🎉 N8N NUCLEAR CLEANUP COMPLETED!"
echo "=================================="
echo "🔗 Webhook URL: $N8N_URL/webhook/webhook-start"
echo "⚙️ Admin Panel: $N8N_URL"
echo "✅ Workflow should be active and ready"
