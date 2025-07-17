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

## TASK #34

**TITLE**: Manual Operator Message History Saving
**DESCRIPTION/ROADMAP**:

- Ensure that when a human operator sends a message (manual operator mode), the message is always saved to the chat history
- Guarantee full auditability and traceability of all operator actions
- Test operator/manual mode logic to confirm messages are properly stored
- Verify that both AI/LLM responses and manual operator messages appear in chat history

**SPECIAL NOTE**:
Andrea requires complete message history for all interactions, including manual operator messages, for audit and quality purposes.

**STORY POINT**: 2
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

## TASK #26

**TITLE**: Automatic Embedding Trigger on Data Change
**DESCRIPTION/ROADMAP**:

- Remove the manual embedding button from all relevant sections (documents, products, FAQs, services, etc.)
- Automatically trigger the embedding process after every add, update, or delete operation
- Ensure this behavior is consistent across all sessions and entity types
- No manual intervention required for embedding generation
- Test thoroughly to confirm embeddings are always up-to-date

**SPECIAL NOTE**:
Andrea requires a clean and maintainable database. All legacy or unused tables must be removed to avoid confusion and improve performance.hat embedding is always up-to-date and automatic. The manual embedding button is no longer desired and must be removed everywhere.

**STORY POINT**: TBD**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2tarted

================================================================================================================================================================

## TASK #23 - N8N workflow does not contain the removed filters

cumentation and technical checklist as needed
**TITLE**: Remove N8N Filter for isActive and isBlacklisted – Move Logic to Backend (LLM/Workflow Bypass)
**DESCRIPTION/ROADMAP**:

- Refactor the backend message processing logic so that:- Centralizes business logic in the backend for better maintainability and security
  - If `customer.isActive === false` **OR** `customer.isBlacklisted === true`, the backend must: or inactive customers
    - NOT call LLM (no OpenRouter, no AI response)
    - NOT call N8N (no workflow trigger)of logic
    - Only save the inbound message to history (using MessageRepository.saveMessage)
    - Return a 200 OK with `processedMessage: ""` and no error
- Remove the corresponding filter/condition from the N8N workflow:
  - Eliminate any N8N node or filter that checks `{{$json.precompiledData.customer.isActive}}` or `{{$json.precompiledData.customer.isBlacklisted}}`checks in the backend only
  - The backend will be the single source of truth for these checks
- Ensure that the logic is now identical to how `activeChatbot` is handled (manual operator mode):
  - If any of these conditions are true, the system is "muted" for AI/automation, but always logs the message
- Add/Update unit and integration tests to verify:
  - No LLM/N8N call is made when customer is inactive or blacklisted
  - Messages are always saved to history
  - N8N workflow does not contain the removed filters========================================
- Update documentation and technical checklist as needed
  (manual operator mode), the message is always saved to the chat history, just like AI/LLM responses. This guarantees full auditability and traceability of all operator actions (operator/manual mode logic).
  **RATIONALE**:- [ ] On the FAQ page (/faq), if there are 10 or fewer elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (FAQ page pagination logic)
  he 'Add Categories' button to just 'Add' for consistency across all CRUD pages (button text standardization)
- Centralizes business logic in the backend for better maintainability and security- [ ] On the Offers page (/offers), if there are fewer than 10 elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (Offers page pagination logic)
- Prevents accidental AI/automation triggers for blocked or inactive customers
- Ensures message history is always complete, regardless of customer status
- Simplifies N8N workflow and reduces duplication of logic
  ion
  **SPECIAL NOTE**:**DESCRIPTION/ROADMAP**:

- This task will remove the filter logic from N8N and enforce all checks in the backend only- Create a legal notice ('Aviso legal') PDF document.
- Applies to both REST API and WhatsApp/N8N webhook flowstion or appropriate storage).
- Must be coordinated with N8N workflow update to avoid regressions section (e.g., legal, compliance, or info page).
  gement works as expected.
  **STORY POINT**: TBD- Use this as a test case for document/PDF management features.
  **STATUS**: 🔴 Not Started

================================================================================Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.

- [ ] Ensure that when a human operator sends a message (manual operator mode), the message is always saved to the chat history, just like AI/LLM responses. This guarantees full auditability and traceability of all operator actions (operator/manual mode logic).**STATUS**: 🔴 Not Started
- [ ] On the FAQ page (/faq), if there are 10 or fewer elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (FAQ page pagination logic)- [ ] Change the 'Add Categories' button to just 'Add' for consistency across all CRUD pages (button text standardization)- [ ] On the Offers page (/offers), if there are fewer than 10 elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (Offers page pagination logic)## TASK #30**TITLE**: Implement 'Aviso legal' PDF Upload and Integration**DESCRIPTION/ROADMAP**:- Create a legal notice ('Aviso legal') PDF document.- Upload the PDF to the system and ensure it is stored correctly (e.g., in the documents section or appropriate storage).- Integrate the PDF so it is accessible from the relevant section (e.g., legal, compliance, or info page).- Test the upload and retrieval process to verify PDF/document management works as expected.- Use this as a test case for document/PDF management features.**SPECIAL NOTE**:Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.**STATUS**: 🔴 Not Started

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
