#!/bin/bash

echo "🧹 N8N Credentials Cleanup"
echo "=========================="

# N8N API Configuration
N8N_URL="http://localhost:5678"
LOGIN_URL="$N8N_URL/rest/login"
CREDENTIALS_URL="$N8N_URL/rest/credentials"

# Login credentials
EMAIL="admin@shopme.com"
PASSWORD="Venezia44"

echo "🔐 Login to N8N..."

# Login and get session cookie
COOKIE_JAR=$(mktemp)
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" -X POST "$LOGIN_URL" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if [[ $? -ne 0 ]]; then
  echo "❌ Login failed"
  rm -f "$COOKIE_JAR"
  exit 1
fi

echo "✅ Login successful!"

echo "📋 Getting all credentials..."

# Get all credentials
CREDENTIALS_RESPONSE=$(curl -s -b "$COOKIE_JAR" "$CREDENTIALS_URL")

if [[ $? -ne 0 ]]; then
  echo "❌ Failed to get credentials"
  rm -f "$COOKIE_JAR"
  exit 1
fi

# Parse and filter Backend API Basic Auth credentials
BACKEND_CREDENTIALS=$(echo "$CREDENTIALS_RESPONSE" | jq -r '.data[] | select(.name == "Backend API Basic Auth") | .id')

# Convert to array
CREDENTIAL_IDS=($BACKEND_CREDENTIALS)
TOTAL_COUNT=${#CREDENTIAL_IDS[@]}

echo "🔍 Found $TOTAL_COUNT 'Backend API Basic Auth' credentials"

if [[ $TOTAL_COUNT -le 1 ]]; then
  echo "✅ No cleanup needed - only $TOTAL_COUNT credential found"
  rm -f "$COOKIE_JAR"
  exit 0
fi

# Keep the first one (most recent), delete the rest
KEEP_ID=${CREDENTIAL_IDS[0]}
echo "✅ Keeping credential: $KEEP_ID"

DELETED_COUNT=0

# Delete the duplicate credentials
for (( i=1; i<$TOTAL_COUNT; i++ )); do
  CREDENTIAL_ID=${CREDENTIAL_IDS[$i]}
  echo "🗑️  Deleting duplicate credential: $CREDENTIAL_ID"
  
  DELETE_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X DELETE "$CREDENTIALS_URL/$CREDENTIAL_ID")
  
  if [[ $? -eq 0 ]]; then
    echo "✅ Deleted credential: $CREDENTIAL_ID"
    ((DELETED_COUNT++))
  else
    echo "❌ Failed to delete credential: $CREDENTIAL_ID"
  fi
done

# Cleanup
rm -f "$COOKIE_JAR"

echo ""
echo "=================================="
echo "🎉 Cleanup Complete!"
echo "📊 Credentials kept: 1"
echo "🗑️  Credentials deleted: $DELETED_COUNT"
echo "✅ N8N credentials cleaned up successfully!"
echo "==================================" 