
## TOP ACTION TASKS

## TASK #1

**TITLE**: PRD Audit and Update
**DESCRIPTION/ROADMAP**:

- Review `docs/PRD.md` for cart auto-extraction, cart reset, workspace isolation, CFs, and model config.
- Ensure all content is in English and matches implementation.

**SPECIAL NOTE**:
PRD is the source of truth; align with tests and code.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #2

**TITLE**: Testing Gap Analysis and Coverage
**DESCRIPTION/ROADMAP**:

- Identify critical areas: cart flow, CFs, N8N payload mapping, workspace isolation, auth, rate limits.
- Add missing unit/integration tests.

**SPECIAL NOTE**:
Prioritize high-risk flows affecting customers.

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #3iop'0



**TITLE**: Enforce workspaceId Everywhere (+ Tests)
**DESCRIPTION/ROADMAP**:

- Ensure every API/CF includes and validates `workspaceId`.
- Filter all reads/writes by `workspaceId` (products, orders, etc.).
- Add tests detecting missing `workspaceId` usage.

**SPECIAL NOTE**:
Multiple WhatsApp channels must not mix data; isolation is mandatory.
ovviamnte la parte di login forgot pwd new user list workspace create workspace non hanno questo controllo

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #4

**TITLE**: PromptAgent Cart Coherence (Live Updates)
**DESCRIPTION/ROADMAP**:

- Update `prompt_agent` so chat cart and CreateOrder `items` are always consistent.
- Keep configuration from DB; no static fallbacks.

**SPECIAL NOTE**:
Focus on preventing empty `items` arrays despite visible cart content.

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #5

**TITLE**: Clear Cart State After Order (Hidden System Message)
**DESCRIPTION/ROADMAP**:

- In N8N, add a hidden system message after successful order creation to clear cart memory.
- Delay the system message by ~5 seconds to avoid race conditions.
- Ensure the message is invisible to the end user.

**SPECIAL NOTE**:
Trigger only on success; never on cancel/failure.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #6

**TITLE**: Automate N8N Seed Login and Workspace Activation
**DESCRIPTION/ROADMAP**:

- Make N8N authentication and workspace activation fully automatic during seed/start.
- Apply a surgical change to the existing script (no regressions to the current flow).
- Persist session (cookie/token) and auto-activate the single active workspace from DB.

**SPECIAL NOTE**:
No hardcoded IDs; read the only active workspace from DB. Flow must stay idempotent.

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #7

**TITLE**: Scripts Hygiene and Cleanup
**DESCRIPTION/ROADMAP**:

- Keep only scripts actually used (referenced in `backend/package.json` or seed flow).
- Delete temporary/debug scripts under `/scripts/` that are no longer needed.

**SPECIAL NOTE**:
No archive; remove if unused.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #8

**TITLE**: Calling Functions for Past Orders (History & Reorder)
**DESCRIPTION/ROADMAP**:

- Add CFs to list past orders and repeat a previous order.
- Integrate with N8N and update Swagger.

**SPECIAL NOTE**:
Respect workspace isolation in all queries.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #9

**TITLE**: Model Configuration Audit and Dynamic Selection
**DESCRIPTION/ROADMAP**:

- Verify current model and enable dynamic selection via DB (agent config) through N8N.
- Avoid static defaults; error clearly if missing.

**SPECIAL NOTE**:
All agent prompts/models must come from DB.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #10

**TITLE**: FE/BE Dead Code Cleanup
**DESCRIPTION/ROADMAP**:

- Remove unused files/exports in frontend and backend without changing layout/UX.
- Keep code style and lint rules consistent.

**SPECIAL NOTE**:
Do not alter existing UI/graphics.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #11

**TITLE**: Shipment Tracking Spike (DHL Demo)
**DESCRIPTION/ROADMAP**:

- Explore DHL demo (`tracking-id` URL param) for a simple tracking UX.
- Proposal: add `trackingCode` to orders (seed default `1234567890`) and respond with link when user asks "dov'è la merce".
- Fallback: provide generic tracking page if order context is unclear.

**SPECIAL NOTE**:
Spike only; no schema changes without approval.

**STORY POINT**: 3 (Spike)
**STATUS**: 🔴 Not Started

================================================================================

# PHASE 2 TASKS

- prompt_agent con url dinamici?
- token viene passato a n8n ?
- auth dentro le API ?
- fammi l'ultimo ordine 

## TASK #223

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

## TASK #120

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

## TASK #133

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

## TASK #134

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

## TASK #135

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

## TASK #136

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

## TASK #137

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

ma il wip funzioan?