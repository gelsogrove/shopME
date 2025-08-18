#!/bin/bash

echo "🔧 Adding missing logger imports..."

# Add logger import to files that need it
files=(
  "backend/src/controllers/agent.controller.ts"
  "backend/src/controllers/analytics.controller.ts"
  "backend/src/controllers/documentController.ts"
  "backend/src/controllers/prompts.controller.ts"
  "backend/src/controllers/usage.controller.ts"
  "backend/src/index.ts"
  "backend/src/interfaces/http/controllers/usage.controller.ts"
  "backend/src/interfaces/http/middlewares/n8n-auth.middleware.ts"
  "backend/src/middlewares/auth.middleware.ts"
  "backend/src/routes/documentRoutes.ts"
  "backend/src/routes/workspace.routes.ts"
  "backend/src/services/agent.service.ts"
  "backend/src/services/documentService.ts"
  "backend/src/services/embeddingService.ts"
  "backend/src/services/prompts.service.ts"
  "backend/src/services/searchService.ts"
  "backend/src/services/usage.service.ts"
  "backend/src/app.ts"
  "backend/src/application/services/analytics.service.ts"
  "backend/src/chatbot/calling-functions/CreateOrder.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Check if logger import already exists
    if ! grep -q "import.*logger" "$file"; then
      # Add logger import after the first import statement
      sed -i '' '1,/^import/{
        /^import/{
          a\
import logger from "../utils/logger"
          :n
        }
      }' "$file"
      
      # If the above didn't work, try a different approach
      if ! grep -q "import.*logger" "$file"; then
        # Add at the top of the file
        sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
      fi
    fi
  fi
done

echo "✅ Logger imports added!"
