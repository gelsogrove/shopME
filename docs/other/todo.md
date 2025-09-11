# 🐛 TODO - Fix Test Manuale ShopMe

## 📋 Lista Errori Identificati dal Test Manuale

### 🔴 **CRITICI - Bloccano Funzionalità Base**

#### 1. **Errore Primo Messaggio Nuovo Cliente** ✅ **COMPLETATO**
- **Problema**: Messaggio "Hola" da nuovo cliente restituisce "Sorry, there was an error processing your message. Please try again later."
- **Impatto**: **BLOCCA COMPLETAMENTE** i nuovi clienti
- **Priorità**: 🔴 **MASSIMA**
- **File Coinvolti**: 
  - `backend/src/routes/index.ts` (webhook WhatsApp)
  - `backend/src/application/services/secure-token.service.ts`
  - `backend/src/repositories/message.repository.ts`
  - `backend/src/application/services/registration-attempts.service.ts`
- **Soluzione Implementata**: 
  - ✅ Rilevamento automatico nuovi utenti tramite numero di telefono
  - ✅ Rilevamento automatico lingua dal messaggio (IT/EN/ES/PT)
  - ✅ Recupero messaggio welcome dal database in base alla lingua
  - ✅ Generazione token di registrazione sicuro (1 ora di validità)
  - ✅ Creazione link di registrazione automatico
  - ✅ Sistema di blocco automatico dopo 5 tentativi (aggiornato da 3)
  - ✅ Salvataggio messaggi nello storico per tutti i formati
  - ✅ Formato risposta consistente per frontend
  - ✅ Invio risposta diretta bypassando LLM per nuovo utente
  - ✅ Funziona sia per formato WhatsApp che formato test
  - ✅ Comportamento corretto: utenti bloccati vengono completamente ignorati (nessun messaggio)

#### 2. **Product Null nel Backoffice**
- **Problema**: Nel backoffice vengono mostrati "Product null" invece dei nomi dei prodotti
- **Impatto**: **RENDE INUTILIZZABILE** la gestione ordini
- **Priorità**: 🔴 **MASSIMA**
- **File Coinvolti**:
  - `frontend/src/pages/OrdersPage.tsx`
  - `backend/src/controllers/order.controller.ts`
  - Database queries per orders
- **Causa Probabile**: Join mancante o campo product non popolato correttamente

### 🟡 **MEDI - Compromettono UX**

#### 3. **Riconoscimento Query Senza Punto Interrogativo**
- **Problema**: 
  - ❌ "che servizi avete" → NON funziona
  - ✅ "che servizi avete?" → funziona
  - ❌ "che offerte avete" → NON funziona  
  - ✅ "che offerte avete?" → funziona
- **Impatto**: **FRUSTRA** gli utenti che non usano il punto interrogativo
- **Priorità**: 🟡 **ALTA**
- **File Coinvolti**:
  - `backend/src/services/dual-llm.service.ts`
  - `docs/other/prompt_agent.md`
- **Causa Probabile**: Prompt troppo rigido che richiede sintassi formale

#### 4. **Totale Non in Grassetto nella Chat**
- **Problema**: Il totale del carrello nella chat non è evidenziato in grassetto
- **Impatto**: **RIDUCE** la visibilità delle informazioni importanti
- **Priorità**: 🟡 **MEDIA**
- **File Coinvolti**:
  - `backend/src/chatbot/calling-functions/` (funzioni carrello)
- **Causa Probabile**: Formattazione Markdown mancante o non supportata

#### 5. **Indirizzo Fatturazione Mancante nel Checkout**
- **Problema**: Nel terzo step del checkout manca la visualizzazione dell'indirizzo di fatturazione
- **Impatto**: **CONFONDE** l'utente durante il checkout
- **Priorità**: 🟡 **MEDIA**
- **File Coinvolti**:
  - `frontend/src/pages/CheckoutPage.tsx`
  - `frontend/src/components/` (componenti checkout)
- **Causa Probabile**: Campo non renderizzato o logica di visualizzazione mancante

### 🟢 **BASSA - Miglioramenti**

#### 6. **Campo Note Mancante nel Backoffice**
- **Problema**: Le note inserite nell'ordine non vengono mostrate nel backoffice
- **Impatto**: **RIDUCE** la visibilità delle informazioni per l'admin
- **Priorità**: 🟢 **BASSA**
- **File Coinvolti**:
  - `frontend/src/pages/OrdersPage.tsx`
  - `backend/src/controllers/order.controller.ts`
- **Causa Probabile**: Campo note non incluso nella query o nel rendering

#### 7. **Modifica Indirizzo Fatturazione Non Funziona**
- **Problema**: Tentativo di modificare indirizzo fatturazione non restituisce link e non chiama CF
- **Impatto**: **IMPEDISCE** la modifica dei dati cliente
- **Priorità**: 🟢 **BASSA**
- **File Coinvolti**:
  - `backend/src/chatbot/calling-functions/`
- **Causa Probabile**: Function calling non implementata o mal configurata

#### 8. **"Voglio Parlare con un Operatore" Non Funziona**
- **Problema**: Richiesta di parlare con operatore non chiama la CF corretta
- **Impatto**: **IMPEDISCE** l'escalation a supporto umano
- **Priorità**: 🟢 **BASSA**
- **File Coinvolti**:
  - `backend/src/chatbot/calling-functions/`
- **Causa Probabile**: Function calling non implementata

#### 9. **Indirizzo di Spedizione Mostrato come JSON Raw**
- **Problema**: L'indirizzo di spedizione viene mostrato come JSON string invece di essere formattato nei singoli campi
- **Esempio**: `{"name":"Mario Rossi","street":"Via Roma 123","city":"Milano","postalCode":"20100","country":"Italy"}`
- **Impatto**: **RENDE ILLEGGIBILE** l'interfaccia utente
- **Priorità**: 🟡 **ALTA**
- **File Coinvolti**:
  - `frontend/src/pages/CustomerProfilePublicPage.tsx`
  - `frontend/src/components/` (componenti profilo)
- **Causa Probabile**: JSON non viene parsato e formattato correttamente nei campi

#### 10. **Voce "Document" da Commentare nel Frontend**
- **Problema**: La voce "document" nel frontend deve essere commentata/nascosta
- **Impatto**: **PULIZIA INTERFACCIA** - rimuove funzionalità non necessaria
- **Priorità**: 🟢 **BASSA**
- **File Coinvolti**:
  - `frontend/src/` (componenti di navigazione/menu)
- **Causa Probabile**: Voce di menu o link non più necessario

## 🎯 **Piano di Risoluzione Suggerito**

### **Fase 1 - Fix Critici (Giorno 1)**
1. **Fix #1**: Errore primo messaggio nuovo cliente
2. **Fix #2**: Product null nel backoffice

### **Fase 2 - Fix UX (Giorno 2)**
3. **Fix #3**: Riconoscimento query senza punto interrogativo
4. **Fix #4**: Totale in grassetto nella chat ✅
5. **Fix #5**: Indirizzo fatturazione nel checkout
6. **Fix #9**: Indirizzo spedizione JSON raw → campi formattati

### **Fase 3 - Miglioramenti (Giorno 3)**
6. **Fix #6**: Campo note nel backoffice
7. **Fix #7**: Modifica indirizzo fatturazione
8. **Fix #8**: Parlare con operatore
9. **Fix #10**: Commentare voce document nel frontend

## 🔍 **Note Tecniche**

- **Test Environment**: Verificare che tutti i fix funzionino sia in sviluppo che in produzione
- **Database**: Controllare integrità dati per Product null
- **Frontend**: Testare responsive design per tutti i fix UI

## 📝 **Stato Attuale**
- **Data Test**: 11 Settembre 2025
- **Tester**: Andrea
- **Ambiente**: Test Manuale Completo
- **Status**: 10 errori identificati, 1 risolto (Fix #1: Totale in grassetto)

- 
---
*Ultimo aggiornamento: 11/09/2025 - Andrea*



te lo spiego dopo questo errore
aggiungi al carrello [000584]

lista clienti 
te lo spiego dopo questo task