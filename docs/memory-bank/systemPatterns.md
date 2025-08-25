# System Patterns - ShopMe Project

## 🚨 CRITICAL ARCHITECTURAL PATTERNS

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
