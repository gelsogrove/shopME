# WhatsApp Message Flow - Implementazione Tecnica con LangChain

## 📋 **Panoramica**

Questo documento descrive l'implementazione completa del **WhatsApp Message Flow** per il sistema ShopME utilizzando **LangChain** con architettura a **due LLM separati**. Il flow gestisce l'intero ciclo di vita dei messaggi WhatsApp, dall'arrivo del webhook Meta API fino alla risposta finale formattata.

## 🏗️ **Architettura del Sistema con Dual-LLM**

### **Componenti Principali**

1. **WhatsAppService** - Orchestratore principale del webhook
2. **LangChainMessageService** - Core engine con LangChain chains
3. **RouterLLM** - Primo LLM per decisioni e function calling
4. **FormatterLLM** - Secondo LLM per formattazione con storico
5. **CacheService** - Sistema di caching per performance
6. **ApiLimitService** - Gestione limiti API per workspace
7. **CheckoutService** - Rilevamento intent e generazione link
8. **TokenService** - Gestione token di registrazione

### **Flow di Orchestrazione Dual-LLM**

```
📱 WhatsApp User → 🌐 Meta API → 🎯 WhatsAppService → 
🔗 LangChain Router → 🤖 RouterLLM (Decision) → 
📊 Function Execution → 🎨 FormatterLLM (History + Format) → 📤 Response
```

## 🧠 **Architettura Dual-LLM**

### **LLM 1: Router/Decision Engine**
- **Scopo**: Analizza il messaggio e decide quale azione intraprendere
- **Input**: Messaggio utente + contesto workspace + customer info
- **Output**: Decisione di routing + parametri per function calling
- **Funzioni**: 
  - `checkout_intent` - Genera link checkout
  - `rag_search` - Cerca informazioni nei documenti
  - `welcome_new_user` - Gestisce nuovi utenti
  - `welcome_back_user` - Gestisce utenti di ritorno
  - `wip_notification` - Invia notifica WIP

### **LLM 2: Response Formatter**
- **Scopo**: Formatta la risposta finale con storico conversazione
- **Input**: Risposta grezza + storico chat + lingua utente + tone professionale
- **Output**: Risposta finale formattata e localizzata
- **Caratteristiche**:
  - Mantiene storico conversazione
  - Applica tone professionale
  - Gestisce localizzazione automatica
  - Personalizza in base al customer

## 🔄 **Sequenza del Flow con LangChain**

### **STEP 1-5: Pre-Processing Chain**
```typescript
const preProcessingChain = new SequentialChain({
  chains: [
    apiLimitChain,      // STEP 1: API Limit Check
    spamDetectionChain, // STEP 2: Spam Detection
    workspaceChain,     // STEP 3: Workspace Active Check
    chatbotChain,       // STEP 4: Chatbot Active Check
    blacklistChain      // STEP 5: Blacklist Check
  ]
})
```

### **STEP 6-8: Router LLM Chain**
```typescript
const routerChain = new LLMChain({
  llm: routerLLM,
  prompt: routerPrompt,
  tools: [
    checkoutTool,
    ragSearchTool,
    welcomeNewUserTool,
    welcomeBackTool,
    wipNotificationTool
  ]
})
```

### **STEP 9: Formatter LLM Chain**
```typescript
const formatterChain = new ConversationChain({
  llm: formatterLLM,
  memory: new BufferWindowMemory({ k: 10 }),
  prompt: formatterPrompt
})
```

### **STEP 1: API Limit Check**
- **Implementazione**: Custom LangChain Tool
- **Limiti**: FREE (100/h), BASIC (500/h), PROFESSIONAL (2000/h)
- **Comportamento**: Se superato → return `null` (no response)

### **STEP 2: Spam Detection**
- **Implementazione**: Custom LangChain Tool con Redis cache
- **Azione**: Auto-blacklist + return `null`
- **Logging**: `[LANGCHAIN] STEP 2: Spam Detection - BLOCKED`

### **STEP 3: Workspace Active Check**
- **Implementazione**: LangChain Tool con cache
- **WIP Behavior**: Se inattivo → trigger WIP notification tool
- **Cache Key**: `workspace:${workspaceId}`

### **STEP 4: Chatbot Active Check**
- **Implementazione**: LangChain Tool con customer lookup
- **Comportamento**: Se `activeChatbot = false` → return `""` (operator control)
- **Cache Key**: `customer:${workspaceId}:${phoneNumber}`

### **STEP 5: Blacklist Check**
- **Implementazione**: LangChain Tool con cache
- **Comportamento**: Se blacklisted → return `null`
- **Cache Key**: `blacklist:${workspaceId}:${phoneNumber}`

### **STEP 6: WIP Check**
- **Implementazione**: LangChain Tool che chiama WIP notification
- **Comportamento**: Se WIP → invia notifica ma continua processing
- **Note**: WIP messages non bloccano più il flow

### **STEP 7: Router LLM Decision**
- **Implementazione**: OpenAI Function Calling con LangChain
- **Input**: Messaggio + contesto completo
- **Output**: Function call decision + parametri
- **Functions Available**:
  - `checkout_intent(customer_id, workspace_id)`
  - `rag_search(query, workspace_id, customer_id)`
  - `welcome_new_user(phone, workspace_id)`
  - `welcome_back_user(customer_id, workspace_id)`

### **STEP 8: Function Execution**
- **Implementazione**: LangChain Tools execution
- **Checkout**: Genera link e messaggio checkout
- **RAG**: Cerca nei documenti/FAQ/servizi
- **Welcome**: Gestisce nuovi utenti e welcome back
- **Output**: Risposta grezza per formatter

### **STEP 9: Response Formatting**
- **Implementazione**: LangChain ConversationChain
- **Input**: Risposta grezza + storico + customer info
- **Processing**:
  - Applica tone professionale
  - Localizza in lingua customer
  - Personalizza con nome customer
  - Mantiene coerenza conversazione
- **Output**: Risposta finale formattata

## 🔗 **LangChain Implementation Details**

### **Router LLM Prompt Template**
```typescript
const routerPrompt = new PromptTemplate({
  template: `
You are a WhatsApp customer service router for {workspace_name}.
Customer: {customer_name} ({customer_language})
Message: {user_message}
Context: {workspace_context}

Analyze the message and decide which function to call:
1. checkout_intent - if user wants to buy/order
2. rag_search - for product/service questions
3. welcome_new_user - for new users greeting
4. welcome_back_user - for returning users after 2+ hours

Call the appropriate function with correct parameters.
`,
  inputVariables: ["workspace_name", "customer_name", "customer_language", "user_message", "workspace_context"]
})
```

### **Formatter LLM Prompt Template**
```typescript
const formatterPrompt = new PromptTemplate({
  template: `
You are a professional customer service representative for {workspace_name}.
Customer: {customer_name} (Language: {customer_language})
Conversation History: {history}

Raw Response: {raw_response}

Format this response with:
- Professional tone
- Customer's language ({customer_language})
- Personalized with customer name
- Consistent with conversation history
- WhatsApp-friendly formatting (emojis, line breaks)

Formatted Response:
`,
  inputVariables: ["workspace_name", "customer_name", "customer_language", "history", "raw_response"]
})
```

### **LangChain Tools Definition**
```typescript
const checkoutTool = new Tool({
  name: "checkout_intent",
  description: "Generate checkout link when customer wants to buy",
  func: async (input) => {
    const { customer_id, workspace_id } = JSON.parse(input)
    return await checkoutService.createCheckoutLink(customer_id, workspace_id)
  }
})

const ragSearchTool = new Tool({
  name: "rag_search", 
  description: "Search in documents, FAQs, and services for customer questions",
  func: async (input) => {
    const { query, workspace_id, customer_id } = JSON.parse(input)
    return await ragService.search(query, workspace_id, customer_id)
  }
})
```

## 🚀 **Performance Optimizations con LangChain**

### **Caching Strategy**
- **LLM Response Cache**: Cache delle risposte LLM per query simili
- **Tool Result Cache**: Cache dei risultati delle function calls
- **Memory Optimization**: Buffer window memory per storico conversazioni

### **Chain Optimization**
- **Parallel Execution**: Pre-processing chains in parallelo
- **Streaming**: Response streaming per UX migliore
- **Fallback Chains**: Chain di fallback per error handling

## 🧪 **Testing Strategy con LangChain**

### **Unit Tests**
- **Individual Tools**: Test di ogni LangChain tool
- **Chain Components**: Test di ogni chain separatamente
- **LLM Mocking**: Mock delle chiamate LLM per test deterministici

### **Integration Tests**
- **End-to-End Chains**: Test del flow completo
- **Dual-LLM Flow**: Test dell'interazione tra i due LLM
- **Memory Persistence**: Test dello storico conversazioni

## 📊 **Monitoring & Metrics con LangChain**

### **LangChain Metrics**
```typescript
interface LangChainMetrics {
  routerLLM: {
    responseTime: number;
    tokenUsage: number;
    functionCallsCount: number;
  };
  formatterLLM: {
    responseTime: number;
    tokenUsage: number;
    memorySize: number;
  };
  toolExecutions: {
    [toolName: string]: {
      executionTime: number;
      successRate: number;
    };
  };
}
```

### **Logging Strategy**
- **Chain Execution**: `[LANGCHAIN] Chain: ${chainName} - ${status} (${time}ms)`
- **LLM Calls**: `[LLM] ${llmType}: ${tokens} tokens - ${time}ms`
- **Tool Execution**: `[TOOL] ${toolName}: ${result} (${time}ms)`
- **Memory Operations**: `[MEMORY] ${operation}: ${details}`

## 🔧 **Configuration**

### **Environment Variables**
```bash
# LangChain Settings
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key

# Router LLM (OpenRouter)
ROUTER_LLM_MODEL=openai/gpt-4o-mini
ROUTER_LLM_TEMPERATURE=0.1
ROUTER_LLM_MAX_TOKENS=500

# Formatter LLM (OpenRouter)  
FORMATTER_LLM_MODEL=openai/gpt-4o-mini
FORMATTER_LLM_TEMPERATURE=0.7
FORMATTER_LLM_MAX_TOKENS=1000

# Memory Settings
CONVERSATION_MEMORY_SIZE=10
MEMORY_TTL=3600  # 1 hour
```

## 🚨 **Error Handling con LangChain**

### **Chain Error Handling**
- **Fallback Chains**: Chain alternative per ogni step
- **Retry Logic**: Retry automatico per LLM failures
- **Graceful Degradation**: Fallback a risposte pre-definite

### **LLM Error Handling**
- **Router LLM Failure**: Fallback a regole deterministiche
- **Formatter LLM Failure**: Return raw response senza formattazione
- **Tool Execution Failure**: Error message localizzato

---

**Documento aggiornato**: $(date)
**Versione**: 2.0 - LangChain Dual-LLM Architecture
**Autore**: AI4Devs Team 