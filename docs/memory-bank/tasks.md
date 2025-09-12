# Task Manager - ShopMe Project

## 🚨 TASK CRITICI - PRIORITÀ MASSIMA

### TASK CRITICO: Sistema non prende la lingua dell'utente
- **Descrizione**: Il sistema non sta rilevando o utilizzando correttamente la lingua dell'utente per le risposte del chatbot. Questo causa risposte nella lingua sbagliata.
- **Priorità**: MASSIMA
- **Stato**: PENDING
- **Note**: Problema critico che impatta l'esperienza utente multilingue

## 📋 TASK PENDING

### TASK: Controllare ordine della chatHistory
- **Descrizione**: Verificare e correggere l'ordine di visualizzazione dei messaggi nella cronologia chat
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: Indirizzo di Spedizione mancante nello step 3 dell'ordine
- **Descrizione**: Aggiungere il campo indirizzo di spedizione nello step 3 del processo di checkout/ordine. L'indirizzo di spedizione deve essere visibile e modificabile durante la creazione dell'ordine.
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: Layout diversi tra chatHistory e popup chat
- **Descrizione**: Si vedono due layout diversi tra la pagina chatHistory e il popup chat. Non si sa se dipende da una chiamata diversa al backend. Investigare le differenze di layout e le chiamate API per identificare la causa.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Potrebbe essere correlato al task critico del rilevamento lingua dell'utente

### TASK: Totali in BOLD dentro la conversazione
- **Descrizione**: I totali devono essere visualizzati in grassetto (BOLD) all'interno delle conversazioni del chatbot. Attualmente i totali non sono evidenziati correttamente.
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: LLM non saluta l'utente con il suo nome
- **Descrizione**: Il LLM non saluta l'utente utilizzando il suo nome personale. Dovrebbe riconoscere e utilizzare il nome dell'utente nei saluti e nelle interazioni.
- **Priorità**: MEDIA
- **Stato**: PENDING
- **Note**: Potrebbe essere correlato al task critico del rilevamento lingua dell'utente

### TASK: Rimuovere campo Notes dalla lista ordini
- **Descrizione**: Nella lista degli ordini non deve essere presente il campo Notes. Il campo Notes deve essere visibile e modificabile solo nel form di modifica ordine, non nella tabella di lista.
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: Assicurarsi che al salvataggio venga generata la generazione di nuovi embed
- **Descrizione**: Verificare e implementare la generazione automatica di nuovi embedding quando vengono salvati dati nel sistema. Questo è importante per mantenere aggiornato il sistema di ricerca semantica.
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: Verificare che le FAQ non attive non vengano prese in considerazione
- **Descrizione**: Verificare che nel sistema di ricerca semantica e nel chatbot, le FAQ con status "non attivo" (isActive = false) non vengano incluse nei risultati di ricerca o nelle risposte del sistema.
- **Priorità**: MEDIA
- **Stato**: PENDING

### TASK: Investigare determinazione workspaceID per nuovi utenti
- **Descrizione**: Quando un nuovo utente scrive, il sistema deve determinare a quale channel/workspace sta scrivendo per identificare il corretto workspaceID. Investigare se questa funzionalità è già implementata e come funziona, oppure se deve essere sviluppata.
- **Priorità**: ALTA
- **Stato**: PENDING
- **Note**: Critico per il funzionamento del sistema multitenant

### TASK: Impostare default "ultimo mese" nella tendina analytics
- **Descrizione**: Nella pagina analytics (http://localhost:3000/analytics), la tendina per la selezione del periodo deve avere come default "ultimo mese" invece di un periodo diverso.
- **Priorità**: MEDIA
- **Stato**: PENDING

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

---

**Ultimo aggiornamento**: $(date)
**Task totali**: 18 (7 completati, 11 pending)
**Task critici**: 2
