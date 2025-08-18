#!/bin/bash

echo "🧹 Removing console.log statements from codebase..."

# Remove console.log from backend TypeScript files
find backend/src -name "*.ts" -type f -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;
find backend/src -name "*.ts" -type f -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;
find backend/src -name "*.ts" -type f -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

# Remove console.log from frontend TypeScript files
find frontend/src -name "*.ts" -type f -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;
find frontend/src -name "*.ts" -type f -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;
find frontend/src -name "*.ts" -type f -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

# Remove console.log from frontend TypeScript React files
find frontend/src -name "*.tsx" -type f -exec sed -i '' 's/console\.log(/logger.info(/g' {} \;
find frontend/src -name "*.tsx" -type f -exec sed -i '' 's/console\.error(/logger.error(/g' {} \;
find frontend/src -name "*.tsx" -type f -exec sed -i '' 's/console\.warn(/logger.warn(/g' {} \;

echo "✅ Console.log statements removed!"
echo "📝 Note: You may need to add logger import statements where needed"
