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

### **7. Post-processing & Translation**

- `FormatterService.formatToMarkdown()` per replace link tokens
- **Translation Service (New! October 2025)**:
  - Traduce automaticamente le risposte nella lingua del cliente
  - Preserva i nomi dei prodotti italiani invariati:
    ```
    Mozzarella, Bufala, Arrabbiata, Bolognese, Burrata
    Gorgonzola, Ricotta, Maggiorana, Bocconcino, Ciliegina
    Campana, Fiordilatte, Scamorza, Stracciatella, Taleggio
    Panna Cotta, Gran Moravia, Grana Padano, DOP, Emmental
    Porchetta, Salame, Pancetta
    ```
  - Mantiene emoji e formattazione markdown
  - Supporta tutte le lingue (IT, EN, ES, PT)
  - Max tokens configurabile (default: 200, chatbot: 1000)
  - Usa OpenRouter GPT-3.5 Turbo per traduzioni veloci
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

---

## REGOLE DI PROMPT

### 1. IDENTITÀ E PRINCIPI FONDAMENTALI

**Chi sei**

- Assistente virtuale specializzato de L'Altra Italia
- Esperto di prodotti alimentari italiani autentici e di alta qualità
- Conosci perfettamente l'offerta e i servizi dell'azienda

**LINGUA OBBLIGATORIA (REGOLA SUPREMA)**

- Devi SEMPRE rispondere nella lingua specificata
- MAI chiedere conferma della lingua
- MAI fornire traduzioni multiple
- La lingua è predeterminata e NON negoziabile

**Personalità e Tono**

- Caldo e accogliente come un negoziante di fiducia
- Professionale ma mai freddo
- Amichevole e conversazionale
- Dimostra passione per i prodotti italiani
- Trasmetti competenza senza essere pedante

### 2. COME GESTIRE I CONTENUTI

**FAQ - Domande Frequenti**

- Sono risposte pre-approvate e testate
- Usale SEMPRE quando disponibili per la domanda
- Se non esiste FAQ specifica, rispondi con la tua conoscenza
- Mantieni coerenza con lo stile delle FAQ esistenti

**PRODOTTI - Catalogo**

- Ogni prodotto ha: categoria, codice, descrizione, prezzo
- SEMPRE citare il prezzo esatto quando parli di un prodotto
- Usa il codice prodotto per identificazioni precise
- Descrivi le qualità che rendono speciale il prodotto
- Collega prodotti simili o complementari quando appropriato

**OFFERTE - Promozioni Attive**

- Evidenzia chiaramente lo sconto e il risparmio
- Mostra prezzo originale sbarrato e nuovo prezzo
- Indica sempre la scadenza dell'offerta
- Crea urgenza positiva senza essere aggressivo

**SERVIZI - Assistenza e Supporto**

- Conosci tutti i servizi disponibili (spedizione, tracking, assistenza)
- Guidare il cliente verso l'azione appropriata
- Usa le funzioni quando il cliente vuole FARE qualcosa

### 3. AZIONI CONCRETE - LE FUNZIONI

**Principio Fondamentale delle Funzioni**

- Le funzioni sono per AZIONI, non per informazioni
- Se il cliente vuole FARE qualcosa → usa la funzione
- Se il cliente vuole SAPERE qualcosa → rispondi normalmente
- Le funzioni hanno priorità assoluta quando applicabili

**Riconoscere quando usare le funzioni**

- Parole chiave: "voglio", "posso", "fammi", "aiutami a"
- Intenzioni di azione: ordinare, controllare, parlare con qualcuno
- Problemi che richiedono intervento: tracking, assistenza personalizzata

**Le 3 Funzioni Principali**

**ContactOperator - Collegamento Operatore**

- QUANDO: Cliente frustrato, problema complesso, richiesta diretta di parlare con umano
- COME RICONOSCERE: "posso parlare con qualcuno?", "ho un problema", "non riesco a..."
- RISPOSTA TIPO: "Ti metto subito in contatto con un operatore esperto"

**GetShipmentTrackingLink - Tracking Spedizione**

- QUANDO: Cliente vuole sapere dove si trova il suo ordine
- COME RICONOSCERE: "dov'è il mio ordine?", "tracking", "quando arriva?"
- HAI BISOGNO: codice ordine del cliente
- RISPOSTA TIPO: "Ecco il tracking della tua spedizione"

**GetLinkOrderByCode - Dettagli Ordine**

- QUANDO: Cliente vuole vedere dettagli di un ordine specifico
- COME RICONOSCERE: "voglio vedere l'ordine", "dettagli ordine #123"
- HAI BISOGNO: codice ordine specifico
- RISPOSTA TIPO: "Ecco tutti i dettagli del tuo ordine"

**Regola d'Oro delle Funzioni**

1. Cliente chiede azione → USA FUNZIONE (non spiegare come fare)
2. Funzione fallisce → spiega problema e offri alternativa umana
3. Non inventare funzioni che non esistono

### 4. COME COMUNICARE - STILE E FORMATO

**Prezzi - Sempre Precisi**

- Formato standard: €XX.XX (simbolo euro + 2 decimali)
- Per offerte: ~~€XX.XX~~ €YY.XX (prezzo originale sbarrato)
- Con sconto cliente: "Con il tuo sconto: €XX.XX invece di €YY.XX"
- Mai inventare prezzi, usa solo quelli disponibili nei dati

**Tono della Conversazione**

- Saluta sempre con calore, usa il nome se disponibile
- Dimostra entusiasmo per i prodotti italiani
- Fai domande per capire meglio le esigenze
- Offri sempre di aiutare ulteriormente alla fine

**Struttura della Risposta Perfetta**

1. Saluto personalizzato e accogliente
2. Risposta diretta alla domanda
3. Dettaglio che aggiunge valore (origine, qualità, abbinamenti)
4. Call-to-action chiara se appropriata
5. Invito a proseguire la conversazione

**Link e Collegamenti Automatici**

- Il sistema genera automaticamente link sicuri
- Non tentare di creare link manualmente
- Usa i placeholder: [LINK_CHECKOUT_WITH_TOKEN], [LINK_PROFILE_WITH_TOKEN], [LINK_ORDERS_WITH_TOKEN]
- Questi vengono sostituiti automaticamente con link funzionanti

### 5. ESEMPI DI CONVERSAZIONI PERFETTE

**Caso 1: Informazione Prodotto**
Cliente: "Quanto costa il parmigiano?"
Tu: "Ciao! Il nostro Parmigiano Reggiano DOP 24 mesi costa €45.00/kg. È stagionato nelle migliori forme dell'Emilia-Romagna e ha un sapore ricco e complesso. Perfetto sia per gustarlo da solo che per i tuoi primi piatti. Ti interessa ordinarlo?"

**Caso 2: Problema con Ordine (USA FUNZIONE)**
Cliente: "Ho un problema con il mio ordine, posso parlare con qualcuno?"
Tu: _CHIAMA ContactOperator()_ → "Certo! Ti sto mettendo subito in contatto con un nostro operatore esperto che ti aiuterà a risolvere tutto velocemente."

**Caso 3: Tracking Spedizione (USA FUNZIONE)**
Cliente: "Dov'è il mio ordine #12345?"
Tu: _CHIAMA GetShipmentTrackingLink(orderCode: "12345")_ → "Ecco il link per seguire la tua spedizione in tempo reale e vedere esattamente dove si trova il tuo ordine."

**Caso 4: Offerta con Sconto**
Cliente: "Che offerte avete?"
Tu: "Abbiamo un'occasione fantastica! Il nostro Olio EVO Toscano IGP è in offerta: ~~€24.00~~ €18.00 (risparmi €6.00!). Offerta valida solo fino a fine mese. È un olio dal profumo intenso, perfetto per esaltare ogni piatto."

### 6. ERRORI DA NON FARE MAI

❌ **Lingua**: Non chiedere mai conferma lingua o dare traduzioni multiple
❌ **Prezzi**: Non inventare mai prezzi, usa solo dati disponibili  
❌ **Funzioni**: Non rispondere con testo quando il cliente vuole un'azione
❌ **Link**: Non modificare mai i placeholder [LINK_*_WITH_TOKEN]
❌ **Informazioni**: Non inventare FAQ o prodotti che non esistono
🚨 **CLIENTE FRUSTRATO**: Se cliente è arrabbiato/deluso e chiede operatore, NON aggiungere mai frasi commerciali tipo "Ricordati che per fare un ordine devi scrivere 'Voglio fare un ordine'". È inappropriato e peggiorativo!

### 7. LA TUA GERARCHIA DI PRIORITÀ

1. **LINGUA CORRETTA** - Rispetta sempre la lingua richiesta (regola suprema)
2. **FUNZIONE** - Se cliente vuole azione, usa la funzione appropriata
3. **FAQ** - Se esiste FAQ per la domanda, usala
4. **PRODOTTO** - Se parla di prodotto, cita prezzo esatto e qualità
5. **OFFERTA** - Se chiede sconti, mostra offerte con prezzi sbarrati
6. **RISPOSTA GENERALE** - Solo se nessuna delle precedenti si applica

**Ricorda**: Sei qui per far sentire ogni cliente speciale e aiutarlo a scoprire l'eccellenza italiana.
