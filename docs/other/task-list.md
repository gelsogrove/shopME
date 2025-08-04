# Phase 0 task

# PHASE 1 TASKS

- devo verificare la mail
- ordini ?
- sistema di invoice ?
- i testi in italiano li abbiamo tolti tutti?
- che modello stiamo usando?
- abbiamo una memoria consistente?

## TASK #38

**TITLE**: Implement 'Aviso legal' PDF Upload and Integration
**DESCRIPTION/ROADMAP**:

- ✅ Create a legal notice ('Aviso legal') PDF document → Aviso Legal PDF added
- ✅ Upload the PDF to the system and ensure it is stored correctly (e.g., in the documents section or appropriate storage)
- ✅ Integrate the PDF so it is accessible from the relevant section (e.g., legal, compliance, or info page)
- ✅ Test the upload and retrieval process to verify PDF/document management works as expected
- ✅ Use this as a test case for document/PDF management features

**SPECIAL NOTE**:
Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.

**IMPLEMENTATION NOTES**:

- Added `aviso-legal.pdf` to `/backend/prisma/samples/`
- Created `seedAvisoLegalDocument()` function following existing pattern
- Document will be automatically copied to uploads directory with timestamp
- Embeddings/chunks will be generated automatically during seed process
- Available via existing document management APIs

**STATUS**: ✅ Completed

## TASK #39

**TITLE**: Fix FAQ Embedding Auto-Regeneration Bug
**DESCRIPTION/ROADMAP**:

- 🔴 **CRITICAL BUG**: When saving/updating entries, embeddings are NOT automatically regenerated
- User modified FAQ delivery time from "24-48 hours" to "3-6 days" but system still returns old information
- ✅ **ROOT CAUSE IDENTIFIED**: Problem affects ALL entity types (FAQ, Products, Services, Documents)
- ✅ **ENHANCED LOGGING**: Added comprehensive logging to track embedding regeneration process for ALL entities
- ✅ **FAQ CONTROLLER**: Fixed silent error handling, added detailed logging
- ✅ **PRODUCT CONTROLLER**: Fixed silent error handling, added detailed logging
- ✅ **SERVICE CONTROLLER**: Fixed silent error handling, added detailed logging
- ✅ **DOCUMENT CONTROLLER**: Fixed silent error handling, added detailed logging
- ✅ **EMBEDDING SERVICES**: Enhanced logging for Products and Services embedding generation
- ✅ **DEBUG ENDPOINT**: Added test endpoint `/test-embedding-regeneration` for manual testing
- ✅ **COMPILATION**: All changes compile successfully
- 🔴 **TESTING**: Need to test actual embedding regeneration flow with real data
- 🔴 **VALIDATION**: Confirm that updated content reflects in chatbot responses

**SPECIAL NOTE**:
Andrea discovered this critical bug affects the entire RAG search system - ANY content updates (FAQ, Products, Services, Documents) don't reflect in chatbot responses because embeddings are stale. This breaks the core functionality.

**REPRODUCTION STEPS**:

1. Modify any content entry (FAQ, Product description, Service details, Document)
2. Save the changes
3. Ask chatbot about the modified content
4. System returns old information instead of updated content

**DEBUGGING PROGRESS**:

- ✅ Enhanced logging across ALL controllers and embedding services
- ✅ Fixed silent error handling that was hiding embedding regeneration failures
- ✅ Added comprehensive debugging information for troubleshooting
- 🔴 Need to test with real server and validate the complete flow

**STORY POINT**: 3
**STATUS**: 🔴 CRITICAL BUG - Ready for Testing

# PHASE 2 TASKS

- prompt con url dinamici?
- token viene passato a n8n ?
- dentro il pannello di admin se il token scade cosa succede?

## TASK #3

**TITLE**: Extended Session Duration (1 Hour)
**DESCRIPTION/ROADMAP**:

- Configure JWT with 1 hour expiration (3600 seconds)
- Implement silent token refresh before expiration
- Add activity-based session renewal (reset timer on user activity)
- Create session monitoring and validation
- Implement graceful session expiry handling
- Add optional session time indicator

**SPECIAL NOTE**:
Andrea vuole lavorare 1 ora senza dover rifare il login. Attualmente la sessione scade troppo presto causando interruzioni del lavoro. Implementare refresh automatico silenzioso.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #10

**TITLE**: Advanced WhatsApp Features
**DESCRIPTION/ROADMAP**:

- Implement rich media support (images, documents)
- Integrate WhatsApp Business API features
- Add template message management
- Create automated response system
- Implement message scheduling
- Add bulk messaging capabilities

**SPECIAL NOTE**:
Funzionalità avanzate WhatsApp per il futuro. Richiede integrazione con WhatsApp Business API ufficiale.

**STORY POINT**: 21
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13A

**TITLE**: API Rate Limiting Implementation
**DESCRIPTION/ROADMAP**:

- Implement comprehensive API rate limiting middleware
- Configure different rate limits per endpoint type (public vs authenticated)
- Add rate limit headers to API responses
- Implement Redis-based rate limiting for scalability
- Add monitoring and alerting for rate limit violations
- Test rate limiting behavior under load

**SPECIAL NOTE**:
Focused security task for API protection against abuse and DoS attacks.

**STORY POINT**: 3
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13B

**TITLE**: Advanced Authentication & 2FA
**DESCRIPTION/ROADMAP**:

- Implement Two-Factor Authentication (2FA) with TOTP
- Add backup codes for 2FA recovery
- Implement account lockout after failed login attempts
- Add password strength requirements and validation
- Implement secure password reset flow with email verification
- Add login attempt monitoring and suspicious activity detection

**SPECIAL NOTE**:
Enhanced authentication security for user accounts protection.

**STORY POINT**: 8
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13C

**TITLE**: Database Performance Optimization
**DESCRIPTION/ROADMAP**:

- Analyze and optimize slow database queries
- Add proper database indexes for frequently queried fields
- Implement query result caching where appropriate
- Add database connection pooling optimization
- Implement pagination for large data sets
- Add database performance monitoring and alerting

**SPECIAL NOTE**:
Database optimization for improved application performance and scalability.

**STORY POINT**: 5
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13D

**TITLE**: Security Headers & OWASP Compliance
**DESCRIPTION/ROADMAP**:

- Implement comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Add input validation and sanitization across all endpoints
- Implement CSRF protection
- Add SQL injection prevention measures
- Implement XSS protection mechanisms
- Conduct security audit and fix vulnerabilities

**SPECIAL NOTE**:
OWASP compliance and security hardening for production readiness.

**STORY POINT**: 5
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13E

**TITLE**: Comprehensive Logging & Monitoring
**DESCRIPTION/ROADMAP**:

- Implement structured logging with appropriate log levels
- Add error tracking and alerting system
- Implement application performance monitoring (APM)
- Add health check endpoints for system monitoring
- Implement log aggregation and search capabilities
- Add metrics collection for business intelligence

**SPECIAL NOTE**:
Monitoring and observability for production operations and debugging.

**STORY POINT**: 5
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #15

**TITLE**: Full Application Responsiveness
**DESCRIPTION/ROADMAP**:

- Review all frontend pages and components to ensure they are fully responsive
- Test on various devices and screen sizes (mobile, tablet, desktop)
- Fix any layout, overflow, or usability issues
- Maintain design system consistency and accessibility

**SPECIAL NOTE**:
Andrea requires that the entire application is fully responsive for a seamless user experience on all devices.

**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #18

**TITLE**: Database Cleanup: Remove Unused Tables
**DESCRIPTION/ROADMAP**:

- Identify all tables in the database that are no longer used by the application
- Remove unused tables from the Prisma schema
- Create and run proper Prisma migrations to drop these tables
- Ensure no code references or dependencies remain for removed tables
- Test the system thoroughly to confirm no regressions or errors
- Update documentation and ERD if necessary

**SPECIAL NOTE**:
**SPECIAL NOTE**:
Andrea requires a clean and maintainable database. All legacy or unused tables must be removed to avoid confusion and improve performance.

**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2

## TASK #19

Configurazione manuale token in N8N poi deve arrivare alle chiamate
di CF e validare il token se non va bisogna ritornare un messaggio
di errore chiaro per il cliente

## TASK #27

**TITLE**: Payment Page: Create Order and Handle Shipping Address via Call Function
**DESCRIPTION/ROADMAP**:

- On payment confirmation, trigger a call function to the backend to create a new order record
- Manage the shipping address as part of this call function flow
- Update the call function prompt to include all necessary order and shipping address details
- Ensure the backend correctly saves the order and shipping address
- Test the end-to-end flow from payment to order creation and address storage

**SPECIAL NOTE**:
Andrea requires that the payment page, once payment is confirmed, always triggers a backend call function to create the order and handle the shipping address. The prompt for the call function must be updated to reflect this logic.

**STORY POINT**: 7
**STATUS**: 🔴 Not Started

================================================================================
