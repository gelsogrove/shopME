# 📱 WhatsApp Chatbot Flow - Documentazione Completa

## 🎯 Panoramica del Sistema

Il sistema di chatbot WhatsApp implementa un flusso conversazionale intelligente che gestisce utenti nuovi e registrati, con controlli di sicurezza, blacklist, e integrazione RAG (Retrieval-Augmented Generation) per risposte contestuali basate su documenti caricati.

## 🔄 Flow Diagram

```mermaid
flowchart TD
    Start([📱 Messaggio WhatsApp in arrivo]) --> SpamCheck{🚨 Controllo Spam<br/>10 msg in 30s?}
    
    SpamCheck -->|Sì| AutoBlock[🚫 Auto-blacklist<br/>Aggiungi a blocklist]
    SpamCheck -->|No| BlacklistCheck{🚫 Utente in Blacklist?}
    
    BlacklistCheck -->|Sì| Block[❌ Blocca dialogo - Nessuna risposta]
    BlacklistCheck -->|No| WipCheck{🚧 Canale in WIP?}
    
    WipCheck -->|Sì| WipMsg[⚠️ Invia messaggio WIP<br/>in lingua appropriata]
    WipCheck -->|No| UserCheck{👤 Nuovo utente?}
    
    UserCheck -->|Sì| GreetingCheck{👋 È un saluto?<br/>Ciao/Hello/Hola/Olá}
    UserCheck -->|No| TimeCheck{⏰ Passate più di 2 ore<br/>dall'ultima chat?}
    
    GreetingCheck -->|No| NoResponse[🔇 Nessuna risposta<br/>per non-saluti]
    GreetingCheck -->|Sì| WelcomeMsg[🎉 Invia Welcome Message<br/>con link registrazione + token]
    
    TimeCheck -->|Sì| WelcomeBack[👋 Bentornato {NOME}]
    TimeCheck -->|No| ProcessMsg[🤖 Elabora messaggio]
    
    WelcomeMsg --> TokenGen[🔐 Genera token sicuro<br/>valido 1 ora]
    TokenGen --> RegLink[🔗 Crea link registrazione<br/>con token]
    RegLink --> SaveTemp[💾 Salva messaggio temporaneo]
    
    WelcomeBack --> ProcessMsg
    ProcessMsg --> FunctionRouter[🎯 Function Router<br/>Determina funzione target]
    
    FunctionRouter --> RAGSearch{📚 Necessaria ricerca<br/>documenti?}
    RAGSearch -->|Sì| DocumentSearch[🔍 Ricerca semantica<br/>nei documenti]
    RAGSearch -->|No| DirectFunction[⚙️ Esegui funzione diretta]
    
    DocumentSearch --> ContextEnrich[📝 Arricchisci contesto<br/>con risultati RAG]
    DirectFunction --> ContextEnrich
    
    ContextEnrich --> LLMProcess[🧠 Elaborazione LLM<br/>con contesto arricchito]
    LLMProcess --> ResponseFormat[📄 Formatta risposta finale]
    
    ResponseFormat --> SensitiveCheck{🔒 Contiene dati sensibili?}
    SensitiveCheck -->|Sì| SecureLink[🔐 Genera link sicuro<br/>per dati sensibili]
    SensitiveCheck -->|No| SendResponse[📤 Invia risposta WhatsApp]
    
    SecureLink --> SendResponse
    SendResponse --> SaveHistory[💾 Salva nella cronologia chat]
    SaveHistory --> End([✅ Fine processo])
    
    AutoBlock --> End
    Block --> End
    WipMsg --> End
    NoResponse --> End
    
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef process fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef security fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef rag fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    
    class Start,End startEnd
    class BlacklistCheck,WipCheck,UserCheck,GreetingCheck,TimeCheck,RAGSearch,SensitiveCheck decision
    class ProcessMsg,FunctionRouter,LLMProcess,ResponseFormat,SendResponse,SaveHistory process
    class TokenGen,RegLink,SecureLink security
    class DocumentSearch,ContextEnrich rag
```

## 🏗️ Architettura del Sistema

### 📊 Componenti Principali

1. **WhatsApp Webhook Handler** (`whatsapp.controller.ts`)
   - Riceve messaggi da Meta API
   - Valida webhook con token di verifica
   - Gestisce sia GET (verifica) che POST (messaggi)

2. **Message Service** (`message.service.ts`)
   - Orchestratore principale del flusso
   - Gestisce logica di business per messaggi
   - Integra tutti i controlli di sicurezza

3. **Function Handler Service** (`function-handler.service.ts`)
   - Router intelligente per funzioni
   - Gestisce chiamate a funzioni specifiche
   - Integrazione RAG per ricerca documenti

4. **Token Service** (`token.service.ts`)
   - Gestione token di registrazione sicuri
   - Validazione e scadenza token
   - Prevenzione riutilizzo token

5. **Document Service** (`documentService.ts`)
   - Gestione upload e processing PDF
   - Generazione embeddings per RAG
   - Ricerca semantica nei documenti

## 🔐 Controlli di Sicurezza

### 1. Blacklist Management
```typescript
// Controllo in customer.isBlacklisted e workspace.blocklist
const isBlacklisted = await this.messageRepository.isCustomerBlacklisted(
  phoneNumber, 
  workspaceId
)
```

**Implementazione:**
- Campo `isBlacklisted` nel modello Customer
- Lista `blocklist` nel modello Workspace (numeri separati da newline)
- Controllo doppio: customer-level e workspace-level

### 2. Token di Registrazione
```typescript
// Generazione token sicuro con scadenza
const token = await this.tokenService.createRegistrationToken(
  phoneNumber, 
  workspaceId
)
```

**Caratteristiche:**
- Token crittograficamente sicuri (crypto.randomBytes)
- Scadenza 1 ora
- Uso singolo (marcati come usati dopo registrazione)
- Validazione phone + workspace

### 3. Stato WIP del Canale
```typescript
if (!workspaceSettings.isActive) {
  return wipMessages[userLang] || wipMessages["en"]
}
```

### 4. Auto-Blacklist per Spam Detection
```typescript
// Controllo spam: 10 messaggi in 30 secondi
const spamCheck = await this.checkSpamBehavior(phoneNumber, workspaceId)
if (spamCheck.isSpam) {
  await this.addToBlacklist(phoneNumber, workspaceId, 'AUTO_SPAM')
  return null // Blocca immediatamente
}
```

**Implementazione Spam Detection:**
- **Soglia**: 10 messaggi in 30 secondi
- **Azione**: Aggiunta automatica a blacklist workspace
- **Durata**: Illimitata (sblocco manuale da admin)
- **Logging**: Tracciamento per audit e review

## 🌍 Gestione Multilingua

### Rilevamento Lingua
```typescript
const greetingLang = this.detectGreeting(message)
// Supporta: it, en, es, pt
```

### Messaggi Configurabili
- **Welcome Messages**: Configurati per workspace in 4 lingue
- **WIP Messages**: Messaggi di manutenzione multilingua
- **Fallback**: Inglese come lingua predefinita

## 🤖 Integrazione RAG (Retrieval-Augmented Generation)

### 1. Document Processing Pipeline
```typescript
// Upload → Extract Text → Chunk → Generate Embeddings
await documentService.processDocument(documentId)
```

**Fasi:**
1. **Upload**: PDF salvato in `/uploads/documents/`
2. **Text Extraction**: Estrazione testo con pdf-parse
3. **Chunking**: Divisione in chunk da 1000 caratteri (overlap 100)
4. **Embeddings**: Generazione con text-embedding-ada-002 (OpenRouter)
5. **Storage**: Salvataggio embeddings in PostgreSQL (JSONB)

### 2. Semantic Search
```typescript
const searchResults = await documentService.searchDocuments(
  query, 
  workspaceId, 
  limit
)
```

**Algoritmo:**
- Generazione embedding per query utente
- Calcolo cosine similarity con chunk esistenti
- Ordinamento per rilevanza
- Ritorno top-K risultati

### 3. Context Enrichment
```typescript
// Arricchimento contesto per LLM
const enrichedContext = {
  userMessage: message,
  documentContext: searchResults,
  chatHistory: previousMessages
}
```

## 📝 Function Calling System

### Router Intelligente
Il sistema utilizza un LLM per determinare quale funzione chiamare:

```markdown
# Funzioni Disponibili:
1. get_product_info(product_name)
2. get_service_info(service_name) 
3. welcome_user()
4. create_order()
5. get_cart_info()
6. add_to_cart(product_name, quantity)
7. search_documents(query) # RAG Integration
```

### Workflow a Due Fasi
1. **Primo LLM**: Determina funzione target
2. **Secondo LLM**: Formatta risposta finale con contesto

## 🔄 Gestione Stati Utente

### Nuovo Utente
```typescript
if (!customer) {
  if (!greetingLang) {
    return null // Non rispondere a non-saluti
  }
  // Invia welcome message con link registrazione
}
```

### Utente Registrato
```typescript
if (customer) {
  // Controlla ultima attività
  if (lastActivity > 2hours) {
    sendWelcomeBack(customer.name)
  }
  // Processa messaggio normalmente
}
```

## 📊 Database Schema

### Tabelle Principali
```sql
-- Customers
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  phone TEXT,
  name TEXT,
  isBlacklisted BOOLEAN DEFAULT false,
  workspaceId TEXT,
  language TEXT,
  -- ... altri campi
);

-- Registration Tokens
CREATE TABLE registration_tokens (
  token TEXT PRIMARY KEY,
  phoneNumber TEXT,
  workspaceId TEXT,
  expiresAt TIMESTAMP,
  usedAt TIMESTAMP
);

-- Documents & Chunks per RAG
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  filename TEXT,
  status DocumentStatus,
  workspaceId TEXT
);

CREATE TABLE document_chunks (
  id TEXT PRIMARY KEY,
  documentId TEXT,
  content TEXT,
  embedding JSONB -- Array di numeri per similarity search
);
```

## ⚙️ Configurazione Ambiente

### Variabili Richieste
```env
# WhatsApp
WHATSAPP_VERIFY_TOKEN=your-verify-token
WHATSAPP_ACCESS_TOKEN=your-access-token

# OpenRouter per embeddings
OPENROUTER_API_KEY=your-openrouter-key

# Database
DATABASE_URL=postgresql://...

# Frontend per link registrazione
FRONTEND_URL=https://your-domain.com
```

## 🚀 Deployment e Monitoring

### Webhook Configuration
```typescript
// Endpoint pubblico per Meta API
POST /api/whatsapp/webhook
GET /api/whatsapp/webhook (verifica)
```

### Logging e Debug
- Tutti i messaggi loggati con winston
- Tracking performance per RAG search
- Monitoring token usage e rate limits

## ✅ Specifiche Confermate

### 1. Gestione Blacklist
- **✅ Popolamento**: Campo `blocklist` in Settings del workspace (manuale) + auto-blacklist per spam
- **✅ Auto-blacklist**: 10 messaggi in 30 secondi → blocco automatico
- **✅ Timeout**: Illimitato fino a sblocco manuale da amministrazione

### 2. Registrazione Utenti
- **✅ Dati minimi**: Form di registrazione esistente (nome, cognome, azienda, telefono)
- **✅ Verifica email**: Non implementata (solo telefono)
- **✅ GDPR**: Checkbox con testo da `http://localhost:3000/gdpr`

### 3. RAG e Knowledge Base
- **✅ Formati supportati**: Solo PDF
- **✅ Dimensione massima**: 5 MB
- **✅ Aggiornamento embeddings**: Manuale tramite bottone "Generate Embeddings" in admin
- **✅ Cache query**: Non implementata

### 4. Performance e Scalabilità
- **✅ Rate limiting**: 100 chiamate ogni 10 minuti (protezione anti-attacco)
- **✅ Queue system**: Non necessario
- **✅ CDN**: Non implementato
- **✅ Database sharding**: Non necessario

### 5. Sicurezza
- **✅ Crittografia E2E**: Non prioritaria (gestione tramite link esterni)
- **✅ Audit log**: Non implementato
- **✅ 2FA**: Pianificato per future release (non priorità)

### 6. Business Logic
- **✅ Pagamenti**: Pianificato per future release
- **✅ Ordini multi-step**: Non prioritario
- **✅ Notifiche proattive**: Non prioritarie
- **✅ Analytics**: Storico chat esistente sufficiente

### 7. UX e Conversational Design
- **✅ Media support**: Non implementato
- **✅ Quick replies**: Non implementati
- **✅ Handoff operatori**: ✅ **IMPLEMENTATO** - Toggle in chat per controllo operatore
- **✅ Sentiment analysis**: Non prioritario

## 🔧 Prossimi Sviluppi

### 🚀 Priorità Immediata (Da Implementare)
1. **Auto-Blacklist Spam Detection**: 10 messaggi in 30 secondi → blocco automatico
2. **Rate Limiting API**: 100 chiamate ogni 10 minuti per protezione anti-attacco
3. **GDPR Integration**: Link dinamico a `/gdpr` nella form di registrazione

### 🎯 Priorità Alta (Future Release)
1. **Payment Integration**: Checkout completo via WhatsApp
2. **2FA Security**: Autenticazione a due fattori per operazioni critiche
3. **Enhanced Document Management**: Miglioramenti gestione PDF (5MB limit)

### 📈 Priorità Media (Roadmap Estesa)
1. **Multi-channel**: Estensione a Telegram, Facebook Messenger
2. **Voice Support**: Gestione messaggi vocali
3. **AI Training**: Fine-tuning modelli su conversazioni specifiche
4. **Media Support**: Immagini e audio in chat

### 🔮 Priorità Bassa (Visione Futura)
1. **Chatbot Builder**: Interface drag-and-drop per flow
2. **A/B Testing**: Testing automatico varianti messaggi
3. **Integration Hub**: Connettori per CRM/ERP esterni
4. **Mobile App**: App dedicata per gestione chatbot

---

**Documento creato da:** AI Assistant  
**Data:** $(date)  
**Versione:** 1.0  
**Status:** Draft per Review 