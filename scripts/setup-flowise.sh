#!/bin/bash

# 🤖 ShopMe - Flowise Setup Script
# Configura e avvia Flowise 3.0 per gestire il flusso WhatsApp

echo "🤖 Setting up Flowise 3.0 for WhatsApp Flow Management"

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Step 1: Update environment variables
echo "🔧 Updating environment variables..."
cd "$PROJECT_ROOT/backend" || exit 1

# Add Flowise configuration to .env if not exists
if ! grep -q "FLOWISE_URL" .env; then
    echo "" >> .env
    echo "# 🤖 Flowise Configuration" >> .env
    echo "FLOWISE_URL=http://localhost:3003" >> .env
    echo "FLOWISE_API_KEY=shopme-api-key-$(date +%s)" >> .env
    echo "FLOWISE_FLOW_ID=whatsapp-main-flow" >> .env
    echo "✅ Flowise environment variables added to .env"
else
    echo "✅ Flowise environment variables already exist"
fi

# Step 2: Start Flowise container
echo "🐳 Starting Flowise container..."
cd "$PROJECT_ROOT" || exit 1
docker compose up -d flowise

if [ $? -ne 0 ]; then
    echo "❌ Failed to start Flowise container"
    exit 1
fi

# Wait for Flowise to be ready
echo "⏳ Waiting for Flowise to be ready..."
sleep 10

# Check if Flowise is running
FLOWISE_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/v1/ping)
if [ "$FLOWISE_HEALTH" = "200" ]; then
    echo "✅ Flowise is running at http://localhost:3003"
else
    echo "⚠️ Flowise might still be starting up..."
fi

# Step 3: Install axios if not present
echo "📦 Checking backend dependencies..."
cd "$PROJECT_ROOT/backend" || exit 1
if ! npm list axios &>/dev/null; then
    echo "📦 Installing axios for Flowise integration..."
    npm install axios
fi

# Step 4: Create Flowise flow configuration
echo "🎨 Creating Flowise flow configuration..."
cat > "$PROJECT_ROOT/flowise-whatsapp-flow.json" << 'EOF'
{
  "name": "WhatsApp Message Processing Flow",
  "description": "Visual flow for processing WhatsApp messages with complete business logic",
  "flowData": {
    "nodes": [
      {
        "id": "chatInput",
        "position": { "x": 100, "y": 100 },
        "type": "chatInput",
        "data": {
          "label": "📱 WhatsApp Input",
          "name": "chatInput",
          "type": "ChatInput",
          "inputs": {},
          "outputs": {
            "output": "ChatInput"
          }
        }
      },
      {
        "id": "apiLimitCheck",
        "position": { "x": 300, "y": 100 },
        "type": "javascriptFunction",
        "data": {
          "label": "🚨 API Limit Check",
          "name": "apiLimitCheck",
          "type": "JavaScriptFunction",
          "inputs": {
            "functionName": "checkApiLimit",
            "code": "// Check if workspace has exceeded API limits\nconst { workspaceId } = $vars;\nconst apiLimit = await checkApiLimit(workspaceId);\nif (apiLimit.exceeded) {\n  return { action: 'BLOCKED', reason: 'API_LIMIT_EXCEEDED' };\n}\nreturn { action: 'CONTINUE' };"
          }
        }
      },
      {
        "id": "spamDetection",
        "position": { "x": 500, "y": 100 },
        "type": "javascriptFunction",
        "data": {
          "label": "🚨 Spam Detection",
          "name": "spamDetection",
          "type": "JavaScriptFunction",
          "inputs": {
            "code": "// Check for spam behavior (10+ messages in 30 seconds)\nconst { phoneNumber, workspaceId } = $vars;\nconst spamCheck = await checkSpamBehavior(phoneNumber, workspaceId);\nif (spamCheck.isSpam) {\n  await addToAutoBlacklist(phoneNumber, workspaceId, 'AUTO_SPAM');\n  return { action: 'BLOCKED', reason: 'SPAM_DETECTED' };\n}\nreturn { action: 'CONTINUE' };"
          }
        }
      },
      {
        "id": "channelActiveCheck",
        "position": { "x": 700, "y": 100 },
        "type": "ifElse",
        "data": {
          "label": "✅ Channel Active Check",
          "name": "channelActiveCheck",
          "type": "IfElse",
          "inputs": {
            "condition": "$vars.workspaceSettings.isActive === true"
          }
        }
      },
      {
        "id": "chatbotActiveCheck",
        "position": { "x": 900, "y": 100 },
        "type": "ifElse",
        "data": {
          "label": "🤖 Chatbot Active Check",
          "name": "chatbotActiveCheck",
          "type": "IfElse",
          "inputs": {
            "condition": "$vars.workspaceSettings.activeChatbot === true"
          }
        }
      },
      {
        "id": "blacklistCheck",
        "position": { "x": 1100, "y": 100 },
        "type": "javascriptFunction",
        "data": {
          "label": "🚫 Blacklist Check",
          "name": "blacklistCheck",
          "type": "JavaScriptFunction",
          "inputs": {
            "code": "// Check if user is blacklisted\nconst { phoneNumber, workspaceId } = $vars;\nconst isBlacklisted = await checkBlacklist(phoneNumber, workspaceId);\nif (isBlacklisted) {\n  return { action: 'BLOCKED', reason: 'BLACKLISTED' };\n}\nreturn { action: 'CONTINUE' };"
          }
        }
      },
      {
        "id": "userFlowDetection",
        "position": { "x": 300, "y": 300 },
        "type": "javascriptFunction",
        "data": {
          "label": "👤 User Flow Detection",
          "name": "userFlowDetection",
          "type": "JavaScriptFunction",
          "inputs": {
            "code": "// Detect if new user or existing user\nconst { phoneNumber, workspaceId, message } = $vars;\nconst customer = await getCustomer(phoneNumber, workspaceId);\n\nif (!customer) {\n  // New user - check for greeting\n  const greetings = ['ciao', 'hello', 'hi', 'hola', 'buongiorno', 'good morning'];\n  const isGreeting = greetings.some(g => message.toLowerCase().includes(g));\n  \n  if (isGreeting) {\n    return { action: 'WELCOME_NEW', customer: null };\n  } else {\n    return { action: 'WELCOME_NEW', customer: null };\n  }\n} else {\n  // Existing user - check last conversation time\n  const lastMessage = await getLastMessage(phoneNumber, workspaceId);\n  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);\n  \n  if (!lastMessage || new Date(lastMessage.createdAt) < twoHoursAgo) {\n    return { action: 'WELCOME_BACK', customer };\n  } else {\n    return { action: 'CONTINUE_CHAT', customer };\n  }\n}"
          }
        }
      },
      {
        "id": "ragSearch",
        "position": { "x": 700, "y": 500 },
        "type": "retrieverTool",
        "data": {
          "label": "🔍 Unified RAG Search",
          "name": "ragSearch",
          "type": "RetrieverTool",
          "inputs": {
            "description": "Search across products, FAQs, services, and documents",
            "retriever": "vectorStoreRetriever"
          }
        }
      },
      {
        "id": "llmFormatter",
        "position": { "x": 900, "y": 500 },
        "type": "chatOpenAI",
        "data": {
          "label": "🎨 LLM Response Formatter",
          "name": "llmFormatter",
          "type": "ChatOpenAI",
          "inputs": {
            "modelName": "gpt-4",
            "temperature": 0.7,
            "systemMessage": "You are a helpful customer service assistant. Format responses in a conversational, friendly manner. Include product details, prices, and availability when relevant."
          }
        }
      },
      {
        "id": "chatOutput",
        "position": { "x": 1100, "y": 500 },
        "type": "chatOutput",
        "data": {
          "label": "💬 Final Response",
          "name": "chatOutput",
          "type": "ChatOutput"
        }
      }
    ],
    "edges": [
      {
        "source": "chatInput",
        "sourceHandle": "output",
        "target": "apiLimitCheck",
        "targetHandle": "input"
      },
      {
        "source": "apiLimitCheck",
        "sourceHandle": "output",
        "target": "spamDetection",
        "targetHandle": "input"
      },
      {
        "source": "spamDetection",
        "sourceHandle": "output",
        "target": "channelActiveCheck",
        "targetHandle": "input"
      },
      {
        "source": "channelActiveCheck",
        "sourceHandle": "true",
        "target": "chatbotActiveCheck",
        "targetHandle": "input"
      },
      {
        "source": "chatbotActiveCheck",
        "sourceHandle": "true",
        "target": "blacklistCheck",
        "targetHandle": "input"
      },
      {
        "source": "blacklistCheck",
        "sourceHandle": "output",
        "target": "userFlowDetection",
        "targetHandle": "input"
      },
      {
        "source": "userFlowDetection",
        "sourceHandle": "output",
        "target": "ragSearch",
        "targetHandle": "input"
      },
      {
        "source": "ragSearch",
        "sourceHandle": "output",
        "target": "llmFormatter",
        "targetHandle": "input"
      },
      {
        "source": "llmFormatter",
        "sourceHandle": "output",
        "target": "chatOutput",
        "targetHandle": "input"
      }
    ]
  }
}
EOF

echo "✅ Flowise flow configuration created: flowise-whatsapp-flow.json"

# Step 5: Final instructions
echo ""
echo "🎉 Flowise setup completed!"
echo ""
echo "📊 Next steps:"
echo "1. Open Flowise at: http://localhost:3003"
echo "2. Login with: admin / shopme2024"
echo "3. Import the flow: flowise-whatsapp-flow.json"
echo "4. Configure database connections in Flowise"
echo "5. Test the visual flow"
echo ""
echo "🔧 Integration points:"
echo "- Backend service: FlowiseIntegrationService"
echo "- Environment: .env updated with Flowise config"
echo "- Docker: flowise container running on port 3003"
echo ""
echo "🚀 Ready to replace complex if/else logic with visual flows!" 