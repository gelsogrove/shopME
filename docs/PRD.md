# ShopMe - WhatsApp E-commerce Platform PRD

## Table of Contents
- [Introduction](#introduction)
  - [Short Description](#short-description)
  - [Business Model](#business-model)
  - [Message Processing Flow](#message-processing-flow)
- [UI Screenshots](#ui-screenshots)
- [Dialog Examples](#dialog-examples)
  - [User Registration](#registro-de-nuevo-usuario)
  - [Product Discovery and Purchase](#descubrimiento-y-compra-de-productos)
- [Main Features](#main-features)
  - [Dashboard Overview](#dashboard-overview)
  - [Push Notification System](#push-notification-system)
  - [Products Catalog Management](#products-catalog-management)
  - [Agent Configuration Tools](#agent-configuration-tools)
  - [Documents Management](#documents-management)
- [Technical Architecture](#technical-architecture)
  - [Architecture Diagram](#architecture-diagram)
  - [C4 Model](#c4-model)
  - [Frontend Architecture](#frontend-architecture)
  - [Backend Architecture](#backend-architecture)
  - [Database and Prisma ORM](#database-and-prisma-orm)
  - [Data Model](#data-model)
  - [Folder Structure](#folder-structure)
  - [AI and Function Call Documentation](#ai-and-function-call-documentation)
  - [AI Configuration Options](#ai-configuration-options)
  - [Authentication and Token Management](#authentication-and-token-management)
  - [API Rate Limiting Implementation](#api-rate-limiting-implementation)
  - [API Endpoints](#api-endpoints)
  - [Security Implementation (OWASP)](#security-implementation-owasp)
  - [Testing Strategy](#testing-strategy)
- [Subscription Plans](#subscription-plans)
- [Development Roadmap](#development-roadmap)
- [Out of Scope Features (MVP)](#out-of-scope-features-mvp)
- [Minimum Marketable Product (MMP)](#minimum-marketable-product-mmp)

## INTRODUCTION

### Short Description
ShopMe is a multilingual SaaS platform (Italian, English, Spanish) that turns WhatsApp into a complete sales channel. Customers can create smart chatbots, manage products, receive orders, and send invoices to their clients without any technical skills. Our AI technology automates customer-care responses, manages push notifications, and offers a 24/7 conversational shopping experience, all directly in the world's most popular messaging app.

All sensitive operations are handled securely through temporary links with security tokens. These links direct customers to our secure website for registration forms, payments, invoices, and accessing personal data. This keeps all sensitive information outside of chat conversations, ensuring data protection while maintaining a smooth customer experience.

### Load Business Model

```
+-------------------------+-------------------------+-------------------------+-------------------------+-------------------------+
| 1. PROBLEM              | 2. SOLUTION             | 3. UNIQUE VALUE         | 4. UNFAIR ADVANTAGE     | 5. CUSTOMER SEGMENTS    |
|                         |                         |    PROPOSITION          |                         |                         |
+-------------------------+-------------------------+-------------------------+-------------------------+-------------------------+
| • E-commerce and        | • WhatsApp-based        | • Unified commerce and  | • 98% message open      | • Small businesses      |
|   customer service      |   chatbot platform      |   customer care in      |   rate vs 20% email     |   without technical     |
|   are separate systems  |   with AI integration   |   one platform          | • 53% cart abandonment  |   expertise             |
|                         |                         |                         |   reduction             |                         |
| • Technical barriers    | • No-code product and   | • Secure token-based    | • Cross-industry        | • Mid-sized retailers   |
|   for WhatsApp          |   catalog management    |   system for sensitive  |   versatility without   |   seeking omnichannel   |
|   commerce integration  |                         |   operations            |   reconfiguration       |   solutions             |
|                         |                         |                         |                         |                         |
| • Limited personalization| • Multi-industry       | • 42% higher conversion | • Unified platform vs   | • Food/grocery          |
|   in traditional        |   adaptability without  |   rate vs traditional   |   competitors' fragmented|  businesses with       |
|   e-commerce            |   reconfiguration       |   websites              |   solutions             |   perishable inventory  |
|                         |                         |                         |                         |                         |
| • Lost sales from       | • AI-powered            | • 67% faster response   | • Customizable platform | • Hospitality businesses|
|   abandoned carts and   |   conversation and      |   time and 3.2x higher  |   for industry-specific |   requiring booking     |
|   unanswered queries    |   engagement            |   customer retention    |   compliance needs      |   and follow-up         |
+-------------------------+-------------------------+-------------------------+-------------------------+-------------------------+
| 6. KEY METRICS                                    | 7. CHANNELS                                                                |
|                                                   |                                                                            |
| • Conversion rate (42% higher than traditional)   | • Direct enterprise sales team                                             |
| • Customer response time (67% reduction)          | • Partner network of e-commerce consultants                                |
| • Average order value (28% increase)              | • WhatsApp Business Platform                                               |
| • Cart abandonment (53% decrease)                 | • Digital marketing (content, webinars, demos)                             |
| • Customer retention (3.2x higher)                | • Free trial program with guided onboarding                                |
+---------------------------------------------------+----------------------------------------------------------------------------+
| 8. COST STRUCTURE                                 | 9. REVENUE STREAMS                                                         |
|                                                   |                                                                            |
| • Development team                                | • Tiered subscription model:                                               |
| • AI/ML model costs                               |   - Free Trial (€0 for 14 days): Single WhatsApp line, unlimited products |
| • WhatsApp Business API fees                      |   - Basic Plan (€49/month): Single WhatsApp line, unlimited products       |
| • Cloud infrastructure                            |   - Professional Plan (€149/month): 3 numbers, unlimited products          |
| • Customer success team                           |   - Enterprise Plan (custom): Unlimited connections                        |
| • Sales & marketing                               | • Implementation and customization services                                |
|                                                   | • API access fees for third-party integrations                             |
+---------------------------------------------------+----------------------------------------------------------------------------+
```

### WhatsApp Chatbot Flow - Complete Documentation

The ShopMe platform implements an intelligent conversational flow that handles new and registered users with comprehensive security controls, blacklist management, and RAG (Retrieval-Augmented Generation) integration for contextual responses based on uploaded documents.

#### Complete Message Processing Flow

## 📊 SCHEMA ASCII DEL FLOW

```
📱 MESSAGGIO WHATSAPP
         |
         v
    ┌─────────────────┐
    │ CANALE ATTIVO?  │ ──NO──> ❌ STOP DIALOGO
    │ (isActive)      │
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ CHATBOT ATTIVO? │ ──NO──> 👨‍💼 CONTROLLO OPERATORE
    │ (activeChatbot) │         (salva msg, no AI response)
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ USER BLACKLIST? │ ──YES─> ❌ BLOCCA CONVERSAZIONE
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ CANALE IN WIP?  │ ──YES─> ⚠️ MESSAGGIO WIP
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ NUOVO UTENTE?   │
    └─────────────────┘
         |              |
       YES|              |NO
         v              v
    ┌─────────────┐  ┌─────────────────┐
    │ SALUTO?     │  │ >2 ORE ULTIMA   │ ──YES─> 👋 BENTORNATO {NOME}
    │ Ciao/Hello  │  │ CONVERSAZIONE?  │
    └─────────────┘  └─────────────────┘
         |YES              |NO
         v                 v
    ┌─────────────┐  ┌─────────────────┐
    │ 🎉 WELCOME  │  │ 🤖 CHAT LIBERA  │
    │ + REG LINK  │  │ UTENTE + RAG    │
    └─────────────┘  └─────────────────┘
         |                 
         v                 
    ┌─────────────┐   
    │ 🔗 TOKEN +  │   
    │ REGISTRA    │          
    └─────────────┘   
         |                 
         v                 
    ┌─────────────┐   
    │ 🤖 CHAT     │   
    │ LIBERA RAG  │  
    └─────────────┘   
```

## 🔑 LEGENDA
- ❌ = STOP/BLOCCO
- 👨‍💼 = CONTROLLO OPERATORE
- ⚠️ = MESSAGGIO AUTOMATICO
- 🎉 = MESSAGGIO BENVENUTO
- 🤖 = ELABORAZIONE AI/RAG
- 🔗 = LINK CON TOKEN
- 🛒 = FINALIZZAZIONE ORDINE/CHECKOUT
- 💬 = CONVERSAZIONE NORMALE

#### System Architecture Components

**1. WhatsApp Webhook Handler** (`whatsapp.controller.ts`)
- Receives messages from Meta API
- Validates webhook with verification token
- Handles both GET (verification) and POST (messages)

**2. Message Service** (`message.service.ts`)
- Main flow orchestrator
- Manages business logic for messages
- Integrates all security controls

**3. Function Handler Service** (`function-handler.service.ts`)
- Intelligent function router
- Handles specific function calls
- RAG integration for document search

**4. Token Service** (`token.service.ts`)
- Secure registration token management
- Token validation and expiration
- Prevents token reuse

**5. Document Management Services**
- **`embeddingService.ts`**: Shared service for chunking, embedding generation, and similarity calculation
- **`documentService.ts`**: PDF upload and processing management (uses shared EmbeddingService)
- **`searchService.ts`**: Unified multi-source RAG search across Documents, FAQs, and Services
- Integration with OpenRouter for embedding generation

#### Security Controls

**1. Blacklist Management**
```typescript
// Check in customer.isBlacklisted and workspace.blocklist
const isBlacklisted = await this.messageRepository.isCustomerBlacklisted(
  phoneNumber, 
  workspaceId
)
```

**Implementation:**
- `isBlacklisted` field in Customer model
- `blocklist` list in Workspace model (newline-separated numbers)
- Dual control: customer-level and workspace-level

**2. Registration Tokens**
```typescript
// Generate secure token with expiration
const token = await this.tokenService.createRegistrationToken(
  phoneNumber, 
  workspaceId
)
```

**Features:**
- Cryptographically secure tokens (crypto.randomBytes)
- 1-hour expiration
- Single use (marked as used after registration)
- Phone + workspace validation

**3. Channel WIP Status**
```typescript
if (!workspaceSettings.isActive) {
  return wipMessages[userLang] || wipMessages["en"]
}
```

**4. Spam Detection Service**

**Overview**
The system implements a dedicated spam detection service that automatically identifies and blocks abusive behavior patterns. This service operates as a separate layer in the message processing pipeline to ensure system stability and prevent resource abuse.

**Service Architecture**
```typescript
// Future implementation: Dedicated SpamDetectionService
class SpamDetectionService {
  async checkSpamBehavior(phoneNumber: string, workspaceId: string): Promise<SpamCheckResult>
  async addToAutoBlacklist(phoneNumber: string, workspaceId: string, reason: string): Promise<void>
  async getSpamStatistics(workspaceId: string): Promise<SpamStats>
  async removeFromBlacklist(phoneNumber: string, workspaceId: string): Promise<void>
}
```

**Current Implementation (MessageService Integration)**
```typescript
// Spam check: 10 messages in 30 seconds
const spamCheck = await this.checkSpamBehavior(phoneNumber, workspaceId)
if (spamCheck.isSpam) {
  await this.addToAutoBlacklist(phoneNumber, workspaceId, 'AUTO_SPAM')
  return null // Block immediately
}
```

**Detection Algorithm:**
- **Threshold**: 10 messages in 30-second sliding window
- **Scope**: Per phone number per workspace
- **Message Type**: Only INBOUND messages (user messages, not bot responses)
- **Time Window**: Sliding 30-second window (not fixed intervals)

**Auto-Blacklist Implementation:**
- **Dual Blocking**: Customer-level (`isBlacklisted = true`) + Workspace-level (`blocklist` field)
- **Immediate Effect**: No response sent when spam detected
- **Duration**: Unlimited (manual admin unlock only)
- **Audit Trail**: Comprehensive logging for compliance and debugging

**Future Service Enhancements:**
- **Rate Limiting**: API call limits per workspace
- **Pattern Recognition**: Advanced spam pattern detection
- **Whitelist Management**: Trusted phone number management
- **Analytics Dashboard**: Spam detection statistics and trends
- **Configurable Thresholds**: Per-workspace spam detection settings
- **Appeal Process**: Customer appeal and review workflow

**Integration Points:**
- **Message Flow**: Integrated before blacklist check in message processing
- **Admin Interface**: Manual blacklist management in customer admin panel
- **Monitoring**: Real-time spam detection alerts and notifications
- **Reporting**: Spam detection reports for workspace administrators

**5. Operator Manual Control (activeChatbot)**
```typescript
// Check if operator has taken manual control
if (customer && !customer.activeChatbot) {
  // Save message but don't generate bot response
  await this.messageRepository.saveMessage({
    workspaceId,
    phoneNumber,
    message,
    response: "",
    agentSelected: "Manual Operator Control",
  })
  return "" // No bot response
}
```

**Manual Control Implementation:**
- **Field**: `activeChatbot` boolean in Customer model (default: true)
- **Control**: Operators can disable chatbot via Chat History interface
- **Behavior**: When disabled, bot saves messages but doesn't respond
- **UI Indicator**: Bot icon changes color (green=auto, gray=manual)
- **Toggle**: Real-time switch in chat interface with confirmation dialog

#### Multilingual Management

**Language Detection**
```typescript
const greetingLang = this.detectGreeting(message)
// Supports: it, en, es, pt
```

**Configurable Messages**
- **Welcome Messages**: Configured per workspace in 4 languages
- **WIP Messages**: Multilingual maintenance messages
- **Fallback**: English as default language

#### RAG Integration (Retrieval-Augmented Generation)

**1. Document Processing Pipeline**
```typescript
// Upload → Extract Text → Chunk → Generate Embeddings
await documentService.processDocument(documentId)
```

**Phases:**
1. **Upload**: PDF saved to `/uploads/documents/`
2. **Text Extraction**: Text extraction with pdf-parse
3. **Chunking**: Division into 1000-character chunks (100 overlap)
4. **Embeddings**: Generation with text-embedding-ada-002 (OpenRouter)
5. **Storage**: Embedding storage in PostgreSQL (JSONB)

**2. Semantic Search**
```typescript
const searchResults = await documentService.searchDocuments(
  query, 
  workspaceId, 
  limit
)
```

**Algorithm:**
- User query embedding generation
- Cosine similarity calculation with existing chunks
- Relevance sorting
- Top-K results return

**3. Context Enrichment**
```typescript
// Context enrichment for LLM
const enrichedContext = {
  userMessage: message,
  documentContext: searchResults,
  chatHistory: previousMessages
}
```

#### Function Calling System

**Intelligent Router**
The system uses an LLM to determine which function to call:

```markdown
# Available Functions:
1. get_product_info(product_name)
2. get_service_info(service_name) 
3. welcome_user()
4. create_order()
5. get_cart_info()
6. add_to_cart(product_name, quantity)
7. search_documents(query) # RAG Integration
```

**Two-Phase Workflow**
1. **First LLM**: Determines target function
2. **Second LLM**: Formats final response with context

#### User State Management

**New User**
```typescript
if (!customer) {
  if (!greetingLang) {
    return null // Don't respond to non-greetings
  }
  // Send welcome message with registration link
}
```

**Registered User**
```typescript
if (customer) {
  // Check last activity
  if (lastActivity > 2hours) {
    sendWelcomeBack(customer.name)
  }
  // Process message normally
}
```

#### Database Schema

**Main Tables**
```sql
-- Customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  phone TEXT,
  name TEXT,
  isBlacklisted BOOLEAN DEFAULT false,
  workspaceId TEXT,
  language TEXT,
  -- ... other fields
);

-- Registration Tokens
CREATE TABLE registration_tokens (
  token TEXT PRIMARY KEY,
  phoneNumber TEXT,
  workspaceId TEXT,
  expiresAt TIMESTAMP,
  usedAt TIMESTAMP
);

-- Documents & Chunks for RAG
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  filename TEXT,
  status DocumentStatus,
  workspaceId TEXT
);

CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  documentId TEXT,
  content TEXT,
  embedding JSONB -- Number array for similarity search
);
```

#### Environment Configuration

**Required Variables**
```env
# WhatsApp
WHATSAPP_VERIFY_TOKEN=your-verify-token
WHATSAPP_ACCESS_TOKEN=your-access-token

# OpenRouter for embeddings
OPENROUTER_API_KEY=your-openrouter-key

# Database
DATABASE_URL=postgresql://...

# Frontend for registration links
FRONTEND_URL=https://your-domain.com
```

#### Confirmed Specifications

**1. Blacklist Management**
- ✅ **Population**: `blocklist` field in workspace Settings (manual) + auto-blacklist for spam
- ✅ **Auto-blacklist**: 10 messages in 30 seconds → automatic block
- ✅ **Timeout**: Unlimited until manual admin unlock

**2. User Registration**
- ✅ **Minimum data**: Existing registration form (first name, last name, company, phone)
- ✅ **Email verification**: Not implemented (phone only)
- ✅ **GDPR**: Checkbox with text from `http://localhost:3000/gdpr`

**3. RAG and Knowledge Base**
- ✅ **Supported formats**: PDF only
- ✅ **Maximum size**: 5 MB
- ✅ **Embedding updates**: Manual via "Generate Embeddings" button in admin
- ✅ **Query cache**: Not implemented

**4. Performance and Scalability**
- ✅ **Rate limiting**: 100 calls every 10 minutes (anti-attack protection)
- ✅ **Queue system**: Not necessary
- ✅ **CDN**: Not implemented
- ✅ **Database sharding**: Not necessary

**5. Security**
- ✅ **E2E encryption**: Not priority (management via external links)
- ✅ **Audit log**: Not implemented
- ✅ **2FA**: Planned for future releases (not priority)

**6. Business Logic**
- ✅ **Payments**: Planned for future releases
- ✅ **Multi-step orders**: Not priority
- ✅ **Proactive notifications**: Not priority
- ✅ **Analytics**: Existing chat history sufficient

**7. UX and Conversational Design**
- ✅ **Media support**: Not implemented
- ✅ **Quick replies**: Not implemented
- ✅ **Operator handoff**: ✅ **IMPLEMENTED** - Toggle in chat for operator control
- ✅ **Sentiment analysis**: Not priority

#### Development Roadmap

**🚀 Immediate Priority (To Implement)**
1. **Auto-Blacklist Spam Detection**: 10 messages in 30 seconds → automatic block
2. **API Rate Limiting**: 100 calls every 10 minutes for anti-attack protection
3. **GDPR Integration**: Dynamic link to `/gdpr` in registration form

**🎯 High Priority (Future Releases)**
1. **Payment Integration**: Complete checkout via WhatsApp
2. **2FA Security**: Two-factor authentication for critical operations
3. **Enhanced Document Management**: PDF management improvements (5MB limit)

**📈 Medium Priority (Extended Roadmap)**
1. **Multi-channel**: Extension to Telegram, Facebook Messenger
2. **Voice Support**: Voice message handling
3. **AI Training**: Fine-tuning models on specific conversations
4. **Media Support**: Images and audio in chat

**🔮 Low Priority (Future Vision)**
1. **Chatbot Builder**: Drag-and-drop interface for flows
2. **A/B Testing**: Automatic testing of message variants
3. **Integration Hub**: Connectors for external CRM/ERP
4. **Mobile App**: Dedicated app for chatbot management

**🚀 Immediate Priority (Critical Security & Core Features)**
1. **Security Audit & Vulnerability Assessment**: Comprehensive OWASP compliance, JWT enhancement, audit logging
2. **WhatsApp Message Templates & Rich Media**: Advanced messaging with templates, media support, bulk messaging
3. **Temporary Token System**: Secure links for payments, invoices, cart access with comprehensive token management
4. **Ticketing System with Plan-Based Access**: Customer support tickets with operator assignment (Professional+ only)
5. **Plan-Based AI Prompt System**: Dynamic prompts based on subscription tier with upgrade messaging
6. **Auto-Blacklist Spam Detection**: 10 messages in 30 seconds → automatic block
7. **API Rate Limiting**: 100 calls every 10 minutes for anti-attack protection

**🎯 High Priority (Business Features)**
1. **Product Pricing with Discounts**: Customer vs product discount calculation system
2. **Customer Chat History Seeding**: Realistic demo data with conversation flows
3. **Block User Integration**: Add blocked users to workspace phone number blocklist
4. **Landing Page Multi-Language**: Professional homepage with EN/IT/ES support
5. **Enhanced Document Management**: PDF management improvements (5MB limit)

**📈 Medium Priority (Extended Features)**
1. **Database Schema Updates**: Support for new security and ticketing features
2. **Workspace-Specific GDPR**: Per-workspace GDPR text management
3. **Pay-Per-Use Billing System**: Usage-based billing with Stripe integration
4. **Professional Plan Contact Sales**: Lead management and operator assignment

**🔮 Low Priority (Future Vision)**
1. **Multi-Channel WhatsApp**: Multiple WhatsApp numbers per workspace
2. **Performance Optimization**: Monitoring, caching, and scalability improvements
3. **Chatbot Builder**: Drag-and-drop interface for flows
4. **Integration Hub**: Connectors for external CRM/ERP

### Security Implementation (OWASP)

**Current Security Status**:
- ✅ **JWT Authentication**: Implemented with workspace integration
- ✅ **Basic Rate Limiting**: Auth endpoints protected
- ✅ **Input Validation**: Basic Prisma validation
- ✅ **HTTPS Enforcement**: Production environment
- ❌ **Comprehensive Security Audit**: Needed
- ❌ **Advanced Token Management**: Missing refresh tokens, blacklisting
- ❌ **Security Monitoring**: No audit logging or intrusion detection

**Planned Security Enhancements**:

#### 🔐 **Authentication & Authorization**
- **JWT Token Security**: Token rotation, blacklisting, secure storage
- **Session Management**: Timeout controls, concurrent session limits
- **2FA Enhancement**: Backup codes, recovery options
- **Account Lockout**: Progressive delays for failed attempts
- **Password Security**: Strong policies, history tracking

#### 🛡️ **Data Protection**
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Prevention**: Parameterized queries, sanitization
- **XSS Protection**: Content Security Policy, output encoding
- **CSRF Protection**: Anti-CSRF tokens for state changes
- **File Upload Security**: Virus scanning, type validation

#### 🔍 **Security Monitoring**
- **Audit Logging**: All security events (login, data access, changes)
- **Intrusion Detection**: Suspicious pattern monitoring
- **Security Headers**: OWASP recommended headers
- **Vulnerability Scanning**: Regular automated scans
- **Penetration Testing**: External security assessments

#### 📊 **Compliance**
- **GDPR Compliance**: Data processing documentation, consent management
- **Security Policies**: Incident response procedures
- **Risk Assessment**: Security risk documentation
- **Security Training**: Developer awareness programs

### WhatsApp Advanced Messaging System

**Current Messaging Capabilities**:
- ✅ **Basic Message Sending**: Text messages via webhook
- ✅ **Welcome Messages**: Multi-language registration links
- ✅ **WIP Messages**: Maintenance mode notifications
- ❌ **Message Templates**: No template system
- ❌ **Rich Media**: No image/document support
- ❌ **Bulk Messaging**: No broadcast capabilities

**Planned Messaging Enhancements**:

#### 📝 **Template System**
- **Template Library**: Pre-built scenarios (welcome, order confirmation, support)
- **Custom Templates**: Workspace-specific template creation
- **Variable Substitution**: Dynamic content (customer name, order details)
- **Multi-language Templates**: All supported languages (IT, EN, ES, PT)
- **Template Categories**: Marketing, transactional, support organization

#### 🎨 **Rich Message Features**
- **Media Support**: Images, documents, audio via WhatsApp
- **Interactive Buttons**: Quick reply buttons for actions
- **List Messages**: Structured product catalogs, menus
- **Location Sharing**: Business locations, delivery addresses
- **Contact Cards**: Business contact information sharing

#### 📤 **Bulk Messaging**
- **Customer Segmentation**: Targeted group messaging
- **Broadcast Lists**: Marketing campaign management
- **Message Scheduling**: Optimal delivery timing
- **Delivery Tracking**: Status and read receipt monitoring
- **Opt-out Management**: Automatic unsubscribe handling

### Temporary Token Security System

**Current Token Implementation**:
- ✅ **Registration Tokens**: 1-hour expiration, single-use
- ✅ **Token Validation**: Database verification
- ❌ **Multiple Token Types**: Only registration supported
- ❌ **Advanced Security**: No encryption or IP validation
- ❌ **Token Management**: No revocation or cleanup

**Enhanced Token System**:

#### 🔐 **Token Types**
- **Registration Tokens**: Customer registration (enhanced)
- **Payment Tokens**: Secure payment processing
- **Invoice Tokens**: Invoice access and download
- **Cart Tokens**: Guest user cart access
- **Password Reset Tokens**: Account recovery
- **Email Verification Tokens**: Address verification

#### 🛡️ **Security Features**
- **Token Encryption**: Encrypted payloads for sensitive data
- **IP Validation**: Optional IP address verification
- **Device Fingerprinting**: Fraud prevention tracking
- **Rate Limiting**: Token generation abuse prevention
- **Audit Logging**: Complete token lifecycle tracking

#### ⏰ **Lifecycle Management**
- **Configurable Expiration**: Different times per token type
- **Single-Use Tokens**: Automatic invalidation after use
- **Token Rotation**: Extended session support
- **Manual Revocation**: Administrative token invalidation
- **Automatic Cleanup**: Expired token removal

### Ticketing System with Plan-Based Access

**Current Support System**:
- ✅ **Operator Manual Control**: activeChatbot flag for operator takeover
- ✅ **Chat History**: Message storage and retrieval
- ❌ **Formal Ticketing**: No ticket creation or management
- ❌ **Plan-Based Access**: No subscription tier restrictions
- ❌ **Operator Assignment**: No systematic operator management

**Planned Ticketing System**:

#### 🎫 **Ticket Management**
- **Automatic Creation**: Detect customer requests for human support
- **Ticket Categories**: Support, Sales, Technical, Billing
- **Priority Levels**: Low, Medium, High, Urgent
- **Status Tracking**: New, Assigned, In Progress, Waiting, Resolved, Closed
- **SLA Management**: Response time tracking and escalation

#### 📋 **Plan-Based Access**
- **Free Plan**: No ticketing - upgrade messaging only
- **Basic Plan**: No ticketing - upgrade to Professional required
- **Professional Plan**: Full ticketing system access
- **Enterprise Plan**: Priority support with dedicated operators
- **Plan Validation**: Automatic subscription tier checking

#### 👥 **Operator Management**
- **Operator Profiles**: Skill-based operator accounts
- **Workload Balancing**: Even ticket distribution
- **Availability Status**: Online, Busy, Away, Offline
- **Performance Metrics**: Response time, satisfaction scores
- **Escalation Rules**: Automatic ticket escalation

### Plan-Based AI Prompt System

**Current AI Configuration**:
- ✅ **Single Prompt System**: One prompt per workspace
- ✅ **Agent Configuration**: Temperature, tokens, model settings
- ❌ **Plan-Based Prompts**: No subscription tier differentiation
- ❌ **Upgrade Messaging**: No plan upgrade suggestions
- ❌ **Dynamic Loading**: Static prompt configuration

**Enhanced Prompt System**:

#### 🤖 **Plan-Specific Prompts**

**Free Plan Features**:
- Basic product information only
- Frequent upgrade messaging
- No human support access
- Limited order processing

**Basic Plan Features**:
- Full product catalog access
- Standard order processing
- Moderate upgrade messaging
- No human support (upgrade required)

**Professional Plan Features**:
- Advanced AI capabilities
- Human support integration
- Priority response handling
- Advanced analytics mentions

**Enterprise Plan Features**:
- Custom AI personality
- Immediate priority support
- Advanced integrations
- White-label messaging options

#### 🔄 **Dynamic Implementation**
- **Plan Detection**: Automatic workspace plan identification
- **Prompt Loading**: Database-driven prompt selection
- **Real-time Updates**: Immediate prompt changes on plan upgrades
- **Fallback System**: Default prompts for missing configurations
- **Performance Caching**: Optimized prompt loading

#### 📊 **Analytics & Optimization**
- **Conversion Tracking**: Plan upgrades from AI interactions
- **Prompt Performance**: Response quality by plan tier
- **A/B Testing**: Different prompt strategy comparison
- **User Satisfaction**: Plan-based satisfaction tracking

## DIALOG EXAMPLES

### Registro de Nuevo Usuario

**Cliente**: "Hola, me gustaría comprar algunos productos."

**ShopMe**: "¡Hola! Estaré encantado de ayudarle con sus productos. Para ofrecerle la mejor experiencia y poder procesar sus pedidos, necesitamos que se registre primero. 

He creado un enlace de registro seguro para usted: [https://shopme.com/registro/token_u7d9f3a1b5]

Este enlace es personal y caduca en 1 hora por motivos de seguridad."


**ShopMe**: "¡Gracias por registrarse! Su cuenta ha sido creada correctamente. 

Nos complace informarle que valoramos su privacidad y seguridad. Todos sus datos se guardan exclusivamente en nuestra base de datos segura y no se comparten con modelos de IA externos.

¿En qué puedo ayudarle hoy?"

### Descubrimiento y Compra de Productos

**Cliente**: "Hola, estoy buscando productos típicos sicilianos para regalar."

**ShopMe**: "¡Ben regresado Andrea! Estaré encantado de ayudarle a encontrar productos típicos sicilianos para un regalo. Para sugerirle las mejores opciones, ¿podría saber:

**ShopMe**: "Según sus preferencias, aquí tiene dos packs de regalo que podrían interesarle:

1. **Box Sicilia Clásica** (45€)
   - 1 botella de passito de Pantelleria (375ml)
   - 250g de pistachos de Bronte
   - 200g de pasta de almendras
   - 100g de caponata artesanal
   - Caja de regalo con lazo

2. **Degustación Siciliana** (55€)
   - 1 crema de pistacho para untar (200g)
   - 1 pesto de pistacho (180g)
   - 250g de cantucci de almendras
   - 200g de chocolate de Módica a la naranja
   - 1 mermelada de higos chumbos (240g)
   - Caja artesanal de madera

¿Cuál de estas opciones le interesa más?"



**ShopMe**: "La crema de pistacho es un producto versátil y delicioso. Puede utilizarse de varias formas:
- Untada en rebanadas de pan o croissants para un desayuno goloso
- Como relleno para tartas, galletas o pasteles
- Añadida al helado de vainilla para darle un toque de sabor
- Para preparar tiramisú o tarta de queso de pistacho
- Simplemente disfrutada a cucharadas como postre

Está elaborada con pistachos de Bronte DOP (40%), azúcar moreno y aceite de girasol. No contiene conservantes ni colorantes.

¿Desea proceder con la finalización del pedido de la Degustación Siciliana o preferiría ver otras opciones?"

**Cliente**: "Me llevo la Degustación Siciliana. ¿Puede entregarse antes del próximo viernes?"

**ShopMe**: "¡Excelente elección! Sí, podemos garantizar la entrega antes del próximo viernes. El artículo está disponible en almacén y califica para envío exprés gratuito.

¿Quiere proceder con el pedido? Puedo crear el pedido y enviarle un enlace de pago seguro."

**Cliente**: "Sí, gracias."

**ShopMe**: "He creado su pedido para la Degustación Siciliana (55€). Aquí tiene el enlace de pago seguro: [Enlace de Pago]

Una vez completado el pago, recibirá:
1. Un email de confirmación del pedido con la información de seguimiento
2. Actualizaciones sobre la entrega vía WhatsApp
3. Su factura electrónica

La fecha estimada de entrega es el viernes 12 de mayo. ¿Puedo ayudarle con algo más?"

**Cliente**: "Eso es todo, ¡gracias!"

**ShopMe**: "¡Gracias por finalizar su pedido! Apreciamos su confianza. Su orden está siendo procesada y recibirá en breve la información de seguimiento. Si tiene preguntas sobre su pedido o productos, no dude en contactarnos aquí. ¡Le deseo un buen día!"

## MAIN FEATURES

### Dashboard Overview
- Real-time customer activity monitoring
- Sales performance metrics and trends
- Chatbot performance analytics
- Product catalog management
- Customer interaction history
- Order status tracking

### Push Notification System
- Automated order status updates
- Personalized promotions based on user behavior
- Re-engagement campaigns for abandoned carts
- Shipping and delivery notifications
- Custom notification templates

### Products Catalog Management
- Multi-category organization
- Text-based product descriptions (WhatsApp optimized)
- Variant management (size, color, etc.)
- Inventory tracking
- Discount and promotion configuration
- Bulk import/export functionality

**Note**: Product images have been removed from the system to optimize for WhatsApp's text-based interface. The platform now focuses on detailed product descriptions and text-based shopping experiences, which align better with conversational commerce patterns.

### Agent Configuration Tools
- AI behavior customization
- Response tone and style settings
- Product recommendation rules
- Conversation flow design
- Fallback response management
- Custom function configuration

### Documents Management
- PDF document upload and storage (5MB maximum size)
- Automatic text extraction from uploaded documents
- AI-powered document chunking for optimal processing (1000 characters per chunk)
- Vector embedding generation for semantic search using OpenRouter API
- Real-time document search through chatbot conversations
- Document status tracking (uploaded, processing, ready, error)
- Secure document storage with workspace isolation
- Document management interface with drag-and-drop upload
- Integration with RAG (Retrieval-Augmented Generation) system

#### RAG Knowledge Base Integration

The system implements a comprehensive RAG (Retrieval-Augmented Generation) pipeline that searches across three main content types:

**1. Documents (PDF Files)**
- Upload and processing of PDF documents up to 5MB
- Automatic text extraction and chunking (1000 characters per chunk with 100 character overlap)
- Vector embeddings generated using OpenRouter's `text-embedding-3-small` model
- Storage in `document_chunks` table with embedding vectors

**2. FAQ (Frequently Asked Questions)**
- FAQ content stored in `faqs` table
- Each FAQ (question + answer) generates embeddings for semantic search
- Active FAQs only are included in RAG search
- Storage in `faq_chunks` table with embedding vectors

**3. Services Catalog**
- Service descriptions and details stored in `services` table
- Service information (name + description + details) generates embeddings
- Active services only are included in RAG search
- Storage in `service_chunks` table with embedding vectors

#### Service Architecture

The RAG system is built on a modular, scalable architecture:

```typescript
EmbeddingService (shared)
├── splitTextIntoChunks()
├── generateEmbedding()  
└── cosineSimilarity()

DocumentService (refactored)
├── PDF processing
├── Uses EmbeddingService for chunking/embeddings
└── Database operations

SearchService (unified)
├── searchAll() - multi-source search
├── searchDocuments() - documents only
├── searchFAQs() - FAQs only
└── UnifiedSearchResult interface

FAQ Controller
└── Uses EmbeddingService for FAQ embeddings
```

**Benefits**:
- **DRY Principle**: No code duplication across services
- **Scalability**: Easy to add new content types
- **Consistency**: Same embedding algorithms for all content
- **Maintainability**: Changes in one place affect all services

#### Embedding Generation Process

**Manual Embedding Generation**: Each content type (Documents, FAQs, Services) includes a "Generate Embeddings" button in the admin interface that:

1. **Identifies Content to Process**: Finds all active, non-embedded content
2. **Text Preparation**: Combines relevant fields (question+answer for FAQs, name+description for Services)
3. **Chunk Creation**: Splits content into optimal chunks for embedding using shared `EmbeddingService`
4. **API Processing**: Calls OpenRouter API to generate vector embeddings via shared service
5. **Database Storage**: Saves chunks with embeddings to respective `*_chunks` tables
6. **Status Updates**: Updates content status to indicate embedding completion

**Automatic Setup Instructions**: After running the database seed (`npm run seed`), the system automatically displays instructions for generating embeddings:

```bash
📝 EMBEDDING GENERATION INSTRUCTIONS:
   🔧 FAQ Embeddings: POST /api/faqs/generate-embeddings
   📄 Document Embeddings: POST /api/documents/generate-embeddings
   Or use the admin interface buttons on the respective pages.
```

This ensures developers and administrators know exactly how to activate the RAG system after initial setup.

**RAG Search Flow**: When a user asks a question via WhatsApp:

1. **Query Embedding**: User question is converted to vector embedding using shared `EmbeddingService`
2. **Unified Search**: `SearchService` orchestrates search across all content types
3. **Similarity Search**: Cosine similarity calculated against all chunk embeddings using shared algorithms
4. **Multi-Source Results**: Top relevant chunks retrieved from documents, FAQs, and services in unified format
5. **Context Assembly**: Most relevant chunks combined as context for LLM
6. **Response Generation**: LLM generates response using retrieved context + user query

**Technical Implementation**:
- **Shared EmbeddingService**: Centralizes chunking, embedding generation, and similarity calculation
- **Unified SearchService**: Provides consistent API for multi-source search with `UnifiedSearchResult` interface
- **Refactored DocumentService**: Uses shared embedding service, eliminating code duplication
- **Scalable Architecture**: Easy to add new content types (Services, etc.) using same embedding pipeline

This multi-source RAG approach ensures comprehensive knowledge coverage, allowing the chatbot to answer questions using information from uploaded documents, configured FAQs, and service catalog details.


## UI SCREENSHOTS

The platform includes an admin panel where business owners can manage:
- AI Prompts and settings
- Products and categories
- Special offers
- Customer data
- Performance metrics


![Chabnel](./img/channel.png)
![Products](./img/products.png)
![Agent configuration](./img/agentConfiguration.png)
![Chat History](./img/chatHistory.png)




## TECHNICAL ARCHITECTURE

### Architecture Diagram

```mermaid
flowchart TB
        User["Customer via WhatsApp"] 
        Operator["Business Operator"]
    
    subgraph "Frontend"
        React["React + TypeScript\n(Tailwind CSS)"]
    end
    
    subgraph "Backend"
        NodeJS["Node.js Express\nApplication"]
        API["REST API"]
    end
    
    subgraph "Data Layer"
        Prisma["Prisma ORM"]
        DB["PostgreSQL Database"]
    end
    
    subgraph "External Services"
        WhatsApp["WhatsApp Business API"]
        OpenAI["OpenAI / LLM Services"]
        Payment["Payment Gateway"]
    end
    
    User <--> WhatsApp
    WhatsApp <--> NodeJS
    Operator --> React
    React --> API
    API --> NodeJS
    NodeJS --> Prisma
    Prisma --> DB
    NodeJS <--> OpenAI
    NodeJS <--> Payment
    
    classDef frontend fill:#42A5F5,stroke:#1976D2,color:white
    classDef backend fill:#66BB6A,stroke:#388E3C,color:white
    classDef database fill:#AB47BC,stroke:#7B1FA2,color:white
    classDef external fill:#FF7043,stroke:#E64A19,color:white
    classDef user fill:#78909C,stroke:#455A64,color:white

    class React frontend
    class NodeJS,API backend
    class Prisma,DB database
    class WhatsApp,OpenAI,Payment external
    class User,Operator user
```

### C4 Model

#### System Context Diagram

```mermaid
C4Context
    title System Context Diagram for ShopMe Platform

    Person(customer, "Customer", "A person who wants to purchase products via WhatsApp")
    Person(businessOwner, "Business Owner", "Owner of the business using ShopMe")
    Person(businessStaff, "Staff Member", "Staff handling customer inquiries")
    
    System(shopMe, "ShopMe Platform", "Enables businesses to sell products and provide customer service via WhatsApp")
    
    System_Ext(whatsApp, "WhatsApp", "Messaging platform used for customer communication")
    System_Ext(paymentGateway, "Payment Gateway", "Processes customer payments")
    System_Ext(aiServices, "AI Services", "Provides natural language processing and generation")
    
    Rel(customer, whatsApp, "Sends messages, browses products, makes purchases")
    Rel(whatsApp, shopMe, "Forwards customer messages")
    Rel(shopMe, whatsApp, "Sends responses, product info, payment links")
    Rel(shopMe, paymentGateway, "Processes payments")
    Rel(shopMe, aiServices, "Uses for message processing")
    Rel(businessOwner, shopMe, "Configures business, manages products")
    Rel(businessStaff, shopMe, "Monitors conversations, handles escalations")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

#### Container Diagram

```mermaid
C4Container
    title Container Diagram for ShopMe Platform
    
    Person(customer, "Customer", "Uses WhatsApp to browse and purchase products")
    Person(businessUser, "Business User", "Manages products, orders, and customer interactions")
    
    System_Boundary(shopMe, "ShopMe Platform") {
        Container(webApp, "Web Application", "React, Next.js", "Provides admin dashboard and management interface")
        Container(apiGateway, "API Gateway", "Express.js", "Handles API requests and orchestrates responses")
        Container(authService, "Auth Service", "Node.js, JWT", "Handles authentication and authorization")
        Container(chatService, "Chat Service", "Node.js", "Processes WhatsApp messages and responses")
        Container(productService, "Product Service", "Node.js", "Manages product catalog and inventory")
        Container(orderService, "Order Service", "Node.js", "Processes orders and payments")
        Container(analyticsService, "Analytics Service", "Node.js", "Tracks customer behavior and business performance")
        ContainerDb(database, "Database", "PostgreSQL", "Stores all persistent data")
        Container(cacheService, "Cache Service", "Redis", "Provides caching for improved performance")
    }
    
    System_Ext(whatsApp, "WhatsApp API", "Messaging platform integration")
    System_Ext(aiService, "AI Service", "OpenAI/LLM", "Provides natural language processing")
    System_Ext(paymentGateway, "Payment Gateway", "Processes payments")
    
    Rel(customer, whatsApp, "Interacts using")
    Rel(businessUser, webApp, "Uses")
    
    Rel(whatsApp, chatService, "Forwards messages to")
    Rel(chatService, apiGateway, "Requests data from")
    Rel(webApp, apiGateway, "Makes API calls to")
    
    Rel(apiGateway, authService, "Validates requests with")
    Rel(apiGateway, productService, "Manages products via")
    Rel(apiGateway, orderService, "Processes orders via")
    Rel(apiGateway, analyticsService, "Records events via")
    
    Rel(authService, database, "Reads/writes user data to")
    Rel(chatService, database, "Reads/writes chat data to")
    Rel(productService, database, "Reads/writes product data to")
    Rel(orderService, database, "Reads/writes order data to")
    Rel(analyticsService, database, "Reads/writes analytics data to")
    
    Rel(chatService, aiService, "Uses for natural language processing")
    Rel(orderService, paymentGateway, "Processes payments via")
    
    Rel(apiGateway, cacheService, "Caches responses in")
    Rel(chatService, cacheService, "Caches conversation context in")
    
    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

### Frontend Architecture

The ShopMe frontend is built with a modern React architecture:

- **Core Technologies**:
  - React 18+ with functional components and hooks
  - TypeScript for type safety and improved developer experience
  - Tailwind CSS for utility-first styling approach
  - Next.js for server-side rendering and optimized performance

- **Key Frontend Components**:
  - Component library with atomic design principles
  - Responsive layouts for all device types
  - Custom hooks for business logic reuse
  - Context API for state management
  - React Query for data fetching and caching
  - Form handling with React Hook Form

- **User Interface Features**:
  - Dark/light mode support
  - Internationalization (i18n) for multiple languages
  - Accessibility compliance (WCAG 2.1 AA)
  - Progressive loading and skeleton screens
  - Custom animations and transitions
  - Interactive data visualizations

### Backend Architecture

The backend follows a Domain-Driven Design (DDD) architecture:

- **Core Technologies**:
  - Node.js with Express framework
  - TypeScript for type safety across the stack
  - Prisma ORM for database access
  - PostgreSQL for data persistence
  - Redis for caching and session management

- **Layer Separation**:
  - **Domain Layer**: Core business entities and rules
  - **Application Layer**: Use cases and application services
  - **Infrastructure Layer**: Technical implementations and external services
  - **Interfaces Layer**: API controllers and routes

- **Key Design Principles**:
  - Business domain at the center of design
  - Clear boundaries between layers
  - Repository pattern for data access
  - Dependency inversion principle

- **Backend Services**:
  - Authentication service with JWT
  - Media handling and storage service
  - Notification service
  - Analytics service
  - External integrations service (WhatsApp, payment providers)
  - Background job processing

### Database and Prisma ORM

- **Primary Database**: PostgreSQL
- **ORM**: Prisma for type-safe database access
- **Migrations**: Prisma Migration for version control
- **Backup Strategy**: Automated daily backups with point-in-time recovery

#### Database Management and Seeding Strategy

**Complete Database Reset Policy**
- When running `npm run seed`, the script performs a complete database reset
- All existing data is deleted before seeding to avoid conflicts and ensure clean state
- This includes: users, workspaces, user-workspace associations, content, and all related data

**Admin User and Workspace Association Requirements**
- Admin user MUST always have a UserWorkspace association
- The admin user should be associated with the main workspace as OWNER
- UserWorkspace table manages the many-to-many relationship between users and workspaces
- Each association includes a role field (OWNER, ADMIN, MEMBER)

**Integration Test Management**
- All integration tests are currently skipped using `describe.skip()` to prevent database conflicts
- After each integration test completion, a complete seed is automatically executed
- This ensures clean state and proper admin user setup for subsequent operations
- Integration tests should only be enabled when the testing infrastructure is fully stable

**Database Schema Key Requirements:**
```typescript
// UserWorkspace Association (MANDATORY for admin)
model UserWorkspace {
  userId      String
  workspaceId String
  role        String  // OWNER, ADMIN, MEMBER

  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@id([userId, workspaceId])
}
```

**Seed Script Behavior:**
1. **Complete Database Cleanup**: Removes ALL data from ALL tables
2. **Admin User Creation**: Creates admin user with credentials from .env
3. **Main Workspace Creation**: Creates the primary workspace with fixed ID
4. **UserWorkspace Association**: MANDATORY association between admin user and main workspace
5. **Content Seeding**: Categories, products, services, FAQs, documents
6. **Verification**: Confirms all associations are properly created

**Error Handling in Seed:**
- Enhanced error logging for UserWorkspace creation
- Verification step to confirm association was created
- Detailed logging of user IDs and workspace IDs
- Proper transaction handling to prevent partial states

### Data Model

```mermaid
erDiagram
    Workspace {
        id UUID PK
        name String
        domain String
        status WorkspaceStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    User {
        id UUID PK
        email String
        name String
        password String
        role UserRole
        workspaceId UUID FK
        status UserStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    Customer {
        id UUID PK
        phone String
        name String
        email String
        workspaceId UUID FK
        isBlocked Boolean
        gdprAccepted Boolean
        createdAt DateTime
        updatedAt DateTime
    }
    
    Product {
        id UUID PK
        name String
        description String
        price Decimal
        images String[]
        sku String
        inventory Int
        workspaceId UUID FK
        categoryId UUID FK
        status ProductStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    // PRICING CALCULATION RULES:
    // When displaying product prices to customers, the system must:
    // 1. Check if customer has a personal discount (Customer.discountValue)
    // 2. Check if product has an active offer discount (Offer.discountValue)
    // 3. Apply the HIGHER of the two discounts (customer wins if equal)
    // 4. Final price = Product.price - (Product.price * max_discount / 100)
    // 5. Never show original price if discount is applied
    
    Category {
        id UUID PK
        name String
        description String
        workspaceId UUID FK
        parentId UUID FK
        status CategoryStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    Order {
        id UUID PK
        customerId UUID FK
        workspaceId UUID FK
        status OrderStatus
        totalAmount Decimal
        paymentStatus PaymentStatus
        paymentMethod PaymentMethod
        createdAt DateTime
        updatedAt DateTime
    }
    
    OrderItem {
        id UUID PK
        orderId UUID FK
        productId UUID FK
        quantity Int
        price Decimal
        createdAt DateTime
        updatedAt DateTime
    }
    
    Conversation {
        id UUID PK
        customerId UUID FK
        workspaceId UUID FK
        status ConversationStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    Message {
        id UUID PK
        conversationId UUID FK
        content String
        role MessageRole
        createdAt DateTime
    }
    
    Setting {
        id UUID PK
        key String
        value JSON
        workspaceId UUID FK
        createdAt DateTime
        updatedAt DateTime
    }
    
    AgentConfig {
        id UUID PK
        workspaceId UUID FK
        model String
        temperature Float
        maxTokens Int
        topP Float
        topK Int
        systemPrompt String
        memoryContext Int
        responseSpeed String
        createdAt DateTime
        updatedAt DateTime
    }
    
    Offer {
        id UUID PK
        name String
        description String
        offerType OfferType
        discountValue Decimal
        startDate DateTime
        endDate DateTime
        workspaceId UUID FK
        status OfferStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    Document {
        id UUID PK
        filename String
        originalName String
        filePath String
        fileSize Int
        mimeType String
        status DocumentStatus
        workspaceId UUID FK
        createdAt DateTime
        updatedAt DateTime
    }
    
    DocumentChunk {
        id UUID PK
        documentId UUID FK
        content Text
        chunkIndex Int
        embedding JSON
        createdAt DateTime
    }
    
    Workspace ||--o{ User : "has"
    Workspace ||--o{ Customer : "has"
    Workspace ||--o{ Product : "has"
    Workspace ||--o{ Category : "has"
    Workspace ||--o{ Order : "has"
    Workspace ||--o{ Conversation : "has"
    Workspace ||--o{ Setting : "has"
    Workspace ||--o{ AgentConfig : "has"
    Workspace ||--o{ Offer : "has"
    Workspace ||--o{ Document : "has"
    
    Category ||--o{ Product : "contains"
    Category ||--o{ Category : "has children"
    
    Customer ||--o{ Order : "places"
    Customer ||--o{ Conversation : "has"
    
    Order ||--o{ OrderItem : "contains"
    OrderItem ||--|| Product : "references"
    
    Conversation ||--o{ Message : "contains"
    
    Document ||--o{ DocumentChunk : "contains"
```

### Folder Structure

#### Backend Structure

```
/backend
  /src
    /domain                # Core business logic
      /entities            # Business models
      /repositories        # Data access interfaces
      /value-objects       # Immutable value objects
    /application           # Application logic
      /services            # Business orchestration
      /use-cases           # Specific features
      /dto                 # Data transfer objects
    /infrastructure        # Technical implementations
      /repositories        # Database access
      /persistence         # ORM configurations
      /external-services   # 3rd party integrations
    /interfaces            # External interfaces
      /http
        /controllers       # Request handlers
        /routes            # API routes
      /websockets          # WebSocket handlers
    /config                # Configuration settings
    /utils                 # Utility functions
  /tests
    /unit                  # Unit tests
    /integration           # Integration tests
    /e2e                   # End-to-end tests
  /prisma                  # Prisma schema and migrations
  /scripts                 # Build and deployment scripts
```

#### Frontend Structure

```
/frontend
  /src
    /components
      /shared              # Reusable components
      /layout              # Layout components
      /forms               # Form components
      /ui                  # UI primitives
    /hooks                 # Custom React hooks
    /pages                 # Page components
    /contexts              # React contexts
    /services              # API services
    /utils                 # Utility functions
    /types                 # TypeScript type definitions
    /styles                # Global styles
    /assets                # Images, fonts, etc.
  /public                  # Static assets
  /tests                   # Frontend tests
```

### AI and Function Call Documentation

The system implements several AI function calls to handle specific operations:

```
+-------------------------+--------------------------------------+----------------+
| FUNCTION NAME           | DESCRIPTION                          | STATUS         |
+-------------------------+--------------------------------------+----------------+
| get_product_info        | Get details about a specific product | Implemented    |
+-------------------------+--------------------------------------+----------------+

+-------------------------+--------------------------------------+----------------+
| get_service_info        | Get details about a specific service | Implemented    |
+-------------------------+--------------------------------------+----------------+
| welcome_user            | Generate welcome message for users   | Implemented    |
+-------------------------+--------------------------------------+----------------+
| create_order            | Create a new order from cart items   | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_cart_info           | Get contents of a user's cart        | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_order_status        | Check status of specific order       | Implemented    |
+-------------------------+--------------------------------------+----------------+
| add_to_cart             | Add product to shopping cart         | Implemented    |
+-------------------------+--------------------------------------+----------------+
| remove_from_cart        | Remove product from shopping cart    | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_product_list        | Get list of available products       | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_products_by_category| Get products filtered by category    | Planned        |
+-------------------------+--------------------------------------+----------------+
| get_categories          | Get list of all product categories   | Planned        |
+-------------------------+--------------------------------------+----------------+
| get_faq_info            | Get information from FAQ database    | Implemented    |
+-------------------------+--------------------------------------+----------------+
| search_documents        | Search through uploaded documents    | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_generic_response    | Handle general conversation/fallback | Implemented    |
+-------------------------+--------------------------------------+----------------+
```

### AI Configuration Options

Under each plan, businesses can customize their AI agent with the following parameters:

| Parameter | Description | Default Value | Available Options |
|-----------|-------------|--------------|-------------------|
| **Model Selection** | AI model used for responses | GPT-3.5-turbo | GPT-4, Claude, Mistral, Llama |
| **Temperature** | Response creativity level | 0.7 | 0.1-1.0 in 0.1 increments |
| **Max Tokens** | Maximum response length | 250 | 50-1000 |
| **Top-P** | Nucleus sampling threshold | 0.95 | 0.5-1.0 |
| **Top-K** | Number of highest probability tokens to consider | 40 | 10-100 |
| **System Prompt** | Base instructions for AI | Basic retail template | Custom templates available |
| **Memory Context** | Number of previous messages to include | 10 | 1-20 |
| **Response Speed** | Balance between quality and speed | Balanced | Fast, Balanced, Quality |

### Authentication and Token Management

Our system uses JWT (JSON Web Token) authentication to keep user accounts secure:

- **Token Types**:
  - Access Token (1 hour validity, HTTP-only cookie)
  - Refresh Token (7 days validity, HTTP-only cookie)

- **Security Measures**:
  - Regular secret key rotation
  - HS256 algorithm for token signing
  - Minimal payload information
  - HTTP header validation
  - Rate limiting on auth endpoints

#### JWT Implementation Status & Security Requirements

**Backend Security (✅ IMPLEMENTED)**:
- JWT middleware active on ALL protected routes
- Token verification includes workspace loading
- Cookie-based authentication with `withCredentials: true`
- User workspace permissions loaded automatically
- Database user validation on each request

**Frontend Security (🚨 CRITICAL IMPLEMENTATION NEEDED)**:
- **MISSING**: Authorization Bearer headers in API calls
- **CURRENT**: Only cookie-based auth (works but incomplete)
- **REQUIRED**: `Authorization: Bearer <token>` header for all API requests
- **REQUIRED**: Token refresh mechanism before expiration
- **REQUIRED**: Automatic re-authentication on 401 responses

**Security Flow**:
```
1. User Login → JWT Token Generated (Backend) ✅
2. Token stored in HTTP-only cookie ✅
3. Frontend API calls include Authorization header ❌ MISSING
4. Backend validates token + loads user workspaces ✅
5. Token refresh before expiration ❌ MISSING
6. Secure logout clears all tokens ❌ PARTIAL
```

**Critical Security Gap**: The frontend currently relies only on cookies for authentication. While functional, this creates inconsistent security patterns and potential vulnerabilities. ALL API calls MUST include `Authorization: Bearer <token>` headers for complete security compliance.

- **Role-Based Access Control**:
  - Admin: Full system access
  - Manager: Workspace management capabilities
  - Agent: Customer service operations
  - Workspace-scoped permissions

### New User Registration and Workspace Management

The platform implements a comprehensive onboarding flow for new users that ensures proper workspace assignment and prevents access errors:

#### New User Registration Flow

**1. Initial Registration**
- Users register through the standard registration form
- Required fields: first name, last name, company, phone number
- GDPR consent checkbox with dynamic text from `/gdpr` endpoint
- Email verification is not required (phone-based registration)

**2. Post-Registration Redirect Logic**
```typescript
// After successful OTP verification
const userWorkspaces = await fetchUserWorkspaces(userId)

if (userWorkspaces.length === 0) {
  // New user with no workspaces - redirect to workspace selection
  navigate('/workspace-selection')
} else {
  // Existing user - redirect to main application
  navigate('/chat')
}
```

**3. Workspace Selection Page**
- New users are automatically redirected to `/workspace-selection`
- Users can either:
  - Create a new workspace (becomes workspace owner)
  - Join an existing workspace (requires invitation)
- Workspace creation includes:
  - Workspace name
  - Business type selection
  - Initial configuration setup

#### Workspace-Dependent Features Protection

**Problem Prevention**
The system prevents the "Workspace ID is required and must be a string" error by implementing workspace validation at multiple levels:

**1. Frontend Route Protection**
```typescript
// In workspace-dependent pages (ChatPage, AgentPage, etc.)
const { workspace, loading } = useWorkspace()

useEffect(() => {
  if (!loading && !workspace?.id) {
    navigate('/workspace-selection')
  }
}, [workspace, loading, navigate])
```

**2. Component-Level Validation**
```typescript
// In WhatsAppChatModal and similar components
const currentWorkspaceId = getWorkspaceId(workspaceId)
const hasValidWorkspace = currentWorkspaceId !== null

// Disable functionality if no workspace
if (!hasValidWorkspace) {
  // Show warning message
  // Disable message sending
  // Redirect to workspace selection
}
```

**3. API Request Validation**
```typescript
// All workspace-dependent API calls include workspace validation
headers: {
  "Content-Type": "application/json",
  "x-workspace-id": workspaceId // Required for workspace-scoped operations
}
```

#### Workspace Context Management

**1. Workspace Hook (`useWorkspace`)**
- Centralized workspace state management
- Automatic workspace loading on app initialization
- Session storage for workspace persistence
- React Query integration for caching

**2. Workspace Configuration (`workspace.config.ts`)**
```typescript
export const getWorkspaceId = (workspaceId?: string): string | null => {
  // Priority order:
  // 1. Provided workspace ID
  // 2. Cached default workspace
  // 3. Environment variable
  // 4. Return null (no hardcoded fallbacks)
}
```

**3. Error Handling**
- Clear error messages when workspace is missing
- Visual indicators in UI (yellow warning boxes)
- Graceful degradation of features
- Automatic redirect to workspace selection

#### User Experience Flow

**New User Journey**
1. User registers → OTP verification → Workspace selection page
2. User creates/joins workspace → Redirected to main application
3. All features now work with proper workspace context

**Existing User Journey**
1. User logs in → Automatic workspace loading → Direct access to application
2. If workspace becomes invalid → Automatic redirect to workspace selection

**Error Prevention**
- No API calls made without valid workspace ID
- UI components show appropriate warnings
- Buttons disabled when workspace unavailable
- Clear messaging about workspace requirement

This comprehensive approach ensures that new users have a smooth onboarding experience while preventing technical errors related to missing workspace context.

### API Rate Limiting Implementation

We protect all API endpoints with smart rate limiting:

- 30 requests per minute per user
- Customizable daily limits per workspace
- Different limits for different endpoint priorities
- Response headers with limit information
- Graceful handling of rate limit exceeded scenarios

### API Endpoints

#### Authentication API

- `POST /api/auth/login`
  - **Description**: Authenticates a user and returns tokens
  - **Body**: `{ email, password }`
  - **Returns**: Access token and refresh token

- `POST /api/auth/refresh`
  - **Description**: Refreshes an expired access token
  - **Body**: (Uses refresh token from HTTP-only cookie)
  - **Returns**: New access token

- `POST /api/auth/logout`
  - **Description**: Invalidates user tokens
  - **Returns**: Success confirmation

#### Workspace API

- `GET /api/workspaces`
  - **Description**: Lists workspaces accessible to the user
  - **Parameters**: `page`, `limit`, `status`
  - **Returns**: Paginated workspace list

- `POST /api/workspaces`
  - **Description**: Creates a new workspace
  - **Body**: Workspace details
  - **Returns**: Created workspace details

- `GET /api/workspaces/:id`
  - **Description**: Gets details of a specific workspace
  - **Returns**: Complete workspace information

#### Products API

- `GET /api/products`
  - **Description**: Lists products
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - Various filters: `category`, `status`, `price_min`, `price_max`
    - Pagination: `page`, `limit`
    - Sorting: `sort_by`, `sort_dir`
  - **Returns**: Paginated product list

- `POST /api/products`
  - **Description**: Creates a new product
  - **Body**: Product details with category and workspace information
  - **Returns**: Created product

- `GET /api/products/:id`
  - **Description**: Gets details of a specific product
  - **Returns**: Complete product information including variants and images

- `PUT /api/products/:id`
  - **Description**: Updates a product
  - **Body**: Fields to update
  - **Returns**: Updated product

- `DELETE /api/products/:id`
  - **Description**: Deletes a product
  - **Returns**: Deletion confirmation

#### Categories API

- `GET /api/categories`
  - **Description**: Lists categories
  - **Parameters**: `workspace_id`, `parent_id`, `status`, `page`, `limit`
  - **Returns**: Paginated category list

- `POST /api/categories`
  - **Description**: Creates a new category
  - **Body**: Category details with parent info
  - **Returns**: Created category

- `GET /api/categories/:id`
  - **Description**: Gets details of a specific category
  - **Returns**: Category information including subcategories and products

#### Customers API

- `GET /api/customers`
  - **Description**: Lists customers
  - **Parameters**: `workspace_id`, various filters, pagination
  - **Returns**: Paginated customer list

- `GET /api/customers/:id`
  - **Description**: Gets customer profile
  - **Returns**: Customer details with order history

- `PUT /api/customers/:id`
  - **Description**: Updates customer information
  - **Body**: Fields to update
  - **Returns**: Updated customer profile

#### Offers API

- `GET /api/offers`
  - **Description**: Retrieves offers and promotions list
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `status` (optional): Filter by active, upcoming, or expired
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: List of offers with details

- `POST /api/offers`
  - **Description**: Creates a new offer
  - **Body**: 
    - `name`: Offer name
    - `description`: Offer description 
    - `offer_type`: Discount type (percentage, fixed, buy_x_get_y)
    - `discount_value`: Value of discount
    - `products`: List of applicable product IDs
    - `categories`: List of applicable category IDs
    - `start_date`: Offer start date
    - `end_date`: Offer end date
    - `min_purchase`: Minimum purchase requirement
    - `usage_limit`: Maximum redemptions allowed
    - `code`: Promo code (optional)
  - **Returns**: Created offer details

- `GET /api/offers/:id`
  - **Description**: Gets details of a specific offer
  - **Parameters**: `id` (required): Offer ID
  - **Returns**: Complete offer details including usage statistics

#### Orders API

- `GET /api/orders`
  - **Description**: Lists orders
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `customer_id` (optional): Filter by customer
    - `status` (optional): Filter by order status
    - `date_from`, `date_to` (optional): Date range filters
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Paginated order list with basic details

- `POST /api/orders`
  - **Description**: Creates a new order
  - **Body**: 
    - `customer_id`: Customer making the order
    - `items`: Array of product IDs with quantities
    - `payment_method`: Payment method to use
    - `shipping_address`: Shipping details (if applicable)
    - `notes`: Additional order notes
  - **Returns**: Created order with payment link

- `GET /api/orders/:id`
  - **Description**: Gets detailed information about an order
  - **Parameters**: `id` (required): Order ID
  - `Returns**: Complete order information including items, payment status, and history

- `PUT /api/orders/:id/status`
  - **Description**: Updates order status
  - **Body**: `status`: New order status
  - **Returns**: Updated order with current status

- `POST /api/orders/:id/refund`
  - **Description**: Initiates a refund for an order
  - **Body**: `amount`: Amount to refund, `reason`: Refund reason
  - **Returns**: Refund confirmation

#### Conversations API

- `GET /api/conversations`
  - **Description**: Lists customer conversations
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `customer_id` (optional): Filter by customer
    - `status` (optional): Filter by conversation status
    - `date_from`, `date_to` (optional): Date range filters
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Paginated conversation list

- `GET /api/conversations/:id`
  - **Description**: Gets details of a specific conversation
  - **Parameters**: `id` (required): Conversation ID
  - **Returns**: Conversation with messages

- `PUT /api/conversations/:id/status`
  - **Description**: Updates conversation status (e.g., open, closed)
  - **Body**: `status`: New conversation status
  - **Returns**: Updated conversation status

- `GET /api/conversations/:id/messages`
  - **Description**: Gets messages from a conversation
  - **Parameters**: 
    - `id` (required): Conversation ID
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Paginated message list

- `POST /api/conversations/:id/messages`
  - **Description**: Adds a message to a conversation
  - **Body**: `content`: Message content, `role`: Sender role
  - **Returns**: Created message

#### Documents API

- `GET /api/documents`
  - **Description**: Lists uploaded documents
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `status` (optional): Filter by document status (uploaded, processing, ready, error)
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Paginated document list with metadata

- `POST /api/documents/upload`
  - **Description**: Uploads a new PDF document
  - **Body**: Multipart form data with PDF file
  - **Returns**: Created document with upload confirmation

- `POST /api/documents/:id/process`
  - **Description**: Processes document for text extraction and embedding generation
  - **Parameters**: `id` (required): Document ID
  - **Returns**: Processing status and job information

- `GET /api/documents/:id`
  - **Description**: Gets details of a specific document
  - **Parameters**: `id` (required): Document ID
  - **Returns**: Complete document information including processing status

- `DELETE /api/documents/:id`
  - **Description**: Deletes a document and its associated chunks
  - **Parameters**: `id` (required): Document ID
  - **Returns**: Deletion confirmation

- `POST /api/documents/search`
  - **Description**: Performs semantic search across document content
  - **Body**: 
    - `query`: Search query text
    - `workspace_id`: Workspace identifier
    - `limit` (optional): Maximum number of results (default: 5)
  - **Returns**: Relevant document chunks with similarity scores

#### Analytics API

- `GET /api/analytics/overview`
  - **Description**: Gets high-level analytics for a workspace
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `period` (optional): Time period (daily, weekly, monthly)
  - **Returns**: Key metrics summary

- `GET /api/analytics/sales`
  - **Description**: Gets sales analytics
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `period` (optional): Time period
    - `group_by` (optional): Grouping (product, category)
  - **Returns**: Sales data for the requested period

- `GET /api/analytics/customers`
  - **Description**: Gets customer analytics
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `period` (optional): Time period
  - **Returns**: Customer metrics (new, returning, average spend)

- `GET /api/analytics/conversations`
  - **Description**: Gets conversation analytics
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `period` (optional): Time period
  - **Returns**: Conversation metrics (volume, response time, satisfaction)

#### Settings API

- `GET /api/settings`
  - **Description**: Gets workspace settings
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: All workspace settings

- `PUT /api/settings`
  - **Description**: Updates workspace settings
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Body**: Object containing settings to update
  - **Returns**: Updated settings
  - **Special Fields**:
    - `blocklist`: Phone Number Blocklist (newline-separated phone numbers)
    - When user clicks "Block User" in chat, phone number is automatically added to this field
    - Blocked users cannot send messages and are filtered out from conversations

- `GET /api/settings/templates`
  - **Description**: Gets message templates
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: Available message templates

- `POST /api/settings/templates`
  - **Description**: Creates a message template
  - **Body**: Template details and content
  - **Returns**: Created template

#### Media API

- `POST /api/media/upload`
  - **Description**: Uploads a media file
  - **Body**: Multipart form with file
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: Uploaded file details with URL

- `GET /api/media`
  - **Description**: Lists media files
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `type` (optional): Filter by media type
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Paginated media list

- `DELETE /api/media/:id`
  - **Description**: Deletes a media file
  - **Parameters**: `id` (required): Media ID
  - **Returns**: Deletion confirmation

#### Agent Configuration API

- `GET /api/agent-config`
  - **Description**: Gets AI agent configuration
  - **Parameters**: `workspace_id`
  - **Returns**: Current AI configuration

- `PUT /api/agent-config`
  - **Description**: Updates AI agent configuration
  - **Body**: Configuration parameters to update
  - **Returns**: Updated configuration

#### WhatsApp Integration API

- `POST /api/whatsapp/webhook`
  - **Description**: Webhook for incoming WhatsApp messages
  - **Body**: Message payload from WhatsApp Business API
  - **Returns**: Acknowledgment of receipt

- `POST /api/whatsapp/send`
  - **Description**: Sends message to a customer via WhatsApp
  - **Body**: Message content, recipient, and options
  - **Returns**: Delivery status

### Security Implementation (OWASP)

The platform follows OWASP security guidelines:
- Input validation and sanitization
- Protection against XSS, CSRF, SQLi
- Secure authentication and authorization
- Data encryption in transit and at rest
- Regular security audits
- 

### Testing Strategy

Comprehensive testing approach:
- Unit tests for domain logic
- Integration tests for services
- End-to-end tests for key flows
- Performance and load testing
- Security and penetration testing

## SUBSCRIPTION PLANS

### Subscription Plans & Pricing (REVISED)

#### 1. **Free Plan** (€0/month) - **STARTER**
**Target**: Piccole attività che vogliono testare il sistema
- ✅ **1 WhatsApp channel**
- ✅ **Up to 100 AI messages/month**
- ✅ **Maximum 5 Products**
- ✅ **Maximum 3 Services**
- ✅ **Basic analytics dashboard**
- ❌ API access (disabled)
- ❌ Advanced analytics (disabled)
- ❌ Push notifications (disabled)
- ❌ Priority support (disabled)
- ❌ Custom AI training (disabled)
- **Support**: Community forum only
- **Response time**: Best effort (no SLA)

#### 2. **Basic Plan** (€59/month + €0.005/message) - **BUSINESS**
**Target**: Piccole/medie imprese con esigenze standard
- ✅ **1 WhatsApp channel**
- ✅ **Up to 1,000 AI messages/month included**
- ✅ **€0.005 per additional message** (0.5 cents per message over limit)
- ✅ **Up to 50 Products** (not unlimited!)
- ✅ **Up to 20 Services**
- ✅ **Basic analytics dashboard**
- ✅ **API access** (limited to 1,000 calls/month)
- ✅ **Real-time billing dashboard**
- ✅ **Monthly usage reports**
- ❌ Advanced analytics (disabled)
- ❌ Push notifications (disabled)
- ❌ Custom AI training (disabled)
- **Support**: Email support
- **Response time**: 48h SLA
- **Billing**: Monthly subscription + pay-per-use overage

#### 3. **Professional Plan** (€149/month) - **ENTERPRISE**
**Target**: Aziende in crescita con esigenze avanzate
**Upgrade Process**: **Contact Sales Form** - Direct operator contact required
- ✅ **Up to 3 WhatsApp channels**
- ✅ **Up to 5,000 AI messages/month**
- ✅ **Unlimited Products and Services**
- ✅ **Advanced analytics and reporting**
- ✅ **Full API access** (unlimited calls)
- ✅ **Push notifications**
- ✅ **Custom AI training**
- ✅ **Priority response time (12h SLA)**
- ✅ **Phone and email support**
- ✅ **White-label options**
- ✅ **Dedicated onboarding session**
- ✅ **Custom configuration setup**
- **Support**: Dedicated support team
- **Sales Process**: Personal consultation with technical specialist

#### 4. **Enterprise Plan** (Custom pricing) - **CORPORATE**
**Target**: Grandi aziende con esigenze specifiche
- ✅ **Unlimited WhatsApp channels**
- ✅ **Custom AI message volume**
- ✅ **Unlimited products/services**
- ✅ **Dedicated response team (4h SLA)**
- ✅ **Full API access with custom limits**
- ✅ **White-label options**
- ✅ **Dedicated account manager**
- ✅ **Custom integrations**
- ✅ **On-premises deployment option**
- ✅ **Custom AI model training**
- **Support**: 24/7 dedicated support

### Plan Comparison Matrix

| Feature | Free | Basic (€59 + overage) | Professional (€149) | Enterprise (Custom) |
|---------|------|-------------|-------------------|-------------------|
| **WhatsApp Channels** | 1 | 1 | 3 | Unlimited |
| **AI Messages/Month** | 100 (hard limit) | 1,000 included + €0.005/extra | 5,000 | Custom |
| **Overage Billing** | ❌ | ✅ Pay-per-use | ❌ (unlimited) | Custom |
| **Products** | 5 | 50 | Unlimited | Unlimited |
| **Services** | 3 | 20 | Unlimited | Unlimited |
| **Analytics** | Basic | Basic + Billing | Advanced | Custom |
| **API Access** | ❌ | Limited | Full | Custom |
| **Billing Dashboard** | ❌ | ✅ Real-time | ✅ Advanced | ✅ Custom |
| **Payment Methods** | ❌ | Credit Card | Multiple | Enterprise |
| **Push Notifications** | ❌ | ❌ | ✅ | ✅ |
| **Custom AI Training** | ❌ | ❌ | ✅ | ✅ |
| **Support** | Community | Email (48h) | Phone+Email (12h) | 24/7 Dedicated |
| **White-label** | ❌ | ❌ | ✅ | ✅ |

### Monetization Strategy

#### Revenue Drivers:
1. **Message Volume**: Primary limitation for scaling
2. **Channel Count**: Multiple WhatsApp numbers for different departments
3. **Product/Service Limits**: Catalog size restrictions
4. **Advanced Features**: Analytics, API, Custom AI
5. **Support Level**: Response time and channel quality

#### Upgrade Triggers:
- **Free → Basic**: When hitting 100 messages/month or need more than 5 products (Self-service upgrade)
- **Basic → Professional**: When overage costs exceed €90/month consistently (Contact Sales Form)
- **Professional → Enterprise**: When need custom integrations or 24/7 support (Enterprise Sales Process)

### Professional Plan Sales Process

#### Contact Sales Form Requirements:
When users click "Upgrade to Professional" they are directed to a contact form instead of immediate upgrade:

**Form Fields Required**:
- Company name and size (employees)
- Current monthly message volume
- Specific needs (multiple channels, API access, custom training)
- Preferred contact method (phone/email)
- Urgency level (immediate, within week, within month)
- Additional requirements or questions

**Sales Response Process**:
- **Immediate**: Automated confirmation email sent
- **Within 2 hours**: Sales operator contacts prospect
- **Within 24 hours**: Technical consultation scheduled
- **Custom proposal**: Tailored pricing and feature package
- **Onboarding**: Dedicated setup and configuration session

**Benefits of Sales-Assisted Upgrade**:
- Personalized feature configuration
- Custom onboarding and training
- Optimized setup for specific business needs
- Direct relationship with account manager
- Potential custom pricing for high-volume users

### Pay-Per-Use Billing System

#### Billing Model Overview:
**Basic Plan**: €59/month base + €0.005 per message over 1,000 monthly limit

#### Real-Time Billing Architecture:

**1. Message Counting System**
- Every AI response increments workspace message counter
- Real-time tracking with Redis for performance
- Daily aggregation to PostgreSQL for billing
- Monthly reset on billing cycle date

**2. Overage Calculation**
```typescript
// Example billing calculation
const basePrice = 59.00; // €59 monthly subscription
const includedMessages = 1000;
const overageRate = 0.005; // €0.005 per message
const actualMessages = 1547;

const overageMessages = Math.max(0, actualMessages - includedMessages);
const overageCost = overageMessages * overageRate;
const totalMonthlyBill = basePrice + overageCost;

// Result: €59 + (547 * €0.005) = €59 + €2.735 = €61.74
```

**3. Billing Dashboard Components**
- **Current Month Usage**: Real-time message count and cost
- **Projected Bill**: Estimated monthly cost based on current usage
- **Usage History**: 12-month usage and billing history
- **Cost Alerts**: Notifications at €10, €25, €50 overage thresholds
- **Usage Analytics**: Peak usage times, message trends

**4. Payment Processing Integration**
- **Stripe Integration**: For credit card processing
- **Monthly Billing Cycle**: Subscription + overage charges
- **Automatic Payment**: Credit card on file
- **Invoice Generation**: PDF invoices with usage breakdown
- **Failed Payment Handling**: Grace period + service suspension

**5. Cost Control Features**
- **Spending Limits**: Set maximum monthly overage (e.g., €50 max)
- **Usage Alerts**: Email/SMS at 80%, 100%, 150% of included messages
- **Auto-Upgrade**: Automatic upgrade to Professional when overage > €90/month
- **Billing Notifications**: Real-time cost updates in dashboard

### Plan Limits Enforcement System

#### Where Limits Are Applied:

**1. WhatsApp Message Processing (`/src/services/whatsapp.service.ts`)**
- Check monthly message count before sending AI response
- Block response if limit exceeded, show upgrade message instead
- Track message count per workspace per month

**2. Product Management (`/src/controllers/products.controller.ts`)**
- Validate product count before creating new product
- Show upgrade popup when limit reached
- Prevent product creation beyond plan limit

**3. Service Management (`/src/controllers/services.controller.ts`)**
- Validate service count before creating new service
- Show upgrade popup when limit reached
- Prevent service creation beyond plan limit

**4. API Endpoints (`/src/middleware/plan-limits.middleware.ts`)**
- Rate limiting based on plan (1,000 calls for Basic, unlimited for Professional)
- Return 429 error with upgrade message when API limit exceeded
- Track API usage per workspace

**5. Frontend Components**
- Products page: Show usage indicator "47/50 products used"
- Services page: Show usage indicator "18/20 services used"
- Dashboard: Show monthly message usage "847/1,000 messages used"
- Settings: Show current plan and usage statistics

#### Popup Trigger Locations:

**Frontend Popup Triggers:**
- **Products Page**: When clicking "Add Product" at limit
- **Services Page**: When clicking "Add Service" at limit
- **Chat Interface**: When monthly message limit reached
- **API Documentation**: When API calls limit reached
- **Dashboard**: Proactive warnings at 80% usage

**Backend Response Modifications:**
- **WhatsApp Webhook**: Return upgrade message instead of AI response
- **API Endpoints**: Return 402 Payment Required with upgrade link
- **CRUD Operations**: Return limit exceeded errors with upgrade CTA

## DEVELOPMENT ROADMAP

### Phase 1: Core Data Management (Months 1-2)
- M1.1 (Week 1-2): Infrastructure and development environment setup
  - Repository and CI/CD configuration
  - Database and Prisma schema setup
  - JWT authentication implementation
- M1.2 (Week 3-4): Base entity CRUD implementation
  - Workspace management API
  - User management API
  - Administrative dashboard UI foundation
- M1.3 (Week 5-6): Products and categories management
  - Complete products/categories API
  - Product catalog management UI
  - Images and media upload system
- M1.4 (Week 7-8): Multi-tenancy and roles
  - Complete multi-workspace implementation
  - Permissions and roles system
  - Load and performance testing

### Phase 2: Communication Platform (Months 3-4)
- M2.1 (Week 1-2): WhatsApp API integration
  - WhatsApp API connection setup
  - Webhook and notifications management
  - Message authentication and validation
- M2.2 (Week 3-4): RAG and LLM implementation
  - OpenAI/LLM integration
  - RAG system for knowledge base
  - Prompt and response testing
- M2.3 (Week 5-6): Conversation flow builder
  - UI for conversational flow creation
  - Template saving and management
  - A/B testing for response effectiveness
- M2.4 (Week 7-8): Communication dashboard
  - Conversation management interface
  - Performance statistics and metrics
  - Customer satisfaction survey system

### Phase 3: Monetization & Notifications (Months 5-6)
- M3.1 (Week 1-2): Payment integration
  - Payment gateway implementation
  - Transaction and billing management
  - Payment tracking UI
- M3.2 (Week 3-4): Push notifications system
  - Push notification architecture
  - Customizable notification templates
  - Scheduler and automation sends
- M3.3 (Week 5-6): Beta testing
  - Beta client onboarding
  - Structured feedback collection
  - Analysis and improvement prioritization
- M3.4 (Week 7-8): Optimization
  - Backend/frontend performance tuning
  - Strategic caching implementation
  - Security hardening and penetration testing

### Phase 4: Marketing & MMP Enhancements (Months 7-8)
- M4.1 (Week 1-2): Marketing tools
  - Automated campaign implementation
  - Advanced customer segmentation
  - A/B testing and optimization
- M4.2 (Week 3-4): Advanced analytics
  - Complete analytics dashboard
  - Customizable reporting
  - Data export and BI tools integration
- M4.3 (Week 5-6): Vertical market adaptations
  - Sector-specific templates (retail, hotel, restaurants)
  - Industry-customized functions
  - Showcase and sector use cases
- M4.4 (Week 7-8): Advanced AI capabilities
  - Sentiment analysis model improvement
  - Predictive system for customer behavior
  - Intelligent product recommendation implementation

### Phase 5: Full Deployment & Quality Assurance (Months 9-10)
- M5.1 (Week 1-2): Complete testing
  - End-to-end testing on all flows
  - Load and stress testing in production
  - Accessibility and compliance verification
- M5.2 (Week 3-4): Performance benchmarking
  - Final database optimization
  - API and frontend latency fine-tuning
  - Cloud resource usage review
- M5.3 (Week 5-6): Security and audit
  - Complete security audit
  - Security improvements implementation
  - GDPR and regulatory compliance verification
- M5.4 (Week 7-8): Go-to-market
  - Documentation finalization
  - Customer support system setup
  - Public launch and marketing plan


## COMPETITIVE ANALYSIS

### Market Overview

The WhatsApp commerce software market is rapidly growing, with several players offering varying degrees of functionality. This analysis compares ShopMe with key competitors to highlight our unique value proposition and competitive advantages.

### Key Competitors

| Platform | Focus | Target Market | Core Strengths |
|----------|-------|---------------|----------------|
| **WATI** | Conversational automation | SMBs | Chatbot automation, CRM integration |
| **Zoko** | WhatsApp catalogs | E-commerce | Shopify integration, catalog browsing |
| **Charles** | Customer retention | Enterprise, Retail | Journey automation, marketing campaigns |
| **Yalo** | Enterprise solutions | Large B2B companies | GenAI conversations, flow builder |
| **SleekFlow** | Omnichannel communication | SMBs, Service businesses | Multi-channel support, inbox management |
| **Oct8ne** | Visual commerce | E-commerce, Retail | Co-browsing, visual chat, product showcasing |
| **Tellephant** | Messaging solution | Marketing agencies, B2C | Template messaging, API integration |
| **360dialog** | WhatsApp Business API | Enterprise, ISVs | API provider, developer-focused solutions |

### ShopMe's Unique Advantages

#### 1. Industry-Leading Message Engagement
- **98% message open rate vs 20% for email marketing**
  - Direct impact on ROI for all communication
  - Significantly higher conversion from notifications
  - Most competitors don't highlight this critical metric
  - Results in measurable 53% reduction in cart abandonment

#### 2. Cross-Industry Versatility Without Reconfiguration
- Seamless adaptation to multiple verticals:
  - Retail: Product catalogs and inventory
  - Hospitality: Room bookings and service requests
  - Restaurants: Menu exploration and reservations
  
- Competitors typically require custom development for each industry

#### 3. Secure Handling of Sensitive Operations
- **Proprietary token-based secure link system**
- All sensitive transactions (payments, registration, personal data) handled outside chat
- Stronger compliance with privacy regulations
- Competitors often handle sensitive data directly in chat conversations
- Customizable platform for industry-specific compliance requirements

#### 4. Unified Platform vs. Fragmented Solutions
- Single integrated system for the entire customer journey:
  - Customer communication
  - Inventory management
  - Order processing
  - Behavioral analysis
  - Personalized notifications
- Eliminates need for 3-4 separate tools and associated integration costs
- Provides comprehensive customer data in one place

### Comparative Metrics

| Metric | ShopMe | Industry Average | Improvement |
|--------|--------|------------------|-------------|
| Conversion rate | +42% | Baseline | Higher than any competitor |
| Response time | -67% | Baseline | Faster customer service |
| Average order value | +28% | Baseline | Better upselling capabilities |
| Cart abandonment | -53% | Baseline | More completed purchases |
| Customer retention | 3.2x | Baseline | Stronger long-term value |

### Comparative Feature Matrix

The following matrix highlights how ShopMe positions itself against key competitors in terms of core functionality:

| Feature | WATI | Zoko | Charles | Yalo | SleekFlow | Oct8ne | Tellephant | 360dialog |
|---------|:----:|:----:|:-------:|:----:|:---------:|:------:|:----------:|:---------:|
| **Conversational AI** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ |
| **Full E-commerce** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| **Push Notifications** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Secure Payments** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| **Cross-industry** | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐ | ⭐ |
| **Visual Commerce** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ |
| **Analytics** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐ |
| **Customization** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Ease of Setup** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Multi-language** | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

*Legend: ⭐ = Basic, ⭐⭐ = Adequate, ⭐⭐⭐ = Good, ⭐⭐⭐⭐ = Very Good, ⭐⭐⭐⭐⭐ = Excellent*

This matrix clearly demonstrates how ShopMe offers a complete and superior solution in most key categories, with particular advantages in full e-commerce, push notifications, secure payments, and cross-industry adaptability.

### Market Positioning

ShopMe is uniquely positioned at the intersection of customer communication and e-commerce functionality, offering a comprehensive solution that eliminates the need for multiple separate tools. Our platform delivers measurable business outcomes with transparent pricing, making enterprise-level WhatsApp commerce accessible to businesses of all sizes.

### Segment-Specific ROI

Here's an estimate of the expected ROI for different market segments, based on industry benchmark data and ShopMe's differential advantages:

#### Retail (Clothing/Accessories)
| Metric | Before ShopMe | With ShopMe | Impact |
|---------|----------------|------------|---------|
| Conversion rate | 2.5% | 3.6% | +44% |
| Average order value | €75 | €96 | +28% |
| Cart abandonment | 70% | 33% | -53% |
| Customer acquisition cost | €22 | €15 | -32% |
| **Estimated first year ROI** | - | - | **+215%** |

#### Restaurants
| Metric | Before ShopMe | With ShopMe | Impact |
|---------|----------------|------------|---------|
| Weekly reservations | 120 | 168 | +40% |
| Average check value | €35 | €42 | +20% |
| Takeaway/delivery orders | 45/week | 78/week | +73% |
| No-show rate | 18% | 7% | -61% |
| **Estimated first year ROI** | - | - | **+185%** |

#### Hotel/Hospitality
| Metric | Before ShopMe | With ShopMe | Impact |
|---------|----------------|------------|---------|
| Direct bookings vs OTA | 25% | 42% | +68% |
| Additional services upselling | €28/guest | €47/guest | +68% |
| Positive reviews | 75% | 89% | +19% |
| Customer Lifetime Value | €240 | €385 | +60% |
| **Estimated first year ROI** | - | - | **+240%** |

The ROI methodology incorporates implementation costs, subscription fees, and training, with an estimated payback period of 4-6 months for all segments.

### Industry-Specific Solutions

ShopMe is designed to easily adapt to different industry verticals without requiring significant reconfiguration or custom development. Here's how the platform perfectly adapts to three key sectors:

#### Hospitality (Hotels)
- **Reservation management:** Confirmation, modifications, and cancellations directly via WhatsApp
- **Virtual concierge:** 24/7 assistance for guest requests (room service, restaurant reservations)
- **Digital check-in:** Simplified check-in process via secure links
- **Post-stay reviews:** Automated feedback collection after departure
- **Seasonal promotions:** Push notifications for last-minute offers and special packages

#### Restaurants
- **Table reservations:** Reservation management with automatic confirmations
- **Digital menu:** Rich presentation of dishes with photos and detailed descriptions
- **Takeaway/delivery orders:** Complete management of take-out orders
- **Loyalty programs:** Points tracking and automatic sending of personalized promotions
- **Special events:** Promotion of themed evenings, tastings, and special menus

Each industry implementation maintains the same basic architecture but uses templates, functions, and conversation flows optimized for the specific needs of the sector, ensuring a consistent and professional user experience.

### Go-to-Market Strategy

ShopMe's launch strategy is designed to maximize adoption and commercial success in target segments:

#### Phase 1: Early Adopters (Months 1-3)
- **Initial target**: 50-75 selected businesses in retail, restaurant, and hospitality sectors
- **Approach**: Direct implementation with assisted onboarding and personalized setup
- **Incentives**: Special "Founding Member" pricing with 3 free months in exchange for testimonials and case studies
- **KPIs**: Net Promoter Score >40, trial-to-paid conversion rate >70%

#### Phase 2: Market Expansion (Months 4-8)
- **Acquisition channels**:
  - Partnerships with e-commerce consultants (20% commission)
  - Targeted digital campaigns for verticals (Facebook/Instagram, LinkedIn)
  - Case study-based webinars and demos (2 per week)
  - Content marketing focused on sector-specific ROI
- **Referral program**: 25% discount for 3 months for both referrer and new customer
- **KPIs**: CAC <€180, Payback period <5 months, monthly churn <2%

#### Phase 3: Scale (Months 9-12)
- **Geographic markets**: Expansion to Italy, Spain, UK with complete localization
- **New vertical segments**: Focus on beauty & wellness
- **Additional channels**:
  - WhatsApp Business app marketplace integration
  - Technology partners (POS, CRM, ERP integrations)
  - Vendor platform marketplace (WooCommerce, Shopify, Magento)
- **KPIs**: MRR growth >15% month/month, 12-month retention >80%

#### Marketing Mix
| Channel | % Budget | Primary Focus | Key Metrics |
|--------|----------|----------------|-----------------|
| SEO/Content | 25% | Educazione mercato, lead gen | Conversione organica, tempo sul sito |
| SEM | 20% | Intent-based acquisition | CPC, tasso conversione |
| Social Media | 15% | Brand awareness, showcase | Engagement, traffico referral |

| Partners/Referrals | 20% | Qualified conversions | CAC, Partner customer LTV |
| PR/Influencers | 5% | Credibility, reach | Menzioni, sentiment |

#### Pricing & Packaging Strategy
- **"Land & Expand" approach**: Accessible entry point with usage-based guided upgrades
- **Specialized vertical plans**: Pre-configured setups for hotels, restaurants, retail
- **Free trial**: 14 days with message limitation (1000) and feature limits
- **Success metrics**: Value-based pricing (% increase in orders/bookings)

The go-to-market strategy integrates with the product development roadmap, ensuring that features required by target segments are available at launch in their respective channels.

## MINIMUM MARKETABLE PRODUCT (MMP)

Features planned for the MMP phase, after the initial MVP release:

### Enhanced Orders Management
- Complete order lifecycle management
- Order fulfillment workflows
- Custom order statuses
- Automated order notifications
- Bulk order processing capabilities

### Advanced Analytics Dashboard
- Customer behavior analysis
- Conversion funnel visualization
- Revenue and sales performance tracking
- Chat quality and sentiment analysis
- Custom report builder with export options

### Full Payment Integration
- Multiple payment gateway integrations
- Saved payment methods for customers
- Subscription and recurring payment handling
- Advanced fraud detection and prevention
- Automated refund processing

### Multi-Agent Collaboration
- Team inbox with shared conversation access
- Agent routing and assignment rules
- Supervisor monitoring and intervention tools
- Agent performance metrics and reporting
- Shift management and availability tracking

### Enhanced AI Capabilities
- Advanced sentiment analysis and emotional intelligence
- Proactive customer outreach based on behavior
- Personalized product recommendations based on preferences
- Automated follow-up sequences for abandoned carts
- A/B testing of different AI prompts and approaches

## DATA MANAGEMENT AND DELETION POLICIES

### Hard Delete Implementation
ShopMe implements a comprehensive **hard delete system** for workspace management to ensure complete data removal and compliance with data protection regulations.

#### Workspace Hard Delete Features
- **Complete cascade deletion**: When a workspace is deleted, ALL related data is permanently removed
- **Transaction-based safety**: Uses database transactions to ensure data integrity during deletion
- **No recovery option**: Hard delete is irreversible - ensures true data removal for privacy compliance
- **Comprehensive scope**: Deletes all related entities including:
  - Products and categories
  - Customers and chat sessions  
  - Services and offers
  - Documents and FAQ chunks
  - Agent configurations and prompts
  - User-workspace relationships
  - WhatsApp settings

#### Implementation Details
```typescript
// Hard delete in cascading order to avoid foreign key constraints
await prisma.$transaction(async (tx) => {
  // 1. Delete dependent data first (chunks, items, etc.)
  // 2. Delete main entities (documents, products, customers)
  // 3. Delete workspace relationships
  // 4. Finally delete workspace itself
})
```

#### Data Protection Compliance
- **GDPR Article 17 (Right to erasure)**: Complete data removal ensures compliance with right to be forgotten
- **Audit trail**: Deletion operations are logged for compliance reporting
- **No soft delete fallbacks**: Prevents accidental data retention
- **Secure token cleanup**: Associated security tokens are also purged

#### Business Justification
- **Storage optimization**: Prevents accumulation of unused data
- **Performance improvement**: Reduces database size and query complexity
- **Cost efficiency**: Lower storage and backup costs
- **Regulatory compliance**: Meets strict data protection requirements
- **User trust**: Demonstrates commitment to data privacy

This implementation ensures that when users delete their workspace, their data is completely and permanently removed from our systems, providing peace of mind and regulatory compliance.
