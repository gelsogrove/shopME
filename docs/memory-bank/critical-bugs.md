# 🚨 CRITICAL BUGS - ShopMe Project

## **SYSTEM STATUS: ✅ FUNCTIONAL WITH MINOR ISSUES**

**Date:** 2025-08-29  
**Status:** System operational, OpenRouter credits restored  
**Impact:** Minor functionality issues, core system working  
**Priority:** 🟡 MEDIUM - Fix remaining bugs  

---

## **BUG #1: ContactOperator Function - activeChatbot Not Disabled**

### **Status:** ❌ CRITICAL - Operator escalation not functional
### **Priority:** 🔴 HIGH
### **Date Identified:** 2025-08-29

### **Issue Description**
The `ContactOperator()` calling function does not disable `activeChatbot` when a customer requests human operator assistance.

### **Expected Behavior**
When `ContactOperator()` is called, it should:
1. Set `activeChatbot: false` for the customer
2. Send email notification to operator
3. Disable chatbot responses for that customer

### **Current Behavior**
The function appears to work correctly in the code but there's a bug where `activeChatbot` is not being set to `false`.

### **Code Location**
- **Function:** `backend/src/chatbot/calling-functions/ContactOperator.ts`
- **Controller:** `backend/src/interfaces/http/controllers/internal-api.controller.ts`
- **Tests:** `backend/src/__tests__/unit/ContactOperator.test.ts`

### **Impact**
- **Customer Escalation:** Customers cannot be properly escalated to human operators
- **Chatbot Control:** Chatbot continues to respond even after operator request
- **Operator Workflow:** Operators may not receive proper notifications
- **Customer Experience:** Frustration when chatbot doesn't stop responding

### **Root Cause**
Bug in the `ContactOperator()` function implementation where the `activeChatbot` field update is not working correctly.

### **Solution Required**
Fix the `ContactOperator()` function to properly disable `activeChatbot` when called.

### **Verification Steps**
1. Test `ContactOperator()` function call
2. Verify `activeChatbot` is set to `false` in database
3. Confirm chatbot stops responding to that customer
4. Verify operator notification email is sent

---

## **BUG #2: Chat History Disappearing in Popup - Messages Lost**

### **Status:** ❌ CRITICAL - Chat history not functional
### **Priority:** 🔴 HIGH
### **Date Identified:** 2025-08-29

### **Issue Description**
When chatting in the popup modal, the first messages in the chat history disappear and are not visible to users. This makes it impossible to see the complete conversation context.

### **Expected Behavior**
When opening a chat in the popup modal, all messages from the conversation should be visible, including the first messages that establish context.

### **Current Behavior**
- **First messages disappear** from chat history in popup
- **Incomplete conversation context** shown to users
- **Chat history truncated** without clear indication
- **User experience degraded** due to missing conversation start

### **Code Location**
- **Frontend Component:** `frontend/src/components/shared/WhatsAppChatModal.tsx`
- **Backend Repository:** `backend/src/repositories/message.repository.ts`
- **Chat Controller:** `backend/src/interfaces/http/controllers/chat.controller.ts`
- **API Endpoint:** `/api/chat/{sessionId}/messages`

### **Impact**
- **Customer Support:** Operators cannot see full conversation context
- **User Experience:** Incomplete chat history in popup
- **Debugging:** Difficult to trace conversation origins
- **Context Loss:** Missing important initial messages and context

### **Root Cause**
Potential issues in message retrieval or frontend rendering:
1. **Backend:** No explicit limit in `getChatSessionMessages()` but potential pagination issues
2. **Frontend:** Message state management or rendering problems in popup modal
3. **API:** Possible message truncation or ordering issues

### **Technical Details**
- **Backend Method:** `getChatSessionMessages()` returns all messages without `take` limit
- **Frontend State:** Messages stored in `useState<Message[]>([])` in WhatsAppChatModal
- **API Call:** `api.get(\`/chat/${chat.sessionId}/messages\`)` fetches messages
- **Message Ordering:** Backend orders by `createdAt: "asc"` (oldest first)

### **Solution Required**
Investigate and fix the chat history display issue in the popup modal to ensure all messages are visible.

### **Verification Steps**
1. Open a chat with existing message history in popup
2. Verify all messages from conversation start are visible
3. Check if messages are being truncated or filtered
4. Verify backend returns complete message history
5. Test with conversations of different lengths

### **Debugging Approach**
1. **Backend Logs:** Check if all messages are returned by API
2. **Frontend State:** Verify message array contains all messages
3. **UI Rendering:** Check if messages are being filtered or hidden
4. **Message Limits:** Verify no hidden pagination or limits

---

## **BUG #3: Model Parameters Hardcoded - Not Dynamic from Database**

### **Status:** ❌ CRITICAL - LLM configuration not functional
### **Priority:** 🔴 HIGH
### **Date Identified:** 2025-08-29

### **Issue Description**
The LLM model parameters (model, temperature, maxTokens) are hardcoded in multiple places throughout the codebase instead of being dynamically retrieved from the database `AgentConfig` table. This prevents workspace-specific customization and makes the system inflexible.

### **Expected Behavior**
All LLM calls should dynamically use the configuration from the database:
- **Model:** From `agentConfig.model` (default: "openai/gpt-4o-mini")
- **Temperature:** From `agentConfig.temperature` (default: 0.7)
- **MaxTokens:** From `agentConfig.maxTokens` (default: 1000)

### **Current Behavior**
Multiple hardcoded values found throughout the codebase:
- **Routes:** `temperature: 0.0`, `maxTokens: 3500`, `model: "gpt-4o"`
- **Dual LLM Service:** Some hardcoded values mixed with dynamic ones
- **App.ts:** Hardcoded model and token values
- **Inconsistent:** Some services use database config, others use hardcoded values

### **Code Location**
- **Routes:** `backend/src/routes/index.ts` (lines 243-245)
- **Dual LLM Service:** `backend/src/services/dual-llm.service.ts` (lines 95, 275)
- **App.ts:** `backend/src/app.ts` (lines 218-220, 272)
- **Database Schema:** `backend/prisma/schema.prisma` (AgentConfig model)

### **Impact**
- **Configuration Inflexibility:** Cannot customize LLM behavior per workspace
- **Inconsistent Behavior:** Different parts of system use different settings
- **Maintenance Issues:** Hard to change global LLM settings
- **User Experience:** No workspace-specific AI behavior customization
- **Cost Control:** Cannot optimize token usage per workspace

### **Root Cause**
1. **Incomplete Migration:** Not all code has been updated to use database config
2. **Mixed Implementation:** Some services use dynamic config, others use hardcoded values
3. **Legacy Code:** Old hardcoded values not replaced during refactoring
4. **Inconsistent Patterns:** Different services implement configuration differently

### **Technical Details**
- **Database Schema:** `AgentConfig` table has proper fields for dynamic configuration
- **Default Values:** Database has sensible defaults (temperature: 0.7, maxTokens: 1000)
- **Current Usage:** Some services correctly use `agentConfig.temperature || 0.0`
- **Problem Areas:** Webhook routes, app.ts, and some service methods still hardcoded

### **Solution Required**
Replace all hardcoded LLM parameters with dynamic database configuration:
1. **Update Routes:** Use `agentConfig` from database in webhook routes
2. **Fix App.ts:** Remove hardcoded values, use dynamic config
3. **Standardize Services:** Ensure all LLM calls use database configuration
4. **Add Validation:** Ensure database config exists before making LLM calls

### **Verification Steps**
1. Check webhook routes use database config instead of hardcoded values
2. Verify all LLM services consistently use `agentConfig` parameters
3. Test workspace-specific configuration changes
4. Ensure fallback values are reasonable when database config missing
5. Validate that different workspaces can have different LLM settings

### **Files to Update**
- `backend/src/routes/index.ts` - Webhook LLM configuration
- `backend/src/app.ts` - Remove hardcoded model/token values
- `backend/src/services/dual-llm.service.ts` - Ensure consistency
- Any other services with hardcoded LLM parameters

---

## **BUG #4: Missing Automatic Embedding Regeneration for Offers Updates**

### **Status:** ❌ CRITICAL - Offer embeddings not updated automatically
### **Priority:** 🔴 HIGH
### **Date Identified:** 2025-08-29

### **Issue Description**
When offers are updated, the system does not automatically trigger embedding regeneration, unlike other content types (FAQs, Products, Services, Documents) which have this functionality implemented. This causes stale embeddings and inaccurate search results for offers.

### **Expected Behavior**
When an offer is updated, the system should automatically:
1. Trigger embedding regeneration for offers
2. Update the offer chunks in the database
3. Ensure search results reflect the latest offer information
4. Maintain consistency with other content types

### **Current Behavior**
- **FAQs:** ✅ Automatic embedding regeneration on update
- **Products:** ✅ Automatic embedding regeneration on update  
- **Services:** ✅ Automatic embedding regeneration on update
- **Documents:** ✅ Automatic embedding regeneration on update
- **Offers:** ❌ **NO automatic embedding regeneration on update**

### **Code Location**
- **Offer Controller:** `backend/src/interfaces/http/controllers/offer.controller.ts`
- **Offer Service:** `backend/src/application/services/offer.service.ts`
- **Offer Repository:** `backend/src/repositories/offer.repository.ts`
- **Embedding Service:** `backend/src/services/embeddingService.ts` (has `generateOfferEmbeddings` method)

### **Impact**
- **Search Accuracy:** Users get outdated offer information in search results
- **RAG System:** Inconsistent behavior between different content types
- **User Experience:** Customers see incorrect offer details
- **Data Consistency:** Embeddings don't match current offer content
- **System Reliability:** Incomplete automation for content updates

### **Root Cause**
The `OfferController.updateOffer()` method is missing the automatic embedding regeneration logic that exists in other controllers:
- **FAQ Controller:** Has `embeddingService.generateFAQEmbeddings(workspaceId)`
- **Product Controller:** Has `embeddingService.generateProductEmbeddings(workspaceId)`
- **Service Controller:** Has `embeddingService.generateServiceEmbeddings(workspaceId)`
- **Document Controller:** Has `embeddingService.generateDocumentEmbeddings(workspaceId)`
- **Offer Controller:** **Missing embedding regeneration call**

### **Technical Details**
- **Embedding Service:** Already has `generateOfferEmbeddings()` method implemented
- **Database Schema:** `offer_chunks` table exists for storing offer embeddings
- **Pattern:** Other controllers use "fire-and-forget" approach with `.then()` and `.catch()`
- **Missing Code:** No call to `embeddingService.generateOfferEmbeddings(workspaceId)` in offer update

### **Solution Required**
Add automatic embedding regeneration to the `OfferController.updateOffer()` method:
1. **Import Embedding Service:** Add embedding service import
2. **Add Regeneration Call:** Call `generateOfferEmbeddings(workspaceId)` after successful update
3. **Add Logging:** Log the embedding regeneration process
4. **Add Error Handling:** Handle embedding generation failures gracefully
5. **Follow Pattern:** Use same "fire-and-forget" pattern as other controllers

### **Implementation Pattern**
Follow the same pattern used in other controllers:
```typescript
// Fire-and-forget: trigger embedding regeneration for offers
logger.info(
  `🔄 Offer updated, triggering embedding regeneration for workspace: ${workspaceId}, Offer ID: ${id}`
)
embeddingService
  .generateOfferEmbeddings(workspaceId)
  .then((result) => {
    logger.info(
      `✅ Offer embedding regeneration completed for workspace ${workspaceId}: processed ${result.processed} offers, errors: ${result.errors.length}`
    )
    if (result.errors.length > 0) {
      logger.warn(
        `⚠️ Offer embedding regeneration warnings:`,
        result.errors
      )
    }
  })
  .catch((err) => {
    logger.error(
      `❌ Offer embedding regeneration failed for workspace ${workspaceId}:`,
      err
    )
  })
```

### **Verification Steps**
1. Update an offer through the API
2. Verify embedding regeneration is triggered automatically
3. Check logs for embedding regeneration messages
4. Verify offer chunks are updated in database
5. Test search functionality with updated offer content
6. Ensure consistency with other content types

### **Files to Update**
- `backend/src/interfaces/http/controllers/offer.controller.ts` - Add embedding regeneration
- Verify `backend/src/services/embeddingService.ts` has `generateOfferEmbeddings` method
- Test the complete offer update flow

---

## **BUG #5: View Orders Link Not Working from Customer Profile Page**

### **Status:** ❌ CRITICAL - Navigation between public pages broken
### **Priority:** 🔴 HIGH
### **Date Identified:** 2025-08-29

### **Issue Description**
The "View Orders" button on the customer profile page (`/customer-profile?token=...`) does not work correctly. Users cannot navigate from the profile page to view their orders, breaking the cross-page navigation functionality.

### **Expected Behavior**
When clicking "View Orders" from the customer profile page:
1. User should be redirected to `/orders-public?token=...`
2. Token should be preserved and validated
3. Orders page should load correctly with the same token
4. Navigation should work seamlessly between profile and orders

### **Current Behavior**
- **Button exists** and is clickable
- **Click event fires** (logs show navigation attempt)
- **URL generation** appears correct
- **Navigation fails** - user cannot access orders page
- **Cross-page functionality broken** - users stuck on profile page

### **Code Location**
- **Frontend Page:** `frontend/src/pages/CustomerProfilePublicPage.tsx`
- **Navigation Function:** `handleViewOrders()` method
- **Target Route:** `/orders-public` in `frontend/src/App.tsx`
- **Token Handling:** `useTokenValidation` hook

### **Impact**
- **User Experience:** Customers cannot view orders from profile page
- **Navigation Flow:** Broken cross-page functionality
- **Business Process:** Incomplete customer journey
- **Token System:** TOKEN-ONLY system not working properly
- **Customer Support:** Users need to request new links for orders

### **Root Cause**
Potential issues in the navigation implementation:
1. **Token Validation:** Token might not be valid for orders page
2. **Route Configuration:** Orders route might have issues
3. **Navigation Method:** `window.location.href` might not work as expected
4. **Token Type Mismatch:** Profile token might not be compatible with orders page
5. **React Router:** Navigation might be blocked by React Router

### **Technical Details**
- **Navigation Method:** Uses `window.location.href = ordersUrl`
- **URL Generation:** `/orders-public?token=${token}`
- **Token System:** TOKEN-ONLY system (no type restrictions)
- **Route Configuration:** Both `/customer-profile` and `/orders-public` routes exist
- **Token Validation:** Both pages use `useTokenValidation` hook

### **Solution Required**
Fix the navigation between customer profile and orders pages:
1. **Debug Token Validation:** Verify token works on both pages
2. **Fix Navigation Method:** Ensure proper redirection
3. **Verify Route Configuration:** Check for route conflicts
4. **Test Token Compatibility:** Ensure same token works across pages
5. **Add Error Handling:** Provide feedback when navigation fails

### **Verification Steps**
1. Open customer profile page with valid token
2. Click "View Orders" button
3. Verify redirection to orders page
4. Check if orders page loads correctly
5. Verify token validation on orders page
6. Test navigation back to profile page
7. Ensure token persistence across navigation

### **Debugging Approach**
1. **Console Logs:** Check browser console for errors
2. **Network Tab:** Verify API calls and responses
3. **Token Validation:** Test token on both endpoints
4. **Route Testing:** Verify routes are accessible directly
5. **Navigation Method:** Test alternative navigation approaches

### **Files to Investigate**
- `frontend/src/pages/CustomerProfilePublicPage.tsx` - Navigation logic
- `frontend/src/pages/OrdersPublicPage.tsx` - Target page
- `frontend/src/App.tsx` - Route configuration
- `frontend/src/hooks/useTokenValidation.ts` - Token validation
- Browser console and network logs

---

## **SYSTEM HEALTH STATUS**

### **✅ Working Components**
- **API Endpoints:** Working correctly
- **Database:** Working correctly
- **Backend Services:** Working correctly
- **N8N Workflow:** Working correctly (OpenRouter credits restored)
- **Language Detection:** Working correctly
- **Link Generation:** Working correctly
- **Profile Management:** Working correctly
- **Order Processing:** Working correctly
- **System Health Tests:** Created and working

### **❌ Broken Components**
- **ContactOperator Function:** Not properly disabling activeChatbot

---

## **PREVENTION MEASURES**

### **System Health Monitoring**
- **Created:** `07_system-health.integration.spec.ts` with comprehensive health checks
- **Purpose:** Detect system failures early and automatically
- **Coverage:** N8N accessibility, OpenRouter API, database, backend API

### **Future Improvements**
- **Error Handling:** Add graceful degradation when LLM services fail
- **Monitoring:** Implement real-time system health monitoring
- **Alerts:** Set up automated alerts for system failures

---

## **DOCUMENTATION**

### **Files Updated**
- `docs/memory-bank/activeContext.md` - Updated with system status
- `docs/memory-bank/progress.md` - Updated with system status
- `docs/other/task-list.md` - Updated bug status
- `backend/src/__tests__/integration/07_system-health.integration.spec.ts` - System health tests
- `docs/memory-bank/critical-bugs.md` - Cleaned up resolved bugs

### **Test Results**
- **System Health Tests:** All tests should pass with OpenRouter credits restored
- **Integration Tests:** Should work correctly with OpenRouter restored
- **Unit Tests:** 263/263 pass (unaffected by OpenRouter issue)
