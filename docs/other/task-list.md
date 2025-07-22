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

## TASK #25

**TITLE**: Integrate Google Translate Node for English Conversion in RAG Search
**DESCRIPTION/ROADMAP**:

- Integrate a Google Translate node into the RAG search workflow
- Automatically convert any non-English content (especially FAQs) to English before processing
- Update backend logic to ensure all relevant content is translated to English within the RAG flow
- Test the system to confirm correct translation and improved search accuracy

**SPECIAL NOTE**:
Andrea requires that all non-English content, especially FAQs, is automatically translated to English in the RAG search process for better LLM results.

**STORY POINT**: 6
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

# PHASE 2 TASKS

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

## TASK #13

**TITLE**: Security & Performance Optimization
**DESCRIPTION/ROADMAP**:

- Implement comprehensive API rate limiting
- Add advanced authentication (2FA)
- Optimize database queries for performance
- Add frontend performance monitoring
- Implement security headers and OWASP compliance
- Add comprehensive error logging and monitoring

**SPECIAL NOTE**:
Task di ottimizzazione generale per sicurezza e performance. Da implementare quando le funzionalità core sono stabili.

**STORY POINT**: 13
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

- SECUIRTY owasp
================================================================================

## TASK #28

**TITLE**: N8N Token Validation API Endpoint
**DESCRIPTION/ROADMAP**:

- Create new internal API endpoint: `POST /api/internal/validate-session-token`
- Accept sessionToken and workspaceId in request body
- Return validation result with customer data if valid
- Include proper error handling for expired/invalid tokens
- Add comprehensive logging for security monitoring

**TECHNICAL REQUIREMENTS**:
```typescript
// API Endpoint Implementation
POST /api/internal/validate-session-token
Body: { sessionToken: string, workspaceId: string }
Response: { 
  valid: boolean, 
  data?: { customerId, phoneNumber, expiresAt },
  error?: string 
}
```

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #29

**TITLE**: N8N Custom Function - Session Token Validator
**DESCRIPTION/ROADMAP**:

- Create new N8N Custom Function `validateSessionToken(sessionToken, workspaceId)`
- Integrate with backend validation API endpoint
- Throw proper errors for invalid/expired tokens
- Return customer data for valid tokens
- Update all relevant N8N workflows to use token validation

**TECHNICAL REQUIREMENTS**:
```javascript
// N8N Custom Function
async function validateSessionToken(sessionToken, workspaceId) {
  const response = await fetch('http://backend:3001/api/internal/validate-session-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken, workspaceId })
  })
  
  const result = await response.json()
  if (!result.valid) {
    throw new Error('Invalid or expired session token')
  }
  return result.data
}
```

**STORY POINT**: 4
**STATUS**: 🔴 Not Started

================================================================================

## TASK #30

**TITLE**: Public Link Token Validation Security
**DESCRIPTION/ROADMAP**:

- Add token validation middleware for all public links (checkout, invoice, cart)
- Implement frontend token validation before page load
- Add user-friendly error messages for expired/invalid links
- Ensure proper redirect flow for invalid tokens
- Update all link generation to include proper token parameters

**AFFECTED PAGES**:
- `/checkout?token=...&workspaceId=...`
- `/invoice?token=...&workspaceId=...` 
- `/cart?token=...&workspaceId=...`
- `/register?token=...&workspaceId=...` (enhanced)

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #31

**TITLE**: Enhanced Registration Link Token Security
**DESCRIPTION/ROADMAP**:

- Strengthen token validation on registration page
- Add proper error handling for expired registration links
- Implement token pre-validation before form display
- Add user feedback for invalid/expired registration attempts
- Ensure proper cleanup of used registration tokens

**TECHNICAL REQUIREMENTS**:
```typescript
// Enhanced validation flow
useEffect(() => {
  validateRegistrationToken(token, workspaceId)
    .then(result => {
      if (!result.valid) {
        setError('Link di registrazione scaduto o non valido')
        setShowForm(false)
        return
      }
      setCustomerData(result.data)
      setShowForm(true)
    })
    .catch(error => {
      setError('Errore durante la validazione del link')
    })
}, [token, workspaceId])
```

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #32

**TITLE**: N8N Custom Function - Ordinary Customer Handler
**DESCRIPTION/ROADMAP**:

- Create new N8N Custom Function `handleOrdinaryCustomer(customerData, sessionToken)`
- Implement business logic differentiation for ordinary vs premium customers
- Define feature restrictions and permissions for ordinary customers
- Integrate with existing customer management workflows
- Add proper logging and monitoring for customer type handling

**BUSINESS LOGIC**:
```javascript
// N8N Custom Function
async function handleOrdinaryCustomer(customerData, sessionToken) {
  return {
    customerType: 'ordinary',
    allowedFeatures: [
      'basic_chat', 
      'product_inquiry', 
      'basic_support'
    ],
    restrictions: [
      'no_priority_support',
      'limited_discount_access',
      'basic_feature_set'
    ],
    supportLevel: 'standard'
  }
}
```

**STORY POINT**: 4
**STATUS**: 🔴 Not Started

================================================================================

## TASK #33

**TITLE**: Token Security Testing & Monitoring Suite
**DESCRIPTION/ROADMAP**:

- Create comprehensive unit tests for all token services
- Implement integration tests for N8N ↔ Backend token validation
- Add performance monitoring for token operations
- Create admin dashboard for token usage statistics
- Implement security alerts for suspicious token activity

**TEST COVERAGE**:
- SessionTokenService auto-cleanup functionality
- Token validation API endpoint
- N8N Custom Function validation
- Public link token verification
- Registration token security flow

**STORY POINT**: 6
**STATUS**: 🔴 Not Started

================================================================================

## TASK #34

**TITLE**: Database Token Optimization & Indexing
**DESCRIPTION/ROADMAP**:

- Review and optimize database indexes for token tables
- Implement database performance monitoring for token operations
- Add database cleanup job scheduling (backup for auto-cleanup)
- Create token usage analytics and reporting
- Optimize query performance for high-volume token operations

**DATABASE OPTIMIZATIONS**:
```sql
-- Additional indexes for performance
CREATE INDEX idx_secure_tokens_workspace_type ON secure_tokens(workspaceId, type);
CREATE INDEX idx_secure_tokens_phone_expires ON secure_tokens(phoneNumber, expiresAt);
CREATE INDEX idx_registration_tokens_workspace_expires ON registration_tokens(workspaceId, expiresAt);
```

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## PHASE 1 BACKLOG ITEMS

**Priority Items:**
- DEPLOYMENT configuration and environment setup
- Dynamic URL prompts in N8N workflows  
- Static usage price review and dynamic pricing implementation
- Admin panel token management interface
- PDF generation and RAG integration for documents
