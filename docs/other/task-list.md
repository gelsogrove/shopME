# 🚀 SHOPME - TASK LIST E-COMMERCE CONSOLIDATA

## ✅ **DOCUMENTAZIONE CONSOLIDATA** (COMPLETATO)
- [x] **PRD.md Update**: Consolidato Usage Tracking, Invoice Management, Two-LLM Architecture e Complete Flow nel PRD.md
- [x] **File Cleanup**: Rimossi file duplicati (USAGE_TRACKING_*.md, task-receive-invoice-implementation.md, flow.md)
- [x] **Single Source of Truth**: PRD.md ora contiene tutta la documentazione tecnica completa
- [x] **Table of Contents**: Aggiornato indice con nuove sezioni consolidate

## ✅ **MIGLIORAMENTI MULTILINGUE** (COMPLETATO)
- [x] **Prompt Multilingue Enhancement**: ✅ COMPLETED - Aggiunta regola "TRADUCI LE INFORMAZIONI" 
- [x] **Database English Info**: Specificato che dati DB sono in inglese ma utente può usare IT/EN/ES/PT
- [x] **Translation Examples**: Aggiunti esempi multilingue nel prompt per traduzioni corrette
- [x] **Prompt Sync**: Aggiornati prompt_agent.md, seed.ts e workflow N8N
- [x] **PRD Documentation**: Aggiunto diagramma architettura RAG nel PRD

## 🚨 **ORDERS & CART MANAGEMENT REDESIGN** (ALTISSIMA PRIORITÀ)

### 🛒 **USER STORY: SISTEMA ORDINI & CARRELLO ENTERPRISE**

**COME** amministratore ShopMe  
**VOGLIO** un sistema completo di gestione ordini e carrello  
**COSÌ CHE** possa gestire tutto il flusso e-commerce con la stessa qualità grafica del resto dell'app

#### 📋 **ACCEPTANCE CRITERIA - ORDERS MANAGEMENT:**

##### **🎨 GRAFICA & DESIGN SYSTEM:**
- [ ] **Consistent Design**: Stessa grafica di Products/Categories/Customers (colori, font, spacing)
- [ ] **ShopMe Theme**: Uso coerente dei colori principali, secondary, accents del design system
- [ ] **Typography**: Font families e sizing consistenti con Header, Sidebar, Cards
- [ ] **Component Library**: Riuso Button, Card, Badge, Table, Modal, Sheet components esistenti
- [ ] **Responsive Design**: Layout responsive come altre pagine (desktop, tablet, mobile)
- [ ] **Icons & Badges**: Sistema icone coerente, badge di stato colorati e leggibili

##### **🛒 CARRELLO SMART (Enhanced Cart):**
- [ ] **Add Products**: Aggiungi prodotti al carrello da catalogo con qty selector
- [ ] **Modify Quantity**: Modifica quantità prodotti nel carrello (+/- buttons, input diretto)
- [ ] **Remove Products**: Rimuovi singoli prodotti dal carrello (X button + conferma)
- [ ] **Save Cart**: Salva carrello per sessioni future (localStorage + database backup)
- [ ] **Clear Cart**: Svuota tutto il carrello (button + modal conferma)
- [ ] **Cart Totals**: Calcolo automatico subtotal, tax, shipping, total con aggiornamento real-time
- [ ] **Cart Validation**: Validazione stock availability, prezzo aggiornato, prodotti attivi
- [ ] **Cart Persistence**: Carrello persistente tra sessioni e dispositivi

##### **📊 ORDERS DASHBOARD (Lista Ordini):**
- [ ] **Orders Table**: Tabella ordini con colonne: ID, Customer, Date, Status, Total, Actions
- [ ] **Status Badges**: Badge colorati per stati (Pending, Confirmed, Shipped, Delivered, Cancelled)
- [ ] **Search Orders**: Ricerca per Order ID, Customer Name, Product, Date Range
- [ ] **Filter Orders**: Filtri per Status, Date Range, Customer, Amount Range, Payment Method
- [ ] **Pagination**: Paginazione performante per migliaia di ordini
- [ ] **Sort Columns**: Ordinamento per Date, Total, Customer, Status (asc/desc)
- [ ] **Bulk Actions**: Selezione multipla ordini per azioni bulk (change status, export, delete)
- [ ] **Export Orders**: Export CSV/Excel con filtri applicati

##### **📝 ORDER DETAILS (Dettaglio Ordine):**
- [ ] **Order Info Panel**: Panel laterale/modal con dettagli completi ordine
- [ ] **Customer Info**: Dati cliente, contatti, storico ordini del cliente
- [ ] **Order Items Table**: Lista prodotti ordinati con qty, prezzo unitario, totale riga
- [ ] **Shipping Address**: Indirizzo spedizione con mappa integration (optional)
- [ ] **Payment Details**: Metodo pagamento, status pagamento, transaction ID
- [ ] **Order Timeline**: Timeline stati ordine con date e user che ha fatto il cambio
- [ ] **Order Notes**: Note interne per tracking e comunicazioni

##### **✏️ ORDER CRUD OPERATIONS:**
- [ ] **Create Order**: Creazione nuovo ordine manuale da admin panel
- [ ] **Edit Order**: Modifica tutti i campi ordine (customer, products, quantities, shipping, notes)
- [ ] **Update Status**: Cambio stato ordine con dropdown e note (Pending → Confirmed → Shipped → Delivered)
- [ ] **Cancel Order**: Cancellazione ordine con motivo e handling stock restoration
- [ ] **Delete Order**: Eliminazione definitiva ordine (soft delete per audit)
- [ ] **Duplicate Order**: Duplica ordine esistente per nuovo ordine simile
- [ ] **Add/Remove Items**: Aggiungi/rimuovi prodotti da ordine esistente con stock validation

##### **🔄 BUSINESS LOGIC & VALIDATIONS:**
- [ ] **Stock Management**: Aggiornamento stock automatico (decrease on confirm, restore on cancel)
- [ ] **Price Calculation**: Calcolo automatico totali con tax, shipping, discounts
- [ ] **Inventory Check**: Validazione stock availability prima di conferma ordine
- [ ] **Customer Validation**: Verifica customer attivo e dati completi
- [ ] **Payment Integration**: Collegamento con payment status e processing
- [ ] **Notification System**: Notifiche email/SMS per cambio stati ordine
- [ ] **Audit Trail**: Log completo modifiche ordine per compliance

##### **🗄️ DATABASE SCHEMA & RELATIONS:**
- [ ] **Orders Table**: Schema completo con relazioni Customer, Payment, Shipping
- [ ] **OrderItems Table**: Relazione Products con quantities, prezzi snapshot
- [ ] **Order Status Enum**: Stati standardizzati per workflow business
- [ ] **Payment Integration**: Link con payment processor per status sync
- [ ] **Indexes Performance**: Indici database per ricerche veloci
- [ ] **Data Integrity**: Constraints e validazioni database level

##### **🎯 INTEGRATION & API:**
- [ ] **REST API**: Endpoint completi CRUD ordini per integrations
- [ ] **N8N Integration**: Calling functions per order management via WhatsApp
- [ ] **Payment Gateway**: Sync con Stripe/PayPal per payment status
- [ ] **Shipping API**: Integration con corrieri per tracking
- [ ] **Analytics Integration**: Dati ordini in analytics dashboard
- [ ] **Export API**: API per export dati verso sistemi esterni

#### 🎨 **DESIGN SPECIFICATIONS:**

##### **COLOR PALETTE (ShopMe Standard):**
- **Primary**: Blue (#3B82F6) per azioni principali
- **Secondary**: Gray (#6B7280) per azioni secondarie  
- **Success**: Green (#10B981) per stati positivi/confirmed
- **Warning**: Yellow (#F59E0B) per pending/processing
- **Error**: Red (#EF4444) per cancelled/failed
- **Info**: Cyan (#06B6D4) per informational

##### **STATUS BADGE COLORS:**
- **Pending**: Yellow badge (#FEF3C7 bg, #D97706 text)
- **Confirmed**: Blue badge (#DBEAFE bg, #2563EB text)
- **Shipped**: Cyan badge (#CFFAFE bg, #0891B2 text)
- **Delivered**: Green badge (#D1FAE5 bg, #059669 text)
- **Cancelled**: Red badge (#FEE2E2 bg, #DC2626 text)

##### **LAYOUT COMPONENTS:**
- **Header**: Consistent con altre pagine (title, actions, breadcrumb)
- **Sidebar**: Menu navigation coerente
- **Main Content**: Grid layout responsive (table + filters)
- **Action Buttons**: Stesso styling Button component
- **Modals**: Consistent modal styling per edit/create
- **Cards**: Product cards styling per order items
- **Tables**: Stesso DataTable component con sorting/pagination

##### **TYPOGRAPHY:**
- **Headings**: H1/H2/H3 con stesso font-weight e spacing
- **Body Text**: Consistent font-size e line-height
- **Labels**: Form labels con stesso styling
- **Numbers**: Monospace per prezzi e quantities

#### 🚀 **TECHNICAL IMPLEMENTATION:**

##### **Frontend Components:**
- **OrdersPage.tsx**: Pagina principale lista ordini
- **OrderDetail.tsx**: Component dettaglio ordine (modal/sheet)
- **OrderForm.tsx**: Form create/edit ordine
- **CartManager.tsx**: Component gestione carrello smart
- **OrderStatusBadge.tsx**: Badge component per stati
- **OrdersTable.tsx**: Tabella ordini con sorting/filtering
- **OrdersFilters.tsx**: Component filtri avanzati

##### **Backend Services:**
- **OrderService**: Business logic gestione ordini
- **CartService**: Logica carrello e validazioni
- **InventoryService**: Gestione stock e availability
- **PaymentService**: Integration payment processing
- **NotificationService**: Invio notifiche status changes

##### **Database Migrations:**
- **Enhanced Orders Schema**: Campi aggiuntivi per business logic
- **OrderItems Relations**: Relazioni ottimizzate con prodotti
- **Indexes**: Performance indexes per ricerche
- **Constraints**: Validazioni database level

#### ⏱️ **ESTIMATION & PRIORITY:**

##### **PHASE 1 - FOUNDATION (1-2 settimane):**
- Database schema enhancement
- Basic CRUD operations backend
- Orders table component frontend

##### **PHASE 2 - CORE FEATURES (2-3 settimane):**
- Complete Orders dashboard
- Cart management enhanced
- Order detail/edit functionality

##### **PHASE 3 - ADVANCED (1-2 settimane):**
- Advanced filtering/search
- Bulk operations
- Payment integration
- Analytics integration

##### **TOTAL ESTIMATION: 4-7 settimane** (dipende da complessità integration)

## 🚨 **NUOVI TASK CRITICI** (dall'ultimo CHECK - GENNAIO 2025)

### 🔧 **SISTEMA BUILD & LINTING** (ALTA PRIORITÀ)
- [x] **Backend TypeScript Compilation**: ✅ FIXED - Backend ora compila senza errori
- [x] **ESLint Backend Configuration**: ✅ COMPLETED - Configurato ESLint TypeScript per backend
- [ ] **ESLint Frontend Fix**: Aggiornare configurazione frontend (rimuovere flag --ext obsoleto)
- [ ] **Linting Integration**: Integrare linting nel processo CI/CD

### 🔄 **N8N WORKFLOW ACTIVATION** (ALTA PRIORITÀ)
- [ ] **N8N Workflow Registration**: Attivare workflow per webhook-start endpoint
- [ ] **Webhook Testing**: Verificare che webhook N8N risponda correttamente
- [x] **N8N Correct Import Script**: ✅ COMPLETED - Creato script con endpoint N8N corretti
- [x] **Workflow Auto-Import in Seed**: ✅ COMPLETED - Seed ora pulisce e importa automaticamente workflow N8N
- [ ] **N8N Authentication Fix**: Risolvere problemi di autorizzazione N8N API (401 Unauthorized)
- [ ] **🚨 PROMPT DINAMICO N8N**: Rimuovere prompt hardcoded dal workflow, usare {{ $json.prompt }} dal database agentConfig
- [x] **N8N Workflow Path Update**: ✅ COMPLETED - Aggiornati tutti gli script per nuovo path `/n8n/workflows/`

### 🛒 **CHECKOUT FUNCTION INTEGRATION** (ALTA PRIORITÀ)
- [x] **createCheckoutLink Integration**: ✅ COMPLETED - Integrato createCheckoutLink nel FunctionHandlerService
- [x] **Checkout Function Router**: ✅ COMPLETED - Aggiunto create_checkout_link al function router
- [ ] **Checkout Token Security**: Implementare passaggio token sicuro alle calling functions
- [ ] **Checkout Flow Testing**: Testare flow completo di checkout con token
- [ ] **CheckoutService Connection**: Collegare CheckoutService esistente al FunctionHandlerService

### 📋 **CALLING FUNCTIONS IMPLEMENTATE** (NUOVE COMPLETATE)
- [x] **GetAllCategories CF**: ✅ COMPLETED - Implementata calling function per ottenere tutte le categorie
- [x] **Categories Function Router**: ✅ COMPLETED - Aggiunto get_all_categories al function router
- [x] **Categories Integration**: ✅ COMPLETED - Integrata nel FunctionHandlerService con gestione errori
- [x] **Build Verification**: ✅ COMPLETED - Backend e Frontend compilano correttamente

### 🔒 **TOKEN SECURITY ENHANCEMENT** (MEDIA PRIORITÀ)
- [ ] **Calling Functions Token Pass**: Implementare passaggio esplicito token a tutte le CF
- [ ] **Session Token Integration**: Collegare SessionTokenService alle calling functions
- [ ] **Security Token Validation**: Validazione token in tutti gli endpoint delle CF
- [ ] **Token Audit Logging**: Logging utilizzo token per audit security

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

### 📧 **CALLING FUNCTIONS MANCANTI** (HIGH PRIORITY)

#### 🚨 **STATO ATTUALE CALLING FUNCTIONS:**
- ✅ **SearchRag**: Implementato (RAG search endpoint)
- ✅ **GetAllProducts**: Implementato (internal API)  
- ✅ **GetAllServices**: Implementato (internal API)
- ⚠️ **CallOperator**: Parzialmente implementato (manca integrazione completa)
- ❌ **ReceiveInvoice**: MANCANTE COMPLETAMENTE
- ❌ **PaymentProcessStart**: MANCANTE COMPLETAMENTE
- ❌ **GetAllCategories**: MANCANTE
- ❌ **CreateOrder**: MANCANTE
- ❌ **AddToCart**: MANCANTE
- ❌ **GetOrderStatus**: MANCANTE
- ❌ **CancelOrder**: MANCANTE
- ❌ **BookAppointment**: MANCANTE (per cliniche/servizi)
- ❌ **CheckAvailability**: MANCANTE (per prenotazioni)

#### 📧 **ReceiveInvoice Calling Function** (PRIORITÀ #1)
- [ ] **Con codice ordine**: Restituisce fattura specifica per ordine
- [ ] **Senza codice ordine**: Invia link con lista tutte le fatture del cliente
- [ ] **Filtro per customer**: Solo fatture del cliente richiedente
- [ ] **Sicurezza**: Token-based access per lista fatture
- [ ] **Endpoint**: `POST /api/internal/receive-invoice`
- [ ] **N8N Integration**: HTTP Request node configurato
- [ ] **Pagina Lista Fatture**: Design coerente con registrazione + token security

#### 💳 **PaymentProcessStart Calling Function** (PRIORITÀ #2)
- [ ] **Payment Intent Creation**: Crea payment intent Stripe
- [ ] **Secure Payment Links**: Genera link sicuri per pagamento
- [ ] **Multi-Gateway Support**: Stripe + PayPal integration
- [ ] **Payment Status Tracking**: Monitoraggio stato pagamento
- [ ] **Endpoint**: `POST /api/internal/payment-process-start`
- [ ] **N8N Integration**: HTTP Request node configurato

#### 🛒 **E-Commerce Calling Functions** (PRIORITÀ #3)
- [ ] **CreateOrder CF**: `POST /api/internal/create-order`
  - [ ] Creazione ordine da carrello
  - [ ] Validazione stock prodotti
  - [ ] Calcolo totali automatico
  - [ ] Generazione codice ordine univoco

- [ ] **AddToCart CF**: `POST /api/internal/add-to-cart`
  - [ ] Aggiunta prodotti al carrello
  - [ ] Gestione quantità e varianti
  - [ ] Validazione disponibilità stock
  - [ ] Calcolo prezzi real-time

- [ ] **GetOrderStatus CF**: `POST /api/internal/order-status`
  - [ ] Ricerca ordine per codice
  - [ ] Status tracking completo
  - [ ] Link per dettagli ordine
  - [ ] Cronologia stati ordine

#### 📦 **Sistema Ordini Backend** 
- [ ] **Database Schema**: Tabella `orders` con relazioni customer/workspace
- [ ] **Order Management**: CRUD completo ordini
- [ ] **Status Workflow**: Stati ordine (pending, confirmed, shipped, delivered)
- [ ] **Inventory Integration**: Aggiornamento stock automatico

#### 🏥 **Servizi & Prenotazioni Calling Functions** (PRIORITÀ #4)
- [ ] **BookAppointment CF**: `POST /api/internal/book-appointment`
  - [ ] Prenotazione appuntamenti
  - [ ] Controllo disponibilità
  - [ ] Conferma automatica
  - [ ] Invio promemoria

- [ ] **CheckAvailability CF**: `POST /api/internal/check-availability`
  - [ ] Controllo slot disponibili
  - [ ] Calendari per servizio
  - [ ] Gestione orari apertura
  - [ ] Blocco temporaneo slot

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

## 🎯 **PROSSIMI TASK IMMEDIATAMENTE DISPONIBILI:**

### 🔥 **READY TO START (può iniziare subito)**

#### **🚨 CALLING FUNCTIONS (Backend Priority)**
1. **ReceiveInvoice Calling Function** - `POST /api/internal/receive-invoice`
2. **PaymentProcessStart Calling Function** - `POST /api/internal/payment-process-start`
3. **CreateOrder Calling Function** - `POST /api/internal/create-order`
4. **AddToCart Calling Function** - `POST /api/internal/add-to-cart`
5. **GetOrderStatus Calling Function** - `POST /api/internal/order-status`
6. **GetAllCategories Calling Function** - `POST /api/internal/get-categories`
7. **BookAppointment Calling Function** - `POST /api/internal/book-appointment`
8. **CheckAvailability Calling Function** - `POST /api/internal/check-availability`

#### **🗄️ DATABASE FOUNDATION**
1. **Orders Database Schema** - Tabelle ordini nel database
2. **Cart Database Schema** - Sistema carrello persistente
3. **Appointments Database Schema** - Prenotazioni e disponibilità
4. **Invoice Database Schema** - Sistema fatturazione

#### **📱 FRONTEND ESSENZIALE**
1. **PaymentPage Frontend** - Pagina dedicata pagamenti
2. **ShippingPage Frontend** - Pagina dedicata indirizzo spedizione
3. **OrdersPage Frontend** - Lista e dettaglio ordini
4. **CartPage Frontend** - Carrello smart

### ⚡ **HIGH IMPACT (maggior valore business)**

#### **💰 REVENUE GENERATORS**
1. **Pay-Per-Use Billing** - Sistema billing €0.005/messaggio
2. **E-Commerce Complete Flow** - Carrello → Ordine → Pagamento → Fattura
3. **Stripe Payment Integration** - Gateway pagamenti
4. **Invoice PDF Generation** - Generazione automatica fatture

#### **🤖 BUSINESS LOGIC**
1. **Complete Calling Functions Set** - Tutti gli 8+ CF mancanti
2. **N8N Workflow Enhancement** - Integrazione CF in workflow
3. **Multi-Business Support** - CF specifici per tipo business
4. **Advanced Order Management** - Tracking, cancellazioni, modifiche

### 📋 **FOUNDATION REQUIRED (prerequisiti)**
1. **Orders Database Schema** - Prima di tutto il resto
2. **Calling Functions Backend** - Prima di N8N integration
3. **Payment Gateway** - Prima di billing avanzato
4. **Security Headers** - Prima di production
5. **JWT Token Security** - Prima di scale

---

## 📋 **PRIORITÀ SVILUPPO**

### 🔥 **FASE 1 - CRITICAL MISSING (dal PRD)** (1-2 settimane)
1. ReceiveInvoice Calling Function implementation
2. Pay-Per-Use Billing system (€0.005/messaggio)
3. Security implementation (OWASP standards)
4. Plan-based AI prompt system

### ⚡ **FASE 2 - CORE E-COMMERCE ESSENZIALE** (2-3 settimane)  
1. Sistema ordini database (tabelle + API)
2. PaymentPage + ShippingPage frontend
3. OrdersPage (lista + dettaglio ordini)
4. Integrazione Stripe payment gateway

### 🎯 **FASE 3 - ADVANCED E-COMMERCE** (2-3 settimane)
1. Carrello smart + checkout completo
2. Generazione PDF fatture automatica
3. N8N calling functions e-commerce
4. WhatsApp checkout completo

### 🚀 **FASE 4 - PRODUCTION & MONITORING** (1 settimana)
1. Security audit completo
2. Performance monitoring
3. Production deployment
4. Analytics e reporting avanzato

---

## 📝 **FOCUS ANDREA: SOLO L'ESSENZIALE PER INIZIARE**
**Frontend necessario subito:**
1. 📦 **OrdersPage** (lista + dettaglio ordini)
2. 💳 **PaymentPage** (Stripe integration)  
3. 🚚 **ShippingPage** (form + validazione indirizzo)

**Backend prioritario:**
1. 🗄️ **Database Schema** (orders, order_items, invoices, shipments)
2. 🔧 **API Endpoints** (CRUD ordini + pagamenti)
3. 📧 **ReceiveInvoice Calling Function** (gestione fatture via WhatsApp)

**Tutto il resto è enhancement successivo!** 🎯

---

## 🎉 **SUMMARY TASK COUNT CONSOLIDATO**
- **✅ COMPLETATI**: 19 task (documentazione + usage tracking + small fixes)
- **🔥 CRITICAL MISSING CALLING FUNCTIONS**: 8 CF mancanti (backend prioritario)
- **💰 BILLING & PLANS**: 7 task (subscription system)
- **🔐 SECURITY**: 9 task (OWASP compliance)
- **⚡ E-COMMERCE CORE**: 40+ task (sistema completo)
- **🚀 ADVANCED FEATURES**: 15+ task (enhancement)
- **📋 TOTALE DA FARE**: 79+ task

**FOCUS IMMEDIATO**: 8 Calling Functions backend (2-3 settimane)
**STIMA TEMPO TOTALE**: 3-4 mesi per sistema e-commerce enterprise completo.
**STIMA FASE 1 (ESSENZIALE)**: 1-2 mesi per funzionalità base operative.