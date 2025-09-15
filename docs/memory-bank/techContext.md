# 🧠 MEMORY BANK - TECHNICAL CONTEXT

## 📋 **TECHNICAL ARCHITECTURE OVERVIEW**

**Architecture Pattern:** Domain-Driven Design (DDD) with Clean Architecture  
**Deployment:** Docker containers with docker-compose  
**Database:** PostgreSQL with Prisma ORM  
**AI Integration:** OpenRouter API with Two-LLM Architecture  
**Frontend:** React + TypeScript + TailwindCSS  
**Backend:** Node.js + Express + TypeScript  

---

## 🏗️ **SYSTEM ARCHITECTURE**

### 🔧 **Backend Architecture (DDD)**
```
src/
├── domain/                 # Domain Layer (Business Logic)
│   ├── entities/          # Business entities
│   ├── repositories/      # Repository interfaces
│   └── value-objects/     # Value objects
├── application/           # Application Layer (Use Cases)
│   ├── services/         # Application services
│   ├── use-cases/        # Business use cases
│   └── dtos/            # Data Transfer Objects
├── infrastructure/        # Infrastructure Layer
│   └── repositories/     # Repository implementations
├── interfaces/           # Interface Layer
│   ├── http/            # HTTP controllers and routes
│   ├── middlewares/     # Express middlewares
│   └── validations/     # Request validation
└── chatbot/             # AI Chatbot Integration
    └── calling-functions/ # LLM calling functions
```

### ⚛️ **Frontend Architecture**
```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── layout/          # Layout components
│   └── shared/          # Shared components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── services/            # API service functions
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

---

## 🗄️ **DATABASE SCHEMA**

### 📊 **Core Entities**
```sql
-- Workspace Management
workspaces (id, name, businessType, isActive, isDelete, createdAt, updatedAt)
users (id, email, password, role, createdAt, updatedAt)
user_workspaces (userId, workspaceId, role, createdAt)

-- E-commerce
categories (id, workspaceId, name, description, isActive, createdAt, updatedAt)
products (id, workspaceId, categoryId, name, description, price, stock, isActive, createdAt, updatedAt)
services (id, workspaceId, name, description, price, isActive, createdAt, updatedAt)
customers (id, workspaceId, name, email, phone, address, createdAt, updatedAt)
orders (id, workspaceId, customerId, status, total, items, createdAt, updatedAt)

-- AI & Content
faqs (id, workspaceId, question, answer, isActive, createdAt, updatedAt)
documents (id, workspaceId, name, content, type, createdAt, updatedAt)
agent_configs (id, workspaceId, prompt, model, temperature, topP, maxTokens, createdAt, updatedAt)
chats (id, workspaceId, customerId, messages, status, createdAt, updatedAt)

-- Embeddings (for RAG)
product_chunks (id, productId, content, embedding, createdAt)
faq_chunks (id, faqId, content, embedding, createdAt)
document_chunks (id, documentId, content, embedding, createdAt)
service_chunks (id, serviceId, content, embedding, createdAt)
```

### 🔒 **Security & Isolation**
- **Workspace Isolation**: All queries filter by workspaceId
- **Role-based Access**: User roles (OWNER, ADMIN, USER)
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting for security
- **Spam Detection**: Automatic blocking of users sending >30 messages/minute
- **Blacklist Management**: Customer and workspace-level blocking

---

## 🤖 **AI INTEGRATION ARCHITECTURE**

### 🔄 **Two-LLM Architecture**
```
User Input → LLM 1 (RAG Processor) → Structured Data → LLM 2 (Formatter) → Response
```

#### **LLM 1: RAG Processor (Temperature: 0.3)**
- **Purpose**: Analyze and filter raw database results
- **Input**: User query + database search results
- **Output**: Structured JSON with relevant information
- **Function**: `getResponseFromRag()`

#### **LLM 2: Formatter (Temperature: 0.7)**
- **Purpose**: Create conversational responses
- **Input**: Structured data + conversation history + agent config
- **Output**: Natural language response
- **Function**: `formatResponse()`

### 🔍 **RAG Implementation**
- **Embedding Model**: @xenova/transformers (local)
- **Vector Search**: Cosine similarity on embeddings
- **Chunking Strategy**: Semantic chunking for documents
- **Context Window**: Optimized for conversation flow

### 📞 **Calling Functions**
```typescript
// Available calling functions
- getProductsForCustomer()
- getServicesForCustomer()
- getFaqsForCustomer()
- getDocumentsForCustomer()
- confirmOrderFromConversation()
- generateCartLink() // NEW: Web-based cart management
- ContactOperator()
- CreateOrder()
- getOrderStatus()
- getCustomerInfo()
- getBusinessInfo()
```

### 🛒 **Cart Management Architecture**
```typescript
// Web-based cart management with database synchronization
- generateCartLink() // Generates secure cart access token
- CheckoutService.createCheckoutLink() // Creates secure checkout link
- Frontend /checkout page // Web-based cart management interface
- Token-based access // Secure cart access with expiration
- Database synchronization // Real-time sync between frontend and database
- API endpoints: /api/cart/{token}/items (POST, PUT, DELETE)
- refreshCartFromBackend() // Refreshes cart data after operations
```

---

## 🔄 **N8N WORKFLOW INTEGRATION**

### 🏗️ **Workflow Structure**
```
WhatsApp Webhook → LLM Decision → Calling Function → Response → WhatsApp
```

### 🔧 **Key Components**
- **WhatsApp Webhook**: Receives customer messages
- **LLM Decision Node**: Determines which calling function to use
- **Calling Function Nodes**: Execute business logic
- **Response Formatter**: Format responses for WhatsApp
- **Error Handling**: Graceful error management

### 🔐 **Authentication**
- **Backend API Basic Auth**: admin/admin
- **OpenRouter API**: Bearer token authentication
- **WhatsApp Business API**: Bearer token authentication

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### 🐳 **Docker Services**
```yaml
services:
  backend:          # Node.js API server
  frontend:         # React development server
  database:         # PostgreSQL database
  n8n:             # Workflow automation
  redis:           # Caching and sessions
```

### 🔧 **Environment Configuration**
- **Development**: Local development with hot reload
- **Production**: Docker containers with load balancing
- **Environment Variables**: Secure configuration management
- **Database Migrations**: Automated schema updates

---

## 🔒 **SECURITY IMPLEMENTATION**

### 🛡️ **Authentication & Authorization**
- **JWT Tokens**: Secure token-based authentication
- **Workspace Isolation**: Complete data separation
- **Role-based Access**: Granular permission control
- **API Rate Limiting**: Protection against abuse

### 🚨 **Spam Detection System**
```typescript
// SpamDetectionService configuration
- SPAM_THRESHOLD: 30 messages
- TIME_WINDOW_SECONDS: 60 seconds (1 minute)
- Automatic blocking: Users exceeding threshold
- Database integration: Blocked users added to workspace blocklist
- Customer blacklisting: isBlacklisted flag set to true
- Audit logging: All spam events logged for monitoring
```

### 🔐 **Data Protection**
- **GDPR Compliance**: Data privacy and protection
- **Encryption**: Data encryption at rest and in transit
- **Audit Logging**: Complete activity tracking
- **Secure Communication**: HTTPS and encrypted APIs

---

## 📊 **MONITORING & ANALYTICS**

### 📈 **Performance Monitoring**
- **Response Time**: API response time tracking
- **Error Rates**: System error monitoring
- **Usage Metrics**: API call tracking
- **Resource Utilization**: System resource monitoring

### 🔍 **Business Analytics**
- **Sales Analytics**: Revenue and order tracking
- **Customer Analytics**: Customer behavior insights
- **Chat Analytics**: Conversation quality metrics
- **Business Intelligence**: Performance optimization insights

---

## 🧪 **TESTING STRATEGY**

### 🧪 **Test Types**
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user flow testing
- **Performance Tests**: Load and stress testing

### 📁 **Test Structure**
```
__tests__/
├── unit/              # Unit tests
│   ├── controllers/   # Controller tests
│   ├── services/      # Service tests
│   └── utils/         # Utility tests
├── integration/       # Integration tests
│   ├── api/          # API endpoint tests
│   └── database/     # Database integration tests
└── e2e/              # End-to-end tests
```

---

## 🔧 **DEVELOPMENT WORKFLOW**

### 🛠️ **Development Tools**
- **TypeScript**: Type-safe development
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Prisma**: Database ORM and migrations

### 📋 **Development Process**
1. **Feature Development**: Create feature branch
2. **Implementation**: Code implementation with tests
3. **Code Review**: Peer review and approval
4. **Testing**: Automated and manual testing
5. **Deployment**: Staging and production deployment

---

## 🚨 **CRITICAL TECHNICAL CONSTRAINTS**

### 🔒 **Security Requirements**
- **Workspace Isolation**: All queries must filter by workspaceId
- **No Hardcoding**: All configuration from database (except translate and formatter prompts)
- **API Security**: Rate limiting and authentication
- **Data Privacy**: GDPR compliance
- **Token-based Cart Access**: Secure cart management with expiration

### 🏗️ **Architecture Constraints**
- **DDD Pattern**: Follow domain-driven design principles
- **Clean Architecture**: Maintain layer separation
- **Database-Only**: No static fallbacks or hardcoded data
- **Swagger Updates**: Keep API documentation current

### 🎨 **Frontend Constraints**
- **Layout Preservation**: No UI changes without permission
- **Component Reusability**: Use existing UI components
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance

---

## 📚 **TECHNICAL DOCUMENTATION**

### 📖 **API Documentation**
- **Swagger/OpenAPI**: Complete API documentation
- **Postman Collections**: API testing collections
- **Code Comments**: Inline documentation
- **README Files**: Setup and usage instructions

### 🔧 **Development Guides**
- **Setup Guide**: Local development environment
- **Architecture Guide**: System design and patterns
- **Testing Guide**: Testing strategies and practices
- **Deployment Guide**: Production deployment process

---

## 🎯 **PERFORMANCE OPTIMIZATION**

### ⚡ **Backend Optimization**
- **Database Indexing**: Optimized query performance
- **Caching**: Redis caching for frequently accessed data
- **Connection Pooling**: Database connection optimization
- **Async Processing**: Non-blocking operations

### 🚀 **Frontend Optimization**
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed and optimized images
- **Bundle Optimization**: Minimized JavaScript bundles
- **CDN Integration**: Content delivery network

---

## 🔄 **INTEGRATION POINTS**

### 🔗 **External APIs**
- **OpenRouter API**: LLM processing
- **WhatsApp Business API**: Customer communication
- **Payment Gateways**: Payment processing
- **Email Services**: SMTP integration

### 🔧 **Internal Services**
- **N8N Workflows**: Business process automation
- **PDF Generation**: Document and invoice creation
- **File Storage**: Document and image storage
- **Analytics Engine**: Business intelligence processing
