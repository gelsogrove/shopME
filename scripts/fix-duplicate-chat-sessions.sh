#!/bin/bash

echo "🔧 FIXING DUPLICATE CHAT SESSIONS"
echo "================================"
echo ""
echo "Andrea, questo script correggerà le chat duplicate consolidando le conversazioni"
echo "dello stesso numero di telefono in una singola sessione."
echo ""

# Database connection details
DB_USER="shopmefy"
DB_NAME="shopmefy"
DB_HOST="localhost"
DB_PORT="5434"
CONTAINER_NAME="shop_db"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Error: Container $CONTAINER_NAME is not running"
    echo "   Please start the database first with: docker-compose up -d"
    exit 1
fi

echo "✅ Database container is running"
echo ""

# Function to execute SQL
execute_sql() {
    local sql="$1"
    docker exec -it $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "$sql"
}

echo "🔍 Step 1: Checking for duplicate chat sessions..."
echo ""

DUPLICATE_CHECK=$(execute_sql "
SELECT 
    c.phone, 
    COUNT(cs.id) as session_count,
    STRING_AGG(cs.id::text, ', ') as session_ids
FROM customers c 
LEFT JOIN chat_sessions cs ON c.id = cs.\"customerId\" 
WHERE c.phone IS NOT NULL 
GROUP BY c.phone 
HAVING COUNT(cs.id) > 1 
ORDER BY session_count DESC;
")

echo "$DUPLICATE_CHECK"
echo ""

# Count duplicates
DUPLICATE_COUNT=$(execute_sql "
SELECT COUNT(*) as duplicate_phone_numbers
FROM (
    SELECT c.phone
    FROM customers c 
    LEFT JOIN chat_sessions cs ON c.id = cs.\"customerId\" 
    WHERE c.phone IS NOT NULL 
    GROUP BY c.phone 
    HAVING COUNT(cs.id) > 1
) as duplicates;
" | grep -o '[0-9]\+' | tail -1)

if [ "$DUPLICATE_COUNT" = "0" ]; then
    echo "✅ No duplicate chat sessions found! The system is already clean."
    exit 0
fi

echo "⚠️  Found $DUPLICATE_COUNT phone numbers with duplicate chat sessions"
echo ""

read -p "Do you want to proceed with consolidation? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled by user"
    exit 1
fi

echo ""
echo "🔧 Step 2: Consolidating duplicate chat sessions..."
echo ""

# Start transaction
execute_sql "BEGIN;"

# Create temporary table to track consolidations
execute_sql "
CREATE TEMP TABLE session_consolidation AS
SELECT 
    c.phone,
    c.id as customer_id,
    MIN(cs.id) as keep_session_id,
    ARRAY_AGG(cs.id ORDER BY cs.\"startedAt\" ASC) as all_session_ids
FROM customers c 
JOIN chat_sessions cs ON c.id = cs.\"customerId\" 
WHERE c.phone IS NOT NULL 
GROUP BY c.phone, c.id
HAVING COUNT(cs.id) > 1;
"

echo "✅ Created consolidation plan"

# Move all messages from duplicate sessions to the earliest session
execute_sql "
UPDATE messages 
SET \"chatSessionId\" = sc.keep_session_id
FROM session_consolidation sc
WHERE messages.\"chatSessionId\" = ANY(sc.all_session_ids)
  AND messages.\"chatSessionId\" != sc.keep_session_id;
"

echo "✅ Moved all messages to primary sessions"

# Delete duplicate chat sessions (keep only the earliest one)
execute_sql "
DELETE FROM chat_sessions 
WHERE id IN (
    SELECT unnest(all_session_ids[2:]) 
    FROM session_consolidation
);
"

echo "✅ Removed duplicate chat sessions"

# Update session timestamps to reflect the latest activity
execute_sql "
UPDATE chat_sessions 
SET \"updatedAt\" = (
    SELECT MAX(m.\"createdAt\")
    FROM messages m 
    WHERE m.\"chatSessionId\" = chat_sessions.id
)
WHERE id IN (
    SELECT keep_session_id 
    FROM session_consolidation
);
"

echo "✅ Updated session timestamps"

# Commit transaction
execute_sql "COMMIT;"

echo ""
echo "🎉 CONSOLIDATION COMPLETED!"
echo "=========================="
echo ""

# Final verification
echo "🔍 Final verification:"
echo ""

FINAL_CHECK=$(execute_sql "
SELECT 
    COUNT(*) as total_customers,
    COUNT(DISTINCT c.phone) as unique_phones,
    COUNT(cs.id) as total_sessions
FROM customers c 
LEFT JOIN chat_sessions cs ON c.id = cs.\"customerId\" 
WHERE c.phone IS NOT NULL;
")

echo "$FINAL_CHECK"
echo ""

REMAINING_DUPLICATES=$(execute_sql "
SELECT COUNT(*) as remaining_duplicates
FROM (
    SELECT c.phone
    FROM customers c 
    LEFT JOIN chat_sessions cs ON c.id = cs.\"customerId\" 
    WHERE c.phone IS NOT NULL 
    GROUP BY c.phone 
    HAVING COUNT(cs.id) > 1
) as duplicates;
" | grep -o '[0-9]\+' | tail -1)

if [ "$REMAINING_DUPLICATES" = "0" ]; then
    echo "✅ SUCCESS: No duplicate chat sessions remain!"
else
    echo "⚠️  Warning: $REMAINING_DUPLICATES duplicates still exist"
fi

echo ""
echo "💡 The chat interface should now show only one conversation per phone number."
echo "💡 Please refresh the frontend to see the changes."
echo ""
echo "✅ Fix completed successfully!" 