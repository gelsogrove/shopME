# PHASE 1 TASKS

- ⏳ **TODO: n8n TOKEN** - Configurazione manuale token in N8N (Andrea)
- CF pdf
- SISTEMARE IL PRD
- TEST DEVONO ESSERE FUNZIONANTI
- sistema di invoice ?

- Posco fare qualcos'altro per lei nel frattempo? (da togliere)
- Analytics Dashboard- defailt 1 mese e poi dobbiamo capire i costi mensili mostrarli
- pulizia metodi
- mettere campo debug-mode per evtare di far salire il contatore

## TASK #24

**TITLE**: N8N - CF New Order
**DESCRIPTION/ROADMAP**:

- Implement a new N8N Custom Function (CF) for the "New Order" workflow
- Integrate with backend as needed
- Ensure proper error handling and logging
- Test the workflow end-to-end

**SPECIAL NOTE**:
Andrea requires a dedicated N8N CF for new order management.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

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

## TASK #38

**TITLE**: Implement 'Aviso legal' PDF Upload and Integration
**DESCRIPTION/ROADMAP**:

- Create a legal notice ('Aviso legal') PDF document
- Upload the PDF to the system and ensure it is stored correctly (e.g., in the documents section or appropriate storage)
- Integrate the PDF so it is accessible from the relevant section (e.g., legal, compliance, or info page)
- Test the upload and retrieval process to verify PDF/document management works as expected
- Use this as a test case for document/PDF management features

**SPECIAL NOTE**:
Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.

**STATUS**: 🔴 Not Started

================================================================================

blockuser

-

# PHASE 2 TASKS

- prompt con url dinamici?
- ⏳ **TODO: token viene passato?**
- - dentro il pannello se il token scade?

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

================================================================================

## NOTE
