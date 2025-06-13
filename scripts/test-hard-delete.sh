#!/bin/bash

# Test script for workspace hard delete functionality
# Usage: ./scripts/test-hard-delete.sh [workspace_id]

echo "🚨 WORKSPACE HARD DELETE TEST SCRIPT"
echo "======================================"

# Configuration
BACKEND_URL="http://localhost:3001"
WORKSPACE_ID=${1:-"test-workspace-id"}

echo "Backend URL: $BACKEND_URL"
echo "Workspace ID: $WORKSPACE_ID"
echo ""

# Function to check if backend is running
check_backend() {
    echo "🔍 Checking if backend is running..."
    if curl -s "${BACKEND_URL}/health" > /dev/null; then
        echo "✅ Backend is running"
        return 0
    else
        echo "❌ Backend is not running on $BACKEND_URL"
        echo "   Please start the backend with: cd backend && npm run dev"
        exit 1
    fi
}

# Function to check data before deletion
check_data_before() {
    echo "🔍 Checking data before deletion..."
    echo ""
    
    echo "📊 Current workspace data:"
    echo "- Workspace: $(curl -s "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}" | jq -r '.name // "Not found"')"
    
    # Check if authenticated endpoint requires auth
    echo "- Products: $(curl -s "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}/products" | jq 'length // "N/A"' 2>/dev/null || echo "Auth required")"
    echo "- Services: $(curl -s "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}/services" | jq 'length // "N/A"' 2>/dev/null || echo "Auth required")"
    echo "- Categories: $(curl -s "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}/categories" | jq 'length // "N/A"' 2>/dev/null || echo "Auth required")"
    echo ""
}

# Function to perform hard delete
perform_delete() {
    echo "🗑️  Performing hard delete..."
    echo ""
    
    RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -X DELETE "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}")
    HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')
    
    echo "HTTP Status: $HTTP_CODE"
    echo "Response: $BODY"
    echo ""
    
    if [ "$HTTP_CODE" = "204" ]; then
        echo "✅ Delete request successful (HTTP 204)"
        return 0
    elif [ "$HTTP_CODE" = "404" ]; then
        echo "⚠️  Workspace not found (HTTP 404)"
        return 1
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "🔒 Authentication required (HTTP 401)"
        echo "   This is expected for protected endpoints"
        return 2
    else
        echo "❌ Delete failed with HTTP $HTTP_CODE"
        return 1
    fi
}

# Function to verify deletion
verify_deletion() {
    echo "🔍 Verifying deletion..."
    echo ""
    
    RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" "${BACKEND_URL}/api/workspaces/${WORKSPACE_ID}")
    HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')
    
    if [ "$HTTP_CODE" = "404" ]; then
        echo "✅ Workspace successfully deleted (HTTP 404)"
        echo "✅ Hard delete verification passed"
    elif [ "$HTTP_CODE" = "200" ]; then
        echo "❌ Workspace still exists after deletion"
        echo "   Response: $BODY"
        echo "❌ Hard delete verification failed"
    else
        echo "⚠️  Unexpected response during verification (HTTP $HTTP_CODE)"
        echo "   Response: $BODY"
    fi
    echo ""
}

# Function to show database verification commands
show_db_commands() {
    echo "🔍 Database verification commands:"
    echo "=================================="
    echo ""
    echo "To manually verify deletion in database:"
    echo "docker exec -it shop_db psql -U postgres -d shopmefy -c \"SELECT COUNT(*) FROM workspaces WHERE id = '$WORKSPACE_ID';\""
    echo "docker exec -it shop_db psql -U postgres -d shopmefy -c \"SELECT COUNT(*) FROM products WHERE workspaceId = '$WORKSPACE_ID';\""
    echo "docker exec -it shop_db psql -U postgres -d shopmefy -c \"SELECT COUNT(*) FROM services WHERE workspaceId = '$WORKSPACE_ID';\""
    echo "docker exec -it shop_db psql -U postgres -d shopmefy -c \"SELECT COUNT(*) FROM customers WHERE workspaceId = '$WORKSPACE_ID';\""
    echo ""
}

# Main execution
main() {
    echo "Starting hard delete test for workspace: $WORKSPACE_ID"
    echo ""
    
    check_backend
    check_data_before
    
    echo "⚠️  WARNING: This will permanently delete workspace '$WORKSPACE_ID' and ALL related data!"
    echo "This action is irreversible and cannot be undone."
    echo ""
    read -p "Do you want to continue? (yes/no): " -r
    
    if [[ $REPLY != "yes" ]]; then
        echo "Operation cancelled."
        exit 0
    fi
    
    perform_delete
    DELETE_RESULT=$?
    
    if [ $DELETE_RESULT -eq 0 ]; then
        sleep 2  # Wait for operation to complete
        verify_deletion
    elif [ $DELETE_RESULT -eq 2 ]; then
        echo "🔒 Authentication required - cannot complete full test"
        echo "   The delete endpoint is protected and requires authentication"
        echo "   Use the frontend application to test deletion functionality"
    fi
    
    show_db_commands
    
    echo "🏁 Hard delete test completed!"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is not installed. JSON parsing will be limited."
    echo "   Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    echo ""
fi

# Run main function
main "$@" 