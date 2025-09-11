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

---

**Ultimo aggiornamento**: $(date)
**Task totali**: 8 (5 completati, 3 pending)
**Task critici**: 1
