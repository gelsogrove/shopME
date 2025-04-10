# ShopMe – Realistic Project Task List (60 Unique Tasks)

## 📌 Summary by Epic

- System Setup & Architecture: 10 tasks
- Authentication & 2FA: 10 tasks
- Product Management: 10 tasks
- Orders & Cart: 10 tasks
- Clients, GDPR & Tokenization: 10 tasks
- AI, WhatsApp & Messaging: 10 tasks

**Total Tasks: 60**

## ✅ Full Task List

// ... existing tasks until TASK-0040 ...

=============== TASK-0041 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: First-time WhatsApp client consent
**Description**:
When a new client writes for the first time on WhatsApp, implement privacy policy acceptance flow:

1. Send a welcome message with privacy policy (from GDPR.md) in user's language (ITA/ESP/ENG)
2. Wait for explicit consent via "ACCETTO" (ITA) / "ACEPTO" (ESP) / "I ACCEPT" (ENG)
3. No AI processing or data storage until explicit consent is received
4. Store consent timestamp in client record
5. After consent, enable full WhatsApp bot functionality

Technical Requirements:

- Use privacy policy text from GDPR.md
- Support multi-language consent messages
- Store consent timestamp in clients table
- Block all AI/automated processing until consent
- Log first message metadata only (no content storage pre-consent)

Note: This is separate from platform user GDPR consent (TASK-0014). Future MVP will include UNSUBSCRIBE functionality.

- [ ] Not started
  - To be implemented:
  - Multi-language welcome message with privacy policy
  - Explicit consent validation ("ACCETTO"/"ACEPTO"/"I ACCEPT")
  - Pre-consent message handling
  - Consent timestamp storage
  - Message processing flow control

=============== TASK-0042 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Store GDPR acceptance in DB
**Description**:
Add `privacyAcceptedAt`, `privacyVersion` to `clients` table for both platform users and WhatsApp clients.

- [x] Completed
  - Added GDPR fields to schema
  - Implemented acceptance tracking
  - Added version tracking for policy updates

=============== TASK-0043 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Re-ask for consent if version outdated
**Description**:
Compare accepted version with current, resend if different.

- [x] Completed
  - Added version comparison
  - Implemented consent renewal flow
  - Added version tracking

=============== TASK-0044 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Tokenize PII before AI prompt
**Description**:
As per GDPR.md Section 6, implement PII tokenization:

- Replace sensitive data (names, phones, addresses) with tokens
- Store token mappings securely and temporarily
- Never share original PII with external services

- [ ] Not started
  - Implement tokenization service
  - Define PII detection patterns
  - Create secure token storage
  - Add token lifecycle management

=============== TASK-0051 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Connect WhatsApp webhook to n8n
**Description**:
Configure webhook to forward all messages to n8n for processing, with GDPR compliance:

- Check consent status before processing
- Handle pre-consent messages appropriately
- Support multi-language interactions
- Implement message queueing for consent checks

- [ ] Not started
  - Setup n8n webhook endpoint
  - Implement consent verification
  - Configure message routing
  - Add language detection

=============== TASK-0052 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Classify message type
**Description**:
Use keywords and NLP to detect message type (order, question, etc.) with privacy considerations:

- Only process messages after consent
- Support multiple languages (ITA/ESP/ENG)
- Handle consent-related keywords (ACCETTO/ACEPTO/I ACCEPT)
- Identify potential UNSUBSCRIBE requests (future MVP)

- [ ] Not started
  - Implement message classification
  - Add multi-language support
  - Create consent keyword detection
  - Setup message type routing

=============== TASK-0096 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Refactor Prompts to Agents with Router Capability
**Description**:
Refactor the application to replace the Prompts system with a more powerful Agents system, with the following changes:

1. Rename "Prompts" to "Agents" throughout the application (menu, UI, backend)
2. Update the database schema to replace isActive with isRouter
3. Add department field to specify agent specialization (ORDERS, PRODUCTS, etc.)
4. Implement logic to ensure only one agent can be a router at a time
5. Add UI indicators to identify router agents
6. Eliminate all references to "prompts" in the codebase

- [x] Completed
  - [x] Renamed "Prompts" to "Agents" in UI and updated icons
  - [x] Replaced isActive with isRouter in the schema and APIs
  - [x] Added department field for agent specialization
  - [x] Implemented router agent logic in backend and frontend
  - [x] Added visual indicators for router agents in the UI
  - [x] Updated seed data with router and specialized agents
  - [x] Removed all references to "prompts" in the codebase

// ... rest of the tasks remain unchanged ...
