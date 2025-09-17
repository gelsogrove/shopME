# User Stories - ShopMe Token Replacement System

## 🎯 **PROJECT OVERVIEW**

**Objective**: Implement unified token replacement system to eliminate content inventions and ensure all responses use real database data.

**Architecture**: `USER INPUT → TranslationService → DualLLMService → SearchRag → FormatterService (token replacement + formatting)`

**Critical Rule**: ALL token replacements MUST be done in FormatterService BEFORE calling OpenRouter

---

## 📋 **USER STORIES**

### **US1: Token Replacement System Implementation**

#### **📝 User Story**
**As a** ShopMe chatbot user  
**I want** to receive accurate information from the database  
**So that** I never get invented categories, products, or services

#### **🎯 Acceptance Criteria**
1. **AC1.1**: FormatterService replaces `[LIST_CATEGORIES]` with real categories from database
2. **AC1.2**: FormatterService replaces `[USER_DISCOUNT]` with actual user discount from database
3. **AC1.3**: FormatterService replaces `[LINK_ORDERS_WITH_TOKEN]` with generated secure link
4. **AC1.4**: If database is empty, show graceful message instead of empty response
5. **AC1.5**: All token replacements happen BEFORE OpenRouter call

#### **🧪 Test Cases**
```bash
# Test Case 1.1: Categories with data
User: "che categorie avete?"
Expected: Real categories from database (e.g., "Cheeses & Dairy", "Frozen Products")
NOT Expected: Invented categories (e.g., "Vini", "Formaggi")

# Test Case 1.2: Categories with empty database
User: "che categorie avete?"
Expected: "Al momento non abbiamo categorie disponibili 🙏"
NOT Expected: Empty response or invented categories

# Test Case 1.3: User discount
User: "che sconto ho?"
Expected: Actual discount from database (e.g., "10%")
NOT Expected: Invented discount or generic message

# Test Case 1.4: Orders link
User: "mostra i miei ordini"
Expected: Secure link with token (e.g., "http://localhost:3000/orders?token=abc123")
NOT Expected: Generic link or error
```

#### **🔧 Implementation Tasks**
1. **T1.1**: Create `replaceAllTokens()` method in FormatterService
2. **T1.2**: Implement `[LIST_CATEGORIES]` replacement with database query
3. **T1.3**: Implement `[USER_DISCOUNT]` replacement with customer query
4. **T1.4**: Implement `[LINK_ORDERS_WITH_TOKEN]` replacement with SecureTokenService
5. **T1.5**: Add graceful handling for empty database results
6. **T1.6**: Ensure all replacements happen BEFORE OpenRouter call

#### **✅ Definition of Done**
- [ ] All 5 acceptance criteria pass
- [ ] All 4 test cases pass
- [ ] No content inventions in responses
- [ ] Graceful handling of empty database
- [ ] Token replacement happens before OpenRouter

---

### **US2: FormatterService Signature Update**

#### **📝 User Story**
**As a** developer  
**I want** FormatterService to receive all necessary parameters  
**So that** it can perform token replacements with proper context

#### **🎯 Acceptance Criteria**
1. **AC2.1**: FormatterService accepts `customerId` parameter (mandatory)
2. **AC2.2**: FormatterService accepts `workspaceId` parameter (mandatory)
3. **AC2.3**: FormatterService accepts `language` parameter (mandatory)
4. **AC2.4**: FormatterService accepts `originalQuestion` parameter (mandatory)
5. **AC2.5**: FormatterService accepts `conversationHistory` parameter (optional)

#### **🧪 Test Cases**
```typescript
// Test Case 2.1: Valid parameters
await FormatterService.formatResponse(
  "Test response",
  "it",                    // language (mandatory)
  undefined,               // formatRules (optional)
  "customer123",           // customerId (mandatory)
  "workspace456",          // workspaceId (mandatory)
  "che categorie avete?",  // originalQuestion (mandatory)
  conversationHistory      // conversationHistory (optional)
)
Expected: Success, no errors

// Test Case 2.2: Missing mandatory parameters
await FormatterService.formatResponse(
  "Test response",
  "it",
  undefined,
  undefined,  // customerId missing - ERROR!
  "workspace456",
  "che categorie avete?",
  conversationHistory
)
Expected: Error thrown, explicit error message

// Test Case 2.3: All parameters provided
await FormatterService.formatResponse(
  "Test response with [LIST_CATEGORIES]",
  "it",
  undefined,
  "customer123",
  "workspace456",
  "che categorie avete?",
  conversationHistory
)
Expected: Success, token replaced with real data
```

#### **🔧 Implementation Tasks**
1. **T2.1**: Update FormatterService.formatResponse signature
2. **T2.2**: Add parameter validation for mandatory fields
3. **T2.3**: Add error handling for missing parameters
4. **T2.4**: Update all calls to FormatterService in codebase
5. **T2.5**: Add TypeScript types for new parameters

#### **✅ Definition of Done**
- [ ] All 5 acceptance criteria pass
- [ ] All 3 test cases pass
- [ ] TypeScript compilation successful
- [ ] All existing calls updated
- [ ] Parameter validation working

---

### **US3: Parameter Passing Implementation**

#### **📝 User Story**
**As a** system component  
**I want** to pass all required parameters to FormatterService  
**So that** token replacements work correctly with proper context

#### **🎯 Acceptance Criteria**
1. **AC3.1**: DualLLMService passes all mandatory parameters to FormatterService
2. **AC3.2**: Calling Functions pass all mandatory parameters to FormatterService
3. **AC3.3**: SearchRag passes all mandatory parameters to FormatterService
4. **AC3.4**: All parameters are correctly extracted from request object
5. **AC3.5**: No parameter is undefined or null when passed

#### **🧪 Test Cases**
```typescript
// Test Case 3.1: DualLLMService parameter passing
// In dual-llm.service.ts
const formattedOutput = await FormatterService.formatResponse(
  rawResponse,
  request.language || "it",       // ✅ language
  undefined,                      // formatRules
  request.customerid || "",       // ✅ customerId
  request.workspaceId,            // ✅ workspaceId
  request.originalQuery || "",    // ✅ originalQuestion
  request.conversationHistory     // ✅ conversationHistory
)
Expected: All parameters passed correctly

// Test Case 3.2: Calling Functions parameter passing
// In calling-functions.service.ts
const formattedOutput = await FormatterService.formatResponse(
  result.response,
  "it",                          // ✅ language
  undefined,                     // formatRules
  customerId,                    // ✅ customerId
  workspaceId,                   // ✅ workspaceId
  originalQuery,                 // ✅ originalQuestion
  conversationHistory            // ✅ conversationHistory
)
Expected: All parameters passed correctly

// Test Case 3.3: Parameter validation
// Test with missing parameters
Expected: Error thrown with specific message about missing parameter
```

#### **🔧 Implementation Tasks**
1. **T3.1**: Update DualLLMService calls to FormatterService
2. **T3.2**: Update Calling Functions calls to FormatterService
3. **T3.3**: Update SearchRag calls to FormatterService
4. **T3.4**: Add parameter extraction logic from request objects
5. **T3.5**: Add parameter validation and error handling

#### **✅ Definition of Done**
- [ ] All 5 acceptance criteria pass
- [ ] All 3 test cases pass
- [ ] All service calls updated
- [ ] Parameter extraction working
- [ ] No undefined parameters passed

---

### **US4: System Testing & Validation**

#### **📝 User Story**
**As a** ShopMe user  
**I want** the chatbot to provide accurate, non-invented responses  
**So that** I can trust the information I receive

#### **🎯 Acceptance Criteria**
1. **AC4.1**: "che categorie avete?" returns real categories or graceful message
2. **AC4.2**: "che sconto ho?" returns real user discount or graceful message
3. **AC4.3**: "mostra i miei ordini" returns secure link with token
4. **AC4.4**: No content inventions in any response
5. **AC4.5**: All responses are properly formatted and localized

#### **🧪 Test Cases**
```bash
# Test Case 4.1: Complete system test
npm run mcp:test "Mario Rossi" "che categorie avete?" log=true exit-first-message=true
Expected: Real categories from database or "Al momento non abbiamo categorie disponibili 🙏"
NOT Expected: "Vini", "Formaggi", "Salumi" (invented)

# Test Case 4.2: User discount test
npm run mcp:test "Mario Rossi" "che sconto ho?" log=true exit-first-message=true
Expected: Real discount from database or "Nessuno sconto attivo al momento 🙏"
NOT Expected: Invented discount percentage

# Test Case 4.3: Orders link test
npm run mcp:test "Mario Rossi" "mostra i miei ordini" log=true exit-first-message=true
Expected: Secure link with token (e.g., "http://localhost:3000/orders?token=abc123")
NOT Expected: Generic link or error

# Test Case 4.4: Anti-invention test
npm run mcp:test "Mario Rossi" "che prodotti avete?" log=true exit-first-message=true
Expected: Real products from database or graceful message
NOT Expected: Any invented product names or categories

# Test Case 4.5: Multi-language test
npm run mcp:test "Mario Rossi" "what categories do you have?" log=true exit-first-message=true
Expected: Response in English with real categories
NOT Expected: Response in Italian or invented categories
```

#### **🔧 Implementation Tasks**
1. **T4.1**: Run all test cases with current system
2. **T4.2**: Identify and fix any remaining issues
3. **T4.3**: Verify token replacement is working
4. **T4.4**: Verify parameter passing is working
5. **T4.5**: Verify no content inventions
6. **T4.6**: Run integration tests
7. **T4.7**: Run unit tests

#### **✅ Definition of Done**
- [ ] All 5 acceptance criteria pass
- [ ] All 5 test cases pass
- [ ] No content inventions detected
- [ ] All integration tests pass
- [ ] All unit tests pass
- [ ] System ready for production

---

## 🚀 **IMPLEMENTATION ORDER**

### **Phase 1: Foundation (US1)**
1. Implement token replacement system
2. Test with basic scenarios
3. Verify no content inventions

### **Phase 2: Integration (US2)**
1. Update FormatterService signature
2. Add parameter validation
3. Test parameter passing

### **Phase 3: System Integration (US3)**
1. Update all service calls
2. Verify parameter extraction
3. Test end-to-end flow

### **Phase 4: Validation (US4)**
1. Run comprehensive tests
2. Verify system behavior
3. Validate no regressions

---

## 📊 **PROGRESS TRACKING**

### **Current Status**
- **US1**: ⏳ PENDING
- **US2**: ⏳ PENDING  
- **US3**: ⏳ PENDING
- **US4**: ⏳ PENDING

### **Next Action**
Start with **US1: Token Replacement System Implementation**

---

**Last Updated**: December 2024  
**Status**: Ready for implementation
