#!/bin/bash

# 🚀 N8N Complete Auto-Setup Script
# Automatically sets up user, credentials, and imports workflow

echo "🤖 N8N Complete Auto-Setup Script"
echo "=================================="

# Wait for N8N to be ready
echo "⏳ Waiting for N8N to be ready..."
until curl -s http://localhost:5678/healthz > /dev/null 2>&1; do
    echo "   N8N not ready yet, waiting 3 seconds..."
    sleep 3
done

echo "✅ N8N is ready!"

# Setup admin user first
echo "👤 Setting up admin user..."
SETUP_RESPONSE=$(curl -s -X POST http://localhost:5678/rest/owner/setup \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@shopme.com",
        "firstName": "Admin",
        "lastName": "User", 
        "password": "venezia44"
    }')

echo "✅ Admin user configured!"

# Wait for user setup to complete
sleep 5

# Login to get session cookie
echo "🔐 Logging in to get session..."
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/login \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@shopme.com",
        "password": "venezia44"
    }')

echo "✅ Login successful!"

# Create Basic Auth credential for backend API
echo "🔑 Creating Basic Auth credential..."
CREDENTIAL_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/credentials \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Backend API Basic Auth",
        "type": "httpBasicAuth",
        "data": {
            "user": "admin",
            "password": "admin"
        }
    }')

CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | jq -r '.data.id // empty')

if [ -n "$CREDENTIAL_ID" ]; then
    echo "✅ Basic Auth credential created with ID: $CREDENTIAL_ID"
else
    echo "⚠️ Credential might already exist, checking existing ones..."
    EXISTING_CREDS=$(curl -s -b /tmp/n8n_cookies.txt http://localhost:5678/rest/credentials)
    CREDENTIAL_ID=$(echo "$EXISTING_CREDS" | jq -r '.data[] | select(.name == "Backend API Basic Auth") | .id // empty')
    if [ -n "$CREDENTIAL_ID" ]; then
        echo "✅ Found existing credential with ID: $CREDENTIAL_ID"
    fi
fi

# Import workflow
echo "📋 Importing ShopMe WhatsApp workflow..."
WORKFLOW_FILE=".n8n/shopme-whatsapp-workflow.json"

if [ -f "$WORKFLOW_FILE" ]; then
    # Read workflow and update credential references if needed
    WORKFLOW_CONTENT=$(cat "$WORKFLOW_FILE")
    
    # Replace credential placeholder with actual ID if found
    if [ -n "$CREDENTIAL_ID" ]; then
        WORKFLOW_CONTENT=$(echo "$WORKFLOW_CONTENT" | sed "s/\"CREDENTIAL_ID_PLACEHOLDER\"/\"$CREDENTIAL_ID\"/g")
    fi
    
    # Import the workflow
    IMPORT_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/workflows \
        -H "Content-Type: application/json" \
        -d "$WORKFLOW_CONTENT")
    
    WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.id // empty')
    
    if [ -n "$WORKFLOW_ID" ]; then
        echo "✅ Workflow imported successfully with ID: $WORKFLOW_ID"
        
        # Activate the workflow
        echo "🔄 Activating workflow..."
        ACTIVATE_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X PATCH http://localhost:5678/rest/workflows/$WORKFLOW_ID \
            -H "Content-Type: application/json" \
            -d '{"active": true}')
        
        echo "✅ Workflow activated!"
    else
        echo "❌ Failed to import workflow"
        echo "Response: $IMPORT_RESPONSE"
    fi
else
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
fi

# Cleanup
rm -f /tmp/n8n_cookies.txt

# Final verification
echo "🔍 Final verification..."
WORKFLOWS_COUNT=$(curl -s -u admin@shopme.com:venezia44 http://localhost:5678/rest/workflows | jq '.data | length')
CREDENTIALS_COUNT=$(curl -s -u admin@shopme.com:venezia44 http://localhost:5678/rest/credentials | jq '.data | length')

echo "=================================="
echo "🎉 N8N Setup Complete!"
echo "🌐 N8N Dashboard: http://localhost:5678"
echo "📧 Login: admin@shopme.com"
echo "🔑 Password: venezia44"
echo "📊 Workflows imported: $WORKFLOWS_COUNT"
echo "🔐 Credentials configured: $CREDENTIALS_COUNT"
echo "🔗 Webhook URL: http://localhost:5678/webhook/shopme-login-n8n"
echo "==================================" 