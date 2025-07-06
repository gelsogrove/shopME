# 🚀 SHOPME - TASK LIST E-COMMERCE ESSENZIALE

## ✅ **DOCUMENTAZIONE CONSOLIDATA** (COMPLETATO)
- [x] **PRD.md Update**: Consolidato Usage Tracking, Invoice Management, Two-LLM Architecture e Complete Flow nel PRD.md
- [x] **File Cleanup**: Rimossi file duplicati (USAGE_TRACKING_*.md, task-receive-invoice-implementation.md, flow.md)
- [x] **Single Source of Truth**: PRD.md ora contiene tutta la documentazione tecnica completa
- [x] **Table of Contents**: Aggiornato indice con nuove sezioni consolidate

## ✅ **USAGE TRACKING FRONTEND FIX** (COMPLETATO)
- [x] **Analytics API**: Aggiunto campo `usageCost` all'interfaccia `DashboardAnalytics`
- [x] **Backend Service**: Esteso `AnalyticsService` per includere calcolo costi LLM (€0.005)
- [x] **Frontend Dashboard**: Aggiunta carta "Costo LLM" con formato €0.00 (2 decimali)
- [x] **Usage Tracking**: Sistema automatico di tracking €0.005 per messaggio LLM
- [x] **Business Intelligence**: Metriche complete per analisi costi AI

## ✅ **SMALL-CHANGES COMPLETATI** (Andrea's Quick Fixes)
- [x] **Analytics UI/UX Improvements**: Rimossi Date Range Selector, InfoBox, Fatturato
- [x] **Fix Costo LLM Format**: Cambiato da €0.0000 a €0.00 (2 decimali)
- [x] **Disabilitato Link Plans**: Link a plans ora mostra "Plans (Coming Soon)" e disabled
- [x] **Fix Products Upload Form**: Aggiunto checkbox Active Product funzionante
- [x] **Nascosto User Info Header**: Commentate iniziali nome+cognome+piano
- [x] **Fix Customers Active Toggle**: Risolto problema attivazione/disattivazione clienti
- [x] **Documents Toggle Frontend**: Toggle Active/Inactive già implementato nel form di edit

## 🔥 **CRITICAL MISSING TASKS** (dal PRD - PRIORITÀ ASSOLUTA)

### 📧 **INVOICE MANAGEMENT SYSTEM** (HIGH PRIORITY)
- [ ] **ReceiveInvoice Calling Function**: Implementare CF che gestisce richieste fatture
  - [ ] **Con codice ordine**: Restituisce fattura specifica per ordine
  - [ ] **Senza codice ordine**: Invia link con lista tutte le fatture del cliente
  - [ ] **Filtro per customer**: Solo fatture del cliente richiedente
  - [ ] **Sicurezza**: Token-based access per lista fatture
- [ ] **Pagina Lista Fatture**: Design coerente con registrazione + token security
- [ ] **Sistema PDF Invoices**: Generazione automatica PDF fatture
- [ ] **Database Schema**: Tabella `invoices` con relazioni customer/workspace
- [ ] **Secure Download Links**: Token temporanei per download sicuro PDF

### 💰 **SUBSCRIPTION PLANS & BILLING** (HIGH PRIORITY)
- [ ] **Pay-Per-Use Billing**: €59/month + €0.005/messaggio oltre 1000
- [ ] **Real-Time Billing Dashboard**: Conta messaggi in tempo reale
- [ ] **Usage Limits Enforcement**: Blocco servizio al superamento limiti
- [ ] **Plan Upgrade Triggers**: Automatic upgrade suggestions
- [ ] **Stripe Integration**: Pagamenti ricorrenti + overage
- [ ] **Professional Plan Contact Sales**: Form invece di upgrade diretto
- [ ] **Plan-Based Feature Limits**: Enforcement limite prodotti/servizi/API

### 🤖 **PLAN-BASED AI PROMPT SYSTEM** (HIGH PRIORITY)
- [ ] **Prompt Diversi per Piano**: Free, Basic, Professional, Enterprise
- [ ] **Upgrade Messaging**: Promozione upgrade nei prompt AI
- [ ] **Dynamic Prompt Loading**: Cambio prompt automatico su upgrade
- [ ] **Fallback System**: Prompt default per configurazioni mancanti
- [ ] **Plan Feature Restrictions**: Disable funzioni per piano inferiore

### 🔐 **SECURITY IMPLEMENTATION (OWASP)** (HIGH PRIORITY)
- [ ] **Comprehensive Security Audit**: Valutazione vulnerabilità completa
- [ ] **JWT Token Security**: Token rotation, blacklisting, secure storage
- [ ] **Security Headers**: OWASP recommended headers
- [ ] **Input Validation**: Validazione completa tutti gli input
- [ ] **SQL Injection Prevention**: Protezione avanzata database
- [ ] **XSS Protection**: Content Security Policy implementation
- [ ] **2FA Enhancement**: Two-factor authentication sistema
- [ ] **Security Monitoring**: Audit logging completo
- [ ] **Rate Limiting Advanced**: Protezione anti-DDoS

## 🎯 **CORE E-COMMERCE ESSENZIALE** (Andrea's Requirements)

### 🛒 **Sistema Ordini Database** (BACKEND ONLY)
- [ ] **Tabelle Core**: orders, order_items, invoices, shipments, payments
- [ ] **API Endpoints**: CRUD completo per gestione ordini
- [ ] **Order Status Workflow**: Stati ordine (pending, confirmed, shipped, delivered)
- [ ] **Unique Order Codes**: Codici ordine univoci per tracking
- [ ] **Customer Relations**: Collegamento ordini ai clienti
- [ ] **Inventory Integration**: Aggiornamento stock automatico

### 📦 **GESTIONE ORDINI FRONTEND** (ESSENZIALE)
- [ ] **OrdersPage**: Pagina lista ordini con filtri basic
- [ ] **OrderDetail**: Pagina dettaglio singolo ordine
- [ ] **Order Status Display**: Visualizzazione stato ordine semplice
- [ ] **Customer Order History**: Storico ordini cliente

### 💳 **PAGINA PAGAMENTO** (ESSENZIALE)
- [ ] **PaymentPage**: Pagina dedicata per processo pagamento
- [ ] **Payment Form**: Form selezione metodo pagamento
- [ ] **Stripe Integration**: Integrazione gateway Stripe
- [ ] **Payment Confirmation**: Conferma pagamento con redirect
- [ ] **Payment Status Tracking**: Tracking stato pagamento real-time

### � **PAGINA INDIRIZZO SPEDIZIONE** (ESSENZIALE)
- [ ] **ShippingPage**: Pagina dedicata raccolta indirizzo
- [ ] **Address Form**: Form indirizzo spedizione con validazione
- [ ] **Shipping Calculator**: Calcolo costi spedizione
- [ ] **Address Validation**: Validazione indirizzo automatica

### 📄 **Sistema Fatture Backend**
- [ ] **Invoice Generation**: Generazione automatica PDF fatture
- [ ] **Invoice Templates**: Template fatture professionali
- [ ] **Tax Calculation**: Calcolo tasse per compliance
- [ ] **Secure Download**: Link sicuri per download fatture

## 🎯 **PROSSIMI TASK IMMEDIATAMENTE DISPONIBILI:**

### 🔥 **READY TO START (può iniziare subito)**
1. **ReceiveInvoice Calling Function** - Implementazione CF per gestione fatture
2. **Orders Database Schema** - Tabelle ordini nel database
3. **PaymentPage Frontend** - Pagina dedicata pagamenti
4. **ShippingPage Frontend** - Pagina dedicata indirizzo spedizione

### ⚡ **HIGH IMPACT (maggior valore business)**
1. **Pay-Per-Use Billing** - Sistema billing €0.005/messaggio
2. **OrdersPage Frontend** - Lista e dettaglio ordini
3. **Stripe Payment Integration** - Gateway pagamenti
4. **Invoice PDF Generation** - Generazione automatica fatture

### 📋 **FOUNDATION REQUIRED (prerequisiti)**
1. **Orders Database Schema** - Prima di tutto il resto
2. **Payment Gateway** - Prima di billing avanzato
3. **Security Headers** - Prima di production
4. **JWT Token Security** - Prima di scale

---

## 🎉 **SUMMARY TASK COUNT SEMPLIFICATO**
- **✅ COMPLETATI**: 12 task
- **🔥 CRITICAL MISSING**: 28 task (dal PRD)
- **⚡ E-COMMERCE ESSENZIALE**: 16 task (solo quello che serve)
- **📋 TOTALE DA FARE**: 44 task

**STIMA TEMPO TOTALE**: 2-3 mesi per completamento sistema e-commerce essenziale.

---

## 📝 **FOCUS ANDREA: SOLO L'ESSENZIALE**
**Frontend necessario:**
1. 📦 **Gestione ordini** (lista + dettaglio)
2. 💳 **Pagina pagamento** (Stripe integration)  
3. 🚚 **Pagina indirizzo spedizione** (form + validazione)

**Tutto il resto è backend + calling functions per WhatsApp!** 🎯