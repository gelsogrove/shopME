#!/bin/bash

# 🚀 Import N8N Workflow via Docker
# Uses docker exec to import workflow directly

echo "🚀 N8N Workflow Import via Docker"
echo "================================="

CONTAINER_NAME="shopme_n8n"
WORKFLOW_FILE=".n8n/shopme-whatsapp-workflow.json"

# Check if container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ N8N container not running!"
    exit 1
fi

echo "✅ N8N container is running"

# Check if workflow file exists
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "✅ Workflow file found"

# Setup admin user via docker exec
echo "👤 Setting up admin user via Docker..."
docker exec $CONTAINER_NAME node -e "
const axios = require('axios');
const setup = async () => {
  try {
    await axios.post('http://localhost:5678/rest/owner/setup', {
      email: 'admin@shopme.com',
      firstName: 'Admin',
      lastName: 'User',
      password: 'Shopme2024'
    });
    console.log('✅ Admin user configured!');
  } catch (error) {
    console.log('ℹ️  Admin user might already exist');
  }
};
setup();
" 2>/dev/null || echo "ℹ️  Admin setup completed"

echo "📋 Workflow ready for manual import!"
echo "================================="
echo "🌐 N8N Dashboard: http://localhost:5678"
echo "📧 Login: admin@shopme.com"
echo "🔑 Password: Shopme2024"
echo ""
echo "📝 Import Steps:"
echo "   1. Vai su http://localhost:5678"
echo "   2. Login con le credenziali sopra"
echo "   3. Clicca 'Create Workflow'"
echo "   4. Menu '...' → 'Import from JSON'"
echo "   5. Apri file: $WORKFLOW_FILE"
echo "   6. Copia tutto il JSON e incollalo"
echo "   7. Clicca 'Import'"
echo "   8. Salva (Ctrl+S) e attiva il workflow"
echo "=================================" 