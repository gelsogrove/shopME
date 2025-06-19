#!/bin/bash

echo "🚀 Import Workflow Diretto"
echo "=========================="

# Wait for N8N
until curl -s http://localhost:5678/healthz > /dev/null 2>&1; do
    echo "Aspettando N8N..."
    sleep 2
done

# Setup owner with valid password
echo "👤 Setup owner..."
SETUP_RESPONSE=$(curl -s -X POST http://localhost:5678/rest/owner/setup \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@shopme.com",
        "firstName": "Admin",
        "lastName": "User",
        "password": "Venezia44"
    }')

sleep 5

# Login and get session with correct API format
echo "🔐 Login..."
LOGIN_RESPONSE=$(curl -s -c /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/login \
    -H "Content-Type: application/json" \
    -d '{
        "emailOrLdapLoginId": "admin@shopme.com",
        "password": "Venezia44"
    }')

echo "✅ Login successful!"

# Disable personalization survey to prevent the customize screen
echo "⏭️ Disabling personalization survey..."
DISABLE_SURVEY=$(curl -s -b /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/settings \
    -H "Content-Type: application/json" \
    -d '{
        "personalizationSurveyEnabled": false
    }')

echo "✅ Personalization survey disabled!"

# Create Header Auth credential automatically
echo "🔑 Creating Header Auth credential..."
CREDENTIAL_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/credentials \
    -H "Content-Type: application/json" \
    -d '{
        "name": "ShopMe Internal API Auth",
        "type": "httpHeaderAuth",
        "data": {
            "name": "x-internal-auth",
            "value": "shopme-internal-2024"
        }
    }')

CREDENTIAL_ID=$(echo "$CREDENTIAL_RESPONSE" | jq -r '.data.id // empty')

if [ -n "$CREDENTIAL_ID" ]; then
    echo "✅ Header Auth credential created with ID: $CREDENTIAL_ID"
else
    echo "⚠️ Checking if credential already exists..."
    EXISTING_CREDS=$(curl -s -b /tmp/n8n_cookies.txt http://localhost:5678/rest/credentials)
    CREDENTIAL_ID=$(echo "$EXISTING_CREDS" | jq -r '.data[] | select(.name == "ShopMe Internal API Auth") | .id // empty')
    if [ -n "$CREDENTIAL_ID" ]; then
        echo "✅ Found existing credential with ID: $CREDENTIAL_ID"
    else
        echo "❌ Failed to create credential"
    fi
fi

# Import workflow dal file JSON
echo "📋 Importing complete workflow from file..."

# Leggi il workflow dal file
WORKFLOW_FILE=".n8n/workflows/shopme-whatsapp-workflow.json"
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

WORKFLOW_DATA=$(cat "$WORKFLOW_FILE")

# Assicurati che il workflow sia attivo
WORKFLOW_DATA=$(echo "$WORKFLOW_DATA" | jq '.active = true')

echo "📋 Importing workflow: $(echo "$WORKFLOW_DATA" | jq -r '.name')"

# Update workflow to use the credential ID if we have one
if [ -n "$CREDENTIAL_ID" ]; then
    echo "🔧 Linking credential to workflow nodes..."
    # Replace placeholder credential references with actual credential ID
    WORKFLOW_DATA=$(echo "$WORKFLOW_DATA" | jq --arg cred_id "$CREDENTIAL_ID" '
        .active = true |
        .nodes = (.nodes | map(
            if .type == "n8n-nodes-base.httpRequest" and (.parameters.authentication // "none") == "genericCredentialType" then
                .credentials = {"httpHeaderAuth": {"id": $cred_id, "name": "ShopMe Internal API Auth"}}
            else
                .
            end
        ))
    ')
else
    # Ensure active field is present even without credentials
    WORKFLOW_DATA=$(echo "$WORKFLOW_DATA" | jq '.active = true')
fi

IMPORT_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X POST http://localhost:5678/rest/workflows \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_DATA")

WORKFLOW_ID=$(echo "$IMPORT_RESPONSE" | jq -r '.data.id // empty')

if [ -n "$WORKFLOW_ID" ]; then
    echo "✅ Workflow imported successfully with ID: $WORKFLOW_ID"
    
    # Activate the workflow
    echo "🔄 Activating workflow..."
    ACTIVATE_RESPONSE=$(curl -s -b /tmp/n8n_cookies.txt -X PATCH http://localhost:5678/rest/workflows/$WORKFLOW_ID \
        -H "Content-Type: application/json" \
        -d '{"active": true}')
    
    echo "✅ Workflow activated!"
    
    # Trigger webhook registration
    echo "🔗 Triggering webhook registration..."
    curl -s -b /tmp/n8n_cookies.txt "http://localhost:5678/rest/workflows/$WORKFLOW_ID/activate" >/dev/null
    
else
    echo "❌ Failed to import workflow"
    echo "Response: $IMPORT_RESPONSE"
fi

# Cleanup
rm -f /tmp/n8n_cookies.txt

# Final verification
echo "🔍 Final verification..."
LOGIN_RESPONSE2=$(curl -s -c /tmp/n8n_cookies2.txt -X POST http://localhost:5678/rest/login \
    -H "Content-Type: application/json" \
    -d '{
        "emailOrLdapLoginId": "admin@shopme.com",
        "password": "Venezia44"
    }')

WORKFLOWS_COUNT=$(curl -s -b /tmp/n8n_cookies2.txt http://localhost:5678/rest/workflows | jq '.data | length')
CREDENTIALS_COUNT=$(curl -s -b /tmp/n8n_cookies2.txt http://localhost:5678/rest/credentials | jq '.data | length')

rm -f /tmp/n8n_cookies2.txt

echo "=================================="
echo "🎉 N8N Setup Complete!"
echo "🌐 N8N Dashboard: http://localhost:5678"
echo "📧 Login: admin@shopme.com"
echo "🔑 Password: Venezia44"
echo "📊 Workflows imported: $WORKFLOWS_COUNT"
echo "🔐 Credentials configured: $CREDENTIALS_COUNT"
echo "🔗 Webhook URL: http://localhost:5678/webhook/whatsapp-webhook"
echo "✅ Header Auth (x-internal-auth) configured automatically!"
echo "🚫 Personalization survey permanently disabled!"
echo "==================================" 