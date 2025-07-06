#!/bin/bash

# Script to fix duplicate customers in the database
# This script will merge duplicate customers and keep only the most recent one per phone/workspace

echo "🔧 FIXING DUPLICATE CUSTOMERS"
echo "==============================="

# Change to the project directory
cd "$(dirname "$0")/.."

# Check if PostgreSQL container is running
if ! docker ps | grep -q shop_db; then
    echo "❌ PostgreSQL container 'shop_db' is not running!"
    echo "Please start the database first with: docker-compose up -d"
    exit 1
fi

echo "📊 BEFORE: Checking current customer duplicates..."

# Show duplicate customers before fixing
docker exec -it shop_db psql -U shopmefy -d shopmefy -c "
SELECT phone, \"workspaceId\", COUNT(*) as count 
FROM customers 
WHERE phone IS NOT NULL AND phone != '' 
GROUP BY phone, \"workspaceId\" 
HAVING COUNT(*) > 1
ORDER BY count DESC;
"

echo ""
echo "🔧 FIXING: Merging duplicate customers..."

# SQL script to fix duplicates
# Keep the most recent customer (latest createdAt) for each phone/workspace combination
docker exec -it shop_db psql -U shopmefy -d shopmefy -c "
-- Step 1: Create a temporary table with the IDs of customers to keep (most recent per phone/workspace)
CREATE TEMP TABLE customers_to_keep AS
SELECT DISTINCT ON (phone, \"workspaceId\") id
FROM customers
WHERE phone IS NOT NULL AND phone != ''
ORDER BY phone, \"workspaceId\", \"createdAt\" DESC;

-- Step 2: Update chat sessions to point to the customer we're keeping
UPDATE chat_sessions 
SET \"customerId\" = (
    SELECT ctk.id 
    FROM customers_to_keep ctk
    JOIN customers c ON c.id = ctk.id
    WHERE c.phone = (SELECT phone FROM customers WHERE id = chat_sessions.\"customerId\")
    AND c.\"workspaceId\" = (SELECT \"workspaceId\" FROM customers WHERE id = chat_sessions.\"customerId\")
)
WHERE \"customerId\" NOT IN (SELECT id FROM customers_to_keep)
AND \"customerId\" IN (
    SELECT id FROM customers 
    WHERE phone IS NOT NULL AND phone != ''
);

-- Step 3: Update orders to point to the customer we're keeping
UPDATE orders 
SET \"customerId\" = (
    SELECT ctk.id 
    FROM customers_to_keep ctk
    JOIN customers c ON c.id = ctk.id
    WHERE c.phone = (SELECT phone FROM customers WHERE id = orders.\"customerId\")
    AND c.\"workspaceId\" = (SELECT \"workspaceId\" FROM customers WHERE id = orders.\"customerId\")
)
WHERE \"customerId\" NOT IN (SELECT id FROM customers_to_keep)
AND \"customerId\" IN (
    SELECT id FROM customers 
    WHERE phone IS NOT NULL AND phone != ''
);

-- Step 4: Update carts to point to the customer we're keeping
UPDATE carts 
SET \"customerId\" = (
    SELECT ctk.id 
    FROM customers_to_keep ctk
    JOIN customers c ON c.id = ctk.id
    WHERE c.phone = (SELECT phone FROM customers WHERE id = carts.\"customerId\")
    AND c.\"workspaceId\" = (SELECT \"workspaceId\" FROM customers WHERE id = carts.\"customerId\")
)
WHERE \"customerId\" NOT IN (SELECT id FROM customers_to_keep)
AND \"customerId\" IN (
    SELECT id FROM customers 
    WHERE phone IS NOT NULL AND phone != ''
);

-- Step 5: Delete duplicate customers (keeping only the ones in customers_to_keep)
DELETE FROM customers 
WHERE id NOT IN (SELECT id FROM customers_to_keep)
AND phone IS NOT NULL AND phone != '';

-- Show results
SELECT 'Duplicate customers removed' as status;
"

echo ""
echo "📊 AFTER: Checking remaining duplicates..."

# Show duplicate customers after fixing
docker exec -it shop_db psql -U shopmefy -d shopmefy -c "
SELECT phone, \"workspaceId\", COUNT(*) as count 
FROM customers 
WHERE phone IS NOT NULL AND phone != '' 
GROUP BY phone, \"workspaceId\" 
HAVING COUNT(*) > 1
ORDER BY count DESC;
"

echo ""
echo "📊 SUMMARY: Customer statistics..."

# Show total customer count
docker exec -it shop_db psql -U shopmefy -d shopmefy -c "
SELECT 
    COUNT(*) as total_customers,
    COUNT(DISTINCT phone) as unique_phones,
    COUNT(CASE WHEN \"isActive\" = true THEN 1 END) as active_customers,
    COUNT(CASE WHEN \"isActive\" = false THEN 1 END) as inactive_customers
FROM customers 
WHERE phone IS NOT NULL AND phone != '';
"

echo ""
echo "✅ Duplicate customer fix completed!"
echo "🔧 The unified customer creation logic in the code will prevent future duplicates."
echo ""
echo "ℹ️  If you still see duplicates in the chat interface, try refreshing the page." 