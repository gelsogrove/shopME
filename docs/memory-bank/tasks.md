# Task Manager - ShopMe Project

## 🚨 CRITICAL RULE - PRD VERIFICATION MANDATORY

**🚨 REGOLA CRITICA**: Prima di qualsiasi operazione, devo SEMPRE:
1. **Leggere il PRD** (`docs/PRD.md`) per verificare i requisiti
2. **Verificare i task** in questo file per lo stato attuale
3. **Bloccare l'operazione** se qualcosa non è chiaro o in dubbio
4. **Chiedere chiarimenti** ad Andrea prima di procedere

**Scala della Verità**: PRD → Test → Codice

## 🚨 TASK CRITICI - PRIORITÀ MASSIMA

### TASK CRITICO: Cart Management System Redesign & Database Synchronization
- **Descrizione**: Sistema di gestione carrello tramite chatbot era complesso e causava problemi di traduzione e gestione dei prodotti. Eliminato sistema chatbot carrello e implementato sistema web-based con sincronizzazione database.
- **Priorità**: MASSIMA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Eliminato sistema chatbot carrello (add_to_cart, remove_from_cart, etc.), implementato sistema web-based con generateCartLink(), sincronizzazione frontend-backend per operazioni carrello (add/update/delete), pulito tutto il codice obsoleto e hardcode non autorizzati, aggiornato PRD e Swagger.

## 📋 TASK PENDING

### 📝 REGOLA TASK MANAGEMENT
- **REGOLA CRITICA**: Quando Andrea dice "aggiungi task" o "aggiugni task", il task deve SEMPRE essere aggiunto nel memory bank (docs/memory-bank/tasks.md)
- **FORMATO**: Seguire il formato standard con descrizione, priorità, stato e note
- **PRIORITÀ**: ALTA per problemi critici, MEDIA per miglioramenti, BASSA per feature opzionali
- **STATO**: PENDING per nuovi task, IN PROGRESS per task in corso, COMPLETATO per task finiti

### TASK: Debug Traduzione nel Frontend WhatsApp
- **Descrizione**: Aggiungere la visualizzazione della traduzione nel debug della chat WhatsApp quando l'utente clicca sul bottone di debug. Mostrare "Translated: [frase tradotta]" nella sezione Function Calls.
- **Priorità**: ALTA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Aggiunta visualizzazione della traduzione nel frontend WhatsApp. Quando l'utente clicca sul bottone debug (icona Code), ora vede "🌐 Translated: [frase tradotta]" nella sezione Function Calls. Il sistema preserva correttamente i nomi dei prodotti italiani (es. "fior di latte cubettata" non viene tradotto).

### TASK: Aggiungere Campo Formato per Ogni Prodotto
- **Descrizione**: Aggiungere il campo "formato" per ogni prodotto nel sistema. Il formato deve essere visualizzato accanto al nome del prodotto (es. "Fior di Latte Cubettata (3 Kg)", "Tiramisù Monoporzione (125gr)"). Questo campo deve essere presente nel database, nelle risposte del chatbot, e nel frontend.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Richiesto da Andrea per migliorare la chiarezza delle informazioni sui prodotti. Il formato deve essere visibile ovunque viene mostrato un prodotto.

### TASK: Refactoring Translation Service - LLM Dedicato
- **Descrizione**: Sostituire l'attuale sistema di traduzione con hardcoded rules con un LLM dedicato che analizzi e decida quando tradurre o preservare i nomi dei prodotti italiani. Il sistema attuale con liste hardcoded non è elegante e non scalabile.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: Andrea ha identificato che la soluzione attuale con debug ovunque e liste hardcoded non è elegante. Serve un LLM dedicato che analizzi il contesto e decida intelligentemente quando tradurre o preservare i nomi dei prodotti.

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


### TASK: Rimozione Completa N8N dal Sistema
- **Descrizione**: RIMUOVERE COMPLETAMENTE: Eliminare ogni traccia di N8N dal sistema. Andrea non vuole più vedere nulla che riguardi N8N, neanche nelle ricerche. Deve essere rimosso: 1) Tutti i file e cartelle N8N dal progetto, 2) Tutti i riferimenti N8N nel codice (import, chiamate, configurazioni), 3) Tutte le pagine frontend che menzionano N8N (N8NPage.tsx, menu, routing), 4) Tutti gli script N8N dalla cartella scripts/, 5) Tutte le configurazioni N8N da docker-compose.yml, 6) Tutti i commenti e documentazione che menziona N8N, 7) Tutte le variabili d'ambiente N8N, 8) Tutti i servizi e controller N8N, 9) Pulizia completa del database da tabelle/dati N8N, 10) Aggiornamento documentazione per rimuovere ogni riferimento N8N. Comportamento corretto: Sistema completamente pulito da N8N, nessuna traccia rimasta nel codice, file, documentazione o database.
- **Priorità**: MASSIMA
- **Stato**: PENDING
- **Note**: CRITICO - Andrea vuole N8N completamente rimosso dal sistema, nessuna traccia deve rimanere

### TASK: Temperatura Dinamica per LLM Formatter
- **Descrizione**: IMPLEMENTARE: Passare la temperatura in modo dinamico all'LLM del formatter invece di usare valori hardcoded. Attualmente il formatter potrebbe usare una temperatura fissa, ma deve utilizzare la configurazione dinamica dall'agent config. Deve essere implementato: 1) Verificare se il formatter LLM usa temperatura hardcoded, 2) Modificare il formatter per ricevere temperatura dall'agent configuration, 3) Assicurarsi che il formatter usi agentConfig.formatterTemperature (o campo equivalente), 4) Implementare fallback sicuro se la configurazione non è disponibile, 5) Testare che la temperatura dinamica funzioni correttamente, 6) Verificare che RAG Processor e Formatter usino temperature diverse come richiesto (0.3 per RAG, 0.7 per Formatter), 7) Aggiornare documentazione se necessario. Comportamento corretto: Formatter usa temperatura dinamica dall'agent config → Maggiore flessibilità di configurazione → Temperature diverse per RAG (0.3) e Formatter (0.7).
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Importante per avere controllo completo sulla configurazione LLM e mantenere temperature diverse per RAG Processor (0.3) e Formatter (0.7)

### TASK: Messaggio Automatico di Riattivazione Chat
- **Descrizione**: IMPLEMENTARE: Quando l'utente clicca per riattivare la chat (isChatActive = true e block = false), il sistema deve inviare automaticamente un messaggio di benvenuto nella chat. Deve essere implementato: 1) Rilevamento del cambio di stato da isChatActive = false a isChatActive = true, 2) Verifica che block = false (utente non bloccato), 3) Invio automatico del messaggio "Il chatbot è ritornato attivo, come posso aiutarti oggi?" nella lingua appropriata dell'utente, 4) Registrazione del messaggio automatico nella cronologia chat, 5) Aggiunta di 0,5 centesimi di guadagno per il messaggio automatico, 6) Gestione multilingue del messaggio (IT/EN/ES/PT), 7) Integrazione con il sistema di messaggistica esistente, 8) Test del flusso completo di riattivazione. Comportamento corretto: Utente clicca riattiva chat → Sistema rileva cambio stato → Invia messaggio automatico → Registra in cronologia → Aggiunge guadagno 0,5 centesimi.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Migliora l'esperienza utente fornendo feedback immediato quando la chat viene riattivata, con messaggio multilingue e tracking del guadagno


### TASK: Sconto 20% Erroneo su Tutti i Prodotti - Offerta Alcolici
- **Descrizione**: ERRORE RISOLTO: Il sistema applicava erroneamente uno sconto del 20% a tutti i prodotti (inclusa la mozzarella di bufala) a causa di un'offerta "Offerta Alcolici 20%" configurata senza categoria specifica. Problema identificato: 1) Offerta "Offerta Alcolici 20%" senza categoryId si applicava a tutti i prodotti, 2) Mozzarella di bufala aveva sconto del 20% (sbagliato), 3) Non esistono prodotti alcolici nel sistema, 4) Offerta creata per errore o mal configurata. Soluzione applicata: 1) Disattivata l'offerta "Offerta Alcolici 20%" nel database, 2) Verificato che non ci siano prodotti alcolici nel sistema, 3) Confermato che l'offerta era configurata male. Comportamento corretto: Prodotti senza sconti non voluti, solo sconti cliente specifici applicati.
- **Priorità**: ALTA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Offerta "Offerta Alcolici 20%" disattivata, mozzarella di bufala ora senza sconto errato

### TASK: Seed Senza Ordini - Aggiunta Ordini di Test
- **Descrizione**: PROBLEMA RISOLTO: Il seed del database non creava ordini di esempio, causando un sistema senza ordini per i test. Problema identificato: 1) Seed creava solo prodotti, clienti, chat e FAQ, 2) Nessun ordine di esempio nel database, 3) Sistema di ordini non testabile, 4) Frontend ordini vuoto, 5) Errore TypeScript: campo 'currency' non esiste nel modello Orders. Soluzione applicata: 1) Aggiunta creazione di 3 ordini di esempio nel seed, 2) Ordine per Mario Rossi (CONFIRMED) - €25.50, 3) Ordine per John Smith (PENDING) - €18.90, 4) Ordine per Maria Garcia (DELIVERED) - €32.80, 5) Ogni ordine con items e prodotti reali, 6) Date diverse per testare filtri temporali, 7) Rimosso campo 'currency' non esistente dal modello Orders. Comportamento corretto: Seed crea ordini di esempio per testare il sistema completo.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Seed ora crea 3 ordini di esempio con status diversi per testare il sistema, errore TypeScript risolto

### TASK: Messaggi Sistema Non Verdi - Metadati Mancanti nel Seed
- **Descrizione**: PROBLEMA RISOLTO: I messaggi del sistema nel seed non apparivano verdi nel frontend perché mancavano i metadati necessari per l'identificazione del chatbot. Problema identificato: 1) Messaggi OUTBOUND senza campo aiGenerated, 2) Messaggi senza metadata.agentSelected, 3) Frontend non riconosceva i messaggi come chatbot, 4) Messaggi sistema appaiono bianchi invece che verdi. Soluzione applicata: 1) Aggiunto aiGenerated: true a tutti i messaggi OUTBOUND, 2) Aggiunto metadata con agentSelected: "CHATBOT_DUAL_LLM", 3) Aggiunto metadata con sentBy: "AI", 4) Applicato a tutti i 4 clienti di test (Mario, John, Maria, João). Comportamento corretto: Messaggi del sistema ora appaiono verdi nel frontend come previsto.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Messaggi del sistema ora hanno metadati corretti e appaiono verdi nel frontend

### TASK: Seed Messaggi e Ordini - Semplificazione e Aggiunta Ordini Mario Rossi
- **Descrizione**: MIGLIORAMENTO APPLICATO: Semplificati i messaggi iniziali nel seed e aggiunti ordini per Mario Rossi. Modifiche applicate: 1) Messaggi iniziali semplificati a solo "Ciao!", "Hello!", "¡Hola!", "Olá!" per tutti i clienti, 2) Aggiunti 4 ordini aggiuntivi per Mario Rossi (ORD-004 a ORD-007), 3) Ordini con status diversi (DELIVERED, CONFIRMED, PENDING), 4) Date diverse per testare filtri temporali, 5) Importi variabili (€45.20, €67.80, €28.90, €89.50), 6) Note descrittive per ogni ordine. Comportamento corretto: Seed ora crea 7 ordini totali (5 per Mario Rossi, 1 per John Smith, 1 per Maria Garcia) con messaggi iniziali semplici.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Seed migliorato con messaggi semplici e più ordini per testare il sistema

### TASK: Seed Indirizzi Completi - Fatturazione e Spedizione per Tutti i Clienti
- **Descrizione**: MIGLIORAMENTO APPLICATO: Aggiunti indirizzi di fatturazione e spedizione completi per tutti i clienti nel seed. Modifiche applicate: 1) Aggiunto campo invoiceAddress (JSON) con dati completi per tutti i 4 clienti, 2) Modificato campo address per contenere indirizzo di spedizione (JSON) diverso da fatturazione, 3) Indirizzi realistici per ogni paese (Italia, UK, Spagna, Portogallo), 4) Partite IVA valide per ogni paese, 5) Codici postali corretti, 6) Indirizzi di spedizione diversi da quelli di fatturazione per testare il sistema completo. Comportamento corretto: Tutti i clienti ora hanno indirizzi completi per fatturazione e spedizione, pronti per il checkout e la gestione ordini.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Seed ora include indirizzi completi per tutti i clienti, sistema di checkout e fatturazione completamente funzionale

### TASK: Pagina Ordini Pubblici - Indirizzi Non Visibili
- **Descrizione**: PROBLEMA RISOLTO: Gli indirizzi di fatturazione e spedizione non apparivano nella pagina pubblica degli ordini. Problema identificato: 1) Backend non includeva address e invoiceAddress nella query del customer, 2) Frontend non gestiva la visualizzazione degli indirizzi del cliente, 3) API restituiva solo nome e ID del cliente, 4) Indirizzi JSON non venivano parsati correttamente. Soluzione applicata: 1) Aggiunto address e invoiceAddress alla query del customer nel backend, 2) Aggiunto parsing degli indirizzi JSON nel backend, 3) Aggiornato frontend per mostrare indirizzo di fatturazione completo, 4) Aggiornato frontend per mostrare indirizzo di spedizione (ordine o cliente), 5) Gestione fallback per indirizzi mancanti. Comportamento corretto: Pagina ordini pubblici ora mostra indirizzi completi di fatturazione e spedizione.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Pagina ordini pubblici ora visualizza correttamente tutti gli indirizzi dei clienti

### TASK: Seed Tracking Number - Aggiunta DHL1234456 a Tutti gli Ordini
- **Descrizione**: MIGLIORAMENTO APPLICATO: Aggiunto tracking number DHL1234456 a tutti gli ordini nel seed. Modifiche applicate: 1) Aggiunto trackingNumber: "DHL1234456" a tutti e 7 gli ordini (ORD-001-2024 a ORD-007-2024), 2) Tracking number uguale per tutti gli ordini come richiesto, 3) Applicato a ordini di tutti i clienti (Mario Rossi, John Smith, Maria Garcia), 4) Tracking number visibile nelle pagine ordini pubbliche e private. Comportamento corretto: Tutti gli ordini ora hanno il tracking number DHL1234456 per il tracciamento delle spedizioni.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Seed ora include tracking number DHL1234456 per tutti gli ordini

### TASK: Formatter - Prevenzione Invenzione Informazioni
- **Descrizione**: PROBLEMA RISOLTO: Il formatter (secondo LLM) stava inventando informazioni non presenti nei dati, come "Ricorda che il link sarà attivo fino al 14 settembre 2025". Problema identificato: Il formatter aggiungeva informazioni non esistenti nei dati forniti dalle funzioni. Soluzione applicata: 1) Aggiunta regola CRITICA nel prompt del formatter: "NEVER add information that is not explicitly provided in the data", 2) Aggiunta regola specifica: "NEVER invent or add phrases like 'Ricorda che il link sarà attivo fino al...' unless this information is explicitly provided in the data", 3) Aggiunta regola generale: "ONLY use information that is explicitly provided in the function results or data", 4) Aggiornato prompt del formatter nel dual-llm.service.ts. Comportamento corretto: Il formatter ora usa solo informazioni presenti nei dati, senza inventare dettagli aggiuntivi.
- **Priorità**: ALTA
- **Stato**: COMPLETATO ✅
- **Note**: RISOLTO E TESTATO - Formatter ora rispetta i dati forniti senza inventare informazioni aggiuntive. Test confermato da Andrea.

### TASK: SearchRag - Pulizia Intelligente del Prompt
- **Descrizione**: PROBLEMA IDENTIFICATO: Quando l'utente chiede "come pago?", il sistema risponde genericamente "non ho informazioni" invece di chiamare SearchRag per trovare la FAQ sui metodi di pagamento. Problema identificato: Il prompt conteneva regole specifiche per SearchRag che non erano necessarie, dato che la logica è già implementata nel codice (Cloud Functions → SearchRag → Risposta Generica). Soluzione applicata: 1) Rimossa sezione "TRIGGER PAGAMENTI E FAQ" non necessaria, 2) Sostituita regola complessa con regola semplice: "FLUSSO AUTOMATICO: Cloud Functions FIRST → SearchRag FALLBACK → Risposta Generica", 3) Pulita sezione "FALLBACK SearchRAG" rimuovendo esempi specifici, 4) Aggiunta regola assoluta: "Non devi specificare nulla per SearchRag - il sistema gestisce automaticamente il fallback!", 5) Backup creato prima della modifica, 6) Seed eseguito per aggiornare il prompt nel database. Comportamento atteso: Ora "come pago?" dovrebbe chiamare SearchRag automaticamente tramite il flusso implementato nel codice.
- **Priorità**: ALTA
- **Stato**: COMPLETATO ✅
- **Note**: RISOLTO - "come pago?" ora funziona correttamente con SearchRag. Problema era negli embedding mancanti, risolto con generazione automatica nel seed.

### TASK: GetCustomerProfileLink - Link Profilo Cliente Non Funzionante
- **Descrizione**: ERRORE CRITICO: La calling function GetCustomerProfileLink non funziona. Quando l'utente chiede di modificare email, indirizzo di spedizione, o profilo, il chatbot risponde sempre: "Sembra che ci sia stato un problema nel tentativo di ottenere il link per il profilo cliente". Esempi che non funzionano: 1) "devo modificare la mail" → Errore link profilo, 2) "devo modificare il mio indirizzo di spedizione" → Errore link profilo, 3) "devo cambiare il mio profile" → Errore link profilo, 4) "profilo" → Errore link profilo. Deve essere investigato: 1) Verificare se GetCustomerProfileLink è implementata correttamente, 2) Controllare se la funzione genera token validi, 3) Verificare se il link generato è corretto, 4) Testare la calling function direttamente, 5) Controllare se il prompt riconosce correttamente le richieste di modifica profilo, 6) Verificare se il formatter gestisce correttamente la risposta della funzione. Comportamento corretto: Richiesta modifica profilo → GetCustomerProfileLink chiamata → Link valido generato → Utente può accedere al profilo.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: CRITICO - Gli utenti non possono modificare i loro dati personali perché il link profilo non funziona

### TASK: generateCartLink - Trigger Non Riconosciuti dal Chatbot
- **Descrizione**: ERRORE CRITICO: Il chatbot non riconosce i trigger per generateCartLink(). Quando l'utente chiede "che prodotti ho nel carrello", "mostrami carrello", "aggiungi al carrello", il chatbot usa SearchRag invece di chiamare generateCartLink(). Problema identificato: 1) Trigger "che prodotti ho nel carrello" non riconosciuto, 2) Trigger "mostrami carrello" non riconosciuto, 3) Trigger "aggiungi al carrello" non riconosciuto, 4) Chatbot usa SearchRag invece di generateCartLink(), 5) Link carrello non viene fornito all'utente, 6) Sistema non funziona come progettato. Deve essere risolto: 1) Investigare perché il LLM non riconosce i trigger, 2) Verificare se la funzione generateCartLink è correttamente definita, 3) Controllare se il prompt ha le regole corrette, 4) Testare il riconoscimento dei trigger, 5) Verificare se il sistema di function calling funziona, 6) Assicurarsi che generateCartLink() venga chiamata per i trigger del carrello. Comportamento corretto: Trigger carrello riconosciuto → generateCartLink() chiamata → Link carrello fornito all'utente.
- **Priorità**: MASSIMA
- **Stato**: PENDING
- **Note**: CRITICO - Il sistema di gestione carrello web-based non funziona perché i trigger non vengono riconosciuti


---

**Ultimo aggiornamento**: September 15, 2025
**Task totali**: 14 (0 completati, 14 pending)
**Task critici**: 2
