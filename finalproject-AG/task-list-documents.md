# 📋 TASK LIST DETTAGLIATA - FEATURE DOCUMENTI

## 🎯 **OBIETTIVO**
Implementare la gestione completa dei documenti PDF con upload, processing, embedding generation e ricerca semantica (RAG) integrata nel sistema di function calling esistente.

## 🔧 **SPECIFICHE TECNICHE CONFERMATE**
- **Embedding Storage**: PostgreSQL JSON (array di numeri)
- **Embedding Model**: text-embedding-ada-002 (OpenRouter)
- **File Storage**: `/backend/uploads/documents/` (locale)
- **Processing**: Sincrono (utente aspetta con loading)
- **Chunk Size**: 1000 caratteri con 100 overlap
- **RAG Integration**: Tramite function calling esistente

---

## 📋 **TASKS DETTAGLIATE**

### **🗄️ FASE 1: DATABASE & SCHEMA**

#### **Task 1.1: Aggiornare Prisma Schema** ⚙️ **[BACKEND]**
**Descrizione**: Aggiungere modelli per Documents e DocumentChunks
**Riceve**: N/A
**Ritorna**: Schema aggiornato con nuovi modelli
**Acceptance Criteria**:
- ✅ Modello `Documents` con campi: id, filename, originalName, filePath, fileSize, mimeType, status, workspaceId, createdAt, updatedAt
- ✅ Modello `DocumentChunks` con campi: id, documentId, content, chunkIndex, embedding (Json), createdAt
- ✅ Relazioni corrette tra Workspace → Documents → DocumentChunks
- ✅ Enum `DocumentStatus` (UPLOADED, PROCESSING, PROCESSED, ERROR)

#### **Task 1.2: Creare Migration Database** ⚙️ **[BACKEND]**
**Descrizione**: Generare e applicare migration per i nuovi modelli
**Riceve**: Schema Prisma aggiornato
**Ritorna**: Database con nuove tabelle
**Acceptance Criteria**:
- ✅ Migration generata correttamente con `npx prisma migrate dev`
- ✅ Tabelle `documents` e `document_chunks` create nel database
- ✅ Indici appropriati per performance (workspaceId, documentId)

### **🔧 FASE 2: BACKEND SERVICES & REPOSITORIES**

#### **Task 2.1: Document Entity & Repository Interface** ⚙️ **[BACKEND]**
**Descrizione**: Creare entità e interfaccia repository per documenti
**Riceve**: N/A
**Ritorna**: Strutture DDD per documenti
**Acceptance Criteria**:
- ✅ `Document.entity.ts` in `/domain/entities/`
- ✅ `IDocumentRepository` in `/domain/repositories/`
- ✅ Metodi: create, findById, findByWorkspace, updateStatus, delete
- ✅ `DocumentChunk.entity.ts` con metodi per embedding

#### **Task 2.2: Document Repository Implementation** ⚙️ **[BACKEND]**
**Descrizione**: Implementare repository con Prisma
**Riceve**: Interfaccia repository
**Ritorna**: Repository funzionante con database
**Acceptance Criteria**:
- ✅ `DocumentRepository` in `/infrastructure/repositories/`
- ✅ Tutti i metodi dell'interfaccia implementati
- ✅ Gestione errori e logging appropriato
- ✅ Query ottimizzate per performance

#### **Task 2.3: PDF Processing Service** ⚙️ **[BACKEND]**
**Descrizione**: Servizio per estrarre testo da PDF
**Riceve**: File PDF path
**Ritorna**: Array di chunks di testo
**Acceptance Criteria**:
- ✅ Installazione e configurazione `pdf-parse`
- ✅ Estrazione testo da PDF con gestione errori
- ✅ Divisione testo in chunks (max 1000 caratteri per chunk)
- ✅ Pulizia testo (rimozione caratteri speciali, normalizzazione)
- ✅ Gestione PDF corrotti o non leggibili

#### **Task 2.4: Embedding Service** ⚙️ **[BACKEND]**
**Descrizione**: Servizio per generare embeddings con OpenRouter
**Riceve**: Array di chunks di testo
**Ritorna**: Array di embeddings (vettori numerici)
**Acceptance Criteria**:
- ✅ Integrazione con OpenRouter API per embeddings
- ✅ Modello embedding configurabile (default: text-embedding-ada-002)
- ✅ Batch processing per ottimizzare chiamate API
- ✅ Retry logic per chiamate fallite
- ✅ Rate limiting per rispettare limiti API

#### **Task 2.5: Document Service (Business Logic)** ⚙️ **[BACKEND]**
**Descrizione**: Servizio principale per orchestrare upload e processing
**Riceve**: File upload, workspace ID
**Ritorna**: Document entity con status
**Acceptance Criteria**:
- ✅ Upload file in `/uploads/documents/{workspaceId}/`
- ✅ Validazione file (solo PDF, max 10MB)
- ✅ Salvataggio metadati in database
- ✅ Processing sincrono (PDF → chunks → embeddings)
- ✅ Aggiornamento status durante processing
- ✅ Gestione errori con rollback

#### **Task 2.6: RAG Search Service** ⚙️ **[BACKEND]**
**Descrizione**: Servizio per ricerca semantica nei documenti
**Riceve**: Query string, workspace ID
**Ritorna**: Array di chunks rilevanti con score
**Acceptance Criteria**:
- ✅ Generazione embedding per query di ricerca
- ✅ Calcolo similarity score (cosine similarity)
- ✅ Ordinamento risultati per rilevanza
- ✅ Filtro per workspace e documenti attivi
- ✅ Limite risultati configurabile (default: 5 chunks)

### **🌐 FASE 3: BACKEND API CONTROLLERS & ROUTES**

#### **Task 3.1: Document Controller** ⚙️ **[BACKEND]**
**Descrizione**: Controller per API documenti
**Riceve**: HTTP requests con file/parametri
**Ritorna**: JSON responses con documenti/status
**Acceptance Criteria**:
- ✅ `POST /api/workspaces/:id/documents` - Upload documento
- ✅ `GET /api/workspaces/:id/documents` - Lista documenti
- ✅ `GET /api/documents/:id` - Dettagli documento
- ✅ `POST /api/documents/:id/process` - Genera embeddings
- ✅ `DELETE /api/documents/:id` - Elimina documento
- ✅ `POST /api/documents/search` - Ricerca semantica

#### **Task 3.2: Document Routes & Validation** ⚙️ **[BACKEND]**
**Descrizione**: Route configuration e validazione input
**Riceve**: HTTP requests
**Ritorna**: Validated requests o errori
**Acceptance Criteria**:
- ✅ Route mounting in `/routes/index.ts`
- ✅ Multer configuration per file upload
- ✅ Joi validation schemas per tutti gli endpoint
- ✅ Authentication middleware su tutte le route
- ✅ File type e size validation

#### **Task 3.3: Swagger Documentation** ⚙️ **[BACKEND]**
**Descrizione**: Documentazione API per documenti
**Riceve**: N/A
**Ritorna**: Swagger spec aggiornato
**Acceptance Criteria**:
- ✅ Tutti gli endpoint documentati in `swagger.yaml`
- ✅ Esempi di request/response per ogni endpoint
- ✅ Schema definitions per Document e DocumentChunk
- ✅ File upload examples con multipart/form-data

### **🎨 FASE 4: FRONTEND COMPONENTS & PAGES**

#### **Task 4.1: Document Types & API Service** 🖥️ **[FRONTEND]**
**Descrizione**: Types TypeScript e servizio API per documenti
**Invia**: HTTP requests a backend API
**Riceve**: Document data, upload progress, errors
**Acceptance Criteria**:
- ✅ `Document.types.ts` con interfacce complete
- ✅ `documentsApi.ts` con tutti i metodi API
- ✅ Upload progress tracking con axios
- ✅ Error handling e retry logic
- ✅ TypeScript strict mode compliance

#### **Task 4.2: Documents Page Layout** 🖥️ **[FRONTEND]**
**Descrizione**: Pagina principale per gestione documenti
**Invia**: GET requests per lista documenti
**Riceve**: Array di documenti con status
**Acceptance Criteria**:
- ✅ Layout responsive con header e lista documenti
- ✅ Filtri per status (All, Processing, Processed, Error)
- ✅ Search bar per filtrare per nome
- ✅ Paginazione per grandi quantità di documenti
- ✅ Loading states e empty states

#### **Task 4.3: Document Upload Component** 🖥️ **[FRONTEND]**
**Descrizione**: Componente per upload PDF
**Invia**: POST multipart/form-data con file PDF
**Riceve**: Document created response o errori
**Acceptance Criteria**:
- ✅ Drag & drop area per file PDF
- ✅ File validation (tipo, dimensione) lato client
- ✅ Progress bar durante upload
- ✅ Preview nome file e dimensione
- ✅ Error messages user-friendly

#### **Task 4.4: Document List Component** 🖥️ **[FRONTEND]**
**Descrizione**: Lista documenti con azioni
**Invia**: GET requests per aggiornare lista
**Riceve**: Array documenti aggiornato
**Acceptance Criteria**:
- ✅ Tabella con colonne: Nome, Dimensione, Status, Data, Azioni
- ✅ Status badges colorati (Processing=yellow, Processed=green, Error=red)
- ✅ Azioni: View, Generate Embeddings, Delete
- ✅ Conferma dialog per eliminazione
- ✅ Auto-refresh ogni 30s per documenti in processing

#### **Task 4.5: Generate Embeddings Button** 🖥️ **[FRONTEND]**
**Descrizione**: Bottone per processare documenti
**Invia**: POST request a `/documents/:id/process`
**Riceve**: Processing started confirmation
**Acceptance Criteria**:
- ✅ Bottone visibile solo per documenti UPLOADED
- ✅ Loading spinner durante processing
- ✅ Disabilitato durante processing
- ✅ Success/error notifications
- ✅ Auto-refresh status dopo click

#### **Task 4.6: Navigation Menu Update** 🖥️ **[FRONTEND]**
**Descrizione**: Aggiungere Documents al menu principale
**Invia**: N/A
**Riceve**: N/A
**Acceptance Criteria**:
- ✅ Voce "Documents" aggiunta sopra "Orders" nel menu
- ✅ Icona appropriata (DocumentIcon)
- ✅ Active state quando su pagina documenti
- ✅ Responsive design mantenuto

### **🔧 FASE 5: INTEGRATION & RAG ENHANCEMENT**

#### **Task 5.1: Function Calling Integration** ⚙️ **[BACKEND]**
**Descrizione**: Aggiungere function per ricerca documenti
**Riceve**: User query da LangChain
**Ritorna**: Relevant document chunks
**Acceptance Criteria**:
- ✅ Aggiornare `function-router.md` con nuova function `search_documents`
- ✅ Implementare handler per `search_documents` nel message service
- ✅ Integrazione con RAG search service
- ✅ Formattazione risultati per AI context
- ✅ Gestione casi senza risultati rilevanti

#### **Task 5.2: Message Service Enhancement** ⚙️ **[BACKEND]**
**Descrizione**: Integrare RAG nei messaggi AI
**Riceve**: User message, workspace context
**Ritorna**: Enhanced AI response con document context
**Acceptance Criteria**:
- ✅ Ricerca automatica nei documenti per query rilevanti
- ✅ Injection di context nei prompt AI
- ✅ Citazioni sorgenti nei response (es: "Secondo il documento X...")
- ✅ Fallback graceful se RAG non disponibile

### **🌱 FASE 6: SEED DATA & DOCUMENTATION**

#### **Task 6.1: Seed Data per Documenti** ⚙️ **[BACKEND]**
**Descrizione**: Aggiungere documenti di esempio nel seed
**Riceve**: N/A
**Ritorna**: Database con documenti di test
**Acceptance Criteria**:
- ✅ PDF di esempio in `/prisma/temp/` (mantenere existing PDF)
- ✅ Seed script aggiornato per creare documenti di test
- ✅ Chunks e embeddings di esempio (se possibile)
- ✅ Documenti per tutti i workspace di test

#### **Task 6.2: Aggiornare Function Router Prompt** ⚙️ **[BACKEND]**
**Descrizione**: Aggiungere search_documents al function router
**Riceve**: N/A
**Ritorna**: Function router aggiornato
**Acceptance Criteria**:
- ✅ Aggiornare `/prisma/prompts/function-router.md`
- ✅ Aggiungere function `search_documents` con parametri
- ✅ Esempi di utilizzo per ricerca documenti
- ✅ Mantenere compatibilità con function esistenti

#### **Task 6.3: Creare Agent Prompt Documentation** 📝 **[DOCUMENTATION]**
**Descrizione**: Creare prompt_agent.md nella cartella finalproject-AG
**Riceve**: N/A
**Ritorna**: File prompt_agent.md creato
**Acceptance Criteria**:
- ✅ File `finalproject-AG/prompt_agent.md` creato
- ✅ Include tutte le function esistenti + `search_documents`
- ✅ Esempi di utilizzo per ricerca documenti
- ✅ Sincronizzato con i prompt del backend

#### **Task 6.4: Aggiornare PRD Documentation** 📝 **[DOCUMENTATION]**
**Descrizione**: Documentare feature documenti nel PRD
**Riceve**: N/A
**Ritorna**: PRD aggiornato
**Acceptance Criteria**:
- ✅ Sezione "Document Management" nel PRD
- ✅ User stories per upload e ricerca documenti
- ✅ API endpoints documentati
- ✅ RAG workflow spiegato

#### **Task 6.5: README Update** 📝 **[DOCUMENTATION]**
**Descrizione**: Aggiornare README con feature documenti
**Riceve**: N/A
**Ritorna**: README aggiornato
**Acceptance Criteria**:
- ✅ Sezione "Document Management" nel README
- ✅ Istruzioni setup per PDF processing
- ✅ Environment variables per embeddings
- ✅ Esempi di utilizzo API

### **🧪 FASE 7: TESTING**

#### **Task 7.1: Backend Unit Tests** ⚙️ **[BACKEND]**
**Descrizione**: Test per services e repositories
**Riceve**: N/A
**Ritorna**: Test suite completa
**Acceptance Criteria**:
- ✅ Test per DocumentService (upload, processing, search)
- ✅ Test per PDFProcessingService
- ✅ Test per EmbeddingService
- ✅ Test per DocumentRepository
- ✅ Coverage > 80% per nuovi file

#### **Task 7.2: Backend Integration Tests** ⚙️ **[BACKEND]**
**Descrizione**: Test per API endpoints
**Riceve**: N/A
**Ritorna**: Integration test suite
**Acceptance Criteria**:
- ✅ Test per tutti gli endpoint documenti
- ✅ Test upload file con mock PDF
- ✅ Test processing workflow completo
- ✅ Test ricerca semantica
- ✅ Test error scenarios

#### **Task 7.3: Frontend Unit Tests** 🖥️ **[FRONTEND]**
**Descrizione**: Test per componenti React
**Riceve**: N/A
**Ritorna**: Frontend test suite
**Acceptance Criteria**:
- ✅ Test per DocumentUpload component
- ✅ Test per DocumentList component
- ✅ Test per documentsApi service
- ✅ Test user interactions (upload, delete, process)

---

## 📊 **SUMMARY TASK COUNT**

- **Backend Tasks**: 15
- **Frontend Tasks**: 6  
- **Documentation Tasks**: 3
- **Testing Tasks**: 3
- **TOTALE**: **27 Tasks**

## ⏱️ **STIMA TEMPI**
- **Fase 1-2 (Database + Services)**: 2-3 giorni
- **Fase 3 (API)**: 1 giorno
- **Fase 4 (Frontend)**: 2 giorni  
- **Fase 5-6 (Integration + Docs)**: 1 giorno
- **Fase 7 (Testing)**: 1 giorno
- **TOTALE**: **7-8 giorni**

## 🎯 **PRIORITÀ ESECUZIONE**
1. **FASE 1**: Database Schema (Foundation)
2. **FASE 2**: Backend Services (Core Logic)
3. **FASE 3**: API Endpoints (Interface)
4. **FASE 5**: Function Calling (Integration)
5. **FASE 4**: Frontend (User Interface)
6. **FASE 6**: Documentation (Knowledge)
7. **FASE 7**: Testing (Quality Assurance) 