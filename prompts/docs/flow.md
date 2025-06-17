# WhatsApp Bot Message Flow - Unified RAG Architecture

## 🔄 **COMPLETE MESSAGE PROCESSING FLOW**

### **📱 STEP 1-6: PRE-PROCESSING CHECKS**
1. ✅ **API Limit Check** - Verify workspace hasn't exceeded API limits
2. ✅ **Spam Detection** - Check for message flooding (10 messages in 30 seconds = auto-blacklist)
3. ✅ **Workspace Active Check** - Ensure workspace is active and not deleted
4. ✅ **Chatbot Active Check** - If `activeChatbot = false` → Save message for operator, return empty (manual control)
5. ✅ **Blacklist Check** - If phone number is blacklisted → Ignore message completely
6. ✅ **WIP Check** - If customer has pending order → Send "order in progress" message

### **📱 STEP 7: USER FLOW DETECTION**
- **New Customer**: Send welcome message + registration link
- **Existing Customer**: 
  - **Recent Activity** (< 2 hours): Continue to RAG search
  - **No Recent Activity** (> 2 hours): Prepare welcome back message BUT **CONTINUE TO RAG**

### **📱 STEP 8: CHECKOUT INTENT DETECTION**
- Check if message contains checkout keywords
- If checkout intent detected: Process order flow
- Otherwise: Continue to unified RAG search

### **🔍 STEP 9: UNIFIED RAG SEARCH (NEW ARCHITECTURE)**

#### **9.1 SEMANTIC SEARCH ACROSS ALL CONTENT TYPES**
```typescript
// Search ALL content types in parallel using semantic embeddings
const [productResults, faqResults, serviceResults, documentResults] = await Promise.all([
  embeddingService.searchProducts(message, workspaceId, 5),
  embeddingService.searchFAQs(message, workspaceId, 5), 
  embeddingService.searchServices(message, workspaceId, 5),
  embeddingService.searchDocuments(message, workspaceId, 5)
]);
```

#### **9.2 PRODUCT AVAILABILITY VERIFICATION**
```sql
-- Only return products that are actually available
SELECT * FROM products 
WHERE id IN (semantic_search_results)
  AND workspaceId = ?
  AND isActive = true
  AND stock > 0  -- CRITICAL: Verify stock availability
```

#### **9.3 FULL CONTEXT RETRIEVAL**
- Get complete product details (name, price, stock, category)
- Get complete FAQ details (question, answer)
- Get complete service details (name, description, price, duration)
- Get recent chat history (last 5 messages)

#### **9.4 UNIFIED CONTEXT BUILDING**
```typescript
const unifiedContext = {
  customer: { name, language, discount },
  welcomeBack: welcomeBackMessage || null,
  searchResults: {
    products: [...], // With similarity scores and availability
    faqs: [...],     // With similarity scores
    services: [...], // With similarity scores  
    documents: [...]  // With similarity scores
  },
  chatHistory: [...]
};
```

### **🤖 STEP 10: LLM FORMATTER (UNIFIED RESPONSE)**

#### **10.1 COMPREHENSIVE PROMPT CONSTRUCTION**
```
CUSTOMER CONTEXT:
- Name: {customer.name}
- Language: {customer.language}
- Discount: {customer.discount}%

{WELCOME BACK MESSAGE if applicable}

SEMANTIC SEARCH RESULTS:

PRODUCTS FOUND (with availability):
- Mozzarella di Bufala (Similarity: 0.594)
  Price: €8.50
  Stock: 15 units available
  Category: Cheese
  Match: "Fresh mozzarella cheese made from buffalo milk..."

FAQS FOUND:
- How do you ship products? (Similarity: 0.723)
  Answer: We ship via express courier within 24-48 hours...
  Match: "shipping methods and delivery times..."

SERVICES FOUND:
- Express Delivery (Similarity: 0.681)
  Description: Fast delivery within 24 hours
  Price: €5.00
  Duration: 1 day
  Match: "express shipping service..."

DOCUMENTS FOUND:
- Shipping Policy Document (Similarity: 0.645)
  Content: "International shipping regulations..."

RECENT CHAT HISTORY:
Customer: Ciao, come state?
Bot: Ciao! Tutto bene, grazie per aver scritto...

CUSTOMER MESSAGE: hai la mozzarella fresca? quanto costa la spedizione?

INSTRUCTIONS FOR LLM FORMATTER:
- Combine ALL relevant information into a single, coherent response
- Include welcome back message if provided
- Show product availability and prices
- Include FAQ answers if relevant
- Mention services if applicable
- Reference document information if found
- Respond in {customer.language}
- Be helpful and comprehensive but concise
```

#### **10.2 LLM FORMATTER OUTPUT EXAMPLE**
```
Bentornato Mario! 🎉

Sì, abbiamo la mozzarella fresca disponibile:

🧀 **Mozzarella di Bufala** - €8.50
   📦 15 unità disponibili
   🏷️ Categoria: Formaggi

🚚 **Spedizione:**
   • Corriere espresso: €5.00 (24-48 ore)
   • Spediamo tramite corriere espresso entro 24-48 ore
   • Per spedizioni internazionali, consulta la nostra policy

Vuoi procedere con l'ordine? 😊
```

## 🔄 **KEY ARCHITECTURAL CHANGES**

### **❌ OLD APPROACH (PROBLEMATIC)**
- Router LLM chose between `get_products` OR `rag_search`
- Simple text matching: `product.name.includes(query)`
- Returned ALL products when searching for "mozzarella"
- Separate responses for products vs FAQs vs services

### **✅ NEW APPROACH (UNIFIED)**
- **Single `unified_rag_search` function**
- **Semantic search across ALL content types simultaneously**
- **Stock verification for products** (only available items)
- **LLM formatter combines everything** into coherent response
- **Welcome back + search results** in single message

## 🎯 **EXPECTED BEHAVIOR EXAMPLES**

### **Query: "hai la mozzarella fresca?"**
**BEFORE**: Returns ALL products (mozzarella + wines + pasta + everything)
**AFTER**: Returns only mozzarella products with availability + related FAQs/services

### **Query: "mozzarella e spedizione"**
**BEFORE**: Two separate responses (products, then shipping info)
**AFTER**: Single unified response with mozzarella products + shipping options + FAQ answers

### **Query: "che metodi di pagamento avete?"**
**BEFORE**: Returns products instead of payment info
**AFTER**: Returns FAQ about payment methods + related services

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Embedding Generation**
- Uses local `@xenova/transformers` with `Xenova/all-MiniLM-L6-v2` model
- Generates embeddings for all content types: products, FAQs, services, documents
- Multilingual keyword support for better international search

### **Semantic Search**
- Cosine similarity calculation between query and content embeddings
- Results sorted by similarity score (highest first)
- Configurable result limits per content type

### **Database Integration**
- All searches filtered by `workspaceId` for data isolation
- Products filtered by `isActive = true` and `stock > 0`
- FAQs and services filtered by `isActive = true`

### **LLM Integration**
- Uses OpenRouter API with configurable models
- Dynamic temperature and max_tokens from agent configuration
- Comprehensive context passing for better responses

## 🚨 **CRITICAL SUCCESS FACTORS**

1. **✅ Semantic Search Working**: Embeddings generated for all content
2. **✅ Stock Verification**: Only show available products
3. **✅ Unified Response**: Single LLM call combines all results
4. **✅ Welcome Back Integration**: Seamless user experience
5. **✅ Workspace Isolation**: All queries filtered by workspaceId
6. **✅ Error Handling**: Graceful fallbacks for missing data

This unified architecture ensures that users get comprehensive, accurate responses that combine product availability, FAQ information, service options, and document references in a single, coherent message. 