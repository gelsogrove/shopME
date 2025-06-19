#!/bin/bash

# ShopMefy - Restart All Services Script (macOS Compatible)

echo "🚀 ShopMefy - Restart All Services"

# Step 1: Kill processes on ports
echo "🛑 Stopping processes on ports..."
echo "   Killing port 3000..."
npx kill-port 3000 >/dev/null 2>&1 && echo "Process on port 3000 killed" || echo "Could not kill process on port 3000. No process running on port."

echo "   Killing port 3001..."
npx kill-port 3001 >/dev/null 2>&1 && echo "Process on port 3001 killed" || echo "Could not kill process on port 3001. No process running on port."

echo "   Killing port 5434..."
npx kill-port 5434 >/dev/null 2>&1 && echo "Process on port 5434 killed" || echo "Could not kill process on port 5434. No process running on port."

echo "   Killing port 5432..."
npx kill-port 5432 >/dev/null 2>&1 && echo "Process on port 5432 killed" || echo "Could not kill process on port 5432. No process running on port."

echo "   Killing port 5678..."
npx kill-port 5678 >/dev/null 2>&1 && echo "Process on port 5678 killed" || echo "Could not kill process on port 5678. No process running on port."

echo "🔥 Killing all Node.js processes..."
pkill -f "ts-node-dev" >/dev/null 2>&1 && echo "ts-node-dev processes killed" || echo "No ts-node-dev processes running"
pkill -f "tsnd" >/dev/null 2>&1 && echo "tsnd processes killed" || echo "No tsnd processes running"
pkill -f "npm.*dev" >/dev/null 2>&1 && echo "npm dev processes killed" || echo "No npm dev processes running"
pkill -f "vite" >/dev/null 2>&1 && echo "vite processes killed" || echo "No vite processes running"
echo "✅ All processes cleaned up"

# Step 2: Check Docker
echo "🐳 Checking Docker..."
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "   Starting Docker Desktop..."
    open -a Docker
    echo "   Please wait 30-60 seconds for Docker to start, then run this script again"
    exit 1
fi
echo "✅ Docker is running"

# Step 3: Stop Docker containers and clean up
echo "🛑 Stopping Docker containers..."
docker compose down >/dev/null 2>&1 || true
docker compose -f docker-compose-n8n.yml down >/dev/null 2>&1 || true

# Clean up other containers that might conflict
echo "🧹 Cleaning up conflicting containers..."
docker stop shopmefy-db-db-1 >/dev/null 2>&1 || true
docker rm shopmefy-db-db-1 >/dev/null 2>&1 || true
docker stop ai4devs-monitoring-db-1 >/dev/null 2>&1 || true
docker rm ai4devs-monitoring-db-1 >/dev/null 2>&1 || true
docker stop shopme_n8n >/dev/null 2>&1 || true
docker rm shopme_n8n >/dev/null 2>&1 || true
docker stop shopme_n8n_auto >/dev/null 2>&1 || true
docker rm shopme_n8n_auto >/dev/null 2>&1 || true

# Remove docker volumes for clean start
echo "🗑️  Removing old volumes..."
docker volume rm shop_postgres_data >/dev/null 2>&1 || true

# Step 4: Start PostgreSQL
echo "🗄️ Starting PostgreSQL..."
docker compose up -d
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 15

# Wait for PostgreSQL to be ready
echo "🔍 Checking PostgreSQL connection..."
max_attempts=10
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec shop-db-1 pg_isready -U shopmefy >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
    sleep 3
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  PostgreSQL might not be fully ready, but continuing..."
fi

# Step 5: Setup database
echo "📊 Setting up database..."
cd backend
echo "   Pushing database schema..."
npx prisma db push --force-reset
echo "   Seeding database..."
npm run seed
cd ..

# Step 6: Start N8N
echo "🔄 Starting N8N..."
docker compose -f docker-compose-n8n.yml up -d
echo "   N8N container started"

# Wait for N8N to be ready and configure admin user
echo "   Configuring N8N admin user..."
max_attempts=15
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:5678/rest/login >/dev/null 2>&1; then
        break
    fi
    attempt=$((attempt + 1))
    echo "   Waiting for N8N... attempt $attempt/$max_attempts"
    sleep 2
done

# Setup admin user if not already configured
curl -X POST http://localhost:5678/rest/owner/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@shopme.com",
    "firstName": "Admin",
    "lastName": "ShopMe", 
    "password": "Shopme2024"
  }' >/dev/null 2>&1

echo "   N8N configured with admin user"

# Display service information
echo ""
echo "🎉 Database and N8N are ready!"
echo ""
echo "📊 === SERVICE ACCESS INFORMATION ==="
echo "🌐 Frontend:    http://localhost:3000 (start with: ./scripts/start-frontend.sh)"
echo "🔧 Backend:     http://localhost:3001 (start with: ./scripts/start-backend.sh)"  
echo "🤖 N8N:         http://localhost:5678"
echo ""
echo "🔐 === LOGIN CREDENTIALS ==="
echo "📧 System Login: admin@shopme.com"
echo "🔑 Password:     venezia44"
echo ""
echo "📧 N8N Login:    admin@shopme.com"
echo "🔑 N8N Password: Shopme2024"
echo ""
echo "🚀 Use separate terminals to start backend and frontend:"
echo "   Terminal 1: ./scripts/start-backend.sh"
echo "   Terminal 2: ./scripts/start-frontend.sh" 