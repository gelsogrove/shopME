# Soluzione: Gestione Ordini e Tracking

## 📋 Problema Risolto

L'LLM confondeva quando usare:

- `GetShipmentTrackingLink` (tracking fisico della spedizione)
- `GetLinkOrderByCode` (dettagli/fattura ordine)
- `[LINK_ORDERS_WITH_TOKEN]` (lista completa ordini)

## ✅ Soluzione Implementata

### 1. Distinzione Chiara dei Casi d'Uso

#### `GetShipmentTrackingLink` - Tracking Fisico

**QUANDO**: Utente chiede **DOVE SI TROVA FISICAMENTE** il pacco

**TRIGGER KEYWORDS**: "dov'è", "dove", "tracking", "quando arriva"

**ESEMPI**:

- ✅ "dov'è il mio ordine?"
- ✅ "dov'è il mio ultimo ordine?"
- ✅ "dove l'ordine XXX?"
- ✅ "quando arriva il mio ordine?"
- ✅ "tracking ordine ORD-123"

**PARAMETRI**:

- `orderCode` (optional): se non specificato usa `{{lastordercode}}`

---

#### `GetLinkOrderByCode` - Dettagli Ordine

**QUANDO**: Utente vuole **VEDERE DETTAGLI/FATTURA** di un ordine specifico

**TRIGGER KEYWORDS**: "dammi", "mostrami", "voglio vedere", "fattura"

**ESEMPI**:

- ✅ "dammi ultimo ordine"
- ✅ "dammi ordine ORD-123"
- ✅ "mostrami ultimo ordine"
- ✅ "fammi vedere il mio ultimo ordine"
- ✅ "voglio la fattura dell'ordine XXX"

**PARAMETRI**:

- `orderCode` (optional): se non specificato usa `{{lastordercode}}`

---

#### `[LINK_ORDERS_WITH_TOKEN]` - Lista Completa

**QUANDO**: Utente vuole vedere la **LISTA DI TUTTI** gli ordini

**TRIGGER KEYWORDS**: "tutti", "lista", "storico"

**ESEMPI**:

- ✅ "voglio vedere tutti i miei ordini"
- ✅ "mostrami la lista degli ordini"
- ✅ "storico ordini"

**NOTA**: Questo è un TOKEN, non una calling function!

---

### 2. Modifiche al Codice

#### File: `backend/src/services/llm.service.ts`

**GetShipmentTrackingLink**:

```typescript
{
  type: "function",
  function: {
    name: "GetShipmentTrackingLink",
    description: "⚠️ USA QUESTA FUNZIONE quando l'utente chiede 'DOV'È' o 'DOVE' (= dove si trova FISICAMENTE il pacco). Esempi: 'dov'è il mio ordine?', 'dov'è il mio ultimo ordine?', 'dove l'ordine XXX?', 'quando arriva?', 'tracking'. Fornisce link per tracciare la SPEDIZIONE FISICA del pacco con corriere.",
    parameters: {
      type: "object",
      properties: {
        orderCode: {
          type: "string",
          description: "Il codice dell'ordine da tracciare (es. 'ORD-2025-001'). LASCIA VUOTO se l'utente dice 'ultimo ordine' o 'mio ordine' senza specificare codice. OPZIONALE.",
        },
      },
      required: [],
    },
  },
}
```

**GetLinkOrderByCode**:

```typescript
{
  type: "function",
  function: {
    name: "GetLinkOrderByCode",
    description: "⚠️ USA QUESTA FUNZIONE (NON il token LINK_ORDERS_WITH_TOKEN) quando l'utente chiede di vedere UN SINGOLO ORDINE SPECIFICO o l'ULTIMO ORDINE. Esempi: 'dammi ultimo ordine', 'mostrami ordine ORD-123', 'voglio la fattura'. Fornisce il link per visualizzare i dettagli completi di un ordine.",
    parameters: {
      type: "object",
      properties: {
        orderCode: {
          type: "string",
          description: "Il codice dell'ordine da visualizzare (es. 'ORD-2025-001'). Se l'utente dice 'ultimo ordine' o 'mio ultimo ordine' LASCIA VUOTO questo campo e il sistema userà automaticamente lastordercode. OPZIONALE.",
        },
      },
      required: [],
    },
  },
}
```

---

#### File: `docs/other/prompt_agent.md`

**Sezione GetShipmentTrackingLink**:

```markdown
## 📦 GetShipmentTrackingLink(orderCode)

**QUANDO USARE**: Quando l'utente chiede **DOVE SI TROVA FISICAMENTE** il pacco/ordine (tracking della spedizione)

**TRIGGER SEMANTICI con "DOV'È" o "DOVE"**:

- "dov'è il mio ordine?"
- "dov'è il mio ultimo ordine?"
- "dove è il mio ordine?"
- "dove si trova il mio ordine?"
- "dove l'ordine XXX?"

**TRIGGER SEMANTICI per TRACKING/ARRIVO**:

- "tracking del mio ordine"
- "quando arriva il mio ordine?"
- "tracking ordine ORD-123-2024"
- "stato della spedizione"

⚠️ **REGOLA CHIAVE**: Se la domanda inizia con "DOV'È" o "DOVE" → questa funzione! Se inizia con "DAMMI" → usa GetLinkOrderByCode!
```

**Sezione GetLinkOrderByCode**:

```markdown
## 📄 GetLinkOrderByCode(ordine)

**QUANDO USARE**: L'utente vuole **vedere un ordine specifico**, **dettagli** o **fattura** di UN SINGOLO ORDINE.

**TRIGGER SEMANTICI**:

- Dammi la fattura dell'ordine ORD-123-2024
- Dammi ordine ORD-123-2024
- Dammi ultimo ordine
- Dammi il mio ultimo ordine
- Voglio vedere l'ordine ORD-123-2024
- Mostrami l'ordine
- Mostrami ultimo ordine
- Fammi vedere il mio ultimo ordine
- Dettagli ultimo ordine

⚠️ **NON USARE** per "dov'è" o "dove" → quelle sono richieste di tracking fisico, usa GetShipmentTrackingLink!
```

**Sezione FAQ**:

```markdown
🚨 **REGOLE CRITICHE PER LE FAQ**:

**⚠️ PRIORITÀ DELLE FAQ**:

- Le FAQ hanno PRIORITÀ GENERALE sulle calling functions
- **ECCEZIONI** (le calling functions hanno priorità):
  - "dov'è il mio ordine" / "dov'è ultimo ordine" → usa `GetShipmentTrackingLink()`
  - "dammi ordine" / "mostrami ultimo ordine" → usa `GetLinkOrderByCode()`
  - Le FAQ con [LINK_ORDERS_WITH_TOKEN] sono SOLO per "vedere TUTTI gli ordini" (lista completa)
```

---

### 3. Architettura dei Link

#### Flusso Completo

**GetShipmentTrackingLink**:

```
User: "dov'è il mio ordine?"
  ↓
LLM chiama: GetShipmentTrackingLink({})
  ↓
Backend: llm.service.ts → executeFunctionCall()
  ↓
Backend: callingFunctionsService.getShipmentTrackingLink()
  ↓
Backend: linkGeneratorService.generateShipmentTrackingLink()
  ↓
Backend: urlShortenerService.createShortUrl()
  ↓
Database: ShortUrls table (6-char code)
  ↓
Response: http://localhost:3001/s/ABC123
```

**GetLinkOrderByCode**:

```
User: "dammi ultimo ordine"
  ↓
LLM chiama: GetLinkOrderByCode({})
  ↓
Backend: llm.service.ts → executeFunctionCall()
  ↓
Backend: callingFunctionsService.getOrdersListLink({ orderCode })
  ↓
Backend: linkGeneratorService.generateOrdersLink(token, workspaceId, orderCode)
  ↓
Backend: urlShortenerService.createShortUrl()
  ↓
Database: ShortUrls table (6-char code)
  ↓
Response: http://localhost:3001/s/XYZ789
```

---

## 🧪 Test Validazione

### Test Case 1: Tracking Fisico

```bash
Input: "dov'è il mio ultimo ordine"
Expected Function: GetShipmentTrackingLink
Status: ✅ PASS
```

### Test Case 2: Dettagli Ordine

```bash
Input: "dammi ultimo ordine"
Expected Function: GetLinkOrderByCode
Status: ✅ PASS
```

### Test Case 3: Lista Completa

```bash
Input: "voglio vedere tutti i miei ordini"
Expected: [LINK_ORDERS_WITH_TOKEN] token
Status: ✅ PASS (da FAQ)
```

---

## 📝 Regole Chiave da Ricordare

1. **"DOV'È" / "DOVE"** → Tracking fisico (`GetShipmentTrackingLink`)
2. **"DAMMI" / "MOSTRAMI"** → Dettagli ordine (`GetLinkOrderByCode`)
3. **"TUTTI" / "LISTA"** → Lista completa (`[LINK_ORDERS_WITH_TOKEN]`)

4. **orderCode è OPTIONAL** in entrambe le funzioni
5. **Se non specificato** → usa automaticamente `{{lastordercode}}`

6. **Le calling functions hanno PRIORITÀ** sulle FAQ per ordini specifici
7. **Le FAQ gestiscono** solo la lista completa di tutti gli ordini

---

## 🔧 Consistency Check

✅ `llm.service.ts` - Descriptions aggiornate con "⚠️ USA QUESTA FUNZIONE"
✅ `prompt_agent.md` - Trigger chiari e separati
✅ `calling-functions.service.ts` - orderCode opzionale
✅ `link-generator.service.ts` - Gestisce entrambi i casi
✅ FAQ - Priorità corretta con eccezioni documentate

---

## 📅 Data Implementazione

6 Ottobre 2025

## 👤 Note Finali

Questa soluzione risolve la confusione dell'LLM distinguendo chiaramente:

- **Posizione fisica** (tracking con corriere)
- **Dettagli ordine** (fattura, bolla, info ordine)
- **Lista ordini** (storico completo)

La chiave è stata:

1. Keywords differenti ("dov'è" vs "dammi")
2. Descriptions esplicite nelle function definitions
3. Priorità corretta tra FAQ e calling functions
