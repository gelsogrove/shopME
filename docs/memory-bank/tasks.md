# Task Manager - ShopMe Project

## 🚨 TASK CRITICI - PRIORITÀ MASSIMA

### TASK CRITICO: Sistema non prende la lingua dell'utente
- **Descrizione**: Il sistema non sta rilevando o utilizzando correttamente la lingua dell'utente per le risposte del chatbot. Questo causa risposte nella lingua sbagliata.
- **Priorità**: MASSIMA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Sistema multilingue funzionante (IT/EN/ES/PT). Prompt aggiornato con template multilingue, rilevamento lingua migliorato, messaggi di benvenuto multilingue implementati.

## 📋 TASK PENDING

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

### TASK: Migliorare comprensione LLM delle sfumature linguistiche negli ordini
- **Descrizione**: Il LLM attualmente non distingue tra "procedi con l'ordine" e "conferma ordine". Deve capire queste sfumature linguistiche per gestire correttamente i diversi stati del processo di ordine. Implementare logica per distinguere tra:
  - "Procedi con l'ordine" = continua il processo di creazione ordine
  - "Conferma ordine" = finalizza e conferma l'ordine esistente
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: Importante per UX del chatbot e gestione corretta del flusso ordini

### TASK: Aggiungere nome società nella chat history
- **Descrizione**: Nella chat history attualmente viene mostrato solo il nome del cliente (es. "Mario Rossi"). Deve essere aggiunto anche il nome della società per una migliore identificazione. Formato richiesto: "Mario Rossi (Rossi Limited S.r.l.)" - nome cliente seguito dal nome società tra parentesi.
- **Priorità**: MEDIA
- **Stato**: COMPLETATO
- **Note**: RISOLTO - Corretto il backend per includere il campo 'company' nella query del customer nel metodo getChatSessionsWithUnreadCounts. Il frontend già supportava la visualizzazione del nome della società nel formato richiesto: "Nome Cliente (Nome Società)". Ora Mario Rossi dovrebbe apparire come "Mario Rossi (Rossi Limited S.r.l.)" nella lista delle chat.

### TASK: Migliorare pagina Customer Profile
- **Descrizione**: La pagina customer-profile (es. http://localhost:3000/customer-profile?token=...) necessita di miglioramenti:
  1. Aggiungere bottone "View Cart" / "Vedi Carrello" (multilingue)
  2. Uniformare l'header con le altre pagine del sistema
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Importante per coerenza UI/UX e funzionalità carrello per i clienti

### TASK: Aggiungere listino prezzi nelle statistiche
- **Descrizione**: Aggiungere una sezione "Listino Prezzi" nella pagina delle statistiche con i seguenti costi:
  - €0.005 per risposta LLM (0.5 centesimi)
  - 1 euro per ogni nuovo cliente
  - 1 euro per ogni nuovo ordine
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Importante per trasparenza sui costi del servizio e per aiutare gli utenti a comprendere la struttura dei prezzi

### TASK: Rimuovere bottone "Processed prompt" dalla popup chatbot WhatsApp
- **Descrizione**: Nella popup del chatbot WhatsApp c'è un bottone "Processed prompt" che non deve essere visibile. Andrea vuole solo sapere come il sistema traduce le variabili ({{nameUser}}, {{discountUser}}, {{companyName}}, {{lastordercode}}, {{languageUser}}) ma non vuole vedere il bottone nell'interfaccia.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Il bottone deve essere nascosto/rimosso dall'interfaccia utente, ma la funzionalità di traduzione delle variabili deve rimanere attiva per il debug interno

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
**Task totali**: 23 (18 completati, 5 pending)
**Task critici**: 0
