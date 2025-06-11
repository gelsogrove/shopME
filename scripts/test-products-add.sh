#!/bin/bash

echo "Testing Products ADD functionality..."

# Test data
WORKSPACE_ID="cm9hjgq9v00014qk8fsdy4ujv"
API_URL="http://localhost:3001/api/workspaces/${WORKSPACE_ID}/products"

# Get auth token (you'll need to replace this with a valid token)
# For now, let's test without auth to see the basic response
echo "Testing POST to: $API_URL"

# Test product data
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "description": "Test product description",
    "price": 29.99,
    "stock": 100,
    "categoryId": null,
    "isActive": true
  }' \
  -v

echo -e "\n\nTest completed." 