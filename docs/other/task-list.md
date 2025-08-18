## Task List

This list consolidates existing tasks, renumbered and cleaned. Use plain numeric IDs; no TA- prefixes. Keep UI/layout unchanged unless explicitly approved.

### ✅ Completed Tasks

**AI Dev Tasks System - Removed** ✅ COMPLETED
- Installed and tested AI Dev Tasks workflow system
- Determined it was not needed for current workflow
- Removed to simplify project structure
- Continuing with existing memory-bank + task-list system
- Story Points: 1
- Status: ✅ COMPLETED (Removed)

### Top Action Tasks

1. Enforce workspaceId Everywhere (+ Tests)
   - Ensure every API and calling function includes and validates `workspaceId`.
   - Filter all reads/writes by `workspaceId` (products, orders, etc.).
   - Add tests to detect any missing `workspaceId` usage.
   - Note: Authentication flows (login, forgot password, new user), workspace list/creation may be exempt by design.
   - Story Points: 3
   - Status: Not Started

2. Customer Profile Management Page ✅ COMPLETED
   - Implement secure customer profile management page accessible via WhatsApp bot
   - Token-based authentication with 1-hour expiration
   - Form validation and error handling
   - Database integration for profile updates
   - UI/UX consistency with existing application
   - Story Points: 8
   - Status: ✅ COMPLETED
   - Notes:
     - Backend: API endpoints for profile retrieval and update
     - Frontend: CustomerProfilePublicPage with ProfileForm component
     - WhatsApp: GetCustomerProfileLink() calling function integrated
     - Security: Token validation and workspace isolation
     - Documentation: Swagger and PRD updated

3. PromptAgent Cart Coherence (Live Updates)
   - Ensure chat cart and `CreateOrder.items` remain consistent at all times.
   - Keep configuration strictly from DB; no static fallbacks.
   - Focus on preventing empty `items` arrays when the cart shows content.
   - Story Points: 3
   - Status: Not Started

4. Clear Cart State After Order (Hidden System Message)
   - In N8N, after successful order creation, send a hidden system message to clear cart memory.
   - Delay by ~5 seconds to avoid race conditions; never send on cancel/failure.
   - Story Points: 2
   - Status: Not Started

5. Automate N8N Seed Login and Workspace Activation
   - Make N8N authentication and workspace activation automatic during seed/start.
   - Persist session (cookie/token). Auto-activate the single active workspace from DB.
   - No hardcoded IDs; the flow must be idempotent.
   - Story Points: 3
   - Status: Not Started

6. Scripts Hygiene and Cleanup
   - Keep only scripts actually used (referenced in backend scripts or seed flow).
   - Remove temporary/debug scripts under `/scripts/` that are no longer needed.
   - Story Points: 2
   - Status: Not Started

7. Calling Functions for Past Orders (History & Reorder)
   - Add calling functions to list past orders and to repeat a previous order.
   - Integrate with N8N and update Swagger accordingly.
   - Always respect workspace isolation in queries.
   - Story Points: 5
   - Status: Completed
   - Notes:
     - Public orders flow implemented: FE `/orders-public` with filters via query params (status, payment, from, to, orderCode).
     - BE public endpoints: `GET /api/internal/public/orders`, `GET /api/internal/public/orders/:orderCode` with phone+workspace filtering.
     - N8N `GetOrdersListLink()` updated to produce phone-based external links with optional filters and `orderCode` auto-expand.
     - Invoice/DDT PDF generation added; detail page shows IVA, imponibile, spedizione, tracking e pagamento.

8. Model Configuration Audit and Dynamic Selection
   - Verify current model usage and enable dynamic selection via DB (agent config) through N8N.
   - Avoid static defaults; return a clear error if missing.
   - Story Points: 2
   - Status: Not Started

9. FE/BE Dead Code Cleanup
   - Remove unused files/exports in frontend and backend without altering layout/UX.
   - Keep code style and lint rules consistent.
   - Story Points: 2
   - Status: Not Started

10. Shipment Tracking Spike (DHL Demo)
    - Explore a simple tracking UX using a `tracking-id` URL param.
    - If order context exists, reply with tracking link; otherwise provide a generic tracking page.
    - Spike only; no schema changes without explicit approval.
    - Story Points: 3 (Spike)
    - Status: Not Started

11. Payment Page: Create Order and Handle Shipping Address via Calling Function
    - On payment confirmation, trigger a calling function to create an order and persist the shipping address.
    - Update the CF prompt to include all required order and shipping details.
    - Ensure backend saves correctly and test the end-to-end flow.
    - Story Points: 7
    - Status: Not Started

12. Token to N8N and Validation in Calling Functions
    - Configure manual token in N8N and propagate it to CF calls.
    - Validate token on incoming CF calls; return a clear error to the user if invalid.
    - Status: Not Started

### Phase 2 / Backlog

- Extended Session Duration (1 Hour)
  - Configure JWT to 1h (3600s), add silent refresh, activity-based renewal, monitoring, and graceful expiry handling.
  - Story Points: 5
  - Status: Phase 2

- Advanced WhatsApp Features
  - Rich media, official Business API features, templates, scheduling, and bulk messaging.
  - Story Points: 21
  - Status: Phase 2

- API Rate Limiting Implementation
  - Middleware, differentiated limits, headers, Redis, monitoring, and tests under load.
  - Story Points: 3
  - Status: Phase 2

- Advanced Authentication & 2FA
  - TOTP, backup codes, lockout, password strength, secure reset, and suspicious activity detection.
  - Story Points: 8
  - Status: Phase 2

- Database Performance Optimization
  - Query optimization, indexes, caching, pooling, pagination, and monitoring.
  - Story Points: 5
  - Status: Phase 2

- Security Headers & OWASP Compliance
  - CSP/HSTS/X-Frame-Options, input validation, CSRF, SQLi and XSS protections, security audit.
  - Story Points: 5
  - Status: Phase 2

- Comprehensive Logging & Monitoring
  - Structured logs, error tracking, APM, health checks, log aggregation/search, BI metrics.
  - Story Points: 5
  - Status: Phase 2

- Full Application Responsiveness
  - Review all pages/components for responsiveness across devices; fix layout/overflow issues while preserving design system.
  - Story Points: TBD
  - Status: Phase 2


