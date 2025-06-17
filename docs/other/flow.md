CONFIGURAZIONZDE DELLA CHATNPT

PROMPT 
TEMPERATURA
TOKEN
MODELLO ARRIVANO DALLA TABELLA AGENT CONFIGURATION e' dimanimoc !



API LIMIT e  Spam Detection HAS BEEN REACHED?
arriva un messaggio 

🚨 SPAM DETECTION: 10+ messaggi in 30 secondi? → AUTO-BLACKLIST + STOP DIALOGO

IL canale non e' attivo stop dialogo
l'utente ha activeChatbot flag a false? , se non è true stop dialogo, l'operatore puo' scrivere all'utente viene salvato nell'history ma non l'AI non risponde fino che l'operatore non rilascia il controllo all'AI

E' un utente in blacklist? non rispondere blocca il dialogo

IL CANALE E' IN WIP? messaggio di wip in inglese e blocca il dialogo

 e'  un nuovo utente?
    SI : 
        E' un utente in blacklist?
            SI: NO ANSWER
            NO : Ha scritto Hola? Ciao? Hello/Hi,
                 -Rispondi CON IL WELCOME MESSSAGE IN LINEA (E' DENTRO SETTINGS)
                  Ciao per assicurarti un buon servizio e assicurarti la privacy ti chiedo di inserire qui i tuoi dati : LINK DI REGISTRAZIONE CON TOKEN
                    - una volta messaggio inviato webhook al whatsapp con scritto Ciao {NOME UTENTE} registrazione andata a buon fine come ti posso aiutare oggi ?

                    - chat libera tra Utente e RAG → LLM FORMATTER per risposta discorsiva

    NO :  
        E' REGISTRATO? 
            NO: CONTINUA A MANDARE IL WELCOME MESSAGE CON LINK DI REGISTRAZIONE (non passa al RAG finché non si registra)
            SI: 
                IL CANALE E' ATTIVO? (activeChatbot flag) se non è attivo, passa il controllo all'operatore manuale
                IL CANALE E' IN WIP? messaggio di wip in lingua del cliente 
                - e' passato piu' di 2 ore dall'ulitma chat scrivigli Bentornata {NOME UTENTE}
                - Chat libera tra utente e RAG → LLM FORMATTER per risposta discorsiva
                - QUANDO L'UTENTE CHIEDE DI FINALIZZARE L'ORDINE: LINK CON TOKEN ALLA PAGINA DI CHECKOUT PER COMPLETARE L'ACQUISTO

## 📊 SCHEMA ASCII DEL FLOW

```
📱 MESSAGGIO WHATSAPP
         |
         v
    ┌─────────────────┐
    │ 🚨 SPAM CHECK   │ ──YES─> 🚫 AUTO-BLACKLIST + STOP
    │ 10+ msg/30sec?  │         (customer + workspace)
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ CANALE ATTIVO?  │ ──NO──> ❌ STOP DIALOGO
    │ (isActive)      │
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ CHATBOT ATTIVO? │ ──NO──> 👨‍💼 CONTROLLO OPERATORE
    │ (activeChatbot) │         (salva msg, no AI response)
    └─────────────────┘
         |YES
         v
    ┌─────────────────┐
    │ USER BLACKLIST? │ ──YES─> ❌ BLOCCA CONVERSAZIONE
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ CANALE IN WIP?  │ ──YES─> ⚠️ MESSAGGIO WIP
    └─────────────────┘
         |NO
         v
    ┌─────────────────┐
    │ NUOVO UTENTE?   │
    └─────────────────┘
         |              |
       YES|              |NO
         v              v
    ┌─────────────┐  ┌─────────────────┐
    │ SALUTO?     │  │ E' REGISTRATO?  │
    │ Ciao/Hello  │  └─────────────────┘
    └─────────────┘         |        |
         |YES              NO|        |YES
         v                   v        v
    ┌─────────────┐  ┌─────────────┐ ┌─────────────────┐
    │ 🎉 WELCOME  │  │ 🎉 WELCOME  │ │ >2 ORE ULTIMA   │ ──YES─> 👋 BENTORNATO {NOME}
    │ + REG LINK  │  │ + REG LINK  │ │ CONVERSAZIONE?  │
    └─────────────┘  └─────────────┘ └─────────────────┘
         |                 |              |NO
         v                 v              v
    ┌─────────────┐  ┌─────────────┐ ┌─────────────────┐
    │ 🔗 TOKEN +  │  │ ⏳ ATTENDI  │ │ 🤖 RAG SEARCH + │
    │ REGISTRA    │  │ REGISTRA    │ │ 🎨 LLM FORMATTER│
    └─────────────┘  └─────────────┘ └─────────────────┘
         |                              |
         v                              v
    ┌─────────────┐                ┌─────────────────┐
    │ 🤖 RAG +    │                │ 💬 RISPOSTA     │
    │ 🎨 FORMATTER│                │ DISCORSIVA      │
    └─────────────┘                └─────────────────┘
         |
         v
    ┌─────────────┐   
    │ 💬 RISPOSTA │   
    │ DISCORSIVA  │  
    └─────────────┘   
```

## 🔑 LEGENDA
- 🚨 = SPAM DETECTION
- 🚫 = AUTO-BLACKLIST
- ❌ = STOP/BLOCCO
- 👨‍💼 = CONTROLLO OPERATORE
- ⚠️ = MESSAGGIO AUTOMATICO
- 🎉 = MESSAGGIO BENVENUTO
- 🤖 = ELABORAZIONE RAG
- 🎨 = LLM FORMATTER (per risposta discorsiva)
- ⏳ = ATTENDI REGISTRAZIONE (continua welcome message)
- 🔗 = LINK CON TOKEN
- 🛒 = FINALIZZAZIONE ORDINE/CHECKOUT
- 💬 = CONVERSAZIONE FORMATTATA

## 🔄 PROCESSO RAG UNIFICATO (NUOVO!)

```
📝 DOMANDA UTENTE ("avete mozzarella? quanto costa la spedizione?")
         |
         v
    ┌─────────────────┐
    │ 🔍 UNIFIED RAG  │ ──> Cerca CONTEMPORANEAMENTE in:
    │ SEARCH ENGINE   │     • product_chunks + products table
    │ (All Sources)   │     • faq_chunks + faq table  
    │                 │     • service_chunks + services table
    │                 │     • document_chunks + documents table
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 📊 AGGREGATED   │ ──> Tutte le informazioni rilevanti:
    │ RESULTS         │     • Mozzarelle disponibili (prodotti)
    │ (Multi-Source)  │     • Costi spedizione (servizi/FAQ)
    │                 │     • Politiche (documenti)
    │                 │     • Info aggiuntive (FAQ)
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 🎨 FINAL LLM    │ ──> Raggruppa, formatta, personalizza
    │ FORMATTER       │     usando:
    │ (Agent Config + │     • Storico conversazione
    │  Chat History)  │     • Lingua cliente
    │                 │     • Stile agente configurato
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 💬 RISPOSTA     │ ──> "Abbiamo 2 mozzarelle: 
    │ COMPLETA        │     Mozzarella di Bufala DOP €8.50,
    │ (Unified)       │     Mozzarella di Bufala €6.90.
    │                 │     Spedizione €4.99, gratis sopra €50.
    │                 │     Tempo consegna 24-48h."
    └─────────────────┘
```

### 🎯 VANTAGGI ARCHITETTURA UNIFICATA:
- ✅ **UNA SOLA CHIAMATA** → tutte le fonti
- ✅ **RISPOSTA COMPLETA** → prodotti + servizi + FAQ + documenti
- ✅ **CONTESTO RICCO** → informazioni correlate
- ✅ **LLM FINALE INTELLIGENTE** → raggruppa e personalizza
- ✅ **PERFORMANCE MIGLIORE** → meno chiamate LLM

### 🔧 FONTI DATI UNIFICATE:
```
PRODOTTI:
├── product_chunks (embedding semantico)
├── products table (prezzo, stock, disponibilità)
└── categories (classificazione)

FAQ:
├── faq_chunks (embedding semantico)
└── faqs table (domande/risposte complete)

SERVIZI:
├── service_chunks (embedding semantico)  
└── services table (dettagli servizi)

DOCUMENTI:
├── document_chunks (embedding semantico)
└── documents table (metadata, file originali)
```

---

## 💬 ESEMPI DIALOGO UNIFICATO

### 📱 SCENARIO: QUERY COMPLESSA

**👤 Cliente**: "avete mozzarella di bufala? quanto costa la spedizione?"

**🤖 Sistema Unificato**: 
- 🔍 Cerca in product_chunks: "mozzarella di bufala"
- 🔍 Cerca in service_chunks: "spedizione", "costi", "shipping"  
- 🔍 Cerca in faq_chunks: "spedizione", "consegna", "costi"
- 🔍 Cerca in document_chunks: policy spedizione
- 📊 Aggrega TUTTI i risultati
- 🎨 LLM formatta risposta unificata

**🤖 ShopMe**: "Ciao! Sì, abbiamo due mozzarelle di bufala:

🧀 **Mozzarella di Bufala Campana DOP** - €8.50
   Autentica campana, certificazione DOP
   Stock: 25 unità disponibili

🧀 **Mozzarella di Bufala** - €6.90  
   Tradizionale, ottima qualità
   Stock: 15 unità disponibili

📦 **Spedizione:**
- Costo: €4.99 
- GRATIS per ordini sopra €50
- Tempi: 24-48 ore lavorative
- Corriere espresso disponibile

Vuoi aggiungere una mozzarella al carrello?"

### 📱 PRIMA vs DOPO:

**PRIMA (limitato):**
👤: "avete mozzarella? quanto costa spedizione?"
🤖: *Sceglie solo prodotti O solo servizi* → Risposta incompleta

**DOPO (unificato):**
👤: "avete mozzarella? quanto costa spedizione?"  
🤖: *Cerca in TUTTO* → **Risposta completa con prodotti + spedizione** 🎯

---

## 🛍️ RICERCA SEMANTICA PRODOTTI (NUOVO!)

```
🔍 QUERY PRODOTTO ("avete la mozzarella?")
         |
         v
    ┌─────────────────┐
    │ 🧠 EMBEDDING    │ ──> Genera embedding della query
    │ GENERATION      │     usando OpenRouter API
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 🔍 SEMANTIC     │ ──> Cerca in product_chunks con
    │ SEARCH          │     cosine similarity
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 📊 AVAILABILITY │ ──> Filtra solo prodotti con
    │ CHECK           │     stock > 0 (disponibili)
    └─────────────────┘
         |
         v
    ┌─────────────────┐
    │ 🎯 RISULTATI    │ ──> Solo prodotti pertinenti
    │ PRECISI         │     e disponibili
    └─────────────────┘
```

### 🎯 VANTAGGI RICERCA SEMANTICA:
- ✅ "mozzarella" → SOLO formaggi (non vini!)
- ✅ "queso" (spagnolo) → trova formaggi  
- ✅ "cheese" (inglese) → trova formaggi
- ✅ "formaggio fresco" → trova mozzarelle
- ✅ Controllo stock automatico
- ✅ Multilingua (IT/EN/ES/FR)

### 🗃️ STRUTTURA DATI REALE (dal Prisma Schema):
```prisma
// Tabella product_chunks ESISTENTE
model ProductChunks {
  id          String   @id @default(uuid())
  productId   String
  content     String
  chunkIndex  Int
  embedding   Json?
  workspaceId String
  language    String   @default("en")
  createdAt   DateTime @default(now())
  product     Products @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("product_chunks")
}
```

### 🔧 CONTENUTO ARRICCHITO PER EMBEDDING:
```
Product: Mozzarella di Bufala Campana DOP
Description: Formaggio fresco di bufala autentico campano
Category: Cheese
Price: €8.50
Stock: 25 units

Keywords and Synonyms:
cheese, formaggio, queso, fromage, fresh cheese, dairy, latticini, buffalo, bufala

Multilingual Terms:
prodotto italiano, made in italy, autentico, producto italiano, italian product
```

### 🚀 API ENDPOINTS AGGIUNTI:
- `POST /api/workspaces/{workspaceId}/products/generate-embeddings`
- Ricerca semantica integrata in LangChain service
