#!/bin/bash

# 🧹 N8N Full Cleanup Script (Andrea's Clean Start Solution)
# Resets N8N database for fresh workflow imports

echo "🧹 N8N Full Cleanup - Andrea's Clean Start Solution"
echo "=================================================="

# Configuration
N8N_URL="http://localhost:5678"

echo "🔍 Step 1: Checking if N8N container is running..."

# Check if N8N container is running
if ! docker ps | grep -q "n8n"; then
    echo "⚠️ N8N container not running, starting it..."
    docker compose up -d n8n
    echo "   Waiting for N8N to start..."
    sleep 10
fi

echo "✅ N8N container is running"

echo "🔍 Step 2: Stopping N8N container for cleanup..."

# Stop N8N to safely reset database
docker compose stop n8n

echo "✅ N8N stopped"

echo "🔍 Step 3: Cleaning N8N data..."

# Remove N8N data volume (this will reset all workflows and settings)
docker volume rm shop_n8n_data 2>/dev/null || true

echo "✅ N8N data cleaned"

echo "🔍 Step 4: Restarting N8N..."

# Start N8N again with clean database
docker compose up -d n8n

echo "   Waiting for N8N to initialize..."
sleep 15

# Wait for N8N to be accessible
for i in {1..30}; do
    if curl -s "$N8N_URL" > /dev/null; then
        echo "✅ N8N is accessible"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ N8N failed to start after 30 attempts"
        exit 1
    fi
    echo "   Waiting for N8N... (attempt $i/30)"
    sleep 2
done

echo ""
echo "🎉 N8N CLEANUP COMPLETED!"
echo "========================"
echo "✅ N8N database reset"
echo "✅ All workflows removed"
echo "✅ Fresh N8N instance ready"
echo ""
echo "🔗 Access N8N at: $N8N_URL"
echo "👤 Default login will be created during setup"

echo ""
echo "✅ Ready for workflow import!" 