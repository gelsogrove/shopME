# ShopMe - WhatsApp E-commerce Platform

**Transform WhatsApp into your complete sales channel with AI-powered automation**

ShopMe is a multilingual SaaS platform (Italian, English, Spanish) that enables businesses to create intelligent chatbots, manage products, and process orders directly through WhatsApp. Our AI technology automates customer service, manages push notifications, and provides a 24/7 conversational shopping experience.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI4Devs-finalproject
   ```

2. **Start the database**
   ```bash
   docker-compose up -d
   ```

3. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

4. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```



6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api/docs


## 📋 Features

### ✅ Current Features (MVP)
- **Multi-language Support**: Italian, English, Spanish
- **WhatsApp Integration**: Native chatbot with Meta Business API
- **Product Management**: Complete catalog with categories
- **Service Management**: Only 2 core services (Shipping, Gift Package)
- **Customer Management**: Registration and profile handling
- **AI-Powered Responses**: Context-aware conversational AI
- **Document Upload**: PDF processing with RAG integration
- **Security**: Token-based authentication and secure data handling
- **Hard Delete System**: GDPR-compliant complete data removal
- **🚀 N8N Integration**: Visual workflow management for WhatsApp processing

### 🔄 Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   WhatsApp  │────│   Backend   │────│  Database   │
│   Frontend  │    │   Node.js   │    │ PostgreSQL  │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                          │
                   ┌─────────────┐
                   │   AI/RAG    │
                   │ OpenRouter  │
                   └─────────────┘
```

## 🗑️ Hard Delete System

### Overview
ShopMe implements a comprehensive **hard delete system** that permanently removes workspace data in compliance with GDPR Article 17 (Right to erasure).

### What Gets Deleted
When a workspace is deleted, **ALL** related data is permanently removed:
- Products and categories
- Customers and chat sessions  
- Services and offers
- Documents and FAQ chunks
- Agent configurations and prompts
- User-workspace relationships
- WhatsApp settings

### Safety Features
- **Transaction-based**: Ensures data integrity during deletion
- **Cascade ordering**: Deletes dependent data first to avoid conflicts
- **No recovery**: Irreversible operation for true privacy compliance
- **Error handling**: Robust error management with rollback capability

### Testing Hard Delete

Use the provided test script:
```bash
./scripts/test-hard-delete.sh [workspace_id]
```

Or manually verify with database commands:
```bash
# Check workspace exists
docker exec -it shop_db psql -U postgres -d shopmefy -c "SELECT COUNT(*) FROM workspaces WHERE id = 'workspace_id';"

# Check related data
docker exec -it shop_db psql -U postgres -d shopmefy -c "SELECT COUNT(*) FROM products WHERE workspaceId = 'workspace_id';"
```

## 🏗️ Project Structure

```
AI4Devs-finalproject/
├── backend/                    # Node.js API server
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── routes/           # API routes
│   │   └── utils/            # Utility functions
│   ├── prisma/               # Database schema & migrations
│   └── __tests__/            # Test suites
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── hooks/           # Custom hooks
│   └── __test__/            # Frontend tests
├── scripts/                   # Automation scripts
├── docs/                     # Project documentation
└── docker-compose.yml        # Docker services
```

## 🔧 Available Scripts

### Backend Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run test suite
npm run test:unit    # Run unit tests only
npm run test:integration # Run integration tests only
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
npm run generate     # Generate Prisma client
```

### Frontend Scripts
```bash
npm run dev          # Start development server  
npm run build        # Build for production
npm run test         # Run test suite
npm run lint         # Run ESLint
```

### Utility Scripts
```bash
./scripts/test-hard-delete.sh   # Test workspace deletion
```

## 🛠️ Development

### Environment Setup

1. **Backend Environment** (`.env`)
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5434/shopmefy?schema=public"
   PORT=3001
   NODE_ENV=development
   JWT_SECRET="your-super-secret-jwt-key"
   CORS_ORIGIN="http://localhost:3000"
   OPENROUTER_API_KEY="your-openrouter-key"
   ```

2. **Database Setup**
   ```bash
   docker-compose up -d
   cd backend
   npx prisma migrate dev
   npx prisma seed
   ```

### Testing

Run comprehensive test suites:
```bash
# Backend tests
cd backend
npm run test

# Frontend tests  
cd frontend
npm run test

# Test hard delete functionality
./scripts/test-hard-delete.sh cm9hjgq9v00014qk8fsdy4ujv
```

## 🔐 Security & Compliance

### GDPR Compliance
- **Right to erasure**: Hard delete ensures complete data removal
- **Data minimization**: Only 2 essential services in seed data
- **Secure tokens**: All sensitive operations use temporary secure links
- **Audit trails**: Deletion operations are logged for compliance

### Authentication
- JWT-based authentication
- Token expiration and refresh
- Protected API endpoints
- Role-based access control

## 📊 Recent Updates

### v1.2.0 - Hard Delete Implementation
- ✅ Complete workspace hard delete with cascade
- ✅ GDPR Article 17 compliance
- ✅ Transaction-based safety
- ✅ Comprehensive test script
- ✅ Updated documentation (PRD, Swagger)
- ✅ Reduced services to 2 core offerings

### Data Management
- **Services reduced**: From 3 to 2 services (Shipping, Gift Package)
- **Seed optimization**: Streamlined database seeding
- **Performance**: Improved deletion performance with proper ordering

## 📚 Documentation

- **PRD (Product Requirements Document)**: [docs/PRD.md](docs/PRD.md)
- **API Documentation**: http://localhost:3001/api/docs (when running)
- **Database Schema**: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- **Architecture Docs**: [docs/](docs/)

## 🤝 Contributing

1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow TypeScript best practices
5. Ensure GDPR compliance for data operations

## ⚠️ Important Notes

- **Hard delete is irreversible**: Test carefully before using in production
- **Authentication required**: Most API endpoints require valid JWT tokens
- **Database backups**: Always backup before major operations
- **Environment variables**: Never commit `.env` files

## 🆘 Troubleshooting

### Common Issues

1. **Backend not starting**
   ```bash
   # Check if port 3001 is free
   lsof -i :3001
   # Kill process if needed
   kill <PID>
   ```

2. **Database connection issues**
   ```bash
   # Restart Docker containers
   docker-compose down && docker-compose up -d
   ```

3. **Frontend build errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Support

For questions or issues:
1. Check existing documentation
2. Review test cases for examples
3. Use the hard delete test script for validation
4. Verify environment configuration

---

**Built with ❤️ for AI4Devs Final Project** 