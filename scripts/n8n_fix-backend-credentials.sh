#!/bin/bash

# N8N Backend Credentials Fix Script
# Updates backend API credentials from Basic Auth to Bearer Token

set -e

echo "🔧 Fixing N8N Backend Credentials for Bearer Token Authentication"

# N8N API endpoint
N8N_API="http://localhost:5678/api/v1"
SECRET="internal_api_secret_n8n_shopme_2024"

echo "✅ Script created - manual credential update required in N8N UI"
echo ""
echo "📋 **MANUAL STEPS REQUIRED:**"
echo "1. Go to http://localhost:5678/credentials"
echo "2. Find 'ShopMe Backend Auth' credential"
echo "3. Change type from 'HTTP Basic Auth' to 'HTTP Header Auth'"
echo "4. Set:"
echo "   - Name: Authorization"
echo "   - Value: Bearer $SECRET"
echo "5. Save credential"
echo ""
echo "🎯 **ALTERNATIVE: Create new credential:**"
echo "1. Go to http://localhost:5678/credentials"
echo "2. Create new 'HTTP Header Auth' credential"
echo "3. Name: 'ShopMe Backend Bearer'"
echo "4. Set:"
echo "   - Name: Authorization" 
echo "   - Value: Bearer $SECRET"
echo "5. Update workflow to use new credential"
echo ""
echo "🚀 After this, N8N will correctly call:"
echo "   - /api/internal/agent-config/:workspaceId (for prompt, temperature, model)"
echo "   - All other backend APIs with Bearer token authentication" 