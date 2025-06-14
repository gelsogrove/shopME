# 🚨 **WHATSAPP MESSAGE FLOW - TASK LIST DEDICATA**

## 🎯 **OVERVIEW**
Questa task list è dedicata esclusivamente all'implementazione completa del WhatsApp Message Flow. Ogni task è piccolo, concreto, testabile e segue la sequenza esatta documentata in `docs/flow.md`.

**SEQUENZA FLOW OBBLIGATORIA:**
```
API Limit → Spam Detection → Channel Active → Chatbot Active → Blacklist → WIP → User Flow
```

---

## 📊 **ANALISI STATO ATTUALE**

### ✅ **GIÀ IMPLEMENTATO**
- ✅ Spam Detection (10+ messaggi in 30 secondi)
- ✅ Blacklist Check (customer.isBlacklisted + workspace.blocklist)
- ✅ Workspace Active Check (workspace.isActive)
- ✅ WIP Messages (multilingua)
- ✅ Greeting Detection (Ciao, Hello, Hola, etc.)
- ✅ Welcome Messages con registration token
- ✅ Customer creation e language detection
- ✅ RAG integration per chat libera

### ❌ **MANCANTE/INCOMPLETO**
- ❌ API Limit Check (non implementato)
- ❌ Chatbot Active Check (activeChatbot flag non integrato nel flow)
- ❌ Operator Control Release mechanism
- ❌ "2 ore ultima conversazione" check per utenti esistenti
- ❌ Checkout link generation per finalizzazione ordini
- ❌ Sequenza flow non rispettata completamente
- ❌ Test coverage incompleto per tutti gli scenari

---

## 🔥 **TASK LIST DETTAGLIATA**

### **TASK 0: LangChain Calling Functions System** 
**Priority**: 🚨 **PREREQUISITO CRITICO**
**Estimated Time**: 8 ore
**Description**: Implementare sistema completo LangChain Calling Functions per il WhatsApp Message Flow

**Acceptance Criteria**:

#### Backend Structure Requirements:
- [ ] Creare `/backend/src/calling-functions/` directory con struttura organizzata
- [ ] Implementare `main.ts` per orchestrazione flow globale
- [ ] Creare file funzioni individuali (getProductInfo.ts, createOrder.ts, etc.)
- [ ] Installare e configurare dipendenze LangChain
- [ ] Creare README.md completo documentando tutto il flow

#### LangChain Integration:
- [ ] Installare LangChain packages (`@langchain/core`, `@langchain/openai`, etc.)
- [ ] Configurare LangChain con OpenRouter API integration
- [ ] Implementare two-phase LLM workflow:
  - **Phase 1**: Function selection LLM (determina quale funzione chiamare)
  - **Phase 2**: Response formatting LLM (formatta risposta finale utente)
- [ ] Creare function schemas per LangChain function calling
- [ ] Implementare error handling e fallback mechanisms

#### Function System Architecture:
```
/backend/src/calling-functions/
├── README.md                    # Complete flow documentation
├── main.ts                      # Global orchestration flow
├── types/                       # TypeScript interfaces
│   ├── FunctionCall.ts         # Function call types
│   └── LangChainTypes.ts       # LangChain specific types
├── functions/                   # Individual function implementations
│   ├── getProductInfo.ts       # Product information retrieval
│   ├── getServiceInfo.ts       # Service information retrieval
│   ├── createOrder.ts          # Order creation
│   ├── addToCart.ts           # Cart management
│   ├── searchDocuments.ts     # RAG integration
│   ├── welcomeUser.ts         # User greeting
│   └── getCartInfo.ts         # Cart information
├── prompts/                    # LangChain prompts
│   ├── functionSelector.ts    # Function selection prompt
│   └── responseFormatter.ts   # Response formatting prompt
├── utils/                      # Utility functions
│   ├── langchainConfig.ts     # LangChain configuration
│   └── functionRegistry.ts   # Function registration system
└── tests/                      # Function tests
    ├── unit/                  # Unit tests for individual functions
    └── integration/           # Integration tests for flow
```

#### Core Functions da Implementare:
- [ ] `getProductInfo(product_name)` - Retrieve product details
- [ ] `getServiceInfo(service_name)` - Retrieve service information
- [ ] `welcomeUser()` - User greeting and onboarding
- [ ] `createOrder()` - Order creation workflow
- [ ] `getCartInfo()` - Cart status and contents
- [ ] `addToCart(product_name, quantity)` - Add items to cart
- [ ] `searchDocuments(query)` - RAG document search integration
- [ ] `blockUser(phone_number)` - User blocking functionality
- [ ] `getOffers()` - Active offers and promotions

#### LangChain Configuration:
- [ ] Configurare OpenRouter integration per LLM calls
- [ ] Setup function calling schemas con validazione appropriata
- [ ] Implementare streaming responses per migliore UX
- [ ] Aggiungere conversation memory management
- [ ] Configurare temperature e model parameters per function type

#### Integration Requirements:
- [ ] Integrare con existing WhatsApp message processing
- [ ] Connettere a existing RAG system (documents, FAQs, services)
- [ ] Integrare con workspace-specific data filtering
- [ ] Connettere a existing customer e order management
- [ ] Assicurare proper error handling e logging

**Test Requirements**:
- [ ] Unit tests per ogni funzione individuale
- [ ] Integration tests per complete flow
- [ ] LangChain function calling validation
- [ ] Performance testing per response times
- [ ] Error scenario testing (invalid functions, API failures)

**Files to Create**:
- `backend/src/calling-functions/main.ts` (NEW)
- `backend/src/calling-functions/functions/welcomeUser.ts` (NEW)
- `backend/src/calling-functions/functions/searchDocuments.ts` (NEW)
- `backend/src/calling-functions/functions/createCheckoutLink.ts` (NEW)
- `backend/src/calling-functions/utils/langchainConfig.ts` (NEW)
- `backend/src/__tests__/unit/calling-functions/` (NEW DIRECTORY)

---

### **TASK 1: API Limit Check Implementation**
**Priority**: 🚨 **CRITICAL**
**Estimated Time**: 4 ore
**Description**: Implementare controllo limiti API all'inizio del flow

**Acceptance Criteria**:
- [ ] Creare `ApiLimitService` in `backend/src/application/services/`
- [ ] Implementare metodo `checkApiLimit(workspaceId: string): Promise<{exceeded: boolean, remaining: number}>`
- [ ] Aggiungere controllo API limit come PRIMO step in `MessageService.processMessage()`
- [ ] Se limite superato: return null (nessuna risposta)
- [ ] Logging dettagliato per audit: "API_LIMIT_EXCEEDED: workspace-123 - Remaining: 0"
- [ ] Configurazione limite tramite environment variable `API_LIMIT_PER_HOUR=1000`

**Test Requirements**:
- [ ] Unit test: limite non superato → continua elaborazione
- [ ] Unit test: limite superato → return null
- [ ] Unit test: errore nel controllo → fallback graceful
- [ ] Integration test: scenario completo con limite superato

**Files to Create/Modify**:
- `backend/src/application/services/api-limit.service.ts` (NEW)
- `backend/src/application/services/message.service.ts` (MODIFY)
- `backend/src/__tests__/unit/services/api-limit.service.spec.ts` (NEW)

---

### **TASK 2: Chatbot Active Check Integration**
**Priority**: 🚨 **CRITICAL**
**Estimated Time**: 3 ore
**Description**: Integrare controllo activeChatbot flag nel flow principale

**Acceptance Criteria**:
- [ ] Spostare controllo `activeChatbot` DOPO blacklist check e PRIMA di WIP check
- [ ] Se `activeChatbot = false`: salvare messaggio ma non generare risposta AI
- [ ] Return empty string ("") per indicare controllo operatore
- [ ] Aggiungere `agentSelected: "Manual Operator Control"` nei metadati
- [ ] Logging: "OPERATOR_CONTROL: customer-123 in workspace-456"

**Test Requirements**:
- [ ] Unit test: activeChatbot = true → elaborazione normale
- [ ] Unit test: activeChatbot = false → salva messaggio, no AI response
- [ ] Unit test: customer non esistente → skip controllo
- [ ] Integration test: scenario operatore prende controllo

**Files to Modify**:
- `backend/src/application/services/message.service.ts`
- `backend/src/__tests__/unit/services/message.service.spec.ts`

---

### **TASK 3: Operator Control Release Mechanism**
**Priority**: 🚨 **HIGH**
**Estimated Time**: 5 ore
**Description**: Implementare meccanismo per rilasciare controllo operatore

**Acceptance Criteria**:
- [ ] Creare endpoint `PUT /api/workspaces/:workspaceId/customers/:customerId/chatbot-control`
- [ ] Body: `{activeChatbot: boolean, reason?: string}`
- [ ] Validazione: solo admin/operatori possono modificare
- [ ] Aggiornare `customer.activeChatbot` nel database
- [ ] Logging: "CHATBOT_CONTROL_CHANGED: customer-123 activeChatbot=true by user-456"
- [ ] Frontend: toggle button in chat interface

**Test Requirements**:
- [ ] Unit test: toggle activeChatbot = true/false
- [ ] Unit test: validazione permessi
- [ ] Unit test: customer non trovato → 404
- [ ] Integration test: cambio controllo end-to-end

**Files to Create/Modify**:
- `backend/src/interfaces/http/controllers/customers.controller.ts` (MODIFY)
- `backend/src/interfaces/http/routes/customers.routes.ts` (MODIFY)
- `backend/src/__tests__/integration/apis/customer-control.api.test.ts` (NEW)

---

### **TASK 4: "2 Ore Ultima Conversazione" Check**
**Priority**: 🚨 **HIGH**
**Estimated Time**: 4 ore
**Description**: Implementare controllo "Bentornato {NOME}" per utenti esistenti

**Acceptance Criteria**:
- [ ] Creare metodo `hasRecentActivity(customerId: string, hours: number): Promise<boolean>`
- [ ] Controllare ultimo messaggio del customer negli ultimi 2 ore
- [ ] Se > 2 ore: inviare messaggio "Bentornato {customer.name}!"
- [ ] Messaggio multilingua basato su customer.language
- [ ] Dopo messaggio bentornato: continuare con chat libera RAG

**Test Requirements**:
- [ ] Unit test: ultima attività < 2 ore → no messaggio bentornato
- [ ] Unit test: ultima attività > 2 ore → messaggio bentornato
- [ ] Unit test: customer nuovo → skip controllo
- [ ] Unit test: multilingua (IT, EN, ES, PT)

**Files to Create/Modify**:
- `backend/src/repositories/message.repository.ts` (MODIFY)
- `backend/src/application/services/message.service.ts` (MODIFY)
- `backend/src/__tests__/unit/services/message.service.spec.ts` (MODIFY)

---

### **TASK 5: Checkout Link Generation**
**Priority**: 🚨 **HIGH**
**Estimated Time**: 6 ore
**Description**: Implementare generazione link checkout per finalizzazione ordini

**Acceptance Criteria**:
- [ ] Rilevare intent "finalizzazione ordine" nel messaggio utente
- [ ] Keywords: "ordino", "compro", "acquisto", "checkout", "finalizza", "order"
- [ ] Generare token sicuro per checkout con scadenza 1 ora
- [ ] Creare link: `{baseUrl}/checkout?token={token}&customer={customerId}`
- [ ] Messaggio risposta con link e istruzioni
- [ ] Salvare token in database con scadenza

**Test Requirements**:
- [ ] Unit test: rilevamento intent ordine
- [ ] Unit test: generazione token checkout
- [ ] Unit test: link formatting corretto
- [ ] Unit test: token scadenza 1 ora
- [ ] Integration test: flow completo checkout

**Files to Create/Modify**:
- `backend/src/application/services/checkout.service.ts` (NEW)
- `backend/src/application/services/message.service.ts` (MODIFY)
- `backend/src/__tests__/unit/services/checkout.service.spec.ts` (NEW)

---

### **TASK 6: Flow Sequence Enforcement**
**Priority**: 🚨 **CRITICAL**
**Estimated Time**: 3 ore
**Description**: Garantire sequenza flow esatta e logging completo

**Acceptance Criteria**:
- [ ] Riorganizzare `MessageService.processMessage()` per seguire sequenza esatta:
  1. API Limit Check
  2. Spam Detection  
  3. Workspace Active Check
  4. Chatbot Active Check
  5. Blacklist Check
  6. WIP Check
  7. User Flow (nuovo/esistente)
- [ ] Logging dettagliato per ogni step con outcome
- [ ] Performance logging (tempo per ogni step)
- [ ] Error handling per ogni step

**Test Requirements**:
- [ ] Unit test: sequenza completa con tutti check passati
- [ ] Unit test: interruzione a ogni step della sequenza
- [ ] Unit test: logging corretto per ogni scenario
- [ ] Integration test: flow completo end-to-end

**Files to Modify**:
- `backend/src/application/services/message.service.ts`
- `backend/src/__tests__/unit/services/message.service.spec.ts`

---

### **TASK 7: WIP Message Fix**
**Priority**: 🚨 **MEDIUM**
**Estimated Time**: 2 ore
**Description**: Correggere comportamento WIP message secondo flow

**Acceptance Criteria**:
- [ ] WIP message NON deve bloccare il dialogo
- [ ] Dopo WIP message: continuare con user flow normale
- [ ] WIP message solo come notifica, non come stop
- [ ] Aggiornare documentazione flow se necessario

**Test Requirements**:
- [ ] Unit test: WIP message + continuazione flow
- [ ] Unit test: WIP message multilingua
- [ ] Integration test: scenario WIP completo

**Files to Modify**:
- `backend/src/application/services/message.service.ts`
- `docs/flow.md` (se necessario)

---

### **TASK 8: Comprehensive Flow Testing**
**Priority**: 🚨 **HIGH**
**Estimated Time**: 8 ore
**Description**: Test coverage completo per tutti gli scenari del flow

**Test Scenarios da Implementare**:
- [ ] **Scenario 1**: Nuovo utente + saluto → welcome message + registration
- [ ] **Scenario 2**: Utente registrato + chat normale → RAG response
- [ ] **Scenario 3**: Spam detection → auto-blacklist
- [ ] **Scenario 4**: Utente blacklisted → no response
- [ ] **Scenario 5**: Canale inattivo → WIP message
- [ ] **Scenario 6**: Controllo operatore → save message, no AI
- [ ] **Scenario 7**: API limit superato → no response
- [ ] **Scenario 8**: Bentornato dopo 2 ore → welcome back
- [ ] **Scenario 9**: Intent checkout → link generation
- [ ] **Scenario 10**: Errori vari → fallback graceful

**Files to Create**:
- `backend/src/__tests__/integration/whatsapp-flow-complete.spec.ts` (NEW)
- `backend/src/__tests__/unit/services/message-flow-scenarios.spec.ts` (NEW)

---

### **TASK 9: Performance Optimization**
**Priority**: 🚨 **MEDIUM**
**Estimated Time**: 4 ore
**Description**: Ottimizzare performance del flow per gestire alto volume

**Acceptance Criteria**:
- [ ] Caching per workspace settings (TTL 5 minuti)
- [ ] Caching per customer data (TTL 1 minuto)
- [ ] Database query optimization (indici appropriati)
- [ ] Async processing dove possibile
- [ ] Monitoring performance per ogni step

**Test Requirements**:
- [ ] Performance test: 100 messaggi simultanei
- [ ] Load test: 1000 messaggi in 1 minuto
- [ ] Memory usage test: no memory leaks

**Files to Create/Modify**:
- `backend/src/application/services/cache.service.ts` (NEW)
- `backend/src/application/services/message.service.ts` (MODIFY)

---

### **TASK 10: Documentation & Monitoring**
**Priority**: 🚨 **MEDIUM**
**Estimated Time**: 3 ore
**Description**: Documentazione completa e monitoring

**Acceptance Criteria**:
- [ ] Aggiornare `docs/flow.md` con implementazione finale
- [ ] Creare `docs/whatsapp-flow-implementation.md` con dettagli tecnici
- [ ] Aggiungere metrics per monitoring (Prometheus/StatsD)
- [ ] Dashboard per monitorare flow performance
- [ ] Alerting per errori critici

**Files to Create**:
- `docs/whatsapp-flow-implementation.md` (NEW)
- `backend/src/monitoring/flow-metrics.ts` (NEW)

---

## 🎯 **PRIORITÀ DI ESECUZIONE**

### **FASE 1 - CORE FLOW (Settimana 1)**
0. Task 0: LangChain Integration Setup (PREREQUISITO)
1. Task 1: API Limit Check
2. Task 2: Chatbot Active Check  
3. Task 6: Flow Sequence Enforcement

### **FASE 2 - FEATURES (Settimana 2)**
4. Task 4: "2 Ore Ultima Conversazione"
5. Task 5: Checkout Link Generation
6. Task 3: Operator Control Release

### **FASE 3 - QUALITY (Settimana 3)**
7. Task 7: WIP Message Fix
8. Task 8: Comprehensive Testing
9. Task 9: Performance Optimization
10. Task 10: Documentation

---

## 🧪 **TESTING STRATEGY**

### **Unit Tests (70% coverage target)**
- Ogni service method testato individualmente
- Mock di tutte le dipendenze esterne
- Test per tutti i branch del flow

### **Integration Tests (20% coverage target)**
- Test end-to-end per ogni scenario
- Database reale in test environment
- API calls complete

### **Performance Tests (10% coverage target)**
- Load testing con volume realistico
- Memory leak detection
- Response time monitoring

---

## 📋 **DEFINITION OF DONE**

Per ogni task:
- [ ] ✅ Codice implementato e funzionante
- [ ] ✅ Unit tests scritti e passanti (>90% coverage)
- [ ] ✅ Integration tests per scenario principale
- [ ] ✅ Documentazione aggiornata
- [ ] ✅ Code review completato
- [ ] ✅ Performance verificata (< 500ms response time)
- [ ] ✅ Logging implementato per debugging
- [ ] ✅ Error handling robusto

---

## 🚨 **RISCHI E MITIGAZIONI**

### **Rischio 1: Complessità Flow**
- **Mitigazione**: Task piccoli e incrementali
- **Fallback**: Implementazione graduale con feature flags

### **Rischio 2: Performance Degradation**
- **Mitigazione**: Performance testing continuo
- **Fallback**: Caching aggressivo e ottimizzazioni

### **Rischio 3: Test Coverage Insufficiente**
- **Mitigazione**: TDD approach per ogni task
- **Fallback**: Test automation e CI/CD integration

---

**Andrea, questa task list è pronta per l'implementazione step-by-step! 🚀**

Ogni task è:
- ✅ **Piccolo** (2-8 ore max)
- ✅ **Concreto** (acceptance criteria specifici)
- ✅ **Testabile** (unit + integration tests)
- ✅ **Incrementale** (build su task precedenti)

Vuoi che iniziamo con il **Task 1: API Limit Check**? 