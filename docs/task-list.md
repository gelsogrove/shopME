# 📋 ShopMe Platform - Task List

## 🎯 Overview
This task list is based on the comprehensive PRD analysis and identifies what has been implemented versus what still needs to be developed for the ShopMe WhatsApp e-commerce platform.

---

## 🟢 COMPLETED FEATURES

### ✅ Core WhatsApp Integration
- WhatsApp webhook handler and message processing
- Multi-language support (IT, EN, ES, PT)
- Customer registration with secure tokens
- Blacklist management (customer-level and workspace-level)
- WIP channel status handling
- Greeting detection and welcome messages

### ✅ Document Management & RAG
- PDF document upload and processing (5MB limit)
- Text extraction and chunking (1000 chars with 100 overlap)
- Vector embedding generation using OpenRouter
- Document search and RAG integration
- Generate Embeddings button for documents

### ✅ Core Business Logic
- Product catalog management with plan limits
- Service management with plan limits
- FAQ management system
- Customer management with blacklist support
- Order processing and cart functionality
- Workspace and plan management

### ✅ Security & Authentication
- JWT authentication with refresh tokens
- Registration token system with expiration
- Basic rate limiting on auth endpoints
- GDPR compliance integration

### ✅ FAQ Embedding System
**Priority**: 🚨 **HIGH**
**Description**: Implement embedding generation for FAQ content to include in RAG search
**Acceptance Criteria**:
- [x] Create `faq_chunks` table in database schema
- [x] Implement FAQ text chunking (question + answer)
- [x] Add "Generate Embeddings" button to FAQ page
- [x] Create FAQ embedding service similar to documents
- [x] Only process active FAQs and FAQs not processed yet 
- [x] quando finito che venga fuori un toast che dice che e' andata a buon fine
- [x] la parte di UI del bottone deve essere uguale a docements stesso colore stessa posizione stesso font 
- [x] hai altre domande ? hai dubbi ? ragiona...usa i tools
- [x] completa il task quando finito 
- [x] mi piacerebbe che fosse condiviso il servizio perche' poi dobbiamo fare la stessa cosa per altre tabelle

**Status**: ✅ **COMPLETED**

**Implementation Details**:
- Created `faq_chunks` table with migration `20250612130640_add_faq_chunks_table`
- Implemented shared `EmbeddingService` class for reusability across different content types
- Added `generateEmbeddings` method to existing FAQ controller
- Added "Generate Embeddings" button to FAQ page with same styling as Documents page
- FAQ content is chunked as "Question: [question]\nAnswer: [answer]" format
- Only processes active FAQs without existing chunks
- Shows success toast when embedding generation completes
- Service can be reused for Services and other content types

**🔧 REFACTORING COMPLETED**:
- [x] **DocumentService Refactored**: Removed duplicate code, now uses shared `EmbeddingService`
- [x] **Shared EmbeddingService**: Centralized chunking, embedding generation, and similarity calculation
- [x] **Unified SearchService**: Created global search service for multi-source RAG (Documents + FAQs)
- [x] **Code Deduplication**: Eliminated ~150 lines of duplicate code from DocumentService
- [x] **Consistent API**: All embedding operations now use the same underlying service
- [x] **Seed Enhancement**: Added automatic embedding generation instructions at end of seed

**📋 SEED IMPROVEMENTS**:
- [x] **Clear Instructions**: Seed now provides detailed instructions for embedding generation
- [x] **Memory Optimization**: Avoids memory issues during seeding by deferring embedding generation
- [x] **API Endpoints Listed**: Shows exact API calls needed for FAQ and Document embeddings
- [x] **Admin UI Reference**: Mentions admin interface buttons for easy manual generation

**📚 DOCUMENTATION UPDATES**:
- [x] **PRD Architecture Section**: Updated to reflect new service architecture (EmbeddingService, SearchService)
- [x] **RAG Implementation Details**: Added technical implementation details with shared services
- [x] **Service Dependency Diagram**: Added TypeScript-style architecture diagram showing service relationships
- [x] **Seed Instructions**: Documented automatic embedding generation instructions display
- [x] **Benefits Documentation**: Added DRY, scalability, and maintainability benefits

---

## 🔴 MISSING FEATURES (TO IMPLEMENT)

### 1. **Spam Detection & Auto-Blacklist System**
**Priority**: 🚨 **HIGH**
**Description**: Implement automatic spam detection that blocks users sending 10+ messages in 30 seconds
**Acceptance Criteria**:
- [ ] Create `checkSpamBehavior()` method in MessageService
- [ ] Implement message frequency tracking per user
- [ ] Auto-add to workspace blacklist when threshold exceeded
- [ ] Add logging for spam detection events
- [ ] Duration: Unlimited (manual admin unlock only)

### 3. **Services Embedding System**
**Priority**: 🚨 **HIGH**
**Description**: Implement embedding generation for Services content to include in RAG search
**Acceptance Criteria**:
- [ ] Create `service_chunks` table in database schema
- [ ] Implement Service text chunking (name + description + details)
- [ ] Add "Generate Embeddings" button to Services page
- [ ] Create Service embedding service similar to documents
- [ ] Integrate Service chunks in RAG search pipeline
- [ ] Only process active Services

### 4. **API Rate Limiting System**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive rate limiting (100 calls per 10 minutes) for anti-attack protection
**Acceptance Criteria**:
- [ ] Create global rate limiting middleware
- [ ] Implement 100 calls per 10 minutes limit
- [ ] Add rate limit headers to responses
- [ ] Create rate limit bypass for admin users
- [ ] Log rate limit violations
- [ ] Return appropriate error messages when limit exceeded

### 5. **Enhanced Multi-Source RAG Integration**
**Priority**: 🔥 **MEDIUM**
**Description**: Integrate all three content sources (Documents, FAQs, Services) in unified RAG search
**Acceptance Criteria**:
- [ ] Modify RAG search to query all three chunk tables
- [ ] Implement weighted scoring across content types
- [ ] Combine results from documents, FAQs, and services
- [ ] Optimize similarity search performance
- [ ] Add content source identification in responses

### 6. **Database Schema Updates**
**Priority**: 🔥 **MEDIUM**
**Description**: Add missing database tables and fields for new features
**Acceptance Criteria**:
- [ ] Create migration for `faq_chunks` table
- [ ] Create migration for `service_chunks` table
- [ ] Add spam tracking fields to customer/message tables
- [ ] Add rate limiting tracking table
- [ ] Update Prisma schema accordingly

### 7. **Admin Interface Enhancements**
**Priority**: 🔥 **MEDIUM**
**Description**: Add missing UI components for new features
**Acceptance Criteria**:
- [ ] Add "Generate Embeddings" button to FAQ page (top-right)
- [ ] Add "Generate Embeddings" button to Services page (top-right)
- [ ] Add spam detection status in customer management
- [ ] Add rate limiting monitoring dashboard
- [ ] Add blacklist management interface improvements

### 8. **Testing Coverage**
**Priority**: 🔥 **MEDIUM**
**Description**: Add comprehensive tests for new features
**Acceptance Criteria**:
- [ ] Unit tests for spam detection logic
- [ ] Integration tests for FAQ embedding system
- [ ] Integration tests for Services embedding system
- [ ] API tests for rate limiting
- [ ] E2E tests for multi-source RAG search

### 9. **Performance Optimizations**
**Priority**: 🟡 **LOW**
**Description**: Optimize system performance for production use
**Acceptance Criteria**:
- [ ] Optimize embedding generation batch processing
- [ ] Add caching for frequent RAG queries
- [ ] Optimize database queries for large datasets
- [ ] Add monitoring and alerting for system health

### 10. **Chat History Management Interface**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive chat history management with operator controls
**Acceptance Criteria**:
- [ ] Add "View Orders" button/link in chat history interface
- [ ] Add "Block User" functionality directly from chat history
- [ ] Add "Disable Chatbot" toggle for operator manual control
- [ ] Update chat interface to show chatbot status (active/disabled)
- [ ] Add visual indicators for operator-controlled chats
- [ ] Implement real-time status updates

### 11. **Chatbot Disable Flow Integration**
**Priority**: 🚨 **HIGH**
**Description**: Integrate chatbot disable functionality into WhatsApp message flow
**Acceptance Criteria**:
- [ ] Modify message processing flow to check `activeChatbot` flag
- [ ] When `activeChatbot=false`, agent should not respond automatically
- [ ] Add operator notification when chatbot is disabled for a customer
- [ ] Implement toggle mechanism for operators to enable/disable chatbot
- [ ] Update flow diagram to include chatbot disable check
- [ ] Add logging for chatbot enable/disable events

### 12. **Two-Factor Authentication (2FA)**
**Priority**: 🔥 **MEDIUM**
**Description**: Implement 2FA for enhanced security on critical operations
**Acceptance Criteria**:
- [ ] Add 2FA setup interface for admin users
- [ ] Implement TOTP (Time-based One-Time Password) support
- [ ] Add 2FA verification for sensitive operations (user blocking, settings changes)
- [ ] Create backup codes for 2FA recovery
- [ ] Add 2FA status indicators in user interface
- [ ] Implement 2FA enforcement policies per workspace

### 13. **Order Management System**
**Priority**: 🚨 **HIGH**
**Description**: Complete order management with full CRUD operations and status tracking
**Acceptance Criteria**:
- [ ] Create comprehensive order management interface
- [ ] Add order status tracking (pending, confirmed, processing, shipped, delivered)
- [ ] Implement order editing capabilities for operators
- [ ] Add order search and filtering functionality
- [ ] Create order details view with customer information
- [ ] Add order cancellation and refund management
- [ ] Implement order export functionality (CSV, PDF)

### 14. **Order Notification System**
**Priority**: 🚨 **HIGH**
**Description**: Automated order notifications to customers via WhatsApp
**Acceptance Criteria**:
- [ ] Send order confirmation message when order is placed
- [ ] Send order status update notifications (processing, shipped, delivered)
- [ ] Add customizable notification templates per workspace
- [ ] Implement notification scheduling and retry logic
- [ ] Add tracking number inclusion in shipping notifications
- [ ] Create notification history and delivery status tracking
- [ ] Add opt-out mechanism for customers

### 15. **Operator Alert Email System**
**Priority**: 🔥 **MEDIUM**
**Description**: Email notifications when customers request human operator assistance
**Acceptance Criteria**:
- [ ] Detect customer requests for human operator (keywords: "operator", "human", "help")
- [ ] Send immediate email alert to workspace operators
- [ ] Include customer information and conversation context in email
- [ ] Add email template customization for different languages
- [ ] Implement email delivery confirmation and retry logic
- [ ] Add operator response time tracking
- [ ] Create escalation rules for unresponded operator requests

### 16. **Documentation Updates**
**Priority**: 🟡 **LOW**
**Description**: Update documentation to reflect new features
**Acceptance Criteria**:
- [ ] Update API documentation (Swagger)
- [ ] Update README with new features
- [ ] Update deployment guides
- [ ] Create admin user guides for new features

---

## 📊 Implementation Priority Matrix

| Task | Priority | Effort | Impact | Dependencies |
|------|----------|--------|--------|--------------|
| Spam Detection | 🚨 HIGH | Medium | High | None |
| FAQ Embeddings | 🚨 HIGH | Medium | High | Database Schema |
| Services Embeddings | 🚨 HIGH | Medium | High | Database Schema |
| API Rate Limiting | 🚨 HIGH | Low | High | None |
| Chat History Management | 🚨 HIGH | Medium | High | Order Management |
| Chatbot Disable Flow | 🚨 HIGH | Low | High | None |
| Order Management | 🚨 HIGH | High | High | Database Schema |
| Order Notifications | 🚨 HIGH | Medium | High | Order Management |
| Multi-Source RAG | 🔥 MEDIUM | High | High | FAQ + Services Embeddings |
| Database Schema | 🔥 MEDIUM | Low | High | None |
| Admin UI Updates | 🔥 MEDIUM | Medium | Medium | Backend APIs |
| 2FA System | 🔥 MEDIUM | Medium | Medium | None |
| Operator Email Alerts | 🔥 MEDIUM | Low | Medium | Email Service |
| Testing Coverage | 🔥 MEDIUM | High | Medium | All Features |
| Performance Opts | 🟡 LOW | High | Medium | Core Features |
| Documentation | 🟡 LOW | Medium | Low | All Features |

---

## 🎯 Sprint Recommendations

### **Sprint 1** (Week 1-2): Core Security & Infrastructure
1. Implement Spam Detection & Auto-Blacklist
2. Add API Rate Limiting System
3. Create Database Schema Updates
4. Implement Chatbot Disable Flow Integration

### **Sprint 2** (Week 3-4): RAG Enhancement & Order Management
1. Implement FAQ Embedding System
2. Implement Services Embedding System
3. Add Generate Embeddings buttons to UI
4. Create Order Management System

### **Sprint 3** (Week 5-6): Chat Management & Notifications
1. Implement Chat History Management Interface
2. Add Order Notification System
3. Create Operator Alert Email System
4. Integrate Multi-Source RAG Search

### **Sprint 4** (Week 7-8): Security & Testing
1. Implement 2FA System
2. Add comprehensive testing coverage
3. Update admin interfaces
4. Performance optimizations

### **Sprint 5** (Week 9-10): Polish & Documentation
1. Final testing and bug fixes
2. Documentation updates
3. User acceptance testing
4. Production deployment preparation

---

## 📝 Notes

- **Database Migrations**: All schema changes should be implemented as Prisma migrations
- **Backward Compatibility**: Ensure all changes maintain backward compatibility
- **Testing**: Each feature should include unit, integration, and API tests
- **Documentation**: Update Swagger documentation for all new endpoints
- **Performance**: Monitor system performance during implementation
- **Security**: All new features should follow OWASP security guidelines

---

**Last Updated**: December 2024
**Status**: Ready for Implementation  
**Next Review**: After Sprint 1 completion

---

## 🔥 **CRITICAL FLOW UPDATE NEEDED**

⚠️ **IMPORTANTE**: Il task **"Chatbot Disable Flow Integration"** richiede un aggiornamento del flow WhatsApp nel PRD per includere il controllo `activeChatbot`:

```typescript
// Nel message processing flow, aggiungere dopo blacklist check:
if (customer && !customer.activeChatbot) {
  // Operator has taken manual control - no automatic response
  return null; // Agent non risponde più
}
```

Questo controllo deve essere integrato nel diagramma Mermaid del PRD per mostrare che quando un operatore prende il controllo, l'agente AI si disattiva automaticamente. 