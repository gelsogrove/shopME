# 🚨 CRITICAL CHATBOT FLOW RULES - NEVER FORGET

## MANDATORY RULES - ALWAYS FOLLOW (AGGIORNATO 17/09/2025)

### 1. **LLM DECIDES EVERYTHING**
- ❌ NO hardcoded if statements
- ❌ NO regex patterns  
- ❌ NO include patterns
- ✅ LLM decides what to do based on the prompt
- ✅ È LLM che decide TUTTO, non il codice

### 2. **FLUSSO COMPLETO**
1. **LLM decide** la funzione da chiamare
2. **Se non chiama niente:** salva risposta LLM e chiama SearchRag
3. **Se SearchRag non ha risultati:** ritorna la risposta dell'LLM
4. **Se SearchRag ha risultati:** ritorna il risultato del formatter che ha ricevuto dal SearchRag

### 3. **TRANSLATION LAYER**
- Prima di tutto passa dal layer translate prima del SearchRag
- **CRITICO:** I prodotti italiani NON si traducono in inglese
- Mantieni sempre i nomi originali italiani

### 4. **FORMATTER NATURALE**
- Il formatter manda solo la risposta in modo naturale
- Il formatter riceve: lingua, sconto, workspaceId, customerId, domanda, e risposta del SearchRag

### 5. **VARIABLE REPLACEMENT**
- SearchRag quando ha variabili deve fare replace PRIMA di inviarlo al modello
- Formatter trova variabili come `[LIST_ALL_PRODUCTS]`, `[USER_DISCOUNT]`, etc.
- Sostituisce con dati reali dal database

### 6. **CODICE PULITO**
- ❌ Togliere tutto il codice sporco
- ❌ NON hardcodeare NULLA ma NULLA ma NULLA
- ✅ Tutto deve essere dinamico e intelligente

## FLOW SUMMARY
```
User Question → LLM Decides → CF Executes → CF Saves to DB → SearchRag → 
If Empty: Use Saved Response | If Has Results: Use FAQ Response → 
Formatter (5 params) → Variable Replacement → Final Response
```

## ⚠️ CRITICAL
These rules are MANDATORY and must be followed in every implementation.
No exceptions. No shortcuts. No hardcoding.
