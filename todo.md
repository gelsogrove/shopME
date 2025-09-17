# 🎯 TODO - CORREZIONE SISTEMA TOKEN REPLACE

## 📋 **REGOLE DEL GIOCO**

### **Flusso Corretto:**
1. **LLM con CF** → Se esistono Calling Functions, le esegue → Risultato al formatter
2. **SearchRag** → Se non esistono CF, lancia SearchRag → Risultato al formatter  
3. **LLM Diretto** → Se nessuna CF e SearchRag vuoto → LLM risponde direttamente dal prompt_agent
4. **Formatter** → Riceve risultato → Se trova `[variabile]` fa replace → Passa a OpenRouter
5. **OpenRouter** → Riceve testo già processato → Formatta e traduce

### **Mermaid - Flusso del Sistema:**
```mermaid
flowchart TD
    A[User Input] --> B[TranslationService]
    B --> C[DualLLMService]
    C --> D{CF Partite?}
    D -->|Sì| E[FormatterService]
    D -->|No| F[SearchRag]
    F --> G[FormatterService]
    E --> H{Contains [TOKEN]?}
    G --> H
    H -->|Yes| I[Replace Tokens with Real Data]
    H -->|No| J[Send to OpenRouter]
    I --> J
    J --> K[Format & Translate]
    K --> L[Final Response to User]
    
    M[Conversation History] --> C
    C --> D
    C --> F
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#99ff99
    style D fill:#9999ff
    style F fill:#9999ff
    style E fill:#ffcc99
    style G fill:#ffcc99
    style I fill:#ff9999
    style J fill:#99ff99
    style K fill:#9999ff
    style L fill:#e1f5fe
    style M fill:#ff9999
```

### **Regole Critiche:**
- ✅ **PRIMA COSA: Tradurre con TranslationService**
- ✅ **Solo il formatter fa il replace**
- ✅ **Replace PRIMA di OpenRouter**
- ✅ **Nessun altro replace nel sistema**
- ✅ **OpenRouter riceve sempre testo già processato**
- ✅ **LLM può rispondere direttamente se nessuna CF e SearchRag vuoto**
- ✅ **NOMI PROPRI dal database NON vanno tradotti**
- ✅ **PARAMETRI OBBLIGATORI: customerId, workspaceId, language, originalQuestion**
- ✅ **GESTIONE DATI VUOTI: Messaggio di cortesia se database vuoto**
- ✅ **STORICO CONVERSAZIONE: Gestito da DualLLMService, passato al formatter**
- ✅ **TEMPERATURE: LLM 0.1, Formatter 0.5**

### **🚨 FLUSSO LLM DIRETTO - IMPORTANTE:**
Quando l'LLM iniziale non trova Calling Functions e SearchRag restituisce risultati vuoti, l'LLM deve rispondere direttamente usando le informazioni nel `prompt_agent.md`.

**Esempi di LLM Diretto:**
- **"chi sei?"** → Nessuna CF, SearchRag vuoto → LLM risponde dal prompt_agent
- **"come stai?"** → Nessuna CF, SearchRag vuoto → LLM risponde dal prompt_agent  
- **"aiuto"** → Nessuna CF, SearchRag vuoto → LLM risponde dal prompt_agent
- **"grazie"** → Nessuna CF, SearchRag vuoto → LLM risponde dal prompt_agent

**Flusso LLM Diretto:**
```
1. User: "chi sei?"
2. LLM: Non trova CF specifiche
3. SearchRag: Restituisce risultati vuoti
4. LLM: Risponde direttamente dal prompt_agent
5. Response: "Ciao! Sono l'assistente di L'Altra Italia..."
```

### **🚨 NOMI PROPRI NON TRADURRE - IMPORTANTE:**
I nomi propri dal database (prodotti, servizi, categorie) NON devono essere tradotti. Il formatter deve proteggere questi nomi durante la traduzione.

**Esempi di Nomi Propri da NON Tradurre:**
- **Prodotti**: "Mozzarella di Bufala", "Prosecco DOCG", "Parmigiano Reggiano"
- **Servizi**: "Spedizione Express", "Assistenza Clienti", "Pagamento Sicuro"
- **Categorie**: "Cheeses & Dairy", "Frozen Products", "Sauces & Preserves"
- **Marchi**: "L'Altra Italia", "DOP", "DOCG"

**Soluzioni per Proteggere i Nomi Propri:**

#### **Soluzione 1: Markup Speciale**
```typescript
// Nel formatter, prima di passare a OpenRouter
const protectedText = response.replace(/\*([^*]+)\*/g, '{{PROTECTED:$1}}')

// Dopo traduzione, ripristina i nomi
const finalText = translatedText.replace(/\{\{PROTECTED:([^}]+)\}\}/g, '*$1*')
```

#### **Soluzione 2: Istruzioni Specifiche per OpenRouter**
```typescript
const promptToOpenRouter = `
DOMANDA: "${originalQuestion}"
DATI: "${replacedText}"

REGOLE CRITICHE:
- Traduci SOLO il testo descrittivo
- NON tradurre mai i nomi tra asterischi: *Mozzarella di Bufala*
- NON tradurre mai i nomi tra emoji: 🧀 *Cheeses & Dairy*
- Mantieni i nomi propri esattamente come sono

Formatta in ${language} per WhatsApp.
`
```

#### **Soluzione 3: Lista Nomi Protetti**
```typescript
const protectedNames = [
  'Mozzarella di Bufala', 'Prosecco DOCG', 'Parmigiano Reggiano',
  'Spedizione Express', 'Assistenza Clienti', 'Cheeses & Dairy',
  'Frozen Products', 'L\'Altra Italia', 'DOP', 'DOCG'
]

// Sostituisci temporaneamente i nomi protetti
let protectedText = response
protectedNames.forEach((name, index) => {
  protectedText = protectedText.replace(new RegExp(name, 'g'), `__PROTECTED_${index}__`)
})

// Dopo traduzione, ripristina i nomi
protectedNames.forEach((name, index) => {
  protectedText = protectedText.replace(`__PROTECTED_${index}__`, name)
})
```

**Esempi Pratici:**

#### **Prima (Sbagliato):**
```
Input: "Abbiamo *Mozzarella di Bufala* e *Prosecco DOCG*"
Traduzione: "We have *Buffalo Mozzarella* and *DOCG Prosecco*"
```

#### **Dopo (Corretto):**
```
Input: "Abbiamo *Mozzarella di Bufala* e *Prosecco DOCG*"
Traduzione: "We have *Mozzarella di Bufala* and *Prosecco DOCG*"
```

### **🚨 GESTIONE DATI VUOTI - IMPORTANTE:**
Se il database non restituisce risultati per un token, il formatter deve sostituire con un messaggio di cortesia invece di lasciare vuoto.

**Esempi di Gestione Dati Vuoti:**

#### **Token [LIST_CATEGORIES] - Database Vuoto:**
```typescript
// Query database
const categories = await prisma.category.findMany({
  where: { isActive: true, workspaceId },
  select: { name: true }
})

// Se vuoto, sostituisci con messaggio di cortesia
if (!categories || categories.length === 0) {
  response = response.replace('[LIST_CATEGORIES]', 'Al momento non abbiamo categorie disponibili 🙏')
} else {
  const categoriesList = categories.map(cat => `- ${getEmoji(cat.name)} *${cat.name}*`).join('\n')
  response = response.replace('[LIST_CATEGORIES]', categoriesList)
}
```

#### **Token [LIST_SERVICES] - Database Vuoto:**
```typescript
// Query database
const services = await prisma.service.findMany({
  where: { isActive: true, workspaceId },
  select: { name: true }
})

// Se vuoto, sostituisci con messaggio di cortesia
if (!services || services.length === 0) {
  response = response.replace('[LIST_SERVICES]', 'Al momento non abbiamo servizi disponibili 🙏')
} else {
  const servicesList = services.map(svc => `- ${getEmoji(svc.name)} *${svc.name}*`).join('\n')
  response = response.replace('[LIST_SERVICES]', servicesList)
}
```

#### **Token [USER_DISCOUNT] - Database Vuoto:**
```typescript
// Query database
const customer = await prisma.customer.findUnique({
  where: { id: customerId, workspaceId },
  select: { discount: true }
})

// Se vuoto, sostituisci con messaggio di cortesia
if (!customer || !customer.discount) {
  response = response.replace('[USER_DISCOUNT]', 'Nessuno sconto attivo al momento 🙏')
} else {
  response = response.replace('[USER_DISCOUNT]', customer.discount)
}
```

**Messaggi di Cortesia per Ogni Token:**

| **Token** | **Messaggio se Vuoto** |
|-----------|------------------------|
| `[LIST_CATEGORIES]` | "Al momento non abbiamo categorie disponibili 🙏" |
| `[LIST_SERVICES]` | "Al momento non abbiamo servizi disponibili 🙏" |
| `[LIST_PRODUCTS]` | "Al momento non abbiamo prodotti disponibili 🙏" |
| `[LIST_ALL_PRODUCTS]` | "Al momento non abbiamo prodotti disponibili 🙏" |
| `[USER_DISCOUNT]` | "Nessuno sconto attivo al momento 🙏" |
| `[LINK_ORDERS_WITH_TOKEN]` | "Link non disponibile al momento 🙏" |
| `[LINK_PROFILE_WITH_TOKEN]` | "Link non disponibile al momento 🙏" |
| `[LINK_CART_WITH_TOKEN]` | "Link non disponibile al momento 🙏" |
| `[LINK_TRACKING_WITH_TOKEN]` | "Link non disponibile al momento 🙏" |
| `[LINK_CHECKOUT_WITH_TOKEN]` | "Link non disponibile al momento 🙏" |

**Esempi Pratici:**

#### **Prima (Sbagliato):**
```
User: "che categorie avete?"
Database: Vuoto
Response: "Ciao! Abbiamo le seguenti categorie: "
```

#### **Dopo (Corretto):**
```
User: "che categorie avete?"
Database: Vuoto
Response: "Ciao! Abbiamo le seguenti categorie: Al momento non abbiamo categorie disponibili 🙏"
```

### **🧠 GESTIONE STORICO CONVERSAZIONE:**

#### **Chi Gestisce lo Storico:**
- **DualLLMService**: Riceve `request.messages` e lo gestisce
- **FormatterService**: Riceve lo storico come parametro per contesto
- **SearchRag**: Riceve lo storico per ricerca semantica

#### **Flusso dello Storico:**
```typescript
// 1. DualLLMService riceve lo storico
async processMessage(request: LLMRequest): Promise<LLMResponse> {
  const conversationHistory = request.messages || [] // ← STORICO QUI
  
  // 2. Passa lo storico a SearchRag
  const ragResult = await this.executeSearchRagFallback(request, conversationHistory)
  
  // 3. Passa lo storico al formatter
  const formattedOutput = await FormatterService.formatResponse(
    rawResponse,
    request.language || "it",
    undefined,
    request.customerid,
    request.workspaceId,
    request.originalQuery,
    conversationHistory  // ← STORICO PASSATO AL FORMATTER
  )
}
```

#### **Vantaggi di Questa Architettura:**
1. **Separazione Responsabilità**: LLM gestisce logica, formatter gestisce formattazione
2. **Contesto Completo**: Formatter ha accesso a tutta la conversazione
3. **Flessibilità**: Storico può essere usato per traduzioni più accurate
4. **Manutenibilità**: Logica centralizzata in DualLLMService

---

## 🔍 **STATO ATTUALE**

### **✅ ARCHITETTURA UNIFICATA (ANDREA DECISION):**

#### **1. ARCHITETTURA CORRETTA:**
- **✅ CONFERMATO**: `USER INPUT → TranslationService → DualLLMService → SearchRag → FormatterService (con token replacement)`
- **✅ PRIMA COSA**: Tradurre con TranslationService
- **✅ FLUSSO**: Input → Traduzione → LLM → SearchRag → Formatter → Output

#### **2. TEMPERATURE UNIFICATE:**
- **✅ LLM**: 0.1 (deterministico per trigger recognition)
- **✅ FORMATTER**: 0.5 (creativo per formattazione)
- **✅ CONFERMATO**: Temperature corrette per entrambi

#### **3. TOKEN SYSTEM:**
- **✅ CONFERMATO**: Sistema unificato con token generici e specifici
- **✅ TOKEN GENERICI**: `[LINK_WITH_TOKEN]` per FAQ (PRD)
- **✅ TOKEN SPECIFICI**: `[LIST_CATEGORIES]`, `[USER_DISCOUNT]`, `[LINK_ORDERS_WITH_TOKEN]`, etc. (TODO.MD)
- **✅ SISTEMA**: Token replacement nel formatter PRIMA di OpenRouter
- **✅ GESTIONE**: Messaggi di cortesia per dati vuoti

### **Problemi Identificati:**
1. **❌ Formatter non fa replace**: Token `[LIST_CATEGORIES]` non sostituito
2. **❌ OpenRouter inventa**: Riceve token e inventa categorie
3. **❌ Logica duplicata**: Replace in posti sbagliati
4. **❌ Flusso non corretto**: Non segue le regole
5. **❌ DISCREPANZE DOCUMENTAZIONE**: PRD, RULES_PROMPT e TODO.MD non allineati

### **Cosa Funziona:**
- ✅ SearchRag trova correttamente `[LIST_CATEGORIES]`
- ✅ DualLLMService gestisce il flusso
- ✅ FormatterService esiste

### **Cosa Non Funziona:**
- ❌ Replace dei token nel formatter
- ❌ Query al database per categorie
- ❌ Passaggio parametri al formatter

### **✅ DECISIONI ANDREA - SISTEMA UNIFICATO:**

#### **1. ARCHITETTURA CONFERMATA:**
- **✅ FLUSSO**: `USER INPUT → TranslationService → DualLLMService → SearchRag → FormatterService`
- **✅ PRIMA COSA**: Tradurre con TranslationService
- **✅ TOKEN REPLACEMENT**: Nel formatter PRIMA di OpenRouter

#### **2. TEMPERATURE CONFERMATE:**
- **✅ LLM**: 0.1 (deterministico per trigger recognition)
- **✅ FORMATTER**: 0.5 (creativo per formattazione)

#### **3. TOKEN SYSTEM CONFERMATO:**
- **✅ SISTEMA UNIFICATO**: Token generici + specifici
- **✅ TOKEN GENERICI**: `[LINK_WITH_TOKEN]` per FAQ (PRD)
- **✅ TOKEN SPECIFICI**: `[LIST_CATEGORIES]`, `[USER_DISCOUNT]`, `[LINK_ORDERS_WITH_TOKEN]`, etc. (TODO.MD)
- **✅ GESTIONE**: Messaggi di cortesia per dati vuoti
- **✅ REPLACE**: Nel formatter PRIMA di OpenRouter

#### **4. INFORMAZIONI RIMOSSE (NON ESISTONO PIÙ):**
- ❌ **Multi-business support**: ECOMMERCE, RESTAURANT, CLINIC, RETAIL, SERVICES, GENERIC
- ❌ **Sistema di priorità dinamica**: add_to_cart (100), etc.
- ❌ **Link del carrello**: Mandiamo i link del carrello

---

## 🎯 **PIANO DI CORREZIONE**

**📋 RIFERIMENTO**: Per User Stories complete con Acceptance Criteria e Test Cases, vedere `docs/memory-bank/userStories.md`

### **FASE 1: US1 - Token Replacement System Implementation**
- [ ] **1.1** Implementare `replaceAllTokens()` nel formatter
- [ ] **1.2** Implementare replace `[LIST_CATEGORIES]` con query database
- [ ] **1.3** Implementare replace `[USER_DISCOUNT]` con customer query
- [ ] **1.4** Implementare replace `[LINK_ORDERS_WITH_TOKEN]` con SecureTokenService
- [ ] **1.5** Aggiungere gestione graceful per database vuoto
- [ ] **1.6** Verificare replace PRIMA di OpenRouter
- [ ] **1.7** Testare con Acceptance Criteria US1

### **FASE 2: US2 - FormatterService Signature Update**
- [ ] **2.1** Aggiornare signature con parametri obbligatori
- [ ] **2.2** Aggiungere validazione parametri mandatory
- [ ] **2.3** Aggiungere error handling per parametri mancanti
- [ ] **2.4** Aggiornare TypeScript types
- [ ] **2.5** Testare con Acceptance Criteria US2

### **FASE 3: US3 - Parameter Passing Implementation**
- [ ] **3.1** Aggiornare chiamate DualLLMService al formatter
- [ ] **3.2** Aggiornare chiamate Calling Functions al formatter
- [ ] **3.3** Aggiornare chiamate SearchRag al formatter
- [ ] **3.4** Aggiungere logica estrazione parametri da request
- [ ] **3.5** Testare con Acceptance Criteria US3

### **FASE 4: US4 - System Testing & Validation**
- [ ] **4.1** Test "che categorie avete?" con MCP
- [ ] **3.2** Verificare che non inventi più categorie
- [ ] **3.3** Test altri token (servizi, prodotti, etc.)
- [ ] **3.4** Verificare formattazione WhatsApp

---

## 📝 **ESEMPI DI FUNZIONAMENTO**

### **Esempio 1: "che categorie avete?"**
```
1. SearchRag trova: "Ciao! Abbiamo le seguenti categorie: [LIST_CATEGORIES]"
2. Formatter riceve: "Ciao! Abbiamo le seguenti categorie: [LIST_CATEGORIES]"
3. Formatter fa replace: "Ciao! Abbiamo le seguenti categorie:\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"
4. OpenRouter riceve: testo già processato
5. OpenRouter formatta: "**Ciao!** 🧀\n\n_Ecco le categorie:_\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"
```

### **Esempio 2: "che servizi offrite?"**
```
1. SearchRag trova: "Offriamo i seguenti servizi: [LIST_SERVICES]"
2. Formatter riceve: "Offriamo i seguenti servizi: [LIST_SERVICES]"
3. Formatter fa replace: "Offriamo i seguenti servizi:\n- 🚚 *Spedizione*\n- 📞 *Assistenza*"
4. OpenRouter riceve: testo già processato
5. OpenRouter formatta: "**Offriamo:** 🚚\n\n- 🚚 *Spedizione*\n- 📞 *Assistenza*"
```

---

## 🚨 **REGOLE CRITICHE**

### **NON FARE MAI:**
- ❌ Replace in dual-llm.service.ts
- ❌ Replace in SearchRag
- ❌ Inventare categorie in OpenRouter
- ❌ Hardcode di dati

### **FARE SEMPRE:**
- ✅ Replace solo nel formatter
- ✅ Replace PRIMA di OpenRouter
- ✅ Query database per dati reali
- ✅ WorkspaceId filtering
- ✅ TENERE IL CODICE PULITO
- ✅RIFLETTERE SE STIAMO FACENDO BENE LE COSE E NON STIAMO INVENTANDO

---

## 🔧 **TOKEN DA GESTIRE**

### **Token nel Formatter:**
- `[LIST_CATEGORIES]` → Query database categorie → `prisma.category.findMany()`
- `[LIST_SERVICES]` → Query database servizi → `prisma.service.findMany()`
- `[LIST_PRODUCTS]` → Query database prodotti → `prisma.product.findMany()`
- `[USER_DISCOUNT]` → Query database sconti → `prisma.customer.findUnique()`
- `[LIST_ALL_PRODUCTS]` → Query database tutti i prodotti → `prisma.product.findMany()`
- `[LINK_ORDERS_WITH_TOKEN]` → Genera link sicuro → `SecureTokenService.generateToken()`
- `[LINK_PROFILE_WITH_TOKEN]` → Genera link sicuro → `SecureTokenService.generateToken()`
- `[LINK_CART_WITH_TOKEN]` → Genera link sicuro → `SecureTokenService.generateToken()`
- `[LINK_TRACKING_WITH_TOKEN]` → Genera link sicuro → `SecureTokenService.generateToken()`
- `[LINK_CHECKOUT_WITH_TOKEN]` → Genera link sicuro → `SecureTokenService.generateToken()`

---

## 📋 **TABELLA COMPLETA TOKEN E FUNZIONI**

| **Token** | **Funzione** | **Query Database** | **Parametri** | **Esempio Output** | **Se Vuoto** |
|-----------|--------------|-------------------|---------------|-------------------|--------------|
| `[LINK_WITH_TOKEN]` | `ReplaceLinkWithToken()` | Token generico per FAQ | `(response, linkType, context)` | `https://shopme.com/checkout?token=abc123` | `Link non disponibile al momento 🙏` |
| `[LIST_CATEGORIES]` | `prisma.category.findMany()` | `SELECT name FROM category WHERE isActive=true AND workspaceId=?` | `{ isActive: true, workspaceId }` | `- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*` | `Al momento non abbiamo categorie disponibili 🙏` |
| `[LIST_SERVICES]` | `prisma.service.findMany()` | `SELECT name FROM service WHERE isActive=true AND workspaceId=?` | `{ isActive: true, workspaceId }` | `- 🚚 *Spedizione Express*\n- 📞 *Assistenza Clienti*` | `Al momento non abbiamo servizi disponibili 🙏` |
| `[LIST_PRODUCTS]` | `prisma.product.findMany()` | `SELECT name FROM product WHERE isActive=true AND workspaceId=?` | `{ isActive: true, workspaceId }` | `- 🧀 *Mozzarella di Bufala*\n- 🍷 *Prosecco DOCG*` | `Al momento non abbiamo prodotti disponibili 🙏` |
| `[USER_DISCOUNT]` | `prisma.customer.findUnique()` | `SELECT discount FROM customer WHERE id=? AND workspaceId=?` | `{ id: customerId, workspaceId }` | `10%` | `Nessuno sconto attivo al momento 🙏` |
| `[LIST_ALL_PRODUCTS]` | `prisma.product.findMany()` | `SELECT name, price FROM product WHERE workspaceId=?` | `{ workspaceId }` | `- 🧀 *Mozzarella* - €8.90\n- 🍷 *Prosecco* - €12.50` | `Al momento non abbiamo prodotti disponibili 🙏` |
| `[LINK_ORDERS_WITH_TOKEN]` | `SecureTokenService.generateToken()` | Genera token sicuro | `(customerId, 'orders')` | `http://localhost:3000/orders?token=abc123` | `Link non disponibile al momento 🙏` |
| `[LINK_PROFILE_WITH_TOKEN]` | `SecureTokenService.generateToken()` | Genera token sicuro | `(customerId, 'profile')` | `http://localhost:3000/profile?token=def456` | `Link non disponibile al momento 🙏` |
| `[LINK_CART_WITH_TOKEN]` | `SecureTokenService.generateToken()` | Genera token sicuro | `(customerId, 'cart')` | `http://localhost:3000/cart?token=ghi789` | `Link non disponibile al momento 🙏` |
| `[LINK_TRACKING_WITH_TOKEN]` | `SecureTokenService.generateToken()` | Genera token sicuro | `(customerId, 'tracking')` | `http://localhost:3000/tracking?token=jkl012` | `Link non disponibile al momento 🙏` |
| `[LINK_CHECKOUT_WITH_TOKEN]` | `SecureTokenService.generateToken()` | Genera token sicuro | `(customerId, 'checkout')` | `http://localhost:3000/checkout?token=mno345` | `Link non disponibile al momento 🙏` |

---

## 🔧 **IMPLEMENTAZIONE FORMATTER**

### **📋 Signature Formatter Aggiornata:**
```typescript
static async formatResponse(
  response: string,           // Testo da formattare
  language: string,           // Lingua utente (OBBLIGATORIO)
  formatRules?: string,       // Regole di formattazione
  customerId: string,         // ID cliente per token (OBBLIGATORIO)
  workspaceId: string,        // ID workspace per query (OBBLIGATORIO)
  originalQuestion: string,   // DOMANDA ORIGINALE per contesto (OBBLIGATORIO)
  conversationHistory?: Array<{role: string, content: string}> // STORICO CONVERSAZIONE
): Promise<string>
```

### **🚨 PARAMETRI OBBLIGATORI - CRITICO:**
Il formatter DEVE ricevere SEMPRE questi parametri:

1. **`customerId: string`** - OBBLIGATORIO per:
   - Generare token sicuri per link
   - Query database per sconti utente
   - Isolamento dati per sicurezza

2. **`workspaceId: string`** - OBBLIGATORIO per:
   - Query database con filtro workspace
   - Isolamento multi-tenant
   - Sicurezza dati

3. **`language: string`** - OBBLIGATORIO per:
   - Formattazione nella lingua corretta
   - Traduzione appropriata
   - Localizzazione risposta

4. **`originalQuestion: string`** - OBBLIGATORIO per:
   - Contesto completo per formattazione
   - Coerenza con la domanda
   - Personalizzazione risposta

**NON sono opzionali!** Il formatter non può funzionare senza questi parametri.

### **🚨 CHIAMATE AL FORMATTER - SEMPRE CON PARAMETRI OBBLIGATORI:**

#### **Da DualLLMService:**
```typescript
// SEMPRE passare tutti i parametri obbligatori
const formattedOutput = await FormatterService.formatResponse(
  rawResponse,                    // Testo da formattare
  request.language || "it",       // OBBLIGATORIO: Lingua utente
  undefined,                      // formatRules (opzionale)
  request.customerid || "",       // OBBLIGATORIO: ID cliente
  request.workspaceId,            // OBBLIGATORIO: ID workspace
  request.originalQuery || "",    // OBBLIGATORIO: Domanda originale
  request.conversationHistory     // Opzionale: Storico conversazione
)

// TEMPERATURE FORMATTER: 0.5 (creativo per formattazione)
// TEMPERATURE LLM: 0.1 (deterministico per trigger recognition)
```

#### **Da Calling Functions:**
```typescript
// SEMPRE passare tutti i parametri obbligatori
const formattedOutput = await FormatterService.formatResponse(
  functionResult,                 // Risultato da CF
  language,                       // OBBLIGATORIO: Lingua utente
  undefined,                      // formatRules (opzionale)
  customerId,                     // OBBLIGATORIO: ID cliente
  workspaceId,                    // OBBLIGATORIO: ID workspace
  originalQuestion,               // OBBLIGATORIO: Domanda originale
  conversationHistory             // Opzionale: Storico conversazione
)
```

#### **Da SearchRag:**
```typescript
// SEMPRE passare tutti i parametri obbligatori
const formattedOutput = await FormatterService.formatResponse(
  ragResult,                      // Risultato da SearchRag
  language,                       // OBBLIGATORIO: Lingua utente
  undefined,                      // formatRules (opzionale)
  customerId,                     // OBBLIGATORIO: ID cliente
  workspaceId,                    // OBBLIGATORIO: ID workspace
  originalQuestion,               // OBBLIGATORIO: Domanda originale
  conversationHistory             // Opzionale: Storico conversazione
)
```

### **📋 Flusso Formatter con Parametri Obbligatori:**
```typescript
// 1. Riceve input OBBLIGATORIO
const input = {
  response: "Ciao! Abbiamo le seguenti categorie: [LIST_CATEGORIES]",
  language: "it",                    // OBBLIGATORIO
  customerId: "customer-123",        // OBBLIGATORIO
  workspaceId: "workspace-456",      // OBBLIGATORIO
  originalQuestion: "che categorie avete?", // OBBLIGATORIO
  conversationHistory: [             // Opzionale
    { role: "user", content: "ciao" },
    { role: "assistant", content: "Ciao! Come posso aiutarti?" },
    { role: "user", content: "che categorie avete?" }
  ]
}

// 2. Fa replace dei token
const replacedText = "Ciao! Abbiamo le seguenti categorie:\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"

// 3. Passa a OpenRouter con contesto completo
const promptToOpenRouter = `
STORICO CONVERSAZIONE:
- User: "ciao"
- Assistant: "Ciao! Come posso aiutarti?"
- User: "che categorie avete?"

DOMANDA ORIGINALE: "che categorie avete?"
DATI RIMPIAZZATI: "Ciao! Abbiamo le seguenti categorie:\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"

REGOLE CRITICHE:
- Traduci SOLO il testo descrittivo
- NON tradurre mai i nomi tra asterischi: *Cheeses & Dairy*
- NON tradurre mai i nomi tra emoji: 🧀 *Cheeses & Dairy*
- Mantieni i nomi propri esattamente come sono

Formatta questa risposta in italiano per WhatsApp con emoji e formattazione appropriata, considerando lo storico della conversazione.
`

// 4. OpenRouter restituisce risposta formattata
const finalResponse = "**Perfetto!** 🧀\n\n_Ecco le categorie che abbiamo:_\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*\n\nQuale ti interessa di più?"
```

### **📋 Esempi con Domanda e Storico:**

#### **Esempio 1: "che categorie avete?" (Prima domanda)**
```
STORICO: []
DOMANDA: "che categorie avete?"
DATI: "Ciao! Abbiamo le seguenti categorie:\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"
RISPOSTA: "**Ciao!** 🧀\n\n_Ecco le categorie che abbiamo:_\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"
```

#### **Esempio 2: "che servizi offrite?" (Dopo saluto)**
```
STORICO: [
  { role: "user", content: "ciao" },
  { role: "assistant", content: "Ciao! Come posso aiutarti?" }
]
DOMANDA: "che servizi offrite?"
DATI: "Offriamo i seguenti servizi:\n- 🚚 *Spedizione Express*\n- 📞 *Assistenza Clienti*"
RISPOSTA: "**Perfetto!** 🚚\n\n_Ecco i nostri servizi:_\n- 🚚 *Spedizione Express*\n- 📞 *Assistenza Clienti*\n\nQuale ti serve?"
```

#### **Esempio 3: "che sconto ho?" (Conversazione in corso)**
```
STORICO: [
  { role: "user", content: "ciao" },
  { role: "assistant", content: "Ciao! Come posso aiutarti?" },
  { role: "user", content: "che categorie avete?" },
  { role: "assistant", content: "Ecco le categorie..." }
]
DOMANDA: "che sconto ho?"
DATI: "User discount: 10%"
RISPOSTA: "**Ottima domanda!** 👋\n\n_Il tuo sconto attuale è del **10%**_ 🎉\n\nVuoi vedere i prodotti con sconto?"
```

#### **Esempio 4: "aggiungi mozzarella" (Dopo aver visto categorie)**
```
STORICO: [
  { role: "user", content: "che categorie avete?" },
  { role: "assistant", content: "Ecco le categorie: 🧀 Cheeses & Dairy, 🧊 Frozen Products" }
]
DOMANDA: "aggiungi mozzarella"
DATI: "Product added to cart: Mozzarella di Bufala"
RISPOSTA: "**Perfetto!** 🧀\n\n_Ho aggiunto la Mozzarella di Bufala al tuo carrello!_ ✅\n\nVuoi aggiungere altro?"
```

#### **Esempio 5: "chi sei?" (LLM Diretto)**
```
STORICO: []
DOMANDA: "chi sei?"
DATI: "Nessuna CF, SearchRag vuoto"
RISPOSTA: "**Ciao!** 👋\n\n_Sono l'assistente di L'Altra Italia, il tuo negozio di prodotti italiani di qualità!_ 🇮🇹\n\nPosso aiutarti a trovare prodotti, gestire il tuo carrello e rispondere alle tue domande. Come posso esserti utile oggi?"
```

---

## 📊 **STATO PROGRESSO**

- [ ] **FASE 1**: Analisi e pulizia
- [ ] **FASE 2**: Implementazione replace  
- [ ] **FASE 3**: Test e verifica

**Prossimo Step**: Implementare signature aggiornata nel formatter

---

## ✅ **ACCEPTANCE CRITERIA**

### **🎯 CRITERIO 1: TOKEN REPLACEMENT FUNZIONANTE**
**GIVEN** un messaggio con token `[LIST_CATEGORIES]`
**WHEN** il formatter processa il messaggio
**THEN** il token deve essere sostituito con le categorie reali dal database
**AND** se il database è vuoto, deve mostrare "Al momento non abbiamo categorie disponibili 🙏"

**Test Case:**
```bash
# Test con categorie esistenti
User: "che categorie avete?"
Expected: "Ciao! Abbiamo le seguenti categorie:\n- 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"

# Test con database vuoto
User: "che categorie avete?"
Expected: "Ciao! Abbiamo le seguenti categorie: Al momento non abbiamo categorie disponibili 🙏"
```

### **🎯 CRITERIO 2: NESSUN CONTENUTO INVENTATO**
**GIVEN** qualsiasi query dell'utente
**WHEN** il sistema risponde
**THEN** non deve mai inventare categorie, prodotti, servizi o informazioni
**AND** tutto deve provenire dal database o da messaggi di cortesia predefiniti

**Test Case:**
```bash
# Test anti-invenzione
User: "che categorie avete?"
Expected: Solo categorie reali dal database o messaggio di cortesia
NOT Expected: "Vini", "Formaggi", "Salumi" (se non esistono nel DB)
```

### **🎯 CRITERIO 3: PARAMETRI OBBLIGATORI SEMPRE PASSATI**
**GIVEN** qualsiasi chiamata al FormatterService
**WHEN** il formatter viene invocato
**THEN** deve sempre ricevere: `customerId`, `workspaceId`, `language`, `originalQuestion`
**AND** se manca anche uno solo, deve fallire con errore esplicito

**Test Case:**
```typescript
// ✅ Corretto
await FormatterService.formatResponse(
  "Testo da formattare",
  "it",                    // language (OBBLIGATORIO)
  undefined,               // formatRules (opzionale)
  "customer123",           // customerId (OBBLIGATORIO)
  "workspace456",          // workspaceId (OBBLIGATORIO)
  "che categorie avete?",  // originalQuestion (OBBLIGATORIO)
  conversationHistory      // conversationHistory (opzionale)
)

// ❌ Sbagliato - deve fallire
await FormatterService.formatResponse(
  "Testo da formattare",
  "it",
  undefined,
  undefined,  // customerId mancante - ERRORE!
  "workspace456",
  "che categorie avete?",
  conversationHistory
)
```

### **🎯 CRITERIO 4: GESTIONE STORICO CONVERSAZIONE**
**GIVEN** una conversazione con storico
**WHEN** il formatter processa una risposta
**THEN** deve ricevere lo storico completo della conversazione
**AND** deve usarlo per traduzioni più accurate e contesto

**Test Case:**
```typescript
// DualLLMService deve passare lo storico
const conversationHistory = request.messages || []
const formattedOutput = await FormatterService.formatResponse(
  rawResponse,
  request.language || "it",
  undefined,
  request.customerid,
  request.workspaceId,
  request.originalQuery,
  conversationHistory  // ← STORICO OBBLIGATORIO
)
```

### **🎯 CRITERIO 5: NOMI PROPRI NON TRADOTTI**
**GIVEN** un messaggio con nomi di prodotti/servizi dal database
**WHEN** il formatter traduce il messaggio
**THEN** i nomi propri (Mozzarella di Bufala, Prosecco DOCG) non devono essere tradotti
**AND** solo il resto del testo deve essere tradotto

**Test Case:**
```bash
# Input italiano
"Abbiamo *Mozzarella di Bufala* e *Prosecco DOCG*"

# Output inglese corretto
"We have *Mozzarella di Bufala* and *Prosecco DOCG*"

# Output inglese sbagliato (da evitare)
"We have *Buffalo Mozzarella* and *DOCG Prosecco*"
```

### **🎯 CRITERIO 6: REPLACE PRIMA DI OPENROUTER**
**GIVEN** un messaggio con token da sostituire
**WHEN** il formatter processa il messaggio
**THEN** deve fare il replace di TUTTI i token PRIMA di chiamare OpenRouter
**AND** OpenRouter deve ricevere solo testo già processato

**Test Case:**
```typescript
// Input al formatter
"Ecco le categorie: [LIST_CATEGORIES]"

// Dopo replace (PRIMA di OpenRouter)
"Ecco le categorie: - 🧀 *Cheeses & Dairy*\n- 🧊 *Frozen Products*"

// OpenRouter riceve solo il testo processato
// NON riceve mai token non sostituiti
```

### **🎯 CRITERIO 7: GESTIONE ERRORI ROBUSTA**
**GIVEN** un errore durante il replace dei token
**WHEN** il formatter incontra un problema
**THEN** deve gestire l'errore gracefully
**AND** deve mostrare un messaggio di cortesia invece di fallire

**Test Case:**
```typescript
// Se il database è down
try {
  const categories = await prisma.category.findMany(...)
} catch (error) {
  // Gestione errore graceful
  response = response.replace('[LIST_CATEGORIES]', 'Al momento non abbiamo categorie disponibili 🙏')
}
```

### **🎯 CRITERIO 8: PERFORMANCE ACCETTABILI**
**GIVEN** un messaggio con multiple token
**WHEN** il formatter processa il messaggio
**THEN** deve completare il replace in meno di 2 secondi
**AND** deve gestire fino a 10 token contemporaneamente

**Test Case:**
```typescript
// Test performance
const startTime = Date.now()
await FormatterService.formatResponse(
  "Categorie: [LIST_CATEGORIES]\nServizi: [LIST_SERVICES]\nSconto: [USER_DISCOUNT]",
  "it",
  undefined,
  "customer123",
  "workspace456",
  "info complete",
  conversationHistory
)
const endTime = Date.now()
const duration = endTime - startTime

// Deve essere < 2000ms
assert(duration < 2000, `Formatter troppo lento: ${duration}ms`)
```

### **🎯 CRITERIO 9: COMPATIBILITÀ MULTI-LINGUA**
**GIVEN** messaggi in diverse lingue (IT, EN, ES, PT)
**WHEN** il formatter processa i messaggi
**THEN** deve gestire correttamente tutte le lingue supportate
**AND** deve mantenere la formattazione WhatsApp (bold, italic, etc.)

**Test Case:**
```bash
# Italiano
User: "che categorie avete?"
Expected: "Ciao! Abbiamo le seguenti categorie: ..."

# Inglese
User: "what categories do you have?"
Expected: "Hello! We have the following categories: ..."

# Spagnolo
User: "¿qué categorías tienen?"
Expected: "¡Hola! Tenemos las siguientes categorías: ..."

# Portoghese
User: "que categorias vocês têm?"
Expected: "Olá! Temos as seguintes categorias: ..."
```

### **🎯 CRITERIO 10: INTEGRAZIONE COMPLETA**
**GIVEN** il sistema completo
**WHEN** si eseguono i test di integrazione
**THEN** tutti i test devono passare
**AND** il sistema deve funzionare end-to-end senza errori

**Test Case:**
```bash
# Test completo
npm run test:integration
npm run test:unit
npm run build

# Tutti i test devono passare
# Il sistema deve compilare senza errori
# Le API devono funzionare correttamente
```

---

## 🚀 **DEFINITION OF DONE**

Il task è considerato **COMPLETATO** quando:

- [ ] ✅ Tutti i 10 Acceptance Criteria sono soddisfatti
- [ ] ✅ I test di integrazione passano al 100%
- [ ] ✅ Il sistema compila senza errori
- [ ] ✅ Non ci sono più invenzioni di contenuti
- [ ] ✅ I token vengono sostituiti correttamente
- [ ] ✅ La gestione errori è robusta
- [ ] ✅ Le performance sono accettabili
- [ ] ✅ La documentazione è aggiornata
- [ ] ✅ Andrea ha testato e approvato il sistema

---

**📝 Note:** Questo documento serve come guida completa per implementare correttamente il sistema di token replacement nel formatter, seguendo le regole stabilite da Andrea.

  