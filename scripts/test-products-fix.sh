#!/bin/bash

echo "🔧 Testing Products Page Hooks Fix..."

# Check if frontend is running
echo "📡 Checking frontend status..."
curl -s http://localhost:3000 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend is not running. Please start it first."
    exit 1
fi

# Check if backend is running
echo "📡 Checking backend status..."
curl -s http://localhost:3001/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running on port 3001"
else
    echo "❌ Backend is not running. Please start it first."
    exit 1
fi

echo ""
echo "🎯 Fix Applied:"
echo "✅ Moved useState for selectedCategoryId to top level of component"
echo "✅ Removed conditional hook from renderFormFields function"
echo "✅ Added proper category reset in handleEdit and onAdd"
echo "✅ Fixed React Hooks order violation"
echo ""
echo "🧪 Manual Testing Required:"
echo "1. Open http://localhost:3000/products"
echo "2. Verify products list loads correctly"
echo "3. Test 'Add' button opens form with category dropdown"
echo "4. Test 'Edit' button opens form with correct category selected"
echo "5. Check browser console for no more hooks errors"
echo ""
echo "✨ Products page should now work correctly!" 