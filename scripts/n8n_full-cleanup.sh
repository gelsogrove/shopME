#!/bin/bash

echo "🧹 N8N Full Cleanup - RESET DATABASE"
echo "====================================="

# Check if N8N container is running
if ! docker ps | grep -q "shopme_n8n_unified"; then
    echo "❌ N8N container not running!"
    exit 1
fi

echo "🗄️ Resetting N8N database completely..."
# Stop N8N temporarily to reset database
docker exec shopme_n8n_unified rm -rf /home/node/.n8n/database.sqlite
echo "✅ Database file deleted!"

echo "🔄 Restarting N8N container..."
docker restart shopme_n8n_unified

echo "⏳ Waiting for N8N to restart..."
sleep 10

# Wait for N8N to be healthy
until curl -s http://localhost:5678/healthz > /dev/null 2>&1; do
    echo "   Waiting for N8N to be ready..."
    sleep 2
done

echo "✅ N8N Full Cleanup completed!"
echo "🎯 N8N is now clean and ready for fresh import" 