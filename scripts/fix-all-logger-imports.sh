#!/bin/bash

echo "🔧 Fixing all missing logger imports..."

# Add logger import to all files that need it
files=(
  "backend/src/repositories/message.repository.ts"
  "backend/src/repositories/offer.repository.ts"
  "backend/src/repositories/product.repository.ts"
  "backend/src/repositories/workspace.repository.ts"
  "backend/src/routes/index.ts"
  "backend/src/services/agent.service.ts"
  "backend/src/services/embeddingService.ts"
  "backend/src/services/prompts.service.ts"
  "backend/src/services/usage.service.ts"
  "backend/src/application/services/analytics.service.ts"
  "backend/src/interfaces/http/controllers/usage.controller.ts"
  "backend/src/interfaces/http/middlewares/n8n-auth.middleware.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove any existing logger imports first
    sed -i '' '/^import.*logger.*from/d' "$file"
    
    # Add logger import at the top
    if [[ "$file" == *"repositories/"* ]]; then
      sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
    elif [[ "$file" == *"routes/"* ]]; then
      sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
    elif [[ "$file" == *"services/"* ]]; then
      sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
    elif [[ "$file" == *"application/services/"* ]]; then
      sed -i '' '1i\
import logger from "../../utils/logger"
' "$file"
    elif [[ "$file" == *"interfaces/http/"* ]]; then
      sed -i '' '1i\
import logger from "../../../utils/logger"
' "$file"
    else
      sed -i '' '1i\
import logger from "../utils/logger"
' "$file"
    fi
  fi
done

echo "✅ All logger imports fixed!"
