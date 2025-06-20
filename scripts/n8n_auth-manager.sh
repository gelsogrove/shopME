#!/bin/bash

# 🔑 N8N Authentication Manager (Andrea's No-Password Solution)
# Manages N8N authentication tokens to avoid repeated logins

echo "🔑 N8N Authentication Manager - Andrea's No-Password Solution"
echo "============================================================"

# Configuration
N8N_URL="http://localhost:5678"
USERNAME="admin@shopme.com"
PASSWORD="Venezia44"
TOKEN_FILE="/tmp/n8n_api_token.txt"
COOKIE_FILE="/tmp/n8n_cookies.txt"

# Commands
COMMAND="${1:-check}"

show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  check    - Check if authentication is valid (default)"
    echo "  login    - Force new login and save authentication"
    echo "  status   - Show current authentication status"
    echo "  clear    - Clear saved authentication"
    echo "  test     - Test API access with current authentication"
    echo "  help     - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 check     # Quick check if auth is valid"
    echo "  $0 login     # Force new login"
    echo "  $0 status    # Show detailed status"
}

check_n8n_running() {
    if ! curl -s "$N8N_URL" > /dev/null; then
        echo "❌ N8N is not accessible at $N8N_URL"
        echo "Please start N8N first with: npm run dev"
        return 1
    fi
    return 0
}

make_auth_request() {
    local method="$1"
    local url="$2"
    local data="$3"
    local token_type=$(cat "$TOKEN_FILE" 2>/dev/null)
    
    if [[ "$token_type" == "cookie-auth" ]] && [[ -f "$COOKIE_FILE" ]]; then
        # Use cookie authentication
        if [[ -n "$data" ]]; then
            curl -s -b "$COOKIE_FILE" -X "$method" "$url" \
              -H "Content-Type: application/json" \
              -H "Accept: application/json" \
              -d "$data"
        else
            curl -s -b "$COOKIE_FILE" -X "$method" "$url"
        fi
    else
        echo "❌ No valid authentication found"
        return 1
    fi
}

login_to_n8n() {
    echo "🔑 Logging in to N8N..."
    
    if ! check_n8n_running; then
        return 1
    fi
    
    # Clean up existing files
    rm -f "$COOKIE_FILE" "$TOKEN_FILE"
    
    # Login and get session cookie
    LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST "$N8N_URL/rest/login" \
      -H "Content-Type: application/json" \
      -H "Accept: application/json" \
      -d "{\"email\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

    if [[ $LOGIN_RESPONSE == *"error"* ]] || [[ $LOGIN_RESPONSE == *"Unauthorized"* ]]; then
        echo "❌ Login failed: $LOGIN_RESPONSE"
        return 1
    fi

    echo "✅ Login successful"
    
    # Save authentication type
    echo "cookie-auth" > "$TOKEN_FILE"
    
    # Test the authentication
    TEST_RESPONSE=$(make_auth_request "GET" "$N8N_URL/rest/workflows")
    
    if [[ $TEST_RESPONSE == *"Unauthorized"* ]] || [[ $TEST_RESPONSE == *"error"* ]]; then
        echo "❌ Authentication test failed"
        return 1
    fi
    
    echo "✅ Authentication saved and tested successfully"
    echo "🔗 Token file: $TOKEN_FILE"
    echo "🍪 Cookie file: $COOKIE_FILE"
    
    return 0
}

check_auth() {
    if ! check_n8n_running; then
        return 1
    fi
    
    if [[ -f "$TOKEN_FILE" ]] && [[ -f "$COOKIE_FILE" ]]; then
        TEST_RESPONSE=$(make_auth_request "GET" "$N8N_URL/rest/workflows")
        
        if [[ $TEST_RESPONSE != *"Unauthorized"* ]] && [[ $TEST_RESPONSE != *"error"* ]]; then
            return 0  # Valid
        else
            return 1  # Invalid
        fi
    else
        return 1  # No auth files
    fi
}

show_status() {
    echo "🔍 N8N Authentication Status"
    echo "============================"
    echo "N8N URL: $N8N_URL"
    echo "Username: $USERNAME"
    echo "Token file: $TOKEN_FILE"
    echo "Cookie file: $COOKIE_FILE"
    echo ""
    
    if ! check_n8n_running; then
        echo "Status: ❌ N8N not running"
        return 1
    fi
    
    echo "N8N Service: ✅ Running"
    
    if [[ -f "$TOKEN_FILE" ]]; then
        local token_type=$(cat "$TOKEN_FILE" 2>/dev/null)
        echo "Auth Type: $token_type"
        
        if [[ -f "$COOKIE_FILE" ]]; then
            local cookie_age=$(find "$COOKIE_FILE" -mtime -1 2>/dev/null)
            if [[ -n "$cookie_age" ]]; then
                echo "Cookie Age: ✅ Fresh (less than 24h)"
            else
                echo "Cookie Age: ⚠️ Old (more than 24h)"
            fi
        else
            echo "Cookie File: ❌ Missing"
        fi
        
        if check_auth; then
            echo "Auth Status: ✅ Valid"
        else
            echo "Auth Status: ❌ Invalid"
        fi
    else
        echo "Auth Type: ❌ No authentication saved"
        echo "Auth Status: ❌ Not authenticated"
    fi
}

clear_auth() {
    echo "🧹 Clearing N8N authentication..."
    rm -f "$TOKEN_FILE" "$COOKIE_FILE"
    echo "✅ Authentication cleared"
}

test_auth() {
    echo "🧪 Testing N8N API access..."
    
    if ! check_n8n_running; then
        return 1
    fi
    
    if check_auth; then
        echo "✅ Authentication is valid"
        
        # Test getting workflows
        WORKFLOWS=$(make_auth_request "GET" "$N8N_URL/rest/workflows")
        if command -v jq > /dev/null; then
            WORKFLOW_COUNT=$(echo "$WORKFLOWS" | jq '.data | length' 2>/dev/null || echo "unknown")
            echo "📋 Available workflows: $WORKFLOW_COUNT"
        else
            echo "📋 API response received (install jq for detailed info)"
        fi
    else
        echo "❌ Authentication is invalid"
        return 1
    fi
}

# Main logic
case "$COMMAND" in
    "check")
        if check_auth; then
            echo "✅ N8N authentication is valid"
            exit 0
        else
            echo "❌ N8N authentication is invalid or missing"
            exit 1
        fi
        ;;
    "login")
        login_to_n8n
        ;;
    "status")
        show_status
        ;;
    "clear")
        clear_auth
        ;;
    "test")
        test_auth
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac 