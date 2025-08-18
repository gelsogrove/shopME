#!/bin/bash

echo "🧹 Cleaning up duplicate logger imports..."

# Remove duplicate logger imports
find backend/src -name "*.ts" -type f -exec sed -i '' '/^import logger from "\.\.\/utils\/logger"$/d' {} \;

# Add single logger import at the top of files that need it
files=(
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
  "backend/src/services/documentService.ts"
  "backend/src/services/searchService.ts"
  "backend/src/chatbot/calling-functions/CreateOrder.ts"
  "backend/src/application/services/analytics.service.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Add logger import at the top if it doesn't exist
    if ! grep -q "import.*logger" "$file"; then
      # Determine the correct path based on file location
      if [[ "$file" == *"controllers/"* ]] || [[ "$file" == *"services/"* ]] || [[ "$file" == *"routes/"* ]] || [[ "$file" == *"middlewares/"* ]]; then
        sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
      elif [[ "$file" == *"interfaces/http/"* ]]; then
        sed -i '' '1i\
import logger from "../../../utils/logger"
' "$file"
      elif [[ "$file" == *"chatbot/calling-functions/"* ]]; then
        sed -i '' '1i\
import logger from "../../utils/logger"
' "$file"
      elif [[ "$file" == *"application/services/"* ]]; then
        sed -i '' '1i\
import logger from "../../utils/logger"
' "$file"
      else
        sed -i '' '1i\
import logger from "./utils/logger"
' "$file"
      fi
    fi
  fi
done

echo "✅ Duplicate imports cleaned up!"
