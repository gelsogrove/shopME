# System Patterns - ShopMe Project

## 🚨 CRITICAL ARCHITECTURAL PATTERNS

### **📋 RULES_PROMPT.md - ARCHITECTURAL BIBLE**

**Pattern Name:** `docs/other/RULES_PROMPT.md` as System Architecture Reference
**Category:** Documentation & Architecture
**Priority:** CRITICAL - MANDATORY REFERENCE

#### **🚨 CRITICAL RULE - ALWAYS REFERENCE RULES_PROMPT.md**

**MANDATORY:** Before making ANY changes to the system architecture, components, or prompt engineering, you MUST:

1. **READ `docs/other/RULES_PROMPT.md` FIRST** - This file is the architectural bible
2. **UNDERSTAND component responsibilities** - PROMPT_AGENT, FORMATTER, DUAL_LLM, TRANSLATION
3. **FOLLOW separation of concerns** - Each component has specific responsibilities
4. **MAINTAIN architectural consistency** - All changes must align with `docs/other/RULES_PROMPT.md`

#### **RULES_PROMPT.md CONTAINS:**
- **Component Responsibilities** - Who does what in the system
- **Architectural Principles** - Separation of concerns, zero dependencies
- **Flow Diagrams** - Visual representation of system architecture
- **Priority Rules** - Function priority system with numerical scores
- **Ambiguity Management** - How to distinguish action vs informative verbs
- **Synonym Management** - Action and informative verb synonyms
- **Dynamic Priority** - Context-based priority adjustments
- **User Context Management** - Memory and context handling

#### **❌ ANTI-PATTERN (REJECTED)**
- Making architectural changes without consulting `docs/other/RULES_PROMPT.md`
- Mixing responsibilities between components
- Adding functionality to wrong component
- Ignoring separation of concerns
- Creating dependencies between components

#### **✅ CORRECT PATTERN (MANDATORY)**
1. **Read `docs/other/RULES_PROMPT.md`** before any architectural decision
2. **Identify correct component** for the change
3. **Follow component responsibilities** as defined
4. **Maintain separation of concerns**
5. **Update `docs/other/RULES_PROMPT.md`** if architecture changes

#### **COMPONENT RESPONSIBILITIES (from `docs/other/RULES_PROMPT.md`):**

**PROMPT_AGENT:**
- Istruzioni per LLM
- Trigger e esempi
- Regole di priorità
- Contesto business
- NON formattazione

**FORMATTER:**
- Formattazione WhatsApp
- Template e stile
- Icone prodotti
- Localizzazione
- NON logica business

**DUAL_LLM:**
- Orchestrazione
- Gestione errori
- Coordinamento
- Logging
- NON formattazione

**TRANSLATION:**
- Traduzione IT/ES/PT → EN
- Rilevamento lingua
- Contesto conversazione
- NON istruzioni LLM

#### **WHEN TO REFERENCE `docs/other/RULES_PROMPT.md`:**
- ✅ Before modifying any component
- ✅ Before adding new functionality
- ✅ Before changing prompt structure
- ✅ Before architectural decisions
- ✅ Before debugging system issues
- ✅ Before refactoring code

#### **MANDATORY WORKFLOW:**
1. **Read `docs/other/RULES_PROMPT.md`** → Understand architecture
2. **Identify component** → Where should this change go?
3. **Check responsibilities** → Is this the right place?
4. **Make change** → Following architectural principles
5. **Update `docs/other/RULES_PROMPT.md`** → If architecture changes

---

### **🌍 MULTILINGUAL RAG SYSTEM PATTERN**

**Pattern Name:** LLM-Driven Translation for RAG Search
**Category:** AI/LLM Integration
**Priority:** Critical

#### **Problem Context**
- User queries come in multiple languages (Italian, Spanish, Portuguese, English)
- RAG search database content is primarily in English
- Need to translate user queries to English for optimal semantic search
- Must avoid hardcoded translation logic in backend code

#### **❌ ANTI-PATTERN (REJECTED)**
```typescript
// WRONG: Hardcoded translation in backend
private async translateQueryToEnglish(query: string, language: string): Promise<string> {
  const italianWords = /\b(qual|quale|come|dove|quando|perché|cosa|che|dei|della|delle|del|per|con|una|uno|è|sono|hai|avete|posso|puoi|può|accettate|pagamenti|metodi|pagamento)\b/i
  
  if (italianWords.test(query)) {
    // Hardcoded translation logic
    return await translateWithAPI(query)
  }
  return query
}
```

**Problems with Anti-Pattern:**
- **Maintenance nightmare** - Need to update regex for every new word
- **Scalability issues** - Can't handle all language combinations
- **Code complexity** - Translation logic mixed with business logic
- **Inflexible** - Can't adapt to new languages or contexts

#### **✅ CORRECT PATTERN (IMPLEMENTED)**

**Architecture:**
1. **Backend passes original query** without modification
2. **LLM handles translation** via prompt_agent.md instructions
3. **Prompt contains explicit translation rules** for function calls
4. **Dynamic translation** based on user input language

**Implementation:**
```typescript
// CORRECT: Backend passes original query
async ragSearch(req: Request, res: Response): Promise<void> {
  const { query, workspaceId } = req.body
  
  // Use original query - LLM will handle translation via prompt_agent.md
  const translatedQuery = query
  
  // Perform RAG search with original query
  const results = await performRAGSearch(translatedQuery, workspaceId)
  
  res.json(results)
}
```

**Prompt Rules (prompt_agent.md):**
```
**🚨 ULTRA CRITICAL - RAGSearch TRANSLATION RULE** 🚨
**PRIMA DI CHIAMARE RagSearch()**, DEVI SEMPRE TRADURRE la query in inglese
- Utente: "che pagamenti accettate?" → Tu: RagSearch("what payment methods do you accept")
- Utente: "quali sono gli orari?" → Tu: RagSearch("what are your opening hours")
```

**Flow:**
1. **User Input:** "che pagamenti accettate?" (Italian)
2. **LLM Processing:** Reads prompt_agent.md translation rules
3. **Function Call:** RagSearch("what payment methods do you accept")
4. **Backend:** Receives English query, performs RAG search
5. **Response:** Returns results in user's original language

#### **Benefits of Correct Pattern:**
- **No hardcoded logic** in backend code
- **Flexible translation** via LLM intelligence
- **Easy maintenance** through prompt updates
- **Scalable** to any language combination
- **Consistent** with overall architecture
- **Separation of concerns** - Translation logic in prompt, not code

#### **When to Use This Pattern:**
- ✅ Multilingual user interfaces
- ✅ RAG search systems with English database content
- ✅ LLM-driven applications requiring translation
- ✅ Systems where prompt-based configuration is preferred over hardcoded logic

#### **When NOT to Use This Pattern:**
- ❌ High-frequency translation requirements (use dedicated translation service)
- ❌ Real-time translation without LLM context
- ❌ Systems requiring deterministic translation results

#### **Related Patterns:**
- **Prompt-Driven Configuration** - Using prompts for system behavior
- **LLM Function Calling** - Structured LLM interactions
- **RAG Search Architecture** - Retrieval-augmented generation

---

## Existing Patterns

### **DDD Architecture Pattern**
- **Domain Layer:** Business logic and entities
- **Application Layer:** Use cases and services
- **Infrastructure Layer:** External integrations and data access
- **Interface Layer:** Controllers and API endpoints

### **Repository Pattern**
- **Abstract interfaces** for data access
- **Concrete implementations** for specific data sources
- **Dependency injection** for testability

### **Service Layer Pattern**
- **Business logic encapsulation**
- **Transaction management**
- **Cross-cutting concerns**

### **Factory Pattern**
- **Entity creation** with validation
- **Complex object construction**
- **Domain object instantiation**

---

### **🔍 ACTIVE FILTERING PATTERN FOR EMBEDDINGS**

**Pattern Name:** Consistent Active Status Filtering Across All Content Types
**Category:** Data Access & Embedding Generation
**Priority:** Critical - Security & Data Integrity

#### **Problem Context**
- Multiple content types (Products, FAQs, Services, Documents) have `isActive` status
- Embedding generation must respect active status to avoid indexing inactive content
- RAG search must only return active content to users
- Consistent filtering pattern needed across all content types

#### **✅ CORRECT PATTERN (IMPLEMENTED)**

**Embedding Generation Pattern:**
```typescript
// Products (embeddingService.ts:516-520)
const activeProducts = await prisma.products.findMany({
  where: {
    workspaceId: workspaceId,
    isActive: true, // ✅ Only active products
  },
  include: { category: true },
})

// FAQs (embeddingService.ts:162-166)
const activeFAQs = await prisma.fAQ.findMany({
  where: {
    workspaceId: workspaceId,
    isActive: true, // ✅ Only active FAQs
  },
})

// Documents (documentService.ts:323-328)
const activeDocuments = await prisma.documents.findMany({
  where: {
    workspaceId: workspaceId,
    isActive: true, // ✅ Only active documents
    status: 'UPLOADED'
  }
});
```

**Repository Pattern:**
```typescript
// FAQ Repository (faq.repository.ts:15-19)
async findAll(workspaceId: string): Promise<FAQ[]> {
  const faqs = await prisma.fAQ.findMany({
    where: { 
      workspaceId,
      isActive: true // ✅ Only active FAQs
    }
  });
}

// Product Repository (product.repository.ts:87-90)
if (filters?.active === true) {
  where.isActive = true // ✅ Active filter support
}
```

**Function Handler Pattern:**
```typescript
// FAQ Info (function-handler.service.ts:1262-1265)
const faqs = await this.prisma.fAQ.findMany({
  where: {
    workspaceId,
    isActive: true, // ✅ Only active FAQs
    OR: [/* search conditions */]
  },
})
```

#### **Benefits of This Pattern:**
- **Data Integrity:** Inactive content never appears in search results
- **Security:** Prevents exposure of disabled/draft content
- **Consistency:** Same filtering logic across all content types
- **Performance:** Smaller embedding datasets, faster searches
- **Workspace Isolation:** Combined with workspaceId filtering

#### **Implementation Checklist:**
- ✅ **Products:** Active filtering in embeddings and search
- ✅ **FAQs:** Active filtering in embeddings and search  
- ✅ **Services:** Active filtering in embeddings and search
- ✅ **Documents:** Active filtering in embeddings and search

#### **When to Use This Pattern:**
- ✅ All content types with status management
- ✅ Embedding generation processes
- ✅ RAG search implementations
- ✅ Public-facing content queries
- ✅ Multi-tenant systems with workspace isolation

#### **Critical Rules:**
1. **ALWAYS filter by `isActive: true`** in embedding generation
2. **ALWAYS filter by `isActive: true`** in public search queries
3. **COMBINE with workspaceId filtering** for complete isolation
4. **REGENERATE embeddings** when content status changes
5. **CONSISTENT naming** - use `isActive` field across all entities

#### **Related Patterns:**
- **Workspace Isolation Pattern** - Combined workspaceId + isActive filtering
- **Embedding Generation Pattern** - Batch processing with status filtering
- **Repository Pattern** - Consistent data access with filtering
