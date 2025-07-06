# 🚀 SHOPME - TASK LIST E-COMMERCE AVANZATO

## ✅ **DOCUMENTAZIONE CONSOLIDATA** (COMPLETATO)
- [x] **PRD.md Update**: Consolidato Usage Tracking, Invoice Management, Two-LLM Architecture e Complete Flow nel PRD.md
- [x] **File Cleanup**: Rimossi file duplicati (USAGE_TRACKING_*.md, task-receive-invoice-implementation.md, flow.md)
- [x] **Single Source of Truth**: PRD.md ora contiene tutta la documentazione tecnica completa
- [x] **Table of Contents**: Aggiornato indice con nuove sezioni consolidate

## ✅ **USAGE TRACKING FRONTEND FIX** (COMPLETATO)
- [x] **Analytics API**: Aggiunto campo `usageCost` all'interfaccia `DashboardAnalytics`
- [x] **Backend Service**: Esteso `AnalyticsService` per includere calcolo costi LLM (€0.005)
- [x] **Frontend Dashboard**: Aggiunta carta "Costo LLM" con formatter €0.0000 precision
- [x] **Grid Layout**: Aggiornato layout per supportare 5 metriche (xl:grid-cols-5)
- [x] **Compilation**: Backend e Frontend compilano correttamente
- [x] **Engagement Metrics**: Rimosso sezione "Engagement e Qualità" come richiesto

## ✅ **ANALYTICS UI/UX IMPROVEMENTS** (COMPLETATO - Andrea's small-changes)
- [x] **Rimuovi Date Range Selector**: Eliminato il componente di selezione range date
- [x] **Rimuovi InfoBox**: Eliminata la sezione "Informazioni sul periodo di default"
- [x] **Rimuovi Fatturato**: Eliminata completamente la carta "Fatturato" dal dashboard
- [x] **Fix Costo LLM Format**: Cambiato da €0.0000 a €0.00 (solo 2 decimali)

## ✅ **UI/UX FIXES GENERALI** (COMPLETATO - Andrea's small-changes)
- [x] **Disabilita Link Plans**: Disabilitato il link a http://localhost:3000/plans
- [x] **Fix Products Upload Form**: Aggiunta possibilità di disattivare prodotti nella form di upload
- [x] **Rimuovi User Info Header**: Nascosto iniziali nome+cognome+piano in alto a destra
- [x] **Fix Customers Active Toggle**: Risolto problema toggle Active/Inactive nella form clienti

## ✅ **UI/UX FIXES GENERALI** (COMPLETATO - Andrea's small-changes)
- [x] **Documents Toggle Frontend**: Toggle per attivare/disattivare documenti già implementato nel form di edit

## 💳 **PAGAMENTO ONLINE & CHECKOUT**

### 🛒 **Sistema Ordini Completo**
- [ ] **Carrello Smart**: Gestione prodotti nel carrello con quantità e varianti
- [ ] **Checkout Process**: Flusso completo di checkout con validazione
- [ ] **Pagamento Online**: Integrazione gateway di pagamento (Stripe/PayPal)
- [ ] **Conferma Pagamento**: Gestione stati pagamento (pending/success/failed)

### 📦 **Gestione Spedizioni**
- [ ] **LLM Spedizione**: LLM ritorna link per inserire indirizzo di spedizione
- [ ] **Form Indirizzo**: Pagina dedicata per inserimento dettagli spedizione
- [ ] **Calcolo Spedizione**: Sistema di calcolo costi spedizione automatico
- [ ] **Tracking Spedizione**: Integrazione con corrieri per tracking

## 📋 **PAGINE ORDINI & CONFERME**

### ✅ **Conferma Ordine**
- [ ] **Pagina Conferma**: Se clicca va al dettaglio ordine completo
- [ ] **Conferma Indirizzo**: Visualizzazione e conferma indirizzo spedizione
- [ ] **Conferma Pagamento**: Visualizzazione metodo di pagamento selezionato
- [ ] **Riepilogo Finale**: Totali, prodotti, spedizione prima della conferma

### 📊 **Gestione Ordini Database**
- [ ] **Tabella Ordini**: Sistema completo per memorizzare tutti gli ordini
- [ ] **Codice Ordine**: Generazione automatica codici ordine univoci
- [ ] **Stati Ordine**: Gestione stati (pending/confirmed/shipped/delivered)
- [ ] **Associazione Cliente**: Collegamento ordini a clienti/workspace

## 📄 **FATTURAZIONE & PDF**

### 🧾 **Sistema Fatture**
- [ ] **Generazione PDF**: Download automatico PDF fattura con codice ordine
- [ ] **Template Fattura**: Template PDF professionale con dati fiscali
- [ ] **Link Download**: Sistema link sicuri per download PDF fatture
- [ ] **Archiviazione**: Storage sicuro PDF fatture per accesso futuro

### 📑 **Pagina Gestione Ordini**
- [ ] **Lista Ordini**: Pagina con tutti gli ordini del cliente/workspace
- [ ] **Filtri Ordini**: Filtro per data, stato, importo, prodotti
- [ ] **Dettaglio Ordine**: Drill-down in dettaglio singolo ordine
- [ ] **Azioni Ordine**: Annulla, modifica, ristampa fattura

## 🔧 **BACKEND API NECESSARIE**

### 🛒 **Ordini APIs**
- [ ] `POST /api/orders` - Creazione nuovo ordine
- [ ] `GET /api/orders/:id` - Dettaglio singolo ordine
- [ ] `GET /api/orders` - Lista ordini con filtri
- [ ] `PUT /api/orders/:id/status` - Aggiornamento stato ordine
- [ ] `DELETE /api/orders/:id` - Cancellazione ordine

### 💳 **Pagamenti APIs**
- [ ] `POST /api/payments/intent` - Creazione payment intent
- [ ] `POST /api/payments/confirm` - Conferma pagamento
- [ ] `GET /api/payments/:id/status` - Stato pagamento
- [ ] `POST /api/payments/refund` - Gestione rimborsi

### 📦 **Spedizioni APIs**
- [ ] `POST /api/shipping/calculate` - Calcolo costi spedizione
- [ ] `POST /api/shipping/create` - Creazione spedizione
- [ ] `GET /api/shipping/:id/tracking` - Tracking spedizione
- [ ] `PUT /api/shipping/:id/address` - Aggiornamento indirizzo

### 📄 **Fatture APIs**
- [ ] `POST /api/invoices/generate` - Generazione fattura PDF
- [ ] `GET /api/invoices/:orderCode/download` - Download PDF fattura
- [ ] `GET /api/invoices` - Lista fatture workspace
- [ ] `GET /api/invoices/:id` - Dettaglio fattura

## 📱 **FRONTEND COMPONENTI**

### 🛒 **Carrello & Checkout**
- [ ] **CartComponent**: Carrello smart con aggiornamenti real-time
- [ ] **CheckoutPage**: Pagina checkout con step wizard
- [ ] **PaymentForm**: Form pagamento integrato con gateway
- [ ] **OrderSummary**: Riepilogo ordine finale

### 📦 **Spedizioni & Indirizzi**
- [ ] **ShippingForm**: Form indirizzo spedizione con validazione
- [ ] **ShippingCalculator**: Calcolatore costi spedizione real-time
- [ ] **AddressConfirm**: Componente conferma indirizzo
- [ ] **TrackingDisplay**: Visualizzazione stato spedizione

### 📋 **Ordini & Fatture**
- [ ] **OrdersPage**: Pagina lista ordini con filtri e ricerca
- [ ] **OrderDetail**: Pagina dettaglio singolo ordine
- [ ] **InvoicesList**: Lista fatture con download links
- [ ] **OrderConfirmation**: Pagina conferma ordine post-checkout

## 🗄️ **DATABASE SCHEMA**

### 📊 **Tabelle Nuove**
```sql
-- Tabella Ordini
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  orderCode VARCHAR(20) UNIQUE NOT NULL,
  workspaceId UUID REFERENCES workspaces(id),
  customerId UUID REFERENCES customers(id),
  status OrderStatus DEFAULT 'pending',
  totalAmount DECIMAL(10,2) NOT NULL,
  shippingAmount DECIMAL(10,2),
  taxAmount DECIMAL(10,2),
  shippingAddress JSONB,
  paymentMethod VARCHAR(50),
  paymentStatus PaymentStatus DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Dettagli Ordine
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  orderId UUID REFERENCES orders(id),
  productId UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  unitPrice DECIMAL(10,2) NOT NULL,
  totalPrice DECIMAL(10,2) NOT NULL
);

-- Fatture
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  orderId UUID REFERENCES orders(id),
  invoiceNumber VARCHAR(20) UNIQUE NOT NULL,
  pdfPath VARCHAR(255),
  generatedAt TIMESTAMP DEFAULT NOW()
);

-- Spedizioni
CREATE TABLE shipments (
  id UUID PRIMARY KEY,
  orderId UUID REFERENCES orders(id),
  trackingNumber VARCHAR(100),
  carrier VARCHAR(50),
  status ShipmentStatus DEFAULT 'preparing',
  shippedAt TIMESTAMP,
  deliveredAt TIMESTAMP
);
```

## 🔄 **INTEGRATION N8N**

### 🤖 **N8N Calling Functions E-commerce**
- [ ] **create_order()**: Calling function completa per creazione ordini
- [ ] **process_payment()**: Gestione pagamenti via N8N workflow
- [ ] **calculate_shipping()**: Calcolo spedizione intelligente
- [ ] **generate_invoice()**: Generazione automatica fattura PDF
- [ ] **send_confirmation()**: Invio conferme via WhatsApp/Email

### 📱 **WhatsApp E-commerce Flow**
- [ ] **Checkout WhatsApp**: Possibilità completare ordine via WhatsApp
- [ ] **Payment Links**: Invio link pagamento sicuro via WhatsApp
- [ ] **Order Status**: Aggiornamenti stato ordine via WhatsApp
- [ ] **Invoice Delivery**: Invio fattura PDF via WhatsApp

## 🧪 **TESTING**

### ✅ **Test E-commerce**
- [ ] **Cart Tests**: Test funzionalità carrello
- [ ] **Checkout Tests**: Test flusso checkout completo
- [ ] **Payment Tests**: Test integrazione pagamenti
- [ ] **Invoice Tests**: Test generazione PDF fatture
- [ ] **Orders Tests**: Test gestione ordini completa

## 🚀 **DEPLOYMENT**

### 📦 **Production Ready**
- [ ] **Payment Gateway**: Configurazione produzione Stripe/PayPal
- [ ] **PDF Storage**: Storage sicuro PDF fatture (AWS S3/MinIO)
- [ ] **Email Service**: Servizio email per conferme (SendGrid/AWS SES)
- [ ] **Monitoring**: Monitoring pagamenti e ordini

---

## 📋 **PRIORITÀ SVILUPPO**

### 🔥 **FASE 1 - CORE E-COMMERCE** (2-3 settimane)
1. Sistema ordini database (tabelle + API)
2. Carrello frontend smart
3. Pagina conferma ordine
4. Integrazione pagamento base

### ⚡ **FASE 2 - SPEDIZIONI & FATTURE** (2 settimane)  
1. Sistema spedizioni con LLM link
2. Generazione PDF fatture
3. Pagina gestione ordini
4. Download fatture con codice ordine

### 🎯 **FASE 3 - ADVANCED FEATURES** (1-2 settimane)
1. N8N calling functions e-commerce
2. WhatsApp checkout completo
3. Tracking spedizioni
4. Dashboard analytics ordini

---

**TOTALE TASK: 50+ funzionalità**  
**TEMPO STIMATO: 5-7 settimane**  
**COMPLESSITÀ: ALTA (Sistema e-commerce enterprise-level)**