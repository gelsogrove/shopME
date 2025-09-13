# Task Manager - ShopMe Project

## 🚨 TASK CRITICI - PRIORITÀ MASSIMA

### TASK CRITICO: Sistema non prende la lingua dell'utente
- **Descrizione**: Il sistema non sta rilevando o utilizzando correttamente la lingua dell'utente per le risposte del chatbot. Questo causa risposte nella lingua sbagliata.
- **Priorità**: MASSIMA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Sistema multilingue funzionante (IT/EN/ES/PT). Prompt aggiornato con template multilingue, rilevamento lingua migliorato, messaggi di benvenuto multilingue implementati.

## 📋 TASK PENDING

### 📝 REGOLA TASK MANAGEMENT
- **REGOLA CRITICA**: Quando Andrea dice "aggiungi task" o "aggiugni task", il task deve SEMPRE essere aggiunto nel memory bank (docs/memory-bank/tasks.md)
- **FORMATO**: Seguire il formato standard con descrizione, priorità, stato e note
- **PRIORITÀ**: ALTA per problemi critici, MEDIA per miglioramenti, BASSA per feature opzionali
- **STATO**: PENDING per nuovi task, IN PROGRESS per task in corso, COMPLETATO per task finiti

### TASK: Controllare ordine della chatHistory
- **Descrizione**: Verificare e correggere l'ordine di visualizzazione dei messaggi nella cronologia chat
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Ordine di visualizzazione dei messaggi nella cronologia chat corretto e funzionante.

### TASK: Indirizzo di Spedizione mancante nello step 3 dell'ordine
- **Descrizione**: Aggiungere il campo indirizzo di spedizione nello step 3 del processo di checkout/ordine. L'indirizzo di spedizione deve essere visibile e modificabile durante la creazione dell'ordine.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Campo indirizzo di spedizione aggiunto nello step 3 del checkout. L'indirizzo è ora visibile e modificabile durante la creazione dell'ordine come richiesto.

### TASK: Layout diversi tra chatHistory e popup chat
- **Descrizione**: Si vedono due layout diversi tra la pagina chatHistory e il popup chat. Non si sa se dipende da una chiamata diversa al backend. Investigare le differenze di layout e le chiamate API per identificare la causa.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Sostituito ReactMarkdown con MessageRenderer in ChatPage.tsx per garantire consistenza nel rendering dei messaggi tra popup chat e history chat.

### TASK: Totali in BOLD dentro la conversazione
- **Descrizione**: I totali devono essere visualizzati in grassetto (BOLD) all'interno delle conversazioni del chatbot. Attualmente i totali non sono evidenziati correttamente.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - I totali sono ora visualizzati in grassetto (BOLD) all'interno delle conversazioni del chatbot come richiesto.

### TASK: LLM non saluta l'utente con il suo nome
- **Descrizione**: Il LLM non saluta l'utente utilizzando il suo nome personale. Dovrebbe riconoscere e utilizzare il nome dell'utente nei saluti e nelle interazioni.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Il LLM ora saluta l'utente utilizzando il suo nome personale nei saluti e nelle interazioni come richiesto.

### TASK: Assicurarsi che al salvataggio venga generata la generazione di nuovi embed
- **Descrizione**: Verificare e implementare la generazione automatica di nuovi embedding quando vengono salvati dati nel sistema. Questo è importante per mantenere aggiornato il sistema di ricerca semantica.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - La generazione automatica di nuovi embedding è ora implementata quando vengono salvati dati nel sistema. Il sistema di ricerca semantica rimane aggiornato.

### TASK: Verificare che le FAQ non attive non vengano prese in considerazione
- **Descrizione**: Verificare che nel sistema di ricerca semantica e nel chatbot, le FAQ con status "non attivo" (isActive = false) non vengano incluse nei risultati di ricerca o nelle risposte del sistema.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Analizzato sistema FAQ e corretti 3 punti dove le FAQ non attive venivano incluse: 1) faq.repository.ts findAll() - CORRETTO, 2) faq.repository.ts findById() - CORRETTO, 3) function-handler.service.ts getFaqInfo() - CORRETTO. Il sistema di ricerca semantica (embeddingService.searchFAQs) già filtrava correttamente per isActive: true. Test confermato: ora solo le FAQ attive vengono restituite in tutti i punti del sistema.

### TASK: Investigare determinazione workspaceID per nuovi utenti
- **Descrizione**: Quando un nuovo utente scrive, il sistema deve determinare a quale channel/workspace sta scrivendo per identificare il corretto workspaceID. Investigare se questa funzionalità è già implementata e come funziona, oppure se deve essere sviluppata.
- **Priorità**: ALTA
- **Stato**: COMPLETATO
- **Note**: 
  - **SITUAZIONE ATTUALE**: Sistema usa workspaceID fisso da variabile d'ambiente WHATSAPP_WORKSPACE_ID
  - **FRONTEND SIMULAZIONE**: Funziona perfettamente perché manda sempre workspaceID esplicito
  - **WHATSAPP REALE**: Non implementabile ora perché manca numero destinatario nel webhook
  - **SISTEMA MULTICANALE**: Architettura pronta per multi-tenant quando necessario
  - **PRODUCTION READY**: Sistema single-tenant funziona correttamente
  - **PRD AGGIORNATO**: Documentata strategia futura per routing dinamico


### TASK: Aggiungere nome società nella chat history
- **Descrizione**: Nella chat history attualmente viene mostrato solo il nome del cliente (es. "Mario Rossi"). Deve essere aggiunto anche il nome della società per una migliore identificazione. Formato richiesto: "Mario Rossi" sulla prima linea e "Rossi Limited S.r.l." sulla seconda linea (senza parentesi).
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Modificato il formato di visualizzazione del nome della società nella chat history. Ora mostra "Mario Rossi" sulla prima linea e "Rossi Limited S.r.l." sulla seconda linea senza parentesi. Layout migliorato per migliore allineamento: bandiera lingua + nome cliente + icone sulla prima linea, nome società indentato sulla seconda linea. Aggiornati sia la lista chat che l'header della chat per mantenere consistenza. Frontend compila senza errori.


### TASK: Checkout Success Page - Multilingue e Codice Ordine
- **Descrizione**: La pagina di checkout success (localhost:3000/checkout-success?orderCode=...) ha due problemi:
  1. Testi in inglese invece che nella lingua del cliente
  2. Codice ordine non visualizzato nella pagina (anche se presente nell'URL)
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Deve essere implementato: 1) Sistema multilingue per i testi della pagina, 2) Visualizzazione del codice ordine estratto dall'URL, 3) Testi localizzati per IT/EN/ES/PT

### TASK: Checkout - Aggiornamento Indirizzi Cliente nel Database
- **Descrizione**: ERRORE CRITICO: Durante il processo di checkout, se l'utente modifica gli indirizzi (sia di consegna che di fatturazione), i dati del cliente nel database NON vengono aggiornati. Questo è un problema importante perché i dati del cliente devono rimanere sincronizzati. Deve essere implementato: 1) Rilevamento delle modifiche agli indirizzi durante il checkout, 2) Aggiornamento automatico dei campi 'address' e 'invoiceAddress' del cliente nel database, 3) Sincronizzazione dei dati in tempo reale, 4) Validazione che gli indirizzi aggiornati siano salvati correttamente. Comportamento corretto: Utente modifica indirizzo → Sistema aggiorna automaticamente i dati del cliente nel database → Dati sincronizzati per future operazioni.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: CRITICO - I dati del cliente devono rimanere sempre sincronizzati con le modifiche effettuate durante il checkout

### TASK: Verificare Reset Database - npm run seed
- **Descrizione**: Verificare se il comando `npm run seed` fa un reset completo del database (pulisce tutte le tabelle) o solo aggiunge dati. È importante sapere se il seed cancella tutti i dati esistenti prima di inserire i nuovi dati. Deve essere verificato: 1) Analizzare il file seed.ts per capire se fa deleteMany() su tutte le tabelle, 2) Verificare se cancella tutti i dati esistenti, 3) Documentare il comportamento del seed, 4) Assicurarsi che sia chiaro se il seed è distruttivo o additivo. Comportamento atteso: Il seed dovrebbe fare un reset completo per garantire dati puliti e consistenti.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: CONFERMATO - Il seed fa un reset completo di tutte le tabelle (deleteMany su tutte le entità). È sicuro solo in sviluppo, NON in produzione.

### TASK: Link Carrello Non Funziona - Token Scaduto o Non Valido
- **Descrizione**: ERRORE: Il link del carrello generato dal chatbot non funziona. Il token nel link sembra essere molto lungo e complesso, diverso dai token standard di 64 caratteri generati dal SecureTokenService. Problema identificato: 1) Token nell'immagine: `fbeaac5d95762ece-ce998aec9e18844ab1361af9333f7d7d89de256666630259` (molto lungo), 2) Token nel database: UUID standard di 64 caratteri, 3) Token scaduto o non valido. Deve essere risolto: 1) Investigare perché il token generato è diverso da quello standard, 2) Verificare la validazione del token nel frontend, 3) Controllare se il token viene salvato correttamente nel database, 4) Testare la generazione e validazione del token. Comportamento corretto: Token generato → Salvato nel database → Link funzionante → Accesso al carrello.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: CRITICO - Il link del carrello deve funzionare per permettere agli utenti di accedere al loro carrello

### TASK: FAQ Disattiva - Ricalcolo Embedding Automatico
- **Descrizione**: VERIFICARE: Quando una FAQ viene disattivata (isActive = false), il sistema deve ricalcolare automaticamente gli embedding per rimuovere i chunk disattivi dalla ricerca semantica. Questo è importante per mantenere la coerenza tra lo stato delle FAQ e gli embedding utilizzati per la ricerca. Deve essere implementato: 1) Verificare se il ricalcolo automatico degli embedding avviene quando una FAQ viene disattivata, 2) Implementare trigger automatico per ricalcolo embedding su cambio stato FAQ, 3) Assicurarsi che i chunk delle FAQ disattive vengano rimossi, 4) Testare che la ricerca semantica non restituisca risultati da FAQ disattive. Comportamento corretto: FAQ disattivata → Ricalcolo automatico embedding → Rimozione chunk disattivi → Ricerca semantica aggiornata.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Importante per mantenere coerenza tra stato FAQ e embedding di ricerca

### TASK: Short-Link System - Implementare sistema di short-link
- **Descrizione**: IMPLEMENTARE: Sistema di short-link per ridurre la lunghezza degli URL e aggiungere un livello di sicurezza aggiuntivo. I link attuali sono troppo lunghi e poco user-friendly. Deve essere implementato: 1) Analizzare le opzioni disponibili (librerie gratuite, servizi esterni, implementazione custom), 2) Scegliere la soluzione migliore per il progetto, 3) Implementare il sistema di short-link, 4) Integrare con i token esistenti, 5) Aggiornare tutti i link generati (carrello, checkout, profilo, ordini), 6) Aggiungere gestione sicurezza e tracking, 7) Testare il sistema completo. Comportamento corretto: Link lunghi → Short-link brevi e sicuri → Migliore UX e sicurezza aggiuntiva.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Migliora UX e aggiunge livello di sicurezza per i link generati

### TASK: Sistema Blacklist - Logica di Blocco Utenti
- **Descrizione**: INVESTIGARE: Spesso gli utenti risultano bloccati senza motivo apparente. Deve essere analizzata la logica di blacklist applicata dal sistema. Problema identificato: 1) Utenti bloccati anche quando non dovrebbero esserlo, 2) Logica di rate limiting troppo aggressiva, 3) Criteri di blacklist non chiari, 4) Possibili bug nel sistema di controllo. Deve essere investigato: 1) Analizzare la logica di blacklist nel codice, 2) Verificare i criteri di rate limiting, 3) Controllare i trigger per il blocco utenti, 4) Testare il comportamento con utenti normali, 5) Documentare la logica attuale, 6) Proporre miglioramenti se necessario. Comportamento corretto: Utenti normali non devono essere bloccati ingiustamente, solo utenti che superano i limiti ragionevoli.
- **Priorità**: ALTA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Implementato sistema di spam detection (15 messaggi in 30 secondi) e migliorata logica di blacklist. Creato SpamDetectionService con controllo automatico e blocco intelligente. Sistema ora distingue tra spam reale e utenti normali.

### TASK: Chat History - Navigazione alla Chat dell'Utente Selezionato
- **Descrizione**: MIGLIORARE: Nella lista clienti c'è un'icona che porta alla chat history che funziona bene, ma la pagina deve atterrare direttamente sulla chat dell'utente selezionato. Attualmente la chat history mostra tutti i messaggi, ma dovrebbe filtrare automaticamente per il cliente specifico. Deve essere implementato: 1) Modificare il link dell'icona chat per passare il customerId come parametro, 2) Aggiornare la pagina chat history per ricevere e utilizzare il customerId, 3) Implementare filtro automatico per mostrare solo i messaggi del cliente selezionato, 4) Mantenere la funzionalità di visualizzazione di tutti i messaggi quando si accede senza parametri, 5) Testare la navigazione dalla lista clienti alla chat specifica. Comportamento corretto: Clic su icona chat cliente → Chat history filtrata per quel cliente specifico → Migliore UX per gestione conversazioni.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Migliora l'esperienza utente permettendo di accedere direttamente alla chat del cliente selezionato dalla lista clienti

### TASK: Sistema Coda Messaggi per Sicurezza e Affidabilità (FASE 2)
- **Descrizione**: IMPLEMENTARE: Sistema completo di coda messaggi per garantire sicurezza e affidabilità del sistema WhatsApp. Il sistema attuale processa i messaggi in modo sincrono senza gestione di errori o retry. Deve essere implementato: 1) MessageQueueService per gestione coda, 2) Database schema per persistenza coda (tabella message_queue), 3) Background worker per processamento asincrono, 4) Retry logic con exponential backoff, 5) Monitoring dashboard per visibilità stato coda, 6) Integrazione con sistema esistente, 7) Gestione priorità messaggi (normal/high/urgent), 8) Status tracking completo (pending/processing/completed/failed). Architettura: Messaggio WhatsApp → Message Queue → Security Gateway → N8N Webhook → Background Processing → Retry Logic. Benefici: Zero perdita messaggi, retry automatico, monitoring completo, scalabilità, doppio livello sicurezza.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: FASE 2 - Sistema di coda essenziale per produzione e scalabilità. Componenti: MessageQueueService, MessageQueueRepository, Background Worker, Monitoring Dashboard, Database Schema

### TASK: Investigare Blocco Utenti - Sistema Blacklist e Rate Limiting
- **Descrizione**: CRITICO: Gli utenti si bloccano frequentemente e il sistema MCP blocca sempre l'utente di prova. Deve essere investigata tutta la logica di blocco utenti nel sistema. Problema identificato: 1) Utenti bloccati senza motivo apparente, 2) MCP test client blocca sempre l'utente di prova, 3) Logica di blacklist troppo aggressiva, 4) Rate limiting non configurato correttamente, 5) Possibili bug nel sistema di controllo spam. Deve essere analizzato: 1) Trovare TUTTE le regole di blocco nel codice (blacklist, rate limiting, spam detection), 2) Verificare i trigger per il blocco utenti, 3) Controllare configurazione rate limiting, 4) Analizzare logica SpamDetectionService, 5) Testare comportamento con utenti normali, 6) Documentare tutte le possibilità di blocco, 7) Identificare perché MCP blocca sempre l'utente di prova, 8) Proporre soluzioni per ridurre blocchi ingiustificati. Comportamento corretto: Utenti normali non devono essere bloccati, solo utenti che superano limiti ragionevoli.
- **Priorità**: MASSIMA
- **Stato**: PENDING
- **Note**: CRITICO - Il sistema blocca troppo frequentemente gli utenti, incluso l'utente di prova del MCP. Deve essere risolto immediatamente per permettere il testing e l'uso normale del sistema.

### TASK: Implementare Embedding con Gemma
- **Descrizione**: Implementare il sistema di embedding utilizzando il modello Gemma per sostituire l'attuale sistema di embedding. Deve essere implementato: 1) Integrazione del modello Gemma per la generazione degli embedding, 2) Configurazione del modello per il sistema di embedding locale, 3) Aggiornamento dei servizi di embedding esistenti per utilizzare Gemma, 4) Test di performance e qualità degli embedding generati, 5) Migrazione degli embedding esistenti al nuovo sistema, 6) Documentazione della nuova implementazione. Comportamento corretto: Sistema di embedding più performante e accurato utilizzando Gemma.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: Migliora la qualità degli embedding e le performance del sistema di ricerca semantica

### TASK: Importare Categorie nel Sistema
- **Descrizione**: Implementare l'importazione delle categorie di prodotti nel sistema. Deve essere implementato: 1) Analisi del file categorie esistente (docs/category.md), 2) Creazione dello script di importazione categorie, 3) Mapping delle categorie dal formato attuale al database, 4) Validazione dei dati delle categorie, 5) Inserimento nel database delle categorie, 6) Test dell'importazione, 7) Aggiornamento del seed script se necessario. Comportamento corretto: Categorie importate correttamente nel database e disponibili per l'associazione con i prodotti.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Prerequisito per l'importazione dei prodotti con associazione alle categorie corrette

### TASK: Importare Prodotti con Categoria, Formato e Descrizione
- **Descrizione**: Implementare l'importazione dei prodotti nel sistema con associazione alle categorie corrette e aggiunta dei campi formato e descrizione. Deve essere implementato: 1) Analisi del file prodotti esistente (docs/product.md), 2) Aggiunta del campo "formato" al schema database prodotti (se non presente), 3) Creazione dello script di importazione prodotti, 4) Mapping dei prodotti alle categorie corrette, 5) Generazione automatica delle descrizioni prodotti (inventate in modo realistico), 6) Definizione del formato per ogni prodotto, 7) Validazione dei dati dei prodotti, 8) Inserimento nel database, 9) Test dell'importazione completa, 10) Aggiornamento del seed script. Comportamento corretto: Prodotti importati con categoria corretta, formato definito e descrizione generata, pronti per l'uso nel sistema.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Richiede l'aggiunta del campo formato al schema e la generazione creativa delle descrizioni prodotti

## ✅ TASK COMPLETATI

### TASK: Orders - Riorganizzare campo Notes
- **Descrizione**: Rimosso il campo Notes dalla lista degli ordini e dal Dialog di visualizzazione dettagli. Il campo Notes è ora visibile e editabile solo nel form di modifica ordine (OrderCrudSheet).
- **Stato**: COMPLETATO

### TASK: Lista orders - rimuovere icona dell'occhio
- **Descrizione**: Rimossa l'icona dell'occhio (View Details) dalla tabella degli ordini per semplificare l'interfaccia.
- **Stato**: COMPLETATO

### TASK: Pagina products - Aggiungere productCode alla lista
- **Descrizione**: Il productCode era già presente nella colonna "Code" del frontend, ma il backend restituiva ProductCode invece di code. Aggiunto mapping nel controller per convertire ProductCode in code quando si restituiscono i prodotti al frontend, e viceversa quando si ricevono dati dal frontend.
- **Stato**: COMPLETATO

### TASK: Configurazione dinamica LLM
- **Descrizione**: Sostituiti i valori hardcoded di temperatura e max_tokens con valori dinamici dall'agent configuration. RAG Processor e Formatter ora usano agentConfig.temperature e agentConfig.maxTokens (default 1500) invece di valori fissi.
- **Stato**: COMPLETATO

### TASK: Visualizzazione chat diversa tra popup vs history chat
- **Descrizione**: Sostituito ReactMarkdown con MessageRenderer in ChatPage.tsx per garantire consistenza nel rendering dei messaggi tra popup chat e history chat.
- **Stato**: COMPLETATO

### TASK: Unire Customer Name e Company Name nella lista ordini
- **Descrizione**: Unite le colonne "Customer Name" e "Company Name" in una singola colonna "Customer" con formato "Nome Cognome (Nome Azienda)", mantenendo la coerenza con la lista clienti. La colonna è cliccabile per navigare ai dettagli del cliente.
- **Stato**: COMPLETATO

### TASK: Rimuovere colonna Push dalla lista clienti
- **Descrizione**: Rimossa la colonna "Push" dalla tabella dei clienti per semplificare l'interfaccia. La colonna mostrava lo stato delle notifiche push (Enabled/Disabled) ma non era necessaria nella vista principale.
- **Stato**: COMPLETATO

### TASK: Impostare default "ultimo mese" nella tendina analytics
- **Descrizione**: Modificato il periodo di default nella pagina analytics da "3 mesi" a "ultimo mese". Cambiato DEFAULT_PERIOD da '3months' a 'lastmonth' nel hook useAnalyticsPeriod.ts per migliorare l'esperienza utente.
- **Stato**: COMPLETATO

### TASK: Rimuovere campo Notes dalla lista ordini
- **Descrizione**: Rimossa la colonna "Notes" dalla tabella degli ordini per semplificare l'interfaccia. Il campo Notes rimane visibile e modificabile solo nel form di modifica ordine (OrderCrudSheet), come richiesto.
- **Stato**: COMPLETATO

---

**Ultimo aggiornamento**: $(date)
**Task totali**: 29 (18 completati, 11 pending)
**Task critici**: 1
