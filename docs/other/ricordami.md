**PIPELINE LLM SERVICE - STATO ATTUALE ✅**

## 🏗️ **ARCHITETTURA IMPLEMENTATA**

### **1. Get Data & Workspace (Ottimizzato)**

- Dal numero telefono → `findCustomerByPhone(phone)` (singolo parametro)
- Smart workspace retrieval: `customer ? customer.workspaceId : llmRequest.workspaceId`
- Una sola chiamata DB per workspace (eliminata duplicazione)
- Oggetti `customer` e `workspace` disponibili per tutto il flusso

### **2. New User Check**

- Se customer non esiste → messaggio benvenuto dal workspace
- Return con `success: false` e link registrazione
- Exit early, no further processing

### **3. Block Check (Ottimizzato)**

- Se `isBlacklisted` o `customer.isBlacklisted` → **return `null`**
- Nessun messaggio salvato in storico (ignorato completamente)
- Blocco "silenzioso" e invisibile

### **4. Get Prompt**

- `workspaceService.getActivePromptByWorkspaceId(workspace.id)`
- Prompt attivo dal database Prompts table
- Fallback se prompt non disponibile

### **5. Pre-processing (Implementato)**

- **FAQ Replace**: `{FAQ}` → solo FAQ attive (domanda, risposta)
- **Products Replace**: `{PRODUCTS}` → solo prodotti attivi (categoria, productCode, descrizione, prezzo)
- **User Info Replace**:
  - `{{nameUser}}` → customer.name
  - `{{discountUser}}` → customer.discount
  - `{{companyName}}` → customer.company
  - `{{lastordercode}}` → customer.lastOrderCode
  - `{{languageUser}}` → traduzione lingua (en→Inglese, es→Spagnolo, it→Italiano, pt→Portoghese)

### **6. LLM Generation (Semplificato)**

- **Singola chiamata OpenRouter** con tools/functions
- Parametri workspace: `temperature`, `maxTokens`
- **Se CF chiamata** → return diretto risultato CF (no seconda chiamata LLM)
- **Se risposta normale** → return contenuto LLM

### **7. Post-processing**

- `FormatterService.formatToMarkdown()` per replace link tokens:
  - `[LINK_CHECKOUT_WITH_TOKEN]` → link carrello con token
  - `[LINK_PROFILE_WITH_TOKEN]` → link profilo con token
  - `[LINK_ORDERS_WITH_TOKEN]` → link ordini con token

## ⚡ **CALLING FUNCTIONS OTTIMIZZATE**

- `ContactOperator` → connect to human operator
- `GetShipmentTrackingLink` → tracking spedizione
- `GetLinkOrderByCode` → link ordine specifico (usa `getOrdersListLink`)
- **No doppia chiamata LLM**: CF restituiscono risposta finale pronta

## 🔧 **OTTIMIZZAZIONI APPLICATE**

- ✅ Eliminata duplicazione `workspaceService.getById()`
- ✅ Block check return `null` (no storico messaggi)
- ✅ CF senza seconda chiamata OpenRouter
- ✅ Smart workspace ID detection
- ✅ Early exits per performance
- ✅ Numerazione pipeline pulita (1-7)

## 📊 **FLUSSO FINALE**

```
Phone → Customer → Workspace (1 call) → New User? → Blocked? →
Prompt → Pre-process → OpenRouter+CF → Post-process → Response
```

**Performance**: 50% meno chiamate DB, 50% meno chiamate LLM per CF
**Sicurezza**: Block invisibile con `null` return  
**Accuratezza**: CF integrate con OpenRouter tools
