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

## 🔗 **URL SHORTENER - AUTO-CLEANUP IMPLEMENTATO**

### **Rimozione Cron Job ✅**

- ❌ **Eliminato** `background-jobs.service.ts` (con cron job)
- ❌ **Rimosso** `node-cron` dal package.json
- ❌ **Rimossa** inizializzazione da `app.ts`

### **Pulizia Automatica ad Accesso ✅**

- 🔄 **Auto-cleanup** ogni volta che viene acceduta una URL corta (`/s/:shortCode`)
- 🧹 **Rimuove automaticamente**:
  - Link scaduti (`expiresAt < now`)
  - Link vecchi > 1 ora (`createdAt < 1 ora fa`)
- ⚡ **Esecuzione asincrona** (non blocca il redirect)

### **Funzioni Implementate**

- `urlShortenerService.cleanupOldUrls()` → pulizia automatica (nuova)
- `urlShortenerService.cleanupExpiredUrls()` → solo scaduti (esistente)
- Integrata in `ShortUrlController.redirect()` per auto-trigger
- Test endpoint `/api/test/short-urls/cleanup` aggiornato

### **Vantaggi**

- 🚀 **Performance**: Nessun processo background
- 🔄 **Efficienza**: Database sempre pulito ad ogni accesso
- 📦 **Leggerezza**: Meno dipendenze e complessità
- 🎯 **Precisione**: Pulizia basata su utilizzo reale

MCP

# Formato generale:

cd /Users/gelso/workspace/AI/shop/MCP
node mcp-test-client.js "Nome Utente" "messaggio" exit-first-message=true log=true

# Altri esempi:

node mcp-test-client.js "Mario Rossi" "che prodotti avete?" exit-first-message=true log=true
node mcp-test-client.js "John Smith" "show me products" exit-first-message=true log=true

RICORDATI CHE PROMPT.txt e' generato quello che dobbiamo cambiare e' promot_agent

RICDATI CHE SE CAMBI prompt_Agente devi lanciare npm run update:prompt
