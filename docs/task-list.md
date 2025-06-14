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

### ✅ Services Embedding System
**Priority**: 🚨 **HIGH**  
**Description**: Implement embedding generation for Services content to include in RAG search
**Status**: ✅ **COMPLETED**

### ✅ Chatbot Disable Flow Integration
**Priority**: 🚨 **HIGH**
**Description**: Integrate chatbot disable functionality into WhatsApp message flow
**Status**: ✅ **COMPLETED**

### ✅ Spam Detection & Auto-Blacklist System
**Priority**: 🚨 **HIGH**
**Description**: Implement automatic spam detection that blocks users sending 10+ messages in 30 seconds
**Status**: ✅ **COMPLETED**

**Implementation Details**:
- [x] Created `checkSpamBehavior()` method in MessageService that checks for 10+ messages in 30 seconds
- [x] Implemented `countRecentMessages()` in MessageRepository to track message frequency per user
- [x] Added `addToAutoBlacklist()` method that marks customer as blacklisted AND adds phone to workspace blocklist
- [x] Integrated spam detection BEFORE existing blacklist check in message processing flow
- [x] Added comprehensive logging for spam detection events with phone number and workspace ID
- [x] Duration: Unlimited (manual admin unlock only) - no automatic unblocking
- [x] Added `updateCustomerBlacklist()` and `addToWorkspaceBlocklist()` methods in MessageRepository
- [x] Created comprehensive unit tests covering all spam detection scenarios
- [x] Updated Swagger documentation with detailed spam detection behavior
- [x] System handles both existing customers and new users (workspace-level blocking)

**Technical Implementation**:
- **Threshold**: Exactly 10 messages in 30-second sliding window
- **Detection**: Counts INBOUND messages only (user messages, not bot responses)
- **Action**: Dual blocking (customer.isBlacklisted = true + phone added to workspace.blocklist)
- **Response**: Returns `null` immediately when spam detected (no response sent)
- **Error Handling**: Graceful degradation if spam detection fails
- **Logging**: Detailed audit trail for compliance and debugging

**Test Coverage**:
- ✅ Spam detection when threshold exceeded (10+ messages)
- ✅ Normal processing when below threshold (<10 messages)
- ✅ Error handling when spam detection fails
- ✅ Auto-blacklist without existing customer record
- ✅ Exact 30-second time window verification

**Documentation Updates**:
- ✅ Updated PRD with dedicated Spam Detection Service section
- ✅ Updated flow.md with spam detection integration in message flow
- ✅ Updated Swagger documentation with detailed spam behavior
- ✅ Added spam detection scenario to flow examples
- ✅ Updated task list with completion status

**Future Service Architecture**:
- 📋 **Planned**: Dedicated `SpamDetectionService` class for better separation of concerns
- 📋 **Planned**: Configurable thresholds per workspace
- 📋 **Planned**: Advanced pattern recognition beyond simple frequency
- 📋 **Planned**: Analytics dashboard for spam detection statistics
- 📋 **Planned**: Appeal process for false positives

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

### 1. **14-Day Free Trial Expiration System**
**Priority**: 🚨 **CRITICAL**
**Description**: Implement 14-day trial expiration system where FREE plan = BASIC plan but with time limit. After 14 days, chatbot stops responding until upgrade.
**Acceptance Criteria**:

#### Database Schema Updates:
- [ ] Add `expiresAt` field to Workspace model (DateTime, nullable)
- [ ] Create migration to add expiration field
- [ ] Set `expiresAt = createdAt + 14 days` for all FREE plan workspaces
- [ ] Update workspace creation to automatically set expiration for FREE plans

#### Backend Implementation:
- [ ] Create `WorkspaceExpirationService` to check trial status
- [ ] Add `isTrialExpired()` method that compares current date with `expiresAt`
- [ ] Integrate expiration check in WhatsApp message flow
- [ ] When trial expired: stop AI responses, send upgrade message instead
- [ ] Create `extendTrial()` method for admin use (emergency extensions)
- [ ] Add `upgradePlan()` method that removes `expiresAt` when upgrading to paid plan

#### WhatsApp Flow Integration:
- [ ] Add trial expiration check BEFORE processing any AI message
- [ ] If expired: send upgrade message instead of AI response
- [ ] Upgrade message should include link to plans page with pre-selected Basic plan
- [ ] Continue saving messages to history but don't generate AI responses
- [ ] Allow manual operator responses even when trial expired

#### Frontend Updates:
- [ ] Update PlansPage to show FREE as "14-day trial" with same features as Basic
- [ ] Add trial countdown in dashboard header for FREE plan users
- [ ] Show "X days remaining" warning when < 3 days left
- [ ] Add upgrade prompts in dashboard when trial < 7 days
- [ ] Update plan comparison to show time limits clearly

#### Notification System:
- [ ] Send email at 7 days remaining: "Trial expires soon"
- [ ] Send email at 3 days remaining: "Trial expires in 3 days"
- [ ] Send email at 1 day remaining: "Trial expires tomorrow"
- [ ] Send email on expiration: "Trial expired - upgrade to continue"
- [ ] Add in-app notifications for trial countdown

#### Admin Tools:
- [ ] Add trial status to workspace admin panel
- [ ] Allow admin to extend trials manually (emergency cases)
- [ ] Add bulk trial extension tool for system maintenance
- [ ] Show trial expiration dates in workspace list
- [ ] Add analytics for trial conversion rates

#### Testing Requirements:
- [ ] Test trial expiration flow end-to-end
- [ ] Test upgrade flow removes expiration
- [ ] Test edge cases (timezone differences, leap years)
- [ ] Test notification timing accuracy
- [ ] Test admin extension functionality

#### Migration Strategy:
- [ ] Existing FREE workspaces: set expiration to 14 days from migration date
- [ ] New workspaces: automatic 14-day expiration on creation
- [ ] Paid workspaces: `expiresAt` remains null (no expiration)
- [ ] Provide rollback plan if issues occur

**Current Status**: 
- ❌ No expiration system implemented
- ❌ FREE plan currently unlimited time
- ❌ No trial countdown in UI
- ❌ No expiration notifications

**Business Impact**: **CRITICAL** - This is the core monetization mechanism. Without trial expiration, users have no incentive to upgrade from FREE plan.

### 2. **WhatsApp Message Flow Implementation - EPICA COMPLETA**
**Priority**: 🚨 **CRITICAL**
**Description**: Implementazione completa del WhatsApp Message Flow con LangChain Calling Functions System
**Acceptance Criteria**: **Vedere task list dedicata in `docs/whatsapp-flow-tasks.md`**

#### EPICA SUDDIVISA IN TASK DETTAGLIATI:
- **Task 0**: LangChain Calling Functions System (PREREQUISITO CRITICO)
- **Task 1**: API Limit Check Implementation  
- **Task 2**: Chatbot Active Check Integration
- **Task 3**: Operator Control Release Mechanism
- **Task 4**: "2 Ore Ultima Conversazione" Check
- **Task 5**: Checkout Link Generation
- **Task 6**: Flow Sequence Enforcement
- **Task 7**: WIP Message Fix
- **Task 8**: Comprehensive Flow Testing
- **Task 9**: Performance Optimization
- **Task 10**: Documentation & Monitoring

#### SEQUENZA FLOW OBBLIGATORIA:
```
API Limit → Spam Detection → Channel Active → Chatbot Active → Blacklist → WIP → User Flow
```

#### FASI DI IMPLEMENTAZIONE:
- **FASE 1 - CORE FLOW**: Task 0, 1, 2, 6 (Settimana 1)
- **FASE 2 - FEATURES**: Task 4, 5, 3 (Settimana 2)  
- **FASE 3 - QUALITY**: Task 7, 8, 9, 10 (Settimana 3)

**📋 TASK LIST COMPLETA**: Tutti i dettagli, acceptance criteria, test requirements e file da creare/modificare sono documentati in `docs/whatsapp-flow-tasks.md`

### 3. **Seed Database with Customer Chat History**
**Priority**: 🚨 **HIGH**
**Description**: Add a customer record with chat history to the seed script for testing and demo purposes
**Acceptance Criteria**:
- [ ] Create a customer record in seed script with realistic data
- [ ] Add multiple chat messages with timestamps showing conversation flow
- [ ] Include both customer and bot responses in chat history
- [ ] Add order history for the customer to demonstrate full functionality
- [ ] Ensure chat history demonstrates various features (product inquiries, orders, support)

### 5. **Product Pricing with Discount Calculation**
**Priority**: 🚨 **HIGH**
**Description**: Implement discount calculation system where the highest discount (customer vs product) is applied
**Acceptance Criteria**:
- [ ] Add customer discount field to customer model
- [ ] Add product discount field to product model
- [ ] Create pricing calculation service that compares both discounts
- [ ] Apply the higher discount value (customer discount vs product discount)
- [ ] Update product display to show original price and discounted price
- [ ] Update order calculation to use discounted prices
- [ ] Add discount information to order confirmation messages

### 6. **Block User Integration with Settings**
**Priority**: 🚨 **HIGH**
**Description**: When user clicks "Block User" button, add phone number to Settings Phone Number Blocklist
**Acceptance Criteria**:
- [ ] Add "Block User" button to chat history interface
- [ ] Implement block user functionality that adds phone to workspace blocklist
- [ ] Update Settings page to show Phone Number Blocklist field
- [ ] Allow manual addition/removal of phone numbers in Settings blocklist
- [ ] Ensure blocked users cannot send messages (integrate with existing blacklist check)
- [ ] Add confirmation dialog when blocking a user
- [ ] Show visual indicator when a user is blocked in chat history

**Note**: Blacklist system integration è incluso nell'epica WhatsApp Message Flow

### 7. **JWT Security Enhancement & Token Management**
**Priority**: 🚨 **HIGH**
**Description**: Complete JWT token security implementation with proper frontend token handling and refresh mechanism
**Acceptance Criteria**:

#### Backend Requirements:
- [x] JWT middleware implemented and active on all routes ✅
- [x] Token verification with workspace loading ✅
- [x] Cookie-based authentication working ✅
- [ ] Implement refresh token rotation mechanism
- [ ] Add token blacklist for logout security
- [ ] Add rate limiting for login attempts (5 attempts per 15 minutes)
- [ ] Implement secure token cleanup on logout

#### Frontend Requirements:
- [ ] **CRITICAL**: Add Authorization Bearer header to all API calls
- [ ] Implement token storage in httpOnly cookies (already working) + localStorage backup
- [ ] Add automatic token refresh before expiration
- [ ] Handle 401 responses with automatic re-authentication
- [ ] Add loading states during token refresh
- [ ] Implement secure logout that clears all tokens

#### Security Enhancements:
- [ ] Add CSRF protection for state-changing operations
- [ ] Implement secure headers (HSTS, CSP, X-Frame-Options)
- [ ] Add request signing for critical operations
- [ ] Implement session timeout warnings
- [ ] Add device/browser fingerprinting for suspicious activity detection

#### API Call Security:
- [ ] **URGENT**: Modify frontend API service to include `Authorization: Bearer <token>` header
- [ ] Add token validation before each API call
- [ ] Implement retry logic for failed authentication
- [ ] Add request/response logging for security auditing
- [ ] Implement API call queuing during token refresh

#### Documentation & Testing:
- [ ] Document complete JWT flow (login → token → refresh → logout)
- [ ] Add security testing for token manipulation attempts
- [ ] Create JWT token lifecycle documentation
- [ ] Add integration tests for token refresh scenarios
- [ ] Document security headers and their purposes

**Current Status**: 
- ✅ Backend JWT fully implemented with workspace integration
- 🚨 Frontend missing Authorization headers - **CRITICAL SECURITY GAP**
- ✅ Cookie-based auth working but needs Bearer token backup
- ❌ No refresh token mechanism implemented

**Security Impact**: **HIGH** - API calls may work via cookies but missing Authorization headers create security vulnerabilities and inconsistent authentication patterns.

### 8. **API Rate Limiting System**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive rate limiting (100 calls per 10 minutes) for anti-attack protection
**Acceptance Criteria**:
- [ ] Create global rate limiting middleware
- [ ] Implement 100 calls per 10 minutes limit
- [ ] Add rate limit headers to responses
- [ ] Create rate limit bypass for admin users
- [ ] Log rate limit violations
- [ ] Return appropriate error messages when limit exceeded

**Note**: API Limit Check per WhatsApp Flow è incluso nel Task 1 dell'epica WhatsApp Message Flow

### 9. **Temporary Token System for Secure Links**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive temporary token system for secure registration and checkout links with 1-hour expiration
**Acceptance Criteria**:

#### Token Types Implementation:
- [ ] **Registration Tokens**: Customer registration with 1-hour expiration (enhance existing)
- [ ] **Checkout Tokens**: Secure payment processing links with 1-hour expiration
- [ ] **Invoice Tokens**: Invoice access and download links
- [ ] **Cart Tokens**: Guest user cart access links
- [ ] **Password Reset Tokens**: Account recovery links
- [ ] **Email Verification Tokens**: Address verification links

#### Database Schema:
- [ ] Create `secure_tokens` table with fields:
  - `id` (UUID primary key)
  - `token` (encrypted string, unique)
  - `type` (enum: registration, checkout, invoice, cart, password_reset, email_verification)
  - `workspace_id` (foreign key)
  - `user_id` (foreign key, nullable)
  - `phone_number` (string, nullable)
  - `payload` (JSON, encrypted sensitive data)
  - `expires_at` (timestamp, 1 hour from creation)
  - `used_at` (timestamp, nullable)
  - `created_at` (timestamp)
  - `ip_address` (string, optional security)
- [ ] Add indexes for performance: `token`, `expires_at`, `workspace_id`

#### Backend Services:
- [ ] Create `TokenService` class with methods:
  - `generateToken(type, workspaceId, payload, expiresIn = '1h')`
  - `validateToken(token, type, requiredPayload?)`
  - `markTokenAsUsed(token)`
  - `revokeToken(token)`
  - `cleanupExpiredTokens()` (cron job)
- [ ] Implement token encryption for sensitive payloads
- [ ] Add IP validation for enhanced security (optional)
- [ ] Create token generation rate limiting (max 10 tokens per minute per user)

#### API Endpoints:
- [ ] **POST /api/tokens/registration** - Generate registration token
- [ ] **POST /api/tokens/checkout** - Generate checkout token with cart data
- [ ] **POST /api/tokens/invoice** - Generate invoice access token
- [ ] **GET /api/tokens/validate/:token** - Validate token and return payload
- [ ] **POST /api/tokens/use/:token** - Mark token as used
- [ ] **DELETE /api/tokens/revoke/:token** - Revoke token (admin only)
- [ ] **DELETE /api/tokens/cleanup** - Manual cleanup of expired tokens

#### Frontend Integration:
- [ ] Update WhatsApp flow to generate checkout tokens when user requests order finalization
- [ ] Create secure checkout page that validates token and loads cart data
- [ ] Implement token expiration warnings (show countdown when < 10 minutes left)
- [ ] Add token refresh mechanism for long checkout processes
- [ ] Create error handling for expired/invalid tokens

#### Security Features:
- [ ] **Token Encryption**: Encrypt sensitive payload data (cart contents, user info)
- [ ] **Single-Use Tokens**: Automatically invalidate after successful use
- [ ] **IP Validation**: Optional IP address verification for enhanced security
- [ ] **Rate Limiting**: Prevent token generation abuse
- [ ] **Audit Logging**: Log all token operations for security monitoring

#### WhatsApp Integration:
- [ ] Update message flow to generate checkout tokens when user says "voglio finalizzare l'ordine"
- [ ] Include token in secure checkout links: `https://shopme.com/checkout/token_xyz789`
- [ ] Add token validation in checkout page before processing payment
- [ ] Implement token expiration messaging in WhatsApp flow
- [ ] Add token refresh option for users who need more time

#### Cleanup & Maintenance:
- [ ] Implement automatic cleanup cron job (runs every hour)
- [ ] Add manual cleanup API endpoint for admin use
- [ ] Create token usage analytics and monitoring
- [ ] Add alerts for unusual token generation patterns
- [ ] Implement token lifecycle logging

#### Testing Requirements:
- [ ] Unit tests for TokenService methods
- [ ] Integration tests for token generation and validation
- [ ] Security tests for token encryption/decryption
- [ ] Performance tests for token cleanup operations
- [ ] End-to-end tests for complete checkout flow with tokens

#### Documentation:
- [ ] Document token types and their use cases
- [ ] Create security guidelines for token handling
- [ ] Document token lifecycle and cleanup processes
- [ ] Add troubleshooting guide for token-related issues
- [ ] Create admin guide for token management

**Current Status**: 
- ✅ Basic registration tokens implemented (needs enhancement)
- ❌ No checkout tokens implemented
- ❌ No comprehensive token management system
- ❌ No token encryption or advanced security features
- ❌ No automatic cleanup system

**Business Impact**: **HIGH** - Secure tokens are essential for safe payment processing and user data protection. Without proper token management, the system is vulnerable to security breaches and cannot safely handle financial transactions.
- ❌ No structured calling functions directory
- ❌ No function orchestration system

**Technical Impact**: **HIGH** - This system will be the core of intelligent message processing and function routing, enabling sophisticated AI-driven customer interactions.

### 10. **Subscription Plans Complete Overhaul**
**Priority**: 🔥 **MEDIUM**
**Description**: Complete redesign of subscription plans with logical pricing structure, clear feature differentiation, and proper backend integration for monetization
**Acceptance Criteria**:

#### 🎯 **BUSINESS PROBLEM TO SOLVE:**
The current subscription plans page has several critical issues:
- Basic plan incorrectly shows "Unlimited Products" (should be limited)
- Confusing feature overlap between Basic and Professional tiers
- Missing clear upgrade triggers and value propositions
- No backend enforcement of plan limitations
- Pricing gaps don't reflect value progression

#### 📋 **DETAILED PLAN SPECIFICATIONS:**

**🆓 FREE TRIAL (€0 for 14 days) - "TRIAL"**
- **Target Audience**: New users testing the complete system
- **Core Limitations**:
  - 1 WhatsApp channel only
  - 14-day trial period (service stops after expiration)
  - Unlimited Products and Services (same as Basic)
  - Basic analytics dashboard (view only)
- **Disabled Features**:
  - ❌ API access completely disabled
  - ❌ Advanced analytics and reporting
  - ❌ Push notifications
  - ❌ Custom AI training
  - ❌ Priority support
- **Support**: Community forum access only
- **Upgrade Trigger**: When 14-day trial expires

**💼 BASIC PLAN (€49/month) - "BUSINESS"**
- **Target Audience**: Small to medium businesses with standard needs
- **Enhanced Features**:
  - 1 WhatsApp channel
  - Unlimited Products and Services
  - Basic analytics dashboard with export
  - No time limits - continuous service
- **Still Disabled**:
  - ❌ Advanced analytics
  - ❌ Push notifications
  - ❌ Custom AI training
  - ❌ Multiple WhatsApp channels
  - ❌ API access
- **Support**: Email support with 48h SLA
- **Upgrade Trigger**: When user needs multiple channels or advanced features

**🚀 PROFESSIONAL PLAN (€149/month) - "ENTERPRISE"**
- **Target Audience**: Growing businesses with advanced requirements
- **Premium Features**:
  - Up to 3 WhatsApp channels (multi-department support)
  - Unlimited Products and Services
  - Advanced analytics with custom reports
  - Full API access (unlimited calls)
  - Push notifications system
  - Custom AI training capabilities
- **Premium Support**:
  - ✅ Dedicated support team
  - ✅ 12h response time SLA
  - ✅ Priority feature requests
- **Upgrade Trigger**: When user needs enterprise features or custom integrations

#### 🛠 **FRONTEND IMPLEMENTATION REQUIREMENTS:**

**UI/UX Fixes Needed**:
- [ ] **Fix Basic Plan**: Change "Unlimited Products and Services" to "Up to 50 Products, Up to 20 Services"
- [ ] **Add Clear Icons**: Use ✅ for included features, ❌ for disabled features
- [ ] **Feature Descriptions**: Add tooltips explaining technical terms (API access, Custom AI training)
- [ ] **Target Audience**: Add subtitle under each plan name explaining who it's for
- [ ] **Visual Hierarchy**: Make feature differences more obvious with better spacing and typography
- [ ] **Upgrade CTAs**: Change button text to be more specific ("Start Free Trial", "Upgrade to Business", "Go Professional")

**New UI Components Needed**:
- [ ] **Usage Indicators**: Show current usage vs limits (e.g., "47/50 Products used")
- [ ] **Feature Comparison Table**: Side-by-side comparison of all features
- [ ] **Upgrade Prompts**: Modal dialogs when users hit limits
- [ ] **Plan Benefits Highlights**: Visual callouts for key differentiators

#### 🔧 **BACKEND IMPLEMENTATION REQUIREMENTS:**

**Database Schema Updates**:
- [ ] Add `plan` field to Workspace model (FREE, BASIC, PROFESSIONAL, ENTERPRISE)
- [ ] Add `messageCount` tracking per workspace per month
- [ ] Add `productCount` and `serviceCount` tracking per workspace
- [ ] Add `apiCallCount` tracking per workspace per month
- [ ] Create `PlanLimits` configuration table

**Plan Enforcement Logic**:
- [ ] **Message Limits**: Block AI responses when monthly limit exceeded
- [ ] **Product Limits**: Prevent adding products beyond plan limit
- [ ] **Service Limits**: Prevent adding services beyond plan limit
- [ ] **API Limits**: Return 429 error when API calls exceeded
- [ ] **Feature Gates**: Disable advanced analytics, push notifications based on plan

**Usage Tracking System**:
- [ ] **Message Counter**: Increment on each AI response sent
- [ ] **API Counter**: Track all API calls per workspace
- [ ] **Reset Logic**: Monthly reset of usage counters
- [ ] **Usage Alerts**: Notify users at 80% and 100% of limits

#### 📊 **MONETIZATION STRATEGY IMPLEMENTATION:**

**Upgrade Flow Logic**:
- [ ] **Soft Limits**: Show warnings at 80% usage
- [ ] **Hard Limits**: Block functionality at 100% usage with upgrade prompt
- [ ] **Feature Teasing**: Show disabled features with "Upgrade to unlock" messages
- [ ] **Usage Dashboard**: Let users see their current usage and limits

**Revenue Optimization**:
- [ ] **A/B Testing**: Test different pricing displays
- [ ] **Upgrade Analytics**: Track which limits trigger most upgrades
- [ ] **Churn Prevention**: Offer downgrades instead of cancellations

#### 🧪 **TESTING REQUIREMENTS:**

**Frontend Tests**:
- [ ] **Plan Display**: Verify correct features shown for each plan
- [ ] **Upgrade Flows**: Test upgrade button functionality
- [ ] **Usage Indicators**: Test usage display accuracy
- [ ] **Responsive Design**: Test on mobile and desktop

**Backend Tests**:
- [ ] **Limit Enforcement**: Test all plan limits are enforced
- [ ] **Usage Tracking**: Verify counters increment correctly
- [ ] **Plan Upgrades**: Test plan change workflows
- [ ] **API Rate Limiting**: Test API limits per plan

#### 📈 **SUCCESS METRICS:**

**Business KPIs**:
- [ ] **Conversion Rate**: Free to Basic plan upgrades
- [ ] **Revenue Per User**: Average monthly revenue increase
- [ ] **Churn Reduction**: Lower cancellation rates with clearer value
- [ ] **Feature Adoption**: Usage of premium features

**Technical KPIs**:
- [ ] **Limit Accuracy**: 100% accurate limit enforcement
- [ ] **Performance**: No degradation from usage tracking
- [ ] **Reliability**: 99.9% uptime for plan validation

#### 🚀 **IMPLEMENTATION PHASES:**

**Phase 1 (Week 1)**: Frontend UI fixes
- Fix Basic plan feature list
- Add clear ✅/❌ indicators
- Improve visual design

**Phase 2 (Week 2)**: Backend plan enforcement
- Add database schema updates
- Implement usage tracking
- Create limit enforcement logic

**Phase 3 (Week 3)**: Integration and testing
- Connect frontend to backend limits
- Add upgrade flows
- Comprehensive testing

**Phase 4 (Week 4)**: Monitoring and optimization
- Add analytics tracking
- Monitor conversion rates
- Optimize based on user behavior

#### 🔍 **ACCEPTANCE CRITERIA CHECKLIST:**

**Frontend Completion**:
- [ ] Basic plan no longer shows "Unlimited Products"
- [ ] All features clearly marked as included/excluded
- [ ] Usage indicators show current vs limits
- [ ] Upgrade prompts appear when limits reached
- [ ] Mobile responsive design works perfectly

**Backend Completion**:
- [ ] All plan limits enforced in real-time
- [ ] Usage tracking accurate to the message/product
- [ ] API rate limiting works per plan
- [ ] Plan upgrades/downgrades function correctly
- [ ] Monthly usage resets work automatically

**Business Completion**:
- [ ] Clear upgrade path from Free → Basic → Professional
- [ ] Revenue tracking shows increased conversions
- [ ] Customer support reports fewer pricing confusion tickets
- [ ] Analytics show improved user engagement with limits

**Current Status**: 
- ❌ Frontend shows incorrect Basic plan features
- ❌ No backend plan enforcement
- ❌ No usage tracking or limits
- ❌ No upgrade flows implemented

**Business Impact**: **HIGH** - Proper plan structure is essential for revenue growth and customer acquisition. Clear limits and upgrade paths directly impact conversion rates and monthly recurring revenue.

### 9. **Plan Limits Enforcement & Upgrade Popups System**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive plan limits enforcement with strategic upgrade popups to drive plan conversions when users hit their limits
**Acceptance Criteria**:

#### 🎯 **BUSINESS OBJECTIVE:**
Create a seamless upgrade experience that converts users when they hit plan limitations, driving revenue growth through strategic friction points and clear upgrade paths.

#### 📍 **EXACT IMPLEMENTATION LOCATIONS:**

### 🔧 **BACKEND IMPLEMENTATION:**

#### **1. WhatsApp Message Limit (`/backend/src/services/whatsapp.service.ts`)**
**Location**: `processIncomingMessage()` method
**Implementation**:
```typescript
// Add before AI response generation
const messageCount = await this.getMonthlyMessageCount(workspaceId);
const planLimit = await this.getPlanMessageLimit(workspace.plan);

if (messageCount >= planLimit) {
  return this.sendUpgradeMessage(phoneNumber, workspace.plan);
}
```
**Upgrade Message Examples**:
- FREE: "You've reached your 100 monthly messages limit. Upgrade to Basic for 1,000 messages/month!"
- BASIC: "You've used all 1,000 monthly messages. Upgrade to Professional for unlimited messaging!"

#### **2. Product Creation Limit (`/backend/src/controllers/products.controller.ts`)**
**Location**: `createProduct()` method
**Implementation**:
```typescript
// Add before product creation
const productCount = await this.getProductCount(workspaceId);
const planLimit = await this.getPlanProductLimit(workspace.plan);

if (productCount >= planLimit) {
  return res.status(402).json({
    error: 'PLAN_LIMIT_EXCEEDED',
    message: `You've reached your ${planLimit} products limit`,
    upgradeUrl: '/plans',
    currentPlan: workspace.plan
  });
}
```

#### **3. Service Creation Limit (`/backend/src/controllers/services.controller.ts`)**
**Location**: `createService()` method
**Implementation**:
```typescript
// Add before service creation
const serviceCount = await this.getServiceCount(workspaceId);
const planLimit = await this.getPlanServiceLimit(workspace.plan);

if (serviceCount >= planLimit) {
  return res.status(402).json({
    error: 'PLAN_LIMIT_EXCEEDED',
    message: `You've reached your ${planLimit} services limit`,
    upgradeUrl: '/plans',
    currentPlan: workspace.plan
  });
}
```

#### **4. API Rate Limiting (`/backend/src/middleware/plan-limits.middleware.ts`)**
**New File**: Create comprehensive plan limits middleware
**Implementation**:
```typescript
export const planLimitsMiddleware = async (req, res, next) => {
  const workspace = req.workspace;
  const apiCallCount = await this.getMonthlyApiCallCount(workspace.id);
  const planLimit = await this.getPlanApiLimit(workspace.plan);
  
  if (apiCallCount >= planLimit) {
    return res.status(429).json({
      error: 'API_LIMIT_EXCEEDED',
      message: 'API call limit exceeded for your plan',
      upgradeUrl: '/plans',
      resetDate: this.getNextMonthReset()
    });
  }
  
  // Increment API call counter
  await this.incrementApiCallCount(workspace.id);
  next();
};
```

#### **5. Usage Tracking Service (`/backend/src/services/usage-tracking.service.ts`)**
**New File**: Centralized usage tracking
**Methods Needed**:
- `getMonthlyMessageCount(workspaceId)`
- `getProductCount(workspaceId)`
- `getServiceCount(workspaceId)`
- `getApiCallCount(workspaceId)`
- `incrementMessageCount(workspaceId)`
- `incrementApiCallCount(workspaceId)`
- `resetMonthlyCounters()` (cron job)

### 🎨 **FRONTEND IMPLEMENTATION:**

#### **6. Products Page (`/frontend/src/pages/products/ProductsPage.tsx`)**
**Location**: "Add Product" button click handler
**Implementation**:
```typescript
const handleAddProduct = async () => {
  try {
    // Check if at limit before showing form
    const usage = await api.get(`/workspaces/${workspaceId}/usage`);
    if (usage.data.products >= usage.data.productLimit) {
      showUpgradePopup('products', usage.data.currentPlan);
      return;
    }
    setShowAddForm(true);
  } catch (error) {
    if (error.response?.status === 402) {
      showUpgradePopup('products', error.response.data.currentPlan);
    }
  }
};
```

**Usage Indicator Component**:
```typescript
<div className="usage-indicator">
  Products: {currentCount}/{limit} used
  {currentCount >= limit && (
    <Button onClick={() => showUpgradePopup('products')}>
      Upgrade Plan
    </Button>
  )}
</div>
```

#### **7. Services Page (`/frontend/src/pages/services/ServicesPage.tsx`)**
**Location**: "Add Service" button click handler
**Implementation**: Same pattern as Products page
**Usage Indicator**: "Services: 18/20 used"

#### **8. Dashboard (`/frontend/src/pages/dashboard/Dashboard.tsx`)**
**Location**: Main dashboard with usage overview
**Implementation**:
```typescript
const UsageOverview = () => {
  const { usage } = useUsage(workspaceId);
  
  return (
    <div className="usage-overview">
      <UsageCard 
        title="Messages This Month"
        current={usage.messages}
        limit={usage.messageLimit}
        onUpgrade={() => showUpgradePopup('messages')}
      />
      <UsageCard 
        title="Products"
        current={usage.products}
        limit={usage.productLimit}
        onUpgrade={() => showUpgradePopup('products')}
      />
      <UsageCard 
        title="Services"
        current={usage.services}
        limit={usage.serviceLimit}
        onUpgrade={() => showUpgradePopup('services')}
      />
    </div>
  );
};
```

#### **9. Upgrade Popup Component (`/frontend/src/components/UpgradePopup.tsx`)**
**New Component**: Reusable upgrade popup
**Props**: `limitType`, `currentPlan`, `onClose`, `onUpgrade`
**Implementation**:
```typescript
const UpgradePopup = ({ limitType, currentPlan, onClose, onUpgrade }) => {
  const getUpgradeMessage = () => {
    switch(limitType) {
      case 'products':
        return currentPlan === 'FREE' 
          ? 'Upgrade to Basic for up to 50 products!'
          : 'Upgrade to Professional for unlimited products!';
      case 'messages':
        return currentPlan === 'FREE'
          ? 'Upgrade to Basic for 1,000 messages/month!'
          : 'Upgrade to Professional for unlimited messages!';
      // ... other cases
    }
  };
  
  return (
    <Modal>
      <h3>Plan Limit Reached</h3>
      <p>{getUpgradeMessage()}</p>
      <Button onClick={onUpgrade}>Upgrade Now</Button>
      <Button variant="secondary" onClick={onClose}>Maybe Later</Button>
    </Modal>
  );
};
```

#### **10. Chat Interface (`/frontend/src/components/chat/ChatInterface.tsx`)**
**Location**: When receiving limit exceeded message from WhatsApp
**Implementation**:
```typescript
// Handle special upgrade messages from backend
if (message.type === 'UPGRADE_REQUIRED') {
  showUpgradePopup('messages', message.currentPlan);
  return;
}
```

### 📊 **DATABASE SCHEMA UPDATES:**

#### **11. Usage Tracking Tables**
**Migration**: `add_usage_tracking_tables.sql`
```sql
-- Monthly usage tracking
CREATE TABLE workspace_usage (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  month DATE, -- First day of month
  message_count INTEGER DEFAULT 0,
  api_call_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, month)
);

-- Plan limits configuration
CREATE TABLE plan_limits (
  plan_type VARCHAR(20) PRIMARY KEY,
  message_limit INTEGER,
  product_limit INTEGER,
  service_limit INTEGER,
  api_call_limit INTEGER,
  whatsapp_channels INTEGER
);

-- Insert default limits
INSERT INTO plan_limits VALUES
('FREE', 100, 5, 3, 0, 1),
('BASIC', 1000, 50, 20, 1000, 1),
('PROFESSIONAL', 5000, -1, -1, -1, 3), -- -1 = unlimited
('ENTERPRISE', -1, -1, -1, -1, -1);
```

### 🎯 **STRATEGIC POPUP TRIGGERS:**

#### **Proactive Warnings (80% Usage)**:
- [ ] **Dashboard**: Show warning cards at 80% usage
- [ ] **Email Notifications**: Send usage warnings
- [ ] **In-App Notifications**: Toast notifications for approaching limits

#### **Hard Limits (100% Usage)**:
- [ ] **Block Actions**: Prevent creating new products/services
- [ ] **WhatsApp**: Send upgrade message instead of AI response
- [ ] **API**: Return 402 Payment Required
- [ ] **Immediate Popup**: Show upgrade modal on limit hit

#### **Upgrade Flow Optimization**:
- [ ] **One-Click Upgrade**: Direct links to specific plan
- [ ] **Usage Context**: Show exactly what they'll get with upgrade
- [ ] **Social Proof**: "Join 1,000+ businesses on Professional plan"

### 🧪 **TESTING STRATEGY:**

#### **Backend Tests**:
- [ ] **Limit Enforcement**: Test all limits are enforced correctly
- [ ] **Usage Tracking**: Verify counters increment accurately
- [ ] **Monthly Reset**: Test usage counters reset properly
- [ ] **API Rate Limiting**: Test API limits per plan

#### **Frontend Tests**:
- [ ] **Popup Triggers**: Test popups appear at correct limits
- [ ] **Usage Indicators**: Test usage displays are accurate
- [ ] **Upgrade Flows**: Test upgrade button functionality
- [ ] **Error Handling**: Test graceful handling of limit errors

### 📈 **SUCCESS METRICS:**

#### **Conversion Metrics**:
- [ ] **Popup Conversion Rate**: % of users who upgrade after seeing popup
- [ ] **Limit Hit Rate**: % of users who hit each type of limit
- [ ] **Upgrade Path**: Which limits drive most upgrades
- [ ] **Time to Upgrade**: How long from limit hit to upgrade

#### **Technical Metrics**:
- [ ] **Accuracy**: 100% accurate limit enforcement
- [ ] **Performance**: No degradation from usage tracking
- [ ] **Reliability**: Popups appear consistently

### 🚀 **IMPLEMENTATION PHASES:**

**Phase 1 (Week 1)**: Backend limits enforcement
- Create usage tracking service
- Add limits to WhatsApp, Products, Services
- Database schema updates

**Phase 2 (Week 2)**: Frontend popup system
- Create UpgradePopup component
- Add usage indicators to all pages
- Implement popup triggers

**Phase 3 (Week 3)**: Integration and optimization
- Connect all components
- Add proactive warnings
- Comprehensive testing

**Phase 4 (Week 4)**: Analytics and monitoring
- Track conversion metrics
- Optimize popup messaging
- A/B test upgrade flows

### ✅ **ACCEPTANCE CRITERIA:**

**Backend Completion**:
- [ ] All plan limits enforced in real-time
- [ ] Usage tracking accurate to the action
- [ ] Monthly usage resets work automatically
- [ ] API rate limiting works per plan
- [ ] WhatsApp sends upgrade messages when limit hit

**Frontend Completion**:
- [ ] Usage indicators show on all relevant pages
- [ ] Upgrade popups appear when limits reached
- [ ] Popups have clear messaging and upgrade paths
- [ ] One-click upgrade flows work correctly
- [ ] Mobile responsive design works perfectly

**Business Completion**:
- [ ] Clear upgrade triggers drive conversions
- [ ] Users understand their current usage and limits
- [ ] Upgrade messaging is compelling and contextual
- [ ] Analytics track all conversion events

**Current Status**: 
- ❌ No plan limits enforcement
- ❌ No usage tracking system
- ❌ No upgrade popups implemented
- ❌ No usage indicators in UI

**Business Impact**: **CRITICAL** - This system directly drives revenue by converting users at the moment they need more capacity. Strategic friction points with clear upgrade paths are essential for SaaS monetization.

### 10. **Professional Plan Contact Sales Form & Operator System**
**Priority**: 🚨 **HIGH**
**Description**: Implement contact sales form for Professional plan upgrades with immediate operator notification and response system
**Acceptance Criteria**:

#### 🎯 **BUSINESS OBJECTIVE:**
Replace direct Professional plan upgrade with a sales-assisted process to ensure proper onboarding, custom configuration, and higher customer success rates for €149/month enterprise customers.

#### 📋 **CONTACT SALES FORM IMPLEMENTATION:**

#### **Frontend Form Components**:
- [ ] **Contact Sales Page**: `/contact-professional` route
- [ ] **Form Fields**:
  ```typescript
  interface ContactSalesForm {
    // Company Information
    companyName: string;
    companySize: 'startup' | '1-10' | '11-50' | '51-200' | '200+';
    industry: string;
    website?: string;
    
    // Contact Information
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    jobTitle: string;
    
    // Business Requirements
    currentMessageVolume: number;
    expectedGrowth: string;
    specificNeeds: string[]; // Multiple channels, API access, Custom AI, etc.
    currentPlan: 'FREE' | 'BASIC';
    
    // Contact Preferences
    preferredContactMethod: 'phone' | 'email' | 'video_call';
    urgencyLevel: 'immediate' | 'within_week' | 'within_month';
    preferredContactTime: string;
    timezone: string;
    
    // Additional Information
    additionalRequirements: string;
    currentChallenges: string;
    budget: string;
  }
  ```

#### **Form UI/UX Requirements**:
- [ ] **Multi-step Form**: 3 steps (Company Info → Requirements → Contact Preferences)
- [ ] **Progress Indicator**: Show current step and completion percentage
- [ ] **Validation**: Real-time validation with clear error messages
- [ ] **Auto-save**: Save progress as user fills form
- [ ] **Mobile Responsive**: Perfect mobile experience
- [ ] **Professional Design**: Enterprise-grade visual design

#### **Form Integration Points**:
- [ ] **Upgrade Button**: Replace "Upgrade to Professional" with "Contact Sales"
- [ ] **Billing Dashboard**: Show "Contact Sales" when overage > €90/month
- [ ] **Usage Alerts**: Include "Contact Sales" CTA in high-usage notifications
- [ ] **Plan Comparison**: Professional plan shows "Contact Sales" button

#### 🔧 **BACKEND IMPLEMENTATION:**

#### **API Endpoints**:
- [ ] **POST /api/contact-sales**: Submit contact form
- [ ] **GET /api/contact-sales/:id**: Retrieve submission details
- [ ] **PUT /api/contact-sales/:id/status**: Update lead status
- [ ] **GET /api/admin/contact-sales**: Admin dashboard for leads

#### **Database Schema**:
```sql
CREATE TABLE contact_sales_leads (
  id UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  
  -- Company Information
  company_name VARCHAR(255) NOT NULL,
  company_size VARCHAR(20),
  industry VARCHAR(100),
  website VARCHAR(255),
  
  -- Contact Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  job_title VARCHAR(100),
  
  -- Business Requirements
  current_message_volume INTEGER,
  expected_growth TEXT,
  specific_needs JSONB,
  current_plan VARCHAR(20),
  
  -- Contact Preferences
  preferred_contact_method VARCHAR(20),
  urgency_level VARCHAR(20),
  preferred_contact_time VARCHAR(100),
  timezone VARCHAR(50),
  
  -- Additional Information
  additional_requirements TEXT,
  current_challenges TEXT,
  budget VARCHAR(100),
  
  -- Lead Management
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, qualified, proposal_sent, closed_won, closed_lost
  assigned_operator_id UUID,
  first_contact_at TIMESTAMP,
  last_contact_at TIMESTAMP,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sales_operators (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  specialties JSONB, -- ["enterprise", "technical", "onboarding"]
  max_leads_per_day INTEGER DEFAULT 10,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 📧 **NOTIFICATION SYSTEM:**

#### **Immediate Notifications (< 2 minutes)**:
- [ ] **Slack Integration**: Send lead notification to sales channel
- [ ] **Email Alert**: Send to on-duty sales operator
- [ ] **SMS Alert**: For urgent leads (immediate urgency)
- [ ] **Dashboard Alert**: Real-time notification in admin dashboard

#### **Automated Email Responses**:
- [ ] **Customer Confirmation**: 
  ```
  Subject: "Thank you for your interest in ShopME Professional"
  - Confirmation of form submission
  - Expected response time (within 2 hours)
  - Contact information for urgent needs
  - Link to calendar for scheduling call
  ```

- [ ] **Operator Assignment**:
  ```
  Subject: "New Professional Plan Lead - [Company Name]"
  - Lead details and requirements
  - Urgency level and preferred contact method
  - Direct link to lead management dashboard
  - Suggested talking points based on requirements
  ```

#### 👥 **OPERATOR MANAGEMENT SYSTEM:**

#### **Lead Assignment Logic**:
- [ ] **Round-Robin Assignment**: Distribute leads evenly among active operators
- [ ] **Specialty Matching**: Assign based on lead requirements and operator expertise
- [ ] **Workload Balancing**: Consider current operator workload
- [ ] **Timezone Matching**: Assign based on lead timezone and operator availability

#### **Operator Dashboard**:
- [ ] **Lead Queue**: Assigned leads with priority and urgency
- [ ] **Lead Details**: Complete form submission with contact history
- [ ] **Contact Tools**: Click-to-call, email templates, calendar integration
- [ ] **Lead Status Updates**: Track progress through sales pipeline
- [ ] **Notes and Follow-ups**: Record interactions and schedule follow-ups

#### 📊 **SALES ANALYTICS & REPORTING:**

#### **Lead Tracking Metrics**:
- [ ] **Response Time**: Time from submission to first contact
- [ ] **Conversion Rate**: Leads to Professional plan conversions
- [ ] **Lead Quality**: Score based on company size, message volume, urgency
- [ ] **Operator Performance**: Individual operator conversion rates and response times

#### **Admin Dashboard**:
- [ ] **Lead Pipeline**: Visual pipeline showing lead status distribution
- [ ] **Daily/Weekly Reports**: Lead volume, conversion rates, revenue impact
- [ ] **Operator Workload**: Current assignments and performance metrics
- [ ] **Lead Source Analysis**: Track which upgrade triggers generate best leads

#### 🔄 **INTEGRATION WITH EXISTING SYSTEMS:**

#### **Billing System Integration**:
- [ ] **Usage Triggers**: Automatically create leads when overage > €90/month
- [ ] **Cost Analysis**: Include current overage costs in lead information
- [ ] **ROI Calculator**: Show potential savings with Professional plan

#### **CRM Integration**:
- [ ] **Lead Export**: Export leads to external CRM (HubSpot, Salesforce)
- [ ] **Contact Sync**: Sync contact information with existing customer records
- [ ] **Deal Tracking**: Track deals through external sales pipeline

#### 📱 **MOBILE OPERATOR APP:**

#### **Mobile Notifications**:
- [ ] **Push Notifications**: Immediate alerts for new high-priority leads
- [ ] **Mobile Dashboard**: View and manage leads on mobile device
- [ ] **Quick Actions**: Call, email, and update lead status from mobile

#### 🧪 **TESTING REQUIREMENTS:**

#### **Form Testing**:
- [ ] **Validation Testing**: Test all form validations and error handling
- [ ] **Multi-step Flow**: Test form progression and data persistence
- [ ] **Mobile Testing**: Ensure perfect mobile form experience
- [ ] **Load Testing**: Test form submission under high load

#### **Notification Testing**:
- [ ] **Email Delivery**: Test all automated emails and templates
- [ ] **Slack Integration**: Test Slack notifications and formatting
- [ ] **SMS Delivery**: Test SMS alerts for urgent leads
- [ ] **Timing Tests**: Verify 2-hour response time tracking

#### 📈 **SUCCESS METRICS:**

#### **Response Time Metrics**:
- [ ] **Target**: 95% of leads contacted within 2 hours
- [ ] **Urgent Leads**: 100% contacted within 30 minutes
- [ ] **Follow-up Rate**: 100% of leads receive follow-up within 24 hours

#### **Conversion Metrics**:
- [ ] **Lead to Demo**: % of leads that schedule demo/consultation
- [ ] **Demo to Close**: % of demos that convert to Professional plan
- [ ] **Overall Conversion**: % of contact form submissions that become customers
- [ ] **Revenue Impact**: Monthly revenue from sales-assisted upgrades

#### 🚀 **IMPLEMENTATION PHASES:**

**Phase 1 (Week 1)**: Form and basic notifications
- Create contact sales form
- Implement basic email notifications
- Set up database schema

**Phase 2 (Week 2)**: Operator dashboard and assignment
- Build operator management dashboard
- Implement lead assignment logic
- Add Slack integration

**Phase 3 (Week 3)**: Advanced features and integrations
- Add mobile notifications
- Implement analytics dashboard
- Integrate with billing system triggers

**Phase 4 (Week 4)**: Testing and optimization
- Comprehensive testing
- Performance optimization
- Sales team training

#### ✅ **ACCEPTANCE CRITERIA:**

**Form Completion**:
- [ ] Professional plan upgrade button redirects to contact sales form
- [ ] Form captures all required business and contact information
- [ ] Multi-step form works perfectly on all devices
- [ ] Form data is validated and saved correctly

**Notification System**:
- [ ] All leads generate immediate notifications (< 2 minutes)
- [ ] Operators receive leads via email, Slack, and dashboard
- [ ] Customers receive confirmation email immediately
- [ ] Urgent leads trigger SMS alerts

**Operator Management**:
- [ ] Leads are assigned to operators using round-robin logic
- [ ] Operators can view, contact, and update lead status
- [ ] Lead pipeline is visible in admin dashboard
- [ ] Response time tracking works accurately

**Business Impact**:
- [ ] Professional plan conversions increase vs. self-service
- [ ] Customer satisfaction improves with assisted onboarding
- [ ] Sales team can handle lead volume effectively
- [ ] Revenue per Professional customer increases

**Current Status**: 
- ❌ No contact sales form implemented
- ❌ No operator notification system
- ❌ Professional plan still shows direct upgrade
- ❌ No sales-assisted upgrade process

**Business Impact**: **HIGH** - Sales-assisted Professional plan upgrades will improve conversion rates, customer success, and average revenue per user while providing better onboarding experience for enterprise customers.

### 11. **Multi-Channel WhatsApp Management with Auto-Configuration**
**Priority**: 🚨 **HIGH**
**Description**: Implement multi-channel WhatsApp support with automatic GDPR and Agent Config creation for each new channel
**Acceptance Criteria**:

#### 🎯 **BUSINESS OBJECTIVE:**
Enable Professional and Enterprise plans to manage multiple WhatsApp channels (departments, regions, languages) with automatic configuration setup for each channel.

#### 📋 **MULTI-CHANNEL ARCHITECTURE:**

#### **Database Schema Updates**:
```sql
-- Update whatsapp_settings to support multiple channels per workspace
ALTER TABLE whatsapp_settings ADD COLUMN channel_name VARCHAR(100);
ALTER TABLE whatsapp_settings ADD COLUMN department VARCHAR(100);
ALTER TABLE whatsapp_settings ADD COLUMN is_primary BOOLEAN DEFAULT false;
ALTER TABLE whatsapp_settings ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Update agent_configs to link with specific WhatsApp channels
ALTER TABLE agent_configs ADD COLUMN whatsapp_channel_id UUID REFERENCES whatsapp_settings(id);

-- Ensure one primary channel per workspace
CREATE UNIQUE INDEX idx_workspace_primary_channel 
ON whatsapp_settings(workspace_id) 
WHERE is_primary = true;
```

#### **Frontend Implementation**:
- [ ] **WhatsApp Channels Page**: `/settings/whatsapp-channels`
- [ ] **Channel List View**: Show all channels with status, phone number, department
- [ ] **Add Channel Form**: 
  ```typescript
  interface NewChannelForm {
    channelName: string;
    department: string;
    phoneNumber: string;
    apiKey: string;
    webhookUrl?: string;
    isPrimary: boolean;
    language: 'en' | 'es' | 'it' | 'pt';
  }
  ```
- [ ] **Channel Management**: Edit, activate/deactivate, delete channels
- [ ] **Plan Limits Enforcement**: Show upgrade prompt when limit reached

#### **Backend Implementation**:

#### **API Endpoints**:
- [ ] **GET /api/whatsapp-channels**: List all channels for workspace
- [ ] **POST /api/whatsapp-channels**: Create new channel with auto-config
- [ ] **PUT /api/whatsapp-channels/:id**: Update channel settings
- [ ] **DELETE /api/whatsapp-channels/:id**: Delete channel and related configs
- [ ] **POST /api/whatsapp-channels/:id/activate**: Activate/deactivate channel

#### **Auto-Configuration Service**:
```typescript
class WhatsAppChannelService {
  async createChannel(channelData: NewChannelData): Promise<WhatsAppChannel> {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Validate plan limits
      await this.validateChannelLimits(channelData.workspaceId);
      
      // 2. Create WhatsApp settings
      const whatsappSettings = await tx.whatsappSettings.create({
        data: {
          workspaceId: channelData.workspaceId,
          channelName: channelData.channelName,
          department: channelData.department,
          phoneNumber: channelData.phoneNumber,
          apiKey: channelData.apiKey,
          webhookUrl: channelData.webhookUrl,
          isPrimary: channelData.isPrimary,
          gdpr: await this.getDefaultGdprContent(channelData.language),
        },
      });
      
      // 3. Create dedicated Agent Config for this channel
      const agentConfig = await tx.agentConfig.create({
        data: {
          name: `${channelData.channelName} Assistant`,
          content: await this.getDefaultAgentContent(channelData.department),
          workspaceId: channelData.workspaceId,
          whatsappChannelId: whatsappSettings.id,
          department: channelData.department,
          isActive: true,
          isRouter: true,
          temperature: 0.7,
          model: 'openai/gpt-4o-mini',
        },
      });
      
      return { whatsappSettings, agentConfig };
    });
  }
}
```

#### **Plan Limits Enforcement**:
- [ ] **Free Plan**: 1 channel maximum (existing behavior)
- [ ] **Basic Plan**: 1 channel maximum (existing behavior)
- [ ] **Professional Plan**: Up to 3 channels
- [ ] **Enterprise Plan**: Unlimited channels

#### **Channel-Specific Features**:

#### **Department-Based Routing**:
- [ ] **Sales Channel**: Optimized for product inquiries and orders
- [ ] **Support Channel**: Focused on customer service and troubleshooting
- [ ] **Marketing Channel**: Promotional messages and campaigns
- [ ] **Custom Departments**: User-defined department configurations

#### **Language-Specific GDPR**:
- [ ] **Multi-language GDPR**: Different GDPR texts per channel language
- [ ] **Automatic Language Detection**: Set GDPR based on channel language
- [ ] **GDPR Templates**: Pre-built templates for different languages

#### **Agent Configuration per Channel**:
- [ ] **Department-Specific Prompts**: Different AI behavior per department
- [ ] **Channel-Specific Knowledge**: RAG integration per channel
- [ ] **Custom Model Settings**: Different temperature/model per channel

#### 🔄 **MIGRATION STRATEGY:**

#### **Existing Workspace Migration**:
- [ ] **Automatic Migration**: Convert existing single channels to multi-channel structure
- [ ] **Primary Channel**: Mark existing channel as primary
- [ ] **Backward Compatibility**: Ensure existing API endpoints continue working
- [ ] **Data Integrity**: Preserve all existing GDPR and agent configurations

#### **Migration Script**:
```sql
-- Migration script for existing workspaces
UPDATE whatsapp_settings 
SET channel_name = 'Primary Channel',
    department = 'General',
    is_primary = true,
    is_active = true
WHERE channel_name IS NULL;

-- Link existing agent configs to primary channels
UPDATE agent_configs 
SET whatsapp_channel_id = (
  SELECT id FROM whatsapp_settings 
  WHERE workspace_id = agent_configs.workspace_id 
  AND is_primary = true
)
WHERE whatsapp_channel_id IS NULL;
```

#### 🧪 **TESTING REQUIREMENTS:**

#### **Channel Creation Tests**:
- [ ] **Auto-Configuration**: Test GDPR and Agent Config creation
- [ ] **Plan Limits**: Test channel limits per plan type
- [ ] **Department Routing**: Test message routing to correct department
- [ ] **Language Support**: Test multi-language GDPR creation

#### **Integration Tests**:
- [ ] **WhatsApp Webhook**: Test webhook routing to correct channel
- [ ] **Message Processing**: Test channel-specific agent responses
- [ ] **Channel Management**: Test CRUD operations for channels
- [ ] **Migration**: Test existing workspace migration

#### 📊 **ADMIN DASHBOARD:**

#### **Channel Overview**:
- [ ] **Channel Status**: Active/inactive status for all channels
- [ ] **Message Volume**: Messages per channel and department
- [ ] **Performance Metrics**: Response time and satisfaction per channel
- [ ] **Usage Analytics**: Channel utilization and peak hours

#### **Channel Configuration**:
- [ ] **Bulk Operations**: Activate/deactivate multiple channels
- [ ] **Template Management**: Manage GDPR and agent templates
- [ ] **Department Settings**: Configure department-specific behaviors
- [ ] **Webhook Management**: Test and monitor webhook endpoints

#### 🚀 **IMPLEMENTATION PHASES:**

**Phase 1 (Week 1)**: Database schema and backend API
- Update database schema for multi-channel support
- Create WhatsApp channel management API
- Implement auto-configuration service

**Phase 2 (Week 2)**: Frontend channel management
- Build WhatsApp channels management page
- Implement add/edit channel forms
- Add plan limits enforcement

**Phase 3 (Week 3)**: Department routing and language support
- Implement department-based message routing
- Add multi-language GDPR support
- Create department-specific agent templates

**Phase 4 (Week 4)**: Migration and testing
- Create migration script for existing workspaces
- Comprehensive testing and optimization
- Admin dashboard enhancements

#### ✅ **ACCEPTANCE CRITERIA:**

**Multi-Channel Support**:
- [ ] Professional plan users can create up to 3 WhatsApp channels
- [ ] Each channel automatically gets GDPR settings and Agent Config
- [ ] Channels can be configured for different departments/languages
- [ ] Plan limits are enforced correctly

**Auto-Configuration**:
- [ ] New channels automatically create GDPR settings with appropriate language
- [ ] New channels automatically create Agent Config with department-specific prompts
- [ ] Channel creation is atomic (all-or-nothing transaction)
- [ ] Error handling prevents partial channel creation

**Channel Management**:
- [ ] Users can view, edit, activate/deactivate channels
- [ ] Primary channel cannot be deleted (must transfer primary status first)
- [ ] Channel deletion removes all associated configurations
- [ ] Webhook routing works correctly for multiple channels

**Migration Compatibility**:
- [ ] Existing single-channel workspaces migrate seamlessly
- [ ] All existing GDPR and agent configurations are preserved
- [ ] API backward compatibility maintained
- [ ] No data loss during migration

**Current Status**: 
- ✅ Single channel auto-configuration works (workspace creation)
- ❌ Multi-channel support not implemented
- ❌ No channel-specific GDPR/Agent Config creation
- ❌ Plan limits not enforced for channel count

**Business Impact**: **HIGH** - Multi-channel support is a key differentiator for Professional/Enterprise plans and enables department-based customer service, increasing customer satisfaction and plan upgrade conversions.

### 12. **Workspace-Specific GDPR Management**
**Priority**: 🔥 **MEDIUM**
**Description**: Implement workspace-specific GDPR text management with proper endpoint structure
**Acceptance Criteria**:
- [ ] Update existing `/api/gdpr/default` endpoint to handle workspaceId parameter
- [ ] Create GDPR text management in workspace settings
- [ ] Modify registration flow to use workspace-specific GDPR text
- [ ] Add GDPR text editor in admin interface
- [ ] Support multi-language GDPR texts per workspace
- [ ] Update PRD to clarify workspace-specific GDPR requirement

### ✅ **Services Embedding System** - **COMPLETED**
**Priority**: 🚨 **HIGH**
**Description**: Implement embedding generation for Services content to include in RAG search
**Acceptance Criteria**:
- [x] Create `service_chunks` table in database schema
- [x] Implement Service text chunking (name + description + details)
- [x] Add "Generate Embeddings" button to Services page
- [x] Create Service embedding service similar to documents
- [x] Integrate Service chunks in RAG search pipeline
- [x] Only process active Services

**Status**: ✅ **COMPLETED**

**Implementation Details**:
- Created `service_chunks` table with migration `20250612161144_add_service_chunks_table`
- Implemented `EmbeddingService.generateServiceEmbeddings()` using shared service architecture
- Added "Generate Embeddings" button to Services page with same styling as Documents page
- Service content is chunked as "Service: [name]\nDescription: [description]" format
- Only processes active Services without existing chunks
- Shows success toast when embedding generation completes
- `searchServices()` method available in EmbeddingService for RAG integration

### 13. **Enhanced Multi-Source RAG Integration**
**Priority**: 🔥 **MEDIUM**
**Description**: Integrate all three content sources (Documents, FAQs, Services) in unified RAG search
**Acceptance Criteria**:
- [ ] Modify RAG search to query all three chunk tables
- [ ] Implement weighted scoring across content types
- [ ] Combine results from documents, FAQs, and services
- [ ] Optimize similarity search performance
- [ ] Add content source identification in responses

### 14. **Chat History Management Interface**
**Priority**: 🚨 **HIGH**
**Description**: Implement comprehensive chat history management with operator controls
**Acceptance Criteria**:
- [ ] Add "View Orders" button/link in chat history interface
- [ ] Add "Block User" functionality directly from chat history
- [ ] Add "Disable Chatbot" toggle for operator manual control
- [ ] Update chat interface to show chatbot status (active/disabled)
- [ ] Add visual indicators for operator-controlled chats
- [ ] Implement real-time status updates

### 15. **Database Schema Updates**
**Priority**: 🔥 **MEDIUM**
**Description**: Add missing database tables and fields for new features
**Acceptance Criteria**:
- [ ] Create migration for contact sales leads table
- [ ] Create migration for sales operators table
- [ ] Add spam tracking fields to customer/message tables
- [ ] Add rate limiting tracking table
- [ ] Update Prisma schema accordingly

### 16. **Admin Interface Enhancements**
**Priority**: 🔥 **MEDIUM**
**Description**: Add missing UI components for new features
**Acceptance Criteria**:
- [ ] Add spam detection status in customer management
- [ ] Add rate limiting monitoring dashboard
- [ ] Add blacklist management interface improvements
- [ ] Add sales lead management dashboard
- [ ] Add operator assignment interface

### 17. **Testing Coverage**
**Priority**: 🔥 **MEDIUM**
**Description**: Add comprehensive tests for new features
**Acceptance Criteria**:
- [ ] Unit tests for spam detection logic
- [ ] Integration tests for contact sales form
- [ ] Integration tests for multi-channel WhatsApp
- [ ] API tests for rate limiting
- [ ] E2E tests for multi-source RAG search

### 18. **Performance Optimizations**
**Priority**: 🟡 **LOW**
**Description**: Optimize system performance for production use
**Acceptance Criteria**:
- [ ] Optimize embedding generation batch processing
- [ ] Add caching for frequent RAG queries
- [ ] Optimize database queries for large datasets
- [ ] Add monitoring and alerting for system health

### 19. **Landing Page**
**Priority**: 🚨 **HIGH**
**Description**: Create a beautiful multi-language landing page as the default homepage with integrated login functionality
**Acceptance Criteria**:

#### 🎯 **BUSINESS OBJECTIVE:**
Replace the current default route (localhost:3000/) with a professional landing page that showcases ShopME platform features, includes the existing login functionality, and supports multiple languages to attract international customers.

#### 🌐 **MULTI-LANGUAGE SUPPORT:**
- [ ] **Default Language**: English (EN) as primary language
- [ ] **Additional Languages**: Italian (IT) and Spanish (ES)
- [ ] **Language Switcher**: Dropdown or toggle in header for language selection
- [ ] **URL Structure**: Support for `/en`, `/it`, `/es` routes or query parameters
- [ ] **Content Translation**: All text content translated and stored in language files
- [ ] **SEO Optimization**: Meta tags, titles, and descriptions in each language

#### 📱 **LANDING PAGE DESIGN:**

#### **Header Section**:
- [ ] **Navigation Bar**: Logo, language switcher, login button
- [ ] **Hero Section**: Compelling headline, subheadline, and call-to-action
- [ ] **Value Proposition**: Clear statement of what ShopME does for businesses
- [ ] **Hero Image/Video**: Professional visual showcasing WhatsApp commerce

#### **Features Section**:
- [ ] **WhatsApp Integration**: Highlight seamless WhatsApp Business API integration
- [ ] **AI-Powered Chatbot**: Showcase intelligent customer service automation
- [ ] **Product Catalog**: Visual representation of product management features
- [ ] **Order Management**: Demonstrate complete e-commerce workflow
- [ ] **Analytics Dashboard**: Show business insights and reporting capabilities
- [ ] **Multi-Language Support**: Highlight international business capabilities

#### **Pricing Section**:
- [ ] **Plan Comparison**: Clean pricing table with Free, Basic, Professional, Enterprise
- [ ] **Feature Highlights**: Key differentiators for each plan
- [ ] **Contact Sales**: Professional plan shows "Contact Sales" button
- [ ] **Free Trial CTA**: Prominent "Start Free Trial" button

#### **Social Proof Section**:
- [ ] **Customer Testimonials**: Success stories from existing customers
- [ ] **Usage Statistics**: Number of businesses, messages processed, countries served
- [ ] **Industry Examples**: Restaurant, retail, service business use cases
- [ ] **Trust Badges**: Security, compliance, and integration certifications

#### **Footer Section**:
- [ ] **Company Information**: Contact details, address, social media links
- [ ] **Legal Links**: Privacy policy, terms of service, GDPR compliance
- [ ] **Product Links**: Features, pricing, documentation, support
- [ ] **Language Selection**: Alternative language switcher in footer

#### 🔐 **LOGIN INTEGRATION:**

#### **Login Modal/Section**:
- [ ] **Integrate Existing Login**: Use current `/auth/login` functionality
- [ ] **Modal Overlay**: Login form appears as overlay when "Login" clicked
- [ ] **Responsive Design**: Perfect mobile experience for login form
- [ ] **Social Login Options**: Consider Google/Microsoft SSO integration
- [ ] **Password Recovery**: Link to existing password reset functionality
- [ ] **Registration Link**: Clear path to sign up for new users

#### **Authentication Flow**:
- [ ] **Successful Login**: Redirect to dashboard after authentication
- [ ] **Error Handling**: Clear error messages for failed login attempts
- [ ] **Remember Me**: Option to stay logged in
- [ ] **Security Features**: Rate limiting, CAPTCHA for suspicious activity

#### 🎨 **VISUAL DESIGN:**

#### **Design System**:
- [ ] **Brand Colors**: Consistent with existing ShopME brand identity
- [ ] **Typography**: Professional, readable fonts with proper hierarchy
- [ ] **Icons**: Consistent icon set for features and benefits
- [ ] **Images**: High-quality, professional images and illustrations
- [ ] **Animations**: Subtle animations for engagement (scroll effects, hover states)

#### **Responsive Design**:
- [ ] **Mobile First**: Perfect mobile experience across all devices
- [ ] **Tablet Optimization**: Optimized layout for tablet devices
- [ ] **Desktop Experience**: Full-featured desktop layout
- [ ] **Cross-Browser**: Compatible with Chrome, Firefox, Safari, Edge

#### 🚀 **TECHNICAL IMPLEMENTATION:**

#### **Frontend Structure**:
- [ ] **Landing Page Component**: New component for homepage (`/src/pages/LandingPage.tsx`)
- [ ] **Language Context**: React context for language management
- [ ] **Translation Files**: JSON files for each language (`/src/locales/en.json`, `/it.json`, `/es.json`)
- [ ] **Routing Updates**: Update main router to show landing page on root route
- [ ] **SEO Components**: Meta tags, structured data, sitemap generation

#### **Content Management**:
- [ ] **Translation Keys**: Organized structure for all text content
- [ ] **Image Assets**: Optimized images for different screen sizes
- [ ] **Content Sections**: Modular components for easy content updates
- [ ] **CMS Integration**: Consider headless CMS for easy content management

#### **Performance Optimization**:
- [ ] **Image Optimization**: WebP format, lazy loading, responsive images
- [ ] **Code Splitting**: Lazy load components for faster initial load
- [ ] **Caching Strategy**: Proper caching headers for static assets
- [ ] **Bundle Optimization**: Minimize JavaScript and CSS bundle sizes

#### 📊 **ANALYTICS & TRACKING:**

#### **User Behavior Tracking**:
- [ ] **Google Analytics**: Track page views, user interactions, conversions
- [ ] **Conversion Funnels**: Track signup and login conversion rates
- [ ] **Language Preferences**: Track which languages are most popular
- [ ] **Feature Interest**: Track which features generate most interest

#### **A/B Testing Setup**:
- [ ] **Headline Testing**: Test different value propositions
- [ ] **CTA Testing**: Test different call-to-action buttons and placement
- [ ] **Pricing Display**: Test different pricing presentation formats
- [ ] **Language Impact**: Measure conversion rates by language

#### 🧪 **TESTING REQUIREMENTS:**

#### **Functionality Testing**:
- [ ] **Login Integration**: Test login modal and authentication flow
- [ ] **Language Switching**: Test all language combinations work correctly
- [ ] **Responsive Design**: Test on all device sizes and orientations
- [ ] **Cross-Browser**: Test functionality across all major browsers

#### **Content Testing**:
- [ ] **Translation Accuracy**: Review all translations for accuracy and tone
- [ ] **Cultural Adaptation**: Ensure content is culturally appropriate for each market
- [ ] **SEO Testing**: Verify meta tags and structured data for each language
- [ ] **Performance Testing**: Ensure fast loading times across all languages

#### 📈 **SUCCESS METRICS:**

#### **Conversion Metrics**:
- [ ] **Signup Rate**: % of visitors who create accounts
- [ ] **Login Rate**: % of returning visitors who log in
- [ ] **Language Engagement**: Time spent on page by language
- [ ] **Feature Interest**: Click-through rates on feature sections

#### **Technical Metrics**:
- [ ] **Page Load Speed**: < 3 seconds for initial load
- [ ] **Mobile Performance**: 90+ Google PageSpeed score on mobile
- [ ] **SEO Rankings**: Improved search rankings for target keywords
- [ ] **Bounce Rate**: < 40% bounce rate across all languages

#### 🌍 **CONTENT STRATEGY:**

#### **English Content (Default)**:
- [ ] **Headline**: "Transform Your Business with WhatsApp Commerce"
- [ ] **Subheadline**: "AI-powered chatbot that turns WhatsApp conversations into sales"
- [ ] **Value Props**: Automated customer service, seamless ordering, real-time analytics
- [ ] **CTA**: "Start Free Trial" / "Get Started Today"

#### **Italian Content**:
- [ ] **Headline**: "Trasforma il Tuo Business con WhatsApp Commerce"
- [ ] **Subheadline**: "Chatbot AI che trasforma le conversazioni WhatsApp in vendite"
- [ ] **Local Examples**: Italian business success stories and use cases
- [ ] **Cultural Adaptation**: Italian business communication style

#### **Spanish Content**:
- [ ] **Headline**: "Transforma Tu Negocio con WhatsApp Commerce"
- [ ] **Subheadline**: "Chatbot con IA que convierte conversaciones de WhatsApp en ventas"
- [ ] **Local Examples**: Spanish/Latin American business examples
- [ ] **Regional Adaptation**: Consider different Spanish markets (Spain vs. Latin America)

#### 🚀 **IMPLEMENTATION PHASES:**

**Phase 1 (Week 1)**: Basic landing page structure and English content
- Create landing page component and routing
- Implement hero section, features, and pricing
- Integrate existing login functionality

**Phase 2 (Week 2)**: Multi-language support and Italian translation
- Implement language switching system
- Add Italian translations and content
- Test language switching functionality

**Phase 3 (Week 3)**: Spanish translation and design polish
- Add Spanish translations and content
- Refine visual design and animations
- Optimize for mobile and performance

**Phase 4 (Week 4)**: Analytics, testing, and optimization
- Implement tracking and analytics
- Comprehensive testing across languages and devices
- Performance optimization and SEO improvements

#### ✅ **ACCEPTANCE CRITERIA:**

**Landing Page Functionality**:
- [ ] Beautiful, professional landing page loads on localhost:3000/
- [ ] All sections (hero, features, pricing, testimonials, footer) implemented
- [ ] Login modal integrates existing `/auth/login` functionality
- [ ] Responsive design works perfectly on all devices

**Multi-Language Support**:
- [ ] Language switcher allows selection between English, Italian, Spanish
- [ ] All content translates correctly when language is changed
- [ ] URLs support language routing (e.g., `/en`, `/it`, `/es`)
- [ ] SEO meta tags update based on selected language

**Design Quality**:
- [ ] Professional, modern design that represents ShopME brand
- [ ] Consistent with existing application design system
- [ ] Fast loading times (< 3 seconds) across all languages
- [ ] Perfect mobile experience with touch-friendly interactions

**Business Impact**:
- [ ] Clear value proposition communicates ShopME benefits
- [ ] Pricing section drives users toward appropriate plans
- [ ] Contact sales integration for Professional plan inquiries
- [ ] Strong call-to-action drives user registration and trial signups

**Current Status**: 
- ❌ No landing page exists (root route likely shows dashboard or 404)
- ❌ No multi-language support implemented
- ❌ Login only accessible via direct `/auth/login` route
- ❌ No marketing content to attract new customers

**Business Impact**: **HIGH** - A professional landing page is essential for customer acquisition, brand credibility, and international expansion. This will significantly improve conversion rates and provide a proper entry point for new users.

### 20. **Workspace-Specific GDPR Management**
**Priority**: 🔥 **MEDIUM**
**Description**: Implement workspace-specific GDPR text management with proper endpoint structure
**Acceptance Criteria**:
- [ ] Update existing `/api/gdpr/default` endpoint to handle workspaceId parameter
- [ ] Create GDPR text management in workspace settings
- [ ] Modify registration flow to use workspace-specific GDPR text
- [ ] Add GDPR text editor in admin interface
- [ ] Support multi-language GDPR texts per workspace
- [ ] Update PRD to clarify workspace-specific GDPR requirement

### ✅ **Chatbot Disable Flow Integration** - **COMPLETED**
**Priority**: 🚨 **HIGH**
**Description**: Integrate chatbot disable functionality into WhatsApp message flow
**Status**: ✅ **COMPLETED**

**Implementation Details**:
- Added `activeChatbot` check in WhatsApp message processing flow (after blacklist check)
- When `activeChatbot=false`, system saves message but returns empty response
- Toggle mechanism implemented in ChatPage with confirmation dialog
- Visual indicators show chatbot status (Bot icon: green=auto, gray=manual)
- Flow diagram updated in PRD with new "Chatbot Active?" decision point
- Logging implemented with "Manual Operator Control" agent selection
- Real-time UI updates when operators take/release control

### 21. **Security Audit & Vulnerability Assessment**
**Priority**: 🚨 **HIGH**
**Description**: Comprehensive security audit covering authentication, data protection, and OWASP compliance
**Acceptance Criteria**:

#### 🔐 **Authentication Security**:
- [ ] **JWT Token Security**: Implement token rotation, blacklisting, and secure storage
- [ ] **Session Management**: Add session timeout, concurrent session limits
- [ ] **Password Security**: Enforce strong password policies, implement password history
- [ ] **2FA Enhancement**: Add backup codes, recovery options for 2FA
- [ ] **Account Lockout**: Implement progressive delays for failed login attempts

#### 🛡️ **Data Protection**:
- [ ] **Input Validation**: Comprehensive validation for all user inputs
- [ ] **SQL Injection Prevention**: Parameterized queries, input sanitization
- [ ] **XSS Protection**: Content Security Policy, output encoding
- [ ] **CSRF Protection**: Anti-CSRF tokens for state-changing operations
- [ ] **File Upload Security**: Virus scanning, file type validation, size limits

#### 🔍 **Security Monitoring**:
- [ ] **Audit Logging**: Log all security-relevant events (login, data access, changes)
- [ ] **Intrusion Detection**: Monitor for suspicious patterns and automated attacks
- [ ] **Security Headers**: Implement all OWASP recommended security headers
- [ ] **Vulnerability Scanning**: Regular automated security scans
- [ ] **Penetration Testing**: External security assessment

#### 📊 **Compliance & Documentation**:
- [ ] **GDPR Compliance**: Data processing documentation, consent management
- [ ] **Security Policies**: Document security procedures and incident response
- [ ] **Risk Assessment**: Identify and document security risks and mitigations
- [ ] **Security Training**: Developer security awareness documentation

**Current Status**: 
- ✅ Basic JWT authentication implemented
- ✅ Basic rate limiting on auth endpoints
- ❌ Missing comprehensive security controls
- ❌ No security monitoring or audit logging

**Security Impact**: **CRITICAL** - Comprehensive security is essential for protecting customer data and maintaining platform trust.

### 22. **WhatsApp Message Creation & Template System**
**Priority**: 🚨 **HIGH**
**Description**: Advanced WhatsApp message creation system with templates, media support, and bulk messaging
**Acceptance Criteria**:

#### 📝 **Message Templates**:
- [ ] **Template Library**: Pre-built templates for common scenarios (welcome, order confirmation, support)
- [ ] **Custom Templates**: Allow workspace owners to create custom message templates
- [ ] **Variable Substitution**: Support for dynamic variables (customer name, order details, product info)
- [ ] **Multi-language Templates**: Templates available in all supported languages (IT, EN, ES, PT)
- [ ] **Template Categories**: Organize templates by type (marketing, transactional, support)

#### 🎨 **Rich Message Features**:
- [ ] **Media Support**: Send images, documents, audio messages via WhatsApp
- [ ] **Interactive Buttons**: Quick reply buttons for common customer actions
- [ ] **List Messages**: Structured lists for product catalogs, menu options
- [ ] **Location Sharing**: Send business location, delivery addresses
- [ ] **Contact Cards**: Share business contact information

#### 📤 **Bulk Messaging System**:
- [ ] **Customer Segmentation**: Send messages to specific customer groups
- [ ] **Broadcast Lists**: Create and manage broadcast lists for marketing
- [ ] **Scheduling**: Schedule messages for optimal delivery times
- [ ] **Delivery Tracking**: Track message delivery status and read receipts
- [ ] **Opt-out Management**: Handle unsubscribe requests automatically

#### 🔧 **Message Management Interface**:
- [ ] **Message Composer**: Rich text editor for creating messages
- [ ] **Preview Mode**: Preview messages before sending
- [ ] **Message History**: Track all sent messages and their performance
- [ ] **Analytics Dashboard**: Message open rates, response rates, conversion tracking
- [ ] **A/B Testing**: Test different message versions for optimization

#### 🚀 **Advanced Features**:
- [ ] **Auto-responses**: Set up automatic responses for common queries
- [ ] **Message Flows**: Create conversation flows with conditional logic
- [ ] **Integration APIs**: Connect with external systems for dynamic content
- [ ] **Webhook Integration**: Real-time message status updates
- [ ] **Rate Limiting**: Respect WhatsApp API rate limits and best practices

**Current Status**: 
- ✅ Basic message sending via WhatsApp webhook
- ✅ Welcome messages with registration links
- ❌ No template system or rich message features
- ❌ No bulk messaging capabilities

**Business Impact**: **HIGH** - Advanced messaging capabilities will significantly improve customer engagement and marketing effectiveness.

### 23. **Temporary Token System for Secure Links**
**Priority**: 🚨 **HIGH**
**Description**: Comprehensive temporary token system for secure operations (registration, payments, invoices, cart access)
**Acceptance Criteria**:

#### 🔐 **Token Types & Generation**:
- [ ] **Registration Tokens**: Secure customer registration (already implemented - enhance)
- [ ] **Payment Tokens**: Secure payment processing links
- [ ] **Invoice Tokens**: Secure invoice access and download
- [ ] **Cart Tokens**: Temporary cart access for guest users
- [ ] **Password Reset Tokens**: Secure password reset functionality
- [ ] **Email Verification Tokens**: Email address verification

#### ⏰ **Token Management**:
- [ ] **Configurable Expiration**: Different expiration times per token type
- [ ] **Single-Use Tokens**: Tokens invalidated after first use
- [ ] **Token Rotation**: Generate new tokens for extended sessions
- [ ] **Token Revocation**: Ability to manually invalidate tokens
- [ ] **Cleanup Service**: Automatic cleanup of expired tokens

#### 🔗 **Secure Link Generation**:
- [ ] **Dynamic URLs**: Generate secure URLs with embedded tokens
- [ ] **Domain Validation**: Ensure links only work from authorized domains
- [ ] **HTTPS Enforcement**: All secure links must use HTTPS
- [ ] **Link Tracking**: Track link usage and access patterns
- [ ] **Custom Domains**: Support for custom domain secure links

#### 🛡️ **Security Features**:
- [ ] **Token Encryption**: Encrypt token payloads for additional security
- [ ] **IP Validation**: Optional IP address validation for sensitive operations
- [ ] **Device Fingerprinting**: Track device characteristics for fraud prevention
- [ ] **Rate Limiting**: Prevent token generation abuse
- [ ] **Audit Logging**: Log all token generation and usage events

#### 📱 **Integration Points**:
- [ ] **WhatsApp Integration**: Send secure links via WhatsApp messages
- [ ] **Email Integration**: Send secure links via email notifications
- [ ] **SMS Integration**: Send secure links via SMS for critical operations
- [ ] **QR Code Generation**: Generate QR codes for secure links
- [ ] **Deep Link Support**: Mobile app deep linking with secure tokens

#### 🔧 **API Endpoints**:
- [ ] **POST /api/tokens/generate**: Generate new secure tokens
- [ ] **GET /api/tokens/validate/:token**: Validate token and return data
- [ ] **POST /api/tokens/revoke**: Revoke specific tokens
- [ ] **GET /api/tokens/status/:token**: Check token status without consuming
- [ ] **DELETE /api/tokens/cleanup**: Manual cleanup of expired tokens

**Database Schema**:
```sql
CREATE TABLE secure_tokens (
  id UUID PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  token_type VARCHAR(50) NOT NULL, -- 'registration', 'payment', 'invoice', 'cart', 'password_reset'
  workspace_id UUID REFERENCES workspaces(id),
  user_id UUID REFERENCES users(id) NULL,
  customer_id UUID REFERENCES customers(id) NULL,
  
  -- Token data (encrypted JSON)
  payload JSONB NOT NULL,
  
  -- Security features
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  
  -- Lifecycle management
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_secure_tokens_token ON secure_tokens(token);
CREATE INDEX idx_secure_tokens_type_workspace ON secure_tokens(token_type, workspace_id);
CREATE INDEX idx_secure_tokens_expires ON secure_tokens(expires_at);
```

**Current Status**: 
- ✅ Basic registration tokens implemented
- ❌ No payment or invoice tokens
- ❌ No comprehensive token management system
- ❌ Limited security features

**Security Impact**: **CRITICAL** - Secure token system is essential for protecting sensitive operations and maintaining customer trust.

### 24. **Ticketing System with Plan-Based Access**
**Priority**: 🚨 **HIGH**
**Description**: Customer support ticketing system with plan-based access (Premium only) and operator assignment
**Acceptance Criteria**:

#### 🎫 **Ticket Management System**:
- [ ] **Ticket Creation**: Customers can request human operator via WhatsApp
- [ ] **Automatic Ticket Generation**: Create tickets when customers ask for operator
- [ ] **Ticket Categories**: Support, Sales, Technical, Billing categories
- [ ] **Priority Levels**: Low, Medium, High, Urgent priority assignment
- [ ] **Status Tracking**: New, Assigned, In Progress, Waiting, Resolved, Closed

#### 👥 **Operator Management**:
- [ ] **Operator Profiles**: Create and manage support operator accounts
- [ ] **Skill-Based Routing**: Assign tickets based on operator expertise
- [ ] **Workload Balancing**: Distribute tickets evenly among available operators
- [ ] **Availability Status**: Online, Busy, Away, Offline status management
- [ ] **Escalation Rules**: Automatic escalation for unresolved tickets

#### 📋 **Plan-Based Access Control**:
- [ ] **Free Plan**: No ticketing access - show upgrade message
- [ ] **Basic Plan**: No ticketing access - show upgrade message  
- [ ] **Professional Plan**: Full ticketing system access
- [ ] **Enterprise Plan**: Priority support with dedicated operators
- [ ] **Plan Validation**: Check user plan before allowing ticket creation

#### 🤖 **WhatsApp Integration**:
- [ ] **Trigger Phrases**: Detect when customers request human support
- [ ] **Automatic Detection**: "speak to operator", "human support", "talk to someone"
- [ ] **Ticket Notification**: Send ticket number and estimated response time
- [ ] **Status Updates**: Notify customers of ticket status changes via WhatsApp
- [ ] **Operator Handoff**: Seamless transition from bot to human operator

#### 📊 **Ticketing Dashboard**:
- [ ] **Operator Dashboard**: View assigned tickets, customer history, response tools
- [ ] **Admin Dashboard**: Ticket overview, operator performance, system metrics
- [ ] **Customer Portal**: Customers can view their ticket history and status
- [ ] **Real-time Updates**: Live updates for new tickets and status changes
- [ ] **Search & Filtering**: Find tickets by customer, date, status, category

#### 🔧 **Database Schema**:
```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR(20) UNIQUE NOT NULL, -- TKT-2024-001234
  workspace_id UUID REFERENCES workspaces(id),
  customer_id UUID REFERENCES customers(id),
  
  -- Ticket details
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'support', 'sales', 'technical', 'billing'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(20) DEFAULT 'new', -- 'new', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed'
  
  -- Assignment
  assigned_operator_id UUID REFERENCES users(id) NULL,
  assigned_at TIMESTAMP NULL,
  
  -- Timing
  first_response_at TIMESTAMP NULL,
  resolved_at TIMESTAMP NULL,
  closed_at TIMESTAMP NULL,
  
  -- Metadata
  source VARCHAR(20) DEFAULT 'whatsapp', -- 'whatsapp', 'email', 'web', 'phone'
  tags JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id),
  sender_type VARCHAR(20) NOT NULL, -- 'customer', 'operator', 'system'
  sender_id UUID NULL, -- user_id for operators, customer_id for customers
  
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'file', 'system'
  attachments JSONB DEFAULT '[]',
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_operators (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  
  -- Operator details
  display_name VARCHAR(100) NOT NULL,
  specialties JSONB DEFAULT '[]', -- ['technical', 'billing', 'sales']
  languages JSONB DEFAULT '["en"]', -- ['en', 'it', 'es']
  
  -- Availability
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'offline', -- 'online', 'busy', 'away', 'offline'
  max_concurrent_tickets INTEGER DEFAULT 5,
  
  -- Performance metrics
  avg_response_time INTEGER DEFAULT 0, -- in minutes
  total_tickets_handled INTEGER DEFAULT 0,
  customer_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 🎯 **Plan-Based Prompt System**:
- [ ] **Dynamic Prompts**: Load different AI prompts based on customer's workspace plan
- [ ] **Free/Basic Plans**: Limited prompt with upgrade suggestions for human support
- [ ] **Professional Plan**: Full-featured prompt with ticketing system integration
- [ ] **Enterprise Plan**: Premium prompt with priority support mentions
- [ ] **Prompt Versioning**: Track and manage different prompt versions per plan

#### 📊 **Analytics & Reporting**:
- [ ] **Ticket Metrics**: Response time, resolution time, customer satisfaction
- [ ] **Operator Performance**: Individual operator statistics and performance tracking
- [ ] **Plan Conversion**: Track how many users upgrade after requesting support
- [ ] **Customer Satisfaction**: Post-resolution surveys and feedback collection
- [ ] **Escalation Tracking**: Monitor ticket escalations and resolution patterns

**Current Status**: 
- ✅ Basic operator manual control implemented (activeChatbot flag)
- ❌ No formal ticketing system
- ❌ No plan-based access control
- ❌ No operator assignment or management

**Business Impact**: **HIGH** - Ticketing system is essential for customer retention and provides clear upgrade path from Basic to Professional plans.

### 25. **Plan-Based AI Prompt System**
**Priority**: 🚨 **HIGH**
**Description**: Dynamic AI prompt loading based on workspace subscription plan with different capabilities per tier
**Acceptance Criteria**:

#### 🤖 **Dynamic Prompt Loading**:
- [ ] **Plan Detection**: Automatically detect workspace subscription plan
- [ ] **Prompt Selection**: Load appropriate AI prompt based on plan tier
- [ ] **Real-time Updates**: Update prompts immediately when plan changes
- [ ] **Fallback System**: Default prompt if plan-specific prompt unavailable
- [ ] **Prompt Caching**: Cache prompts for performance optimization

#### 📋 **Plan-Specific Prompts**:

**Free Plan Prompt**:
- [ ] **Limited Features**: Basic product information and simple queries only
- [ ] **Upgrade Messaging**: Frequent mentions of premium features available with upgrade
- [ ] **Support Limitations**: "For human support, upgrade to Professional plan"
- [ ] **Feature Restrictions**: No complex order processing, limited product recommendations

**Basic Plan Prompt**:
- [ ] **Enhanced Features**: Full product catalog access, order processing
- [ ] **Moderate Upgrade Messaging**: Occasional mentions of Professional features
- [ ] **Limited Support**: "Human support available with Professional plan upgrade"
- [ ] **Standard Capabilities**: Normal e-commerce functionality

**Professional Plan Prompt**:
- [ ] **Full Features**: Complete AI capabilities, advanced recommendations
- [ ] **Ticketing Integration**: "I can connect you with a human operator if needed"
- [ ] **Premium Messaging**: Emphasize premium service quality
- [ ] **Advanced Capabilities**: Complex queries, detailed analytics, priority handling

**Enterprise Plan Prompt**:
- [ ] **Maximum Features**: All AI capabilities plus custom features
- [ ] **Priority Support**: "You have priority support - connecting you immediately"
- [ ] **Custom Messaging**: Workspace-specific custom prompt additions
- [ ] **White-label Options**: Customizable AI personality and responses

#### 🔧 **Prompt Management System**:
- [ ] **Admin Interface**: Manage prompts for each plan tier
- [ ] **Version Control**: Track prompt changes and rollback capabilities
- [ ] **A/B Testing**: Test different prompt versions for optimization
- [ ] **Performance Metrics**: Track prompt effectiveness by plan
- [ ] **Multi-language Support**: Plan-specific prompts in all supported languages

#### 📊 **Database Schema Enhancement**:
```sql
-- Extend existing agent_config table
ALTER TABLE agent_config ADD COLUMN plan_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE agent_config ADD COLUMN is_default_for_plan BOOLEAN DEFAULT false;

-- Create plan-specific prompt templates
CREATE TABLE plan_prompt_templates (
  id UUID PRIMARY KEY,
  plan_tier VARCHAR(20) NOT NULL, -- 'free', 'basic', 'professional', 'enterprise'
  language VARCHAR(5) DEFAULT 'en',
  
  -- Prompt content
  system_prompt TEXT NOT NULL,
  welcome_message TEXT,
  upgrade_message TEXT,
  support_message TEXT,
  
  -- AI parameters
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 250,
  top_p DECIMAL(3,2) DEFAULT 0.95,
  
  -- Metadata
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plan_prompts_tier_lang ON plan_prompt_templates(plan_tier, language);
```

#### 🎯 **Prompt Content Strategy**:

**Free Plan Features**:
- Basic product information
- Simple FAQ responses
- Upgrade prompts for advanced features
- No human support access

**Basic Plan Features**:
- Full product catalog
- Order processing
- Basic recommendations
- Upgrade prompts for human support

**Professional Plan Features**:
- Advanced AI capabilities
- Human support integration
- Priority response handling
- Advanced analytics mentions

**Enterprise Plan Features**:
- Custom AI personality
- Immediate priority support
- Advanced integrations
- White-label messaging

#### 🔄 **Implementation Flow**:
- [ ] **Plan Check**: Verify workspace plan on each message
- [ ] **Prompt Loading**: Load appropriate prompt from database
- [ ] **Context Injection**: Inject plan-specific context into AI request
- [ ] **Response Processing**: Process AI response with plan-specific rules
- [ ] **Upgrade Triggers**: Detect when to suggest plan upgrades

#### 📈 **Analytics & Optimization**:
- [ ] **Conversion Tracking**: Track plan upgrades triggered by AI interactions
- [ ] **Prompt Performance**: Measure response quality by plan tier
- [ ] **User Satisfaction**: Track satisfaction scores by plan
- [ ] **A/B Testing Results**: Compare different prompt strategies

**Current Status**: 
- ✅ Basic agent configuration system implemented
- ✅ Single prompt system working
- ❌ No plan-based prompt differentiation
- ❌ No upgrade messaging integration

**Business Impact**: **HIGH** - Plan-based prompts will drive upgrades and provide clear value differentiation between subscription tiers.

### 26. **Database Schema Updates & Migration System**
**Priority**: 🔥 **MEDIUM**
**Description**: Update database schema to support new features and implement proper migration system
**Acceptance Criteria**:

#### 🗄️ **Schema Updates**:
- [ ] **Secure Tokens Table**: Add comprehensive token management table
- [ ] **Support Tickets Tables**: Add ticketing system tables
- [ ] **Plan Prompt Templates**: Add plan-based prompt management
- [ ] **Audit Logging**: Add security audit logging tables
- [ ] **Message Templates**: Add WhatsApp message template storage

#### 🔄 **Migration Management**:
- [ ] **Migration Scripts**: Create Prisma migrations for all new tables
- [ ] **Data Migration**: Migrate existing data to new schema structure
- [ ] **Rollback Procedures**: Document rollback procedures for each migration
- [ ] **Testing Migrations**: Test migrations on development and staging environments
- [ ] **Production Deployment**: Safe production migration procedures

#### 🔍 **Data Integrity**:
- [ ] **Foreign Key Constraints**: Ensure proper relationships between tables
- [ ] **Index Optimization**: Add indexes for performance optimization
- [ ] **Data Validation**: Add database-level validation rules
- [ ] **Backup Procedures**: Update backup procedures for new tables
- [ ] **Performance Testing**: Test database performance with new schema

**Current Status**: 
- ✅ Basic schema implemented
- ❌ Missing tables for new features
- ❌ No comprehensive migration system

**Technical Impact**: **MEDIUM** - Proper database schema is foundation for all new features.

---

## 📊 **TASK PRIORITY SUMMARY**

### 🚨 **HIGH Priority (Must Complete First)**
1. **Security Audit & Vulnerability Assessment** (Task #19)
2. **WhatsApp Message Creation & Template System** (Task #20)  
3. **Temporary Token System for Secure Links** (Task #21)
4. **Ticketing System with Plan-Based Access** (Task #22)
5. **Plan-Based AI Prompt System** (Task #23)
6. **JWT Security Enhancement & Token Management** (Task #5)
7. **Spam Detection & Auto-Blacklist System** (Task #1)
8. **API Rate Limiting System** (Task #6)
9. **Seed Database with Customer Chat History** (Task #2)
10. **Product Pricing with Discount Calculation** (Task #3)
11. **Block User Integration with Settings** (Task #4)
12. **Landing Page with Multi-Language Support** (Task #17)

### 🔥 **MEDIUM Priority (Important but not blocking)**
1. **Database Schema Updates & Migration System** (Task #24)
2. **Workspace-Specific GDPR Management** (Task #18)
3. **Pay-Per-Use Billing System Epic** (Tasks #7-12)
4. **Professional Plan Contact Sales Form** (Task #10)

### 🟡 **LOW Priority (Future enhancements)**
1. **Multi-Channel WhatsApp Management** (Task #11)
2. **Performance Optimization & Monitoring** (Task #16)

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Phase 1: Security & Core Features (Weeks 1-2)**
- Complete JWT security enhancement
- Implement security audit requirements
- Add spam detection and auto-blacklist
- Create temporary token system

### **Phase 2: Advanced Messaging & Support (Weeks 3-4)**
- Build WhatsApp message template system
- Implement ticketing system with plan-based access
- Create plan-based AI prompt system
- Add operator management features

### **Phase 3: Business Features (Weeks 5-6)**
- Implement product pricing with discounts
- Add customer chat history to seed
- Create landing page with multi-language support
- Build block user integration

### **Phase 4: Billing & Enterprise (Weeks 7-8)**
- Implement pay-per-use billing system
- Add professional plan contact sales
- Create multi-channel WhatsApp management
- Performance optimization and monitoring

--- 