# ShopMe Project - Product Requirements Document (PRD)

## 🚨 CRITICAL RULE - PRD VERIFICATION MANDATORY

**🚨 REGOLA CRITICA**: Questo PRD è la **FONTE DELLA VERITÀ ASSOLUTA** per il progetto ShopMe. Prima di qualsiasi operazione, devo SEMPRE:

1. **Leggere questo PRD** per verificare i requisiti
2. **Verificare i task** nel memory bank (`docs/memory-bank/tasks.md`)
3. **Bloccare l'operazione** se qualcosa non è chiaro o in dubbio
4. **Chiedere chiarimenti** ad Andrea prima di procedere

**Scala della Verità**: PRD → Test → Codice

## 🎯 Project Overview

ShopMe is a comprehensive e-commerce platform with WhatsApp chatbot integration, designed for multi-business operations (ECOMMERCE, RESTAURANT, CLINIC, RETAIL, SERVICES, GENERIC).

## 🏗️ Architecture

### Core Components

- **Backend**: Node.js + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Chatbot**: OpenRouter + AI function calling
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with workspace isolation

### Business Focus

- **ECOMMERCE**: Product catalog, cart management, checkout
- **Focus**: Single business type for optimal performance

## 🤖 Chatbot Architecture

### ✅ SIMPLIFIED LLM ARCHITECTURE (Updated September 2025)

**🎯 ARCHITETTURA SEMPLIFICATA - STRUTTURA FINALE:**

```
USER INPUT (IT/EN/ES/PT)
→ LLMService (Direct LLM processing with multilingua support)
→ Cloud Functions (Specific actions: tracking, orders, operators)
→ Variable & Link Replacement ({{nameUser}}, [LINK_*_WITH_TOKEN])
→ DIRECT OUTPUT (IT/EN/ES/PT)
```

### ✅ CORE PRINCIPLES:

- **Direct Processing**: LLM handles language detection and response natively
- **Cloud Functions**: Specific actions only when explicitly triggered
- **Variable Replacement**: {{nameUser}}, {{discountUser}}, etc.
- **Link Generation**: Secure temporary links with token authentication
- **No Translation Layer**: LLM processes and responds in user's language
- **Simplified Flow**: Input → Processing → Output (no intermediate steps)

### Function Flow

1. **Direct Processing**: LLM analyzes user input in original language
2. **Intent Recognition**: Cloud Functions triggered for specific actions
3. **LLM Fallback**: If no CF triggered, direct LLM response generation
4. **Variable Replacement**: Replace {{nameUser}}, {{discountUser}}, etc.
5. **Link Generation**: Replace [LINK_*_WITH_TOKEN] with secure URLs
6. **Output**: Natural response in user's original language

### Token Management System

```typescript
// UNIFIED TOKEN SYSTEM - Two types of tokens:

// 1. GENERIC TOKENS (FAQ)
{
  question: "How can I place an order?",
  answer: "You can place your order through this secure link. [LINK_WITH_TOKEN]"
}

// 2. SPECIFIC TOKENS (Database Data)
{
  question: "What categories do you have?",
  answer: "We have the following categories: [LIST_CATEGORIES]"
}

// LLM_Direct replaces ALL tokens BEFORE OpenRouter:
[LINK_WITH_TOKEN] → "https://shopme.com/checkout?token=abc123..."
[LIST_CATEGORIES] → "- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"
[USER_DISCOUNT] → "10%"
```

## 🛒 Cart Management System

### Web-Based Cart Management

- **Strategy**: All cart operations handled via web interface
- **Link Generation**: Via LLM_Direct + FAQ with `[LINK_WITH_TOKEN]`
- **Token System**: Universal tokens valid for 1 hour across all pages
- **User Experience**: Direct links to cart management page with full functionality

```

### Supported Operations
- Add products to cart
- Modify quantities
- Remove products
- View total
- Proceed to checkout

### Technical Implementation
- **Frontend-Database Sync**: All cart operations immediately sync with PostgreSQL database
- **API Endpoints**: RESTful endpoints for cart operations (`POST`, `PUT`, `DELETE`)
- **Real-time Updates**: Frontend refreshes cart data from backend after each operation
- **Data Persistence**: All changes persisted in `cart_items` table with automatic totals calculation
- **Token Validation**: All operations validate secure token before database modifications

## 📱 WhatsApp Chatbot Integration

### Core Functions
- **Product Search**: `getAllProducts()`, `searchProducts()`
- **Category Browsing**: `getAllCategories()`
- **Document Search**: `searchDocuments()`
- **FAQ Support**: `getFaqInfo()`
- **Order Management**: `confirmOrderFromConversation()`
- **Cart Management**: `generateCartLink()`
- **User Info**: `GetUserInfo()`
- **Order History**: `GetOrdersListLink()`
- **Shipment Tracking**: `GetShipmentTrackingLink()`

### Multi-Language Support
- **Languages**: Italian (IT), English (EN), Spanish (ES), Portuguese (PT)
- **Translation**: OpenRouter-based translation service
- **Product Names**: Never translated (kept in original language)
- **Common Phrases**: Translated for better user experience

### 🚨 CRITICAL LANGUAGE HANDLING RULES
- **Language Detection**: `detectLanguageFromMessage()` in DualLLMService
- **Response Language**: LLM_Direct MUST respond in user's original language
- **Language Formatter**: `applyLanguageFormatting()` method handles language conversion
- **Temperature**: 0.0 for deterministic language formatting
- **No Translation Service**: LLM_Direct handles language directly, no separate translation
- **Critical Rule**: NEVER respond in English when user speaks Italian/Spanish/Portuguese

### Function Calling Strategy
- **Semantic Intelligence**: LLM understands intent without regex patterns
- **Context Awareness**: Maintains conversation history and context
- **Smart Routing**: Automatic function selection based on user intent
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🔐 Security & Authentication

### Token System
- **Universal Tokens**: Single token per customer for all operations
- **Expiration**: 1 hour validity
- **Workspace Isolation**: Automatic filtering by workspaceId
- **Secure Generation**: JWT-based with encrypted payload

### Workspace Isolation
- **Database Level**: All queries filtered by workspaceId
- **API Level**: Automatic workspace validation
- **Frontend Level**: Workspace-specific routing and data

## 📊 Data Management

### Product Data
- **Schema**: Products with formato, ProductCode, description, stock, sku
- **Search**: Semantic search with embeddings
- **Categories**: Hierarchical category system
- **Pricing**: Dynamic pricing with workspace-specific rates

### Order Management
- **Order Creation**: From conversation or direct input
- **Status Tracking**: PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- **Payment Integration**: Multiple payment methods
- **Invoice Generation**: PDF invoices with professional layout

### Customer Management
- **Registration**: Phone-based registration with GDPR compliance
- **Profile Management**: Personal information, preferences, language
- **Order History**: Complete order tracking and history
- **Communication**: WhatsApp integration with conversation history

## 🌐 Public Access System

### Public Orders
- **Token-Based Access**: Secure links without login
- **Order History**: Complete order list with filtering
- **Order Details**: Individual order information
- **Document Downloads**: Invoice and DDT PDF downloads

### Public Checkout
- **Token-Based Access**: Secure checkout without registration
- **Cart Management**: Full cart functionality
- **Address Management**: Billing and shipping addresses
- **Payment Processing**: Integrated payment system

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict typing throughout
- **DDD Architecture**: Domain-driven design patterns
- **Error Handling**: Comprehensive error management
- **Logging**: Structured logging with context
- **Testing**: Unit and integration tests

### Database Standards
- **Prisma ORM**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Seeding**: Automated test data generation
- **Backups**: Regular database backups

### API Standards
- **RESTful Design**: Standard HTTP methods and status codes
- **Swagger Documentation**: Complete API documentation
- **Validation**: Input validation and sanitization
- **Rate Limiting**: API rate limiting and abuse prevention

## 🚀 Deployment

### Environment Setup
- **Development**: Local development with Docker
- **Staging**: Pre-production testing environment
- **Production**: Live environment with monitoring

### Monitoring
- **Health Checks**: System health monitoring
- **Performance**: Response time and throughput monitoring
- **Errors**: Error tracking and alerting
- **Logs**: Centralized logging system

## 📋 Testing Strategy

### Test Types
- **Unit Tests**: Individual component testing
- **Integration Tests**: API and database integration
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing

### Test Data
- **Seeding**: Automated test data generation
- **Mocks**: External service mocking
- **Fixtures**: Reusable test data
- **Cleanup**: Test data cleanup after runs

## 🔄 Maintenance

### Regular Tasks
- **Database Maintenance**: Index optimization, cleanup
- **Security Updates**: Dependency updates, security patches
- **Performance Optimization**: Query optimization, caching
- **Monitoring**: System health and performance monitoring

### Documentation
- **API Documentation**: Swagger/OpenAPI specs
- **Code Documentation**: Inline code comments
- **User Guides**: End-user documentation
- **Developer Guides**: Technical documentation

---

## 📝 Version History

- **v1.0**: Initial implementation with basic functionality
- **v2.0**: Multi-business support and enhanced chatbot
- **v3.0**: Web-based cart management and improved UX
- **v4.0**: Current version with streamlined architecture

---

*This PRD is maintained as the single source of truth for the ShopMe project requirements and architecture.*
```
