#!/bin/bash

echo "🧪 Testing profile update functionality..."

# Test the health endpoint first
echo "📡 Testing health endpoint..."
curl -X GET http://localhost:3001/api/health
echo ""

echo ""
echo "⚠️  To test profile update, you need to:"
echo "1. Login to the application in the browser"
echo "2. Open browser dev tools"
echo "3. Go to Application > Local Storage"
echo "4. Copy the JWT token from 'token' key"
echo "5. Run this command with your token:"
echo ""
echo "curl -X PUT http://localhost:3001/api/users/profile \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \\"
echo "  -d '{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@example.com\"}'"
echo ""
echo "📋 Profile update endpoint: PUT /users/profile"
echo "📋 Expected payload: { firstName: \"string\", lastName: \"string\", email: \"string\" }"
echo "📋 Expected response: User object without password" 