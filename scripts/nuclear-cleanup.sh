#!/bin/bash

echo "🚀 NUCLEAR CLEANUP - PULIZIA COMPLETA N8N"

# Configuration
N8N_URL="http://localhost:5678"
OWNER_EMAIL="admin@shopme.com"
OWNER_PASSWORD="Venezia44"
COOKIES_FILE="/tmp/n8n_nuclear_cookies.txt"
WORKFLOW_FILE="/Users/gelso/workspace/AI/shop/n8n/workflows/shopme-whatsapp-workflow.json"

# Cleanup
rm -f $COOKIES_FILE

echo "1️⃣ Login to N8N..."
LOGIN_RESPONSE=$(curl -s -c $COOKIES_FILE -X POST -H "Content-Type: application/json" \
  -d "{\"emailOrLdapLoginId\":\"$OWNER_EMAIL\",\"password\":\"$OWNER_PASSWORD\"}" \
  "$N8N_URL/rest/login")

echo "Login response: $LOGIN_RESPONSE"

echo "2️⃣ Get all workflows..."
WORKFLOWS_RESPONSE=$(curl -s -b $COOKIES_FILE "$N8N_URL/rest/workflows")
echo "Workflows: $WORKFLOWS_RESPONSE"

# Extract and delete ALL workflows
echo "3️⃣ NUCLEAR DELETE - Removing ALL workflows..."
WORKFLOW_IDS=$(echo "$WORKFLOWS_RESPONSE" | jq -r '.data[].id' 2>/dev/null || echo "")

if [ ! -z "$WORKFLOW_IDS" ]; then
  for ID in $WORKFLOW_IDS; do
    echo "🗑️ Archiving workflow $ID..."
    curl -s -b $COOKIES_FILE -X PATCH -H "Content-Type: application/json" \
      -d '{"isArchived": true}' "$N8N_URL/rest/workflows/$ID"
    
    echo "🗑️ Deleting workflow $ID..."
    curl -s -b $COOKIES_FILE -X DELETE "$N8N_URL/rest/workflows/$ID"
  done
  echo "✅ All workflows deleted"
else
  echo "ℹ️ No workflows found"
fi

echo "4️⃣ Import fresh workflow..."
if [ -f "$WORKFLOW_FILE" ]; then
  # Read workflow and set active
  WORKFLOW_CONTENT=$(cat "$WORKFLOW_FILE")
  WORKFLOW_CONTENT=$(echo "$WORKFLOW_CONTENT" | jq '.active = true')
  
  # Write to temp file
  TMP_FILE="/tmp/workflow_nuclear_import.json"
  echo "$WORKFLOW_CONTENT" > "$TMP_FILE"
  
  # Import
  IMPORT_RESPONSE=$(curl -s -b $COOKIES_FILE -X POST \
    -H "Content-Type: application/json" \
    --data-binary @"$TMP_FILE" \
    "$N8N_URL/rest/workflows")
  
  echo "Import response: $IMPORT_RESPONSE"
  
  # Cleanup
  rm -f "$TMP_FILE"
else
  echo "❌ Workflow file not found: $WORKFLOW_FILE"
  exit 1
fi

echo "5️⃣ Verify import..."
sleep 3
FINAL_WORKFLOWS=$(curl -s -b $COOKIES_FILE "$N8N_URL/rest/workflows")
echo "Final workflows: $FINAL_WORKFLOWS"

# Cleanup
rm -f $COOKIES_FILE

echo "✅ NUCLEAR CLEANUP COMPLETED!"
