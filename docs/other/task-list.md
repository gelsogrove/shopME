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
- [ ] **Constraints**: Validazioni database level

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

## 🎨 **UI/UX IMPROVEMENTS** (ALTA PRIORITÀ)

### 🔔 **TOAST MESSAGES STANDARDIZATION**
- [ ] **Green Success Toast**: Tutti i toast di successo devono essere verdi con scritta bianca
- [ ] **Toast Icons**: Ogni toast deve avere un'icona appropriata (✓ per success, ⚠️ per warning, ❌ per error)
- [ ] **Consistent Styling**: Applicare styling uniforme a tutti i toast nell'applicazione
- [ ] **Sonner Configuration**: Configurare correttamente sonner per styling personalizzato
- [ ] **Component Update**: Aggiornare tutti i componenti che usano toast per nuovo styling

### 📊 **ANALYTICS DASHBOARD FIXES**
- [ ] **Historical Orders Charts**: Analytics Dashboard non mostra grafici degli ordini dei mesi passati
- [ ] **Monthly Orders Visualization**: Implementare grafici per visualizzare ordini storici per mese
- [ ] **Date Range Analytics**: Assicurarsi che il selettore di date funzioni correttamente per periodi passati
- [ ] **Orders Metrics History**: Mostrare metriche storiche degli ordini (volume, revenue, trend)
- [ ] **Charts Data Loading**: Verificare che i dati storici vengano caricati correttamente dal database
- [ ] **Remove Blue Info Box**: Eliminare il box azzurro "Informazioni sul periodo di default" che rovina la grafica
- [ ] **Consistent Dashboard Design**: Applicare stessi colori, font e spacing dell'applicazione principale
- [ ] **Clean Dashboard Layout**: Rivedere completamente il layout per una dashboard pulita e professionale

### 🔐 **LOGIN PAGE DESIGN FIXES**
- [ ] **Right Panel Redesign**: La parte destra di /auth/login non è in linea con il design dell'app
- [ ] **Remove "Conversational E-commerce, Reimagined"**: Testo non appropriato e non coerente
- [ ] **Color Consistency**: Applicare la palette colori dell'applicazione principale
- [ ] **Typography Alignment**: Utilizzare gli stessi font e sizing del resto dell'app
- [ ] **Icon Redesign**: Sostituire icone non coerenti con il design system dell'applicazione
- [ ] **Content Strategy**: Rivedere completamente il contenuto della sezione destra
- [ ] **Brand Consistency**: Assicurarsi che il branding sia coerente con ShopMe

### 🔧 **N8N INTEGRATION SIMPLIFICATION** (ALTA PRIORITÀ)
- [ ] **Remove N8N Workflow URL**: L'URL del workflow N8N non è dinamico e non funziona correttamente
- [ ] **Remove N8N Frontend Integration**: Togliere tutta l'integrazione N8N dal frontend per semplificare
- [ ] **Clean N8N Components**: Rimuovere N8NPage.tsx e componenti correlati
- [ ] **Remove N8N Routes**: Eliminare /settings/n8n route e navigation
- [ ] **Clean N8N Services**: Rimuovere servizi e API calls N8N dal frontend
- [ ] **Simplify Architecture**: Mantenere solo il backend N8N workflow, rimuovere UI
- [ ] **Future Integration Planning**: Documentare per integrazione futura quando necessario

### 👤 **USER AVATAR IMPROVEMENTS**
- [ ] **Increase Avatar Size**: L'icona rotonda con le iniziali in alto a destra è troppo piccola
- [ ] **Better Visibility**: Rendere l'avatar più visibile e prominente
- [ ] **Size Optimization**: Aumentare le dimensioni per migliorare l'usabilità
- [ ] **Consistent Sizing**: Assicurarsi che sia proporzionato al resto dell'header
- [ ] **Accessibility**: Migliorare l'accessibilità con dimensioni adeguate per touch/click

### 📋 **ORDERS PAGE IMPROVEMENTS** (ALTA PRIORITÀ)
- [ ] **Add Status Filter**: Implementare filtro per status ordini (Pending, Confirmed, Shipped, Delivered, Cancelled)
- [ ] **Add Customer Filter**: Implementare filtro dropdown per selezionare cliente specifico
- [ ] **Add Date Range Filter**: Implementare selettore di range date per filtrare ordini per periodo
- [ ] **Remove Email from List**: Eliminare la visualizzazione delle email dalla lista ordini (es: test.customer@shopme.com)
- [ ] **Optimize Customer Display**: Mostrare solo nome e cognome del cliente, non l'email
- [ ] **Filter Combination**: Permettere combinazione di filtri (status + cliente + data)
- [ ] **Clear Filters**: Bottone per resettare tutti i filtri applicati

## 🔐 **AUTHENTICATION IMPROVEMENTS** (ALTA PRIORITÀ)

### ⏰ **USER STORY: EXTENDED SESSION DURATION - Sessione Login Persistente**

**COME** utente amministratore che lavora sulla piattaforma  
**VOGLIO** che la mia sessione di login duri 1 ora senza dover rifare il login  
**COSÌ CHE** possa lavorare in modo fluido senza interruzioni continue per l'autenticazione

#### 📋 **ACCEPTANCE CRITERIA - SESSION MANAGEMENT:**

##### **🔒 TOKEN & SESSION MANAGEMENT:**
- [ ] **1 Hour Session**: Estendere durata sessione JWT da attuale a 1 ora (3600 secondi)
- [ ] **Auto Token Refresh**: Implementare refresh automatico del token prima della scadenza
- [ ] **Silent Renewal**: Rinnovo silenzioso del token senza interruzione dell'esperienza utente
- [ ] **Session Persistence**: Mantenere sessione attiva durante l'uso dell'applicazione
- [ ] **Logout on Inactivity**: Logout automatico solo dopo 1 ora di inattività completa

##### **🎯 TECHNICAL IMPLEMENTATION:**
- [ ] **JWT Expiration**: Configurare JWT con `expiresIn: '1h'` nel backend
- [ ] **Frontend Token Storage**: Gestione sicura del token nel localStorage/sessionStorage
- [ ] **API Interceptors**: Interceptor per gestire token scaduti e refresh automatico
- [ ] **Session Monitoring**: Monitoraggio attività utente per reset timer inattività
- [ ] **Secure Logout**: Pulizia completa token e dati sessione al logout

##### **🔄 USER EXPERIENCE:**
- [ ] **Seamless Experience**: Nessuna interruzione durante il lavoro normale
- [ ] **Clear Session Info**: Indicatore visivo tempo rimanente sessione (opzionale)
- [ ] **Graceful Expiry**: Messaggio chiaro quando sessione scade naturalmente
- [ ] **Quick Re-login**: Processo di re-login veloce se necessario

## 🚨 **CHAT INTERFACE ENHANCEMENTS** (ALTISSIMA PRIORITÀ - GENNAIO 2025)

### 👁️ **USER STORY: VIEW ORDERS - Sistema Visualizzazione Ordini Cliente**

**COME** cliente registrato che ha effettuato ordini  
**VOGLIO** visualizzare tutti i miei ordini storici cliccando "View orders" nella chat  
**COSÌ CHE** possa controllare lo stato, i dettagli e la cronologia dei miei acquisti

#### 📋 **ACCEPTANCE CRITERIA - VIEW ORDERS:**

##### **🔐 SICUREZZA & ACCESSO:**
- [ ] **Token Security**: Sistema di token temporanei JWT (1 ora validità) per accesso sicuro
- [ ] **Customer Isolation**: Filtro rigoroso per `workspaceId` + `customerId` - mai mostrare ordini di altri
- [ ] **URL Protection**: Link sicuro tipo `domain.com/customer/orders?token=JWT_TOKEN`
- [ ] **Token Validation**: Verifica token validity, expiration, customer ownership
- [ ] **Error Handling**: Redirect a pagina errore se token invalido/scaduto

##### **🎨 UI/UX CUSTOMER ORDERS PAGE:**
- [ ] **Customer-Focused Design**: Design semplice e chiaro per cliente finale (non admin)
- [ ] **Responsive Layout**: Funzionale su mobile (principale device per WhatsApp users)
- [ ] **Order Cards**: Card layout per ogni ordine con info essenziali
- [ ] **Status Indicators**: Badge colorati per stati (Pending, Shipped, Delivered, etc.)
- [ ] **Quick Actions**: Bottoni "View Details", "Track Order", "Reorder" (se applicabile)

##### **📊 ORDERS TABLE/LIST:**
- [ ] **Essential Columns**: Order Code, Data, Status, Totale, Azioni
- [ ] **Sort by Date**: Ordini ordinati per data (più recenti primi)
- [ ] **Status Filtering**: Filtro dropdown per status ordini
- [ ] **Date Range Filter**: Filtro per periodo (ultimo mese, 3 mesi, 6 mesi, tutto)
- [ ] **Search Function**: Ricerca per order code o prodotto
- [ ] **Pagination**: Gestione ordini multipli con paginazione

##### **🔍 ORDER DETAIL VIEW:**
- [ ] **Complete Order Info**: Modal/sheet con tutti i dettagli ordine
- [ ] **Products List**: Lista prodotti ordinati con quantità e prezzi
- [ ] **Shipping Info**: Indirizzo spedizione e metodo scelto
- [ ] **Payment Details**: Metodo pagamento e status (senza dati sensibili)
- [ ] **Order Timeline**: Cronologia stati ordine con date
- [ ] **Tracking Info**: Numero tracking se disponibile

##### **🔗 INTEGRATION & BACKEND:**
- [ ] **Secure Endpoint**: `/api/customer/orders?token=JWT_TOKEN`
- [ ] **N8N Integration**: Calling function per generare link ordini sicuro
- [ ] **Customer Service**: Nuovo servizio per gestione ordini cliente
- [ ] **Database Queries**: Query ottimizzate con proper indexing
- [ ] **Error Responses**: Gestione errori con messaggi user-friendly

#### 🚀 **TECHNICAL IMPLEMENTATION:**

##### **Files to Create/Modify:**
- [ ] `frontend/src/pages/CustomerOrdersPage.tsx` - Pagina principale ordini cliente
- [ ] `backend/src/routes/customer.routes.ts` - Route per accesso cliente
- [ ] `backend/src/controllers/customer.controller.ts` - Controller ordini cliente
- [ ] `backend/src/services/customer-orders.service.ts` - Business logic ordini
- [ ] `backend/src/chatbot/calling-functions/generateOrdersLink.ts` - N8N function
- [ ] `frontend/src/components/customer/OrderCard.tsx` - Component card ordine
- [ ] `frontend/src/components/customer/OrderDetail.tsx` - Modal dettaglio

---

### 🚫 **USER STORY: BLOCK USER - Sistema Blocco Utenti Chat**

**COME** operatore customer service  
**VOGLIO** bloccare immediatamente un utente problematico cliccando "Block user" nella chat  
**COSÌ CHE** il numero venga automaticamente aggiunto alla blocklist e non possa più inviare messaggi

#### 📋 **ACCEPTANCE CRITERIA - BLOCK USER:**

##### **🎯 FUNZIONALITÀ CORE:**
- [ ] **One-Click Block**: Click su "Block user" → utente immediatamente bloccato
- [ ] **Automatic Blocklist**: Numero telefono aggiunto automaticamente a `workspace.blocklist`
- [ ] **Immediate Effect**: Messaggi successivi dell'utente bloccati dal sistema
- [ ] **Visual Feedback**: Toast notification conferma blocco + UI update
- [ ] **Persistent Block**: Blocco permanente fino a rimozione manuale da admin

##### **🗄️ DATABASE & STORAGE:**
- [ ] **Blocklist Format**: Numeri separati da newline (`\n`) nel campo `workspace.blocklist`
- [ ] **Duplicate Prevention**: Controllo che numero non sia già in blocklist
- [ ] **Phone Normalization**: Normalizzazione formato numero (+393451234567)
- [ ] **Workspace Isolation**: Blocklist separata per ogni workspace
- [ ] **Audit Trail**: Log dell'azione di blocco (user, timestamp, motivo)

##### **🔒 SICUREZZA & PERMESSI:**
- [ ] **Permission Check**: Solo utenti con permessi workspace possono bloccare
- [ ] **Admin Override**: Admin può sempre bloccare/sbloccare
- [ ] **Self-Block Prevention**: Impedire auto-blocco dell'operatore
- [ ] **Role Validation**: Verifica ruolo utente prima dell'azione
- [ ] **Workspace Validation**: Controllo appartenenza workspace

##### **🔄 SYSTEM INTEGRATION:**
- [ ] **N8N Integration**: Sistema N8N controlla blocklist prima di processare messaggi
- [ ] **Spam Detection**: Integrazione con sistema anti-spam esistente
- [ ] **Message Flow**: Blocco integrato nel flusso message processing
- [ ] **WhatsApp Integration**: Nessuna risposta automatica per utenti bloccati
- [ ] **Analytics Exclusion**: Utenti bloccati esclusi da analytics

##### **🎨 UI/UX ENHANCEMENTS:**
- [ ] **Button State**: Stato button "Block user" → "Blocked" dopo azione
- [ ] **Confirmation Modal**: Modal conferma blocco con motivo (optional)
- [ ] **Undo Option**: Possibilità di sbloccare immediatamente (entro 30 sec)
- [ ] **Visual Indicators**: Indicatore visivo utente bloccato nella chat
- [ ] **Admin Panel**: Gestione blocklist in settings workspace

##### **📡 API & BACKEND:**
- [ ] **Internal Endpoint**: `/api/internal/block-user` per azione blocco
- [ ] **Validation Logic**: Controlli sicurezza e duplicati
- [ ] **Response Format**: Response standardizzato con success/error
- [ ] **Error Handling**: Gestione errori con messaggi specifici
- [ ] **Performance**: Operazione veloce (< 500ms)

#### 🚀 **TECHNICAL IMPLEMENTATION:**

##### **Files to Create/Modify:**
- [ ] `backend/src/routes/internal.routes.ts` - Aggiungere endpoint block-user
- [ ] `backend/src/controllers/internal.controller.ts` - Metodo blockUser
- [ ] `backend/src/services/workspace.service.ts` - Metodo addToBlocklist
- [ ] `frontend/src/pages/ChatPage.tsx` - Handler per Block User button
- [ ] `frontend/src/services/internalApi.ts` - Chiamata API block user
- [ ] `backend/src/middleware/block-validation.middleware.ts` - Validazione blocklist
- [ ] `frontend/src/components/chat/BlockUserModal.tsx` - Modal conferma

##### **Database Schema:**
```sql
-- Workspace blocklist field (già esistente)
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS blocklist TEXT DEFAULT '';

-- Audit log per blocchi (nuovo)
CREATE TABLE user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id),
  phone_number VARCHAR(20) NOT NULL,
  blocked_by UUID NOT NULL REFERENCES users(id),
  blocked_at TIMESTAMP DEFAULT NOW(),
  unblocked_at TIMESTAMP NULL,
  reason TEXT,
  
  INDEX idx_blocks_workspace_phone (workspace_id, phone_number),
  INDEX idx_blocks_date (blocked_at DESC)
);
```

##### **Business Logic Flow:**
```typescript
// Block User Flow
1. User clicks "Block User" button
2. Frontend calls `/api/internal/block-user`
3. Backend validates permissions & workspace
4. Add phone to workspace.blocklist field
5. Create audit log entry
6. Return success response
7. Frontend shows confirmation toast
8. UI updates to show blocked state
```

---

### 📊 **USER STORY: ANALYTICS UI/UX REDESIGN - Coerenza Design System**

**COME** amministratore ShopMe  
**VOGLIO** che la pagina Analytics abbia la stessa grafica e coerenza delle altre sezioni  
**COSÌ CHE** l'interfaccia sia uniforme e professionale in tutta l'applicazione

#### 📋 **ACCEPTANCE CRITERIA - ANALYTICS REDESIGN:**

##### **🎨 DESIGN SYSTEM ALIGNMENT:**
- [ ] **Consistent Header**: Stesso header style di Products/Categories/Customers (title, breadcrumb, actions)
- [ ] **Typography Harmony**: Font families, sizes, weights consistenti con resto app
- [ ] **Color Palette**: Uso colori ShopMe standard (primary blue, secondary gray, success green)
- [ ] **Spacing & Layout**: Margin, padding, grid system identici alle altre pagine
- [ ] **Component Library**: Riuso Button, Card, Badge, Table components esistenti
- [ ] **Icons Consistency**: Stesso icon set e styling delle altre sezioni

##### **🗓️ DATE PICKER ENHANCEMENT:**
- [ ] **Modern Date Picker**: Sostituire date picker attuale con component moderno e user-friendly
- [ ] **Preset Ranges**: Quick select per "Last 7 days", "Last 30 days", "Last 3 months", "Last year"
- [ ] **Custom Range**: Date picker per range personalizzato con validazione
- [ ] **Mobile Responsive**: Date picker funzionale su mobile/tablet
- [ ] **Consistent Styling**: Stesso styling dei form elements nelle altre pagine
- [ ] **Clear Actions**: Bottoni "Apply", "Clear", "Cancel" ben visibili e consistenti

##### **📈 CHARTS & VISUALIZATIONS:**
- [ ] **Chart Library Upgrade**: Migrare a libreria moderna (Chart.js, Recharts, o simile)
- [ ] **Color Scheme**: Colori charts allineati al design system ShopMe
- [ ] **Interactive Elements**: Hover states, tooltips, zoom consistenti
- [ ] **Responsive Charts**: Grafici che si adattano a diverse screen sizes
- [ ] **Loading States**: Skeleton loaders consistenti con resto app
- [ ] **Error States**: Gestione errori con messaging uniforme

##### **📊 METRICS CARDS REDESIGN:**
- [ ] **Card Component**: Uso stesso Card component di Products/Services pages
- [ ] **Metric Layout**: Layout consistente per KPI cards (icon, value, label, trend)
- [ ] **Trend Indicators**: Frecce e percentuali con colori standard (green/red)
- [ ] **Hover Effects**: Stessi hover effects delle altre cards
- [ ] **Grid System**: Responsive grid layout come altre dashboard sections
- [ ] **Loading Placeholders**: Skeleton cards durante loading

##### **🔄 NAVIGATION & FILTERS:**
- [ ] **Filter Bar**: Barra filtri consistente con altre pagine (status, date, category)
- [ ] **Search Function**: Search bar con stesso styling di Products/Categories
- [ ] **Export Actions**: Bottoni export con stesso design delle altre sezioni
- [ ] **Refresh Button**: Action button per refresh dati con loading state
- [ ] **View Options**: Toggle per view mode (cards/table) se applicabile

##### **📱 MOBILE RESPONSIVENESS:**
- [ ] **Mobile Layout**: Layout ottimizzato per mobile come altre pagine
- [ ] **Touch Interactions**: Swipe, tap, scroll ottimizzati per touch
- [ ] **Chart Mobile**: Grafici leggibili e interattivi su mobile
- [ ] **Filter Drawer**: Filtri in drawer/modal su mobile
- [ ] **Performance**: Loading veloce su connessioni mobili

##### **⚡ PERFORMANCE & UX:**
- [ ] **Loading Speed**: Caricamento dati veloce con progressive loading
- [ ] **Caching Strategy**: Cache dati analytics per performance
- [ ] **Smooth Transitions**: Animazioni fluide tra date ranges e filtri
- [ ] **Error Handling**: Messaggi errore user-friendly e recovery options
- [ ] **Data Refresh**: Auto-refresh opzionale con indicator

#### 🚀 **TECHNICAL IMPLEMENTATION:**

##### **Files to Refactor:**
- [ ] `frontend/src/pages/AnalyticsPage.tsx` - Redesign completo pagina
- [ ] `frontend/src/components/analytics/` - Refactor tutti i components analytics
- [ ] `frontend/src/components/analytics/DateRangeSelector.tsx` - Nuovo date picker
- [ ] `frontend/src/components/analytics/MetricsCard.tsx` - Card component uniforme
- [ ] `frontend/src/components/analytics/AnalyticsChart.tsx` - Charts modernizzati
- [ ] `frontend/src/components/analytics/FilterBar.tsx` - Barra filtri consistente
- [ ] `frontend/src/styles/analytics.css` - CSS cleanup e alignment

##### **Design System Components to Use:**
- [ ] **Card Component**: `src/components/ui/card.tsx`
- [ ] **Button Component**: `src/components/ui/button.tsx`
- [ ] **Date Picker**: Nuovo component basato su `react-day-picker` o simile
- [ ] **Badge Component**: `src/components/ui/badge.tsx` per status indicators
- [ ] **Table Component**: Se necessario per data tables
- [ ] **Loading Component**: Skeleton loaders uniformi

##### **Chart Library Migration:**
- [ ] **Research**: Valutare Chart.js vs Recharts vs Victory
- [ ] **Color Tokens**: Definire palette colori charts nel design system
- [ ] **Component Wrapper**: Creare wrapper components per charts riutilizzabili
- [ ] **Responsive Config**: Configurazione responsive per tutti i chart types
- [ ] **Accessibility**: Ensure charts sono accessibili (screen readers, keyboard nav)

##### **Date Picker Implementation:**
```typescript
// Nuovo DateRangeSelector component
interface DateRangeProps {
  value: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date }) => void
  presets?: Array<{ label: string; range: { from: Date; to: Date } }>
  maxDate?: Date
  minDate?: Date
}

// Preset ranges standard
const DEFAULT_PRESETS = [
  { label: "Last 7 days", range: { from: subDays(new Date(), 7), to: new Date() } },
  { label: "Last 30 days", range: { from: subDays(new Date(), 30), to: new Date() } },
  { label: "Last 3 months", range: { from: subMonths(new Date(), 3), to: new Date() } },
  { label: "Last year", range: { from: subYears(new Date(), 1), to: new Date() } }
]
```

##### **Metrics Cards Standardization:**
```typescript
// Standard MetricsCard interface
interface MetricsCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  icon?: React.ReactNode
  loading?: boolean
  error?: string
  onClick?: () => void
}
```

#### ⏱️ **ESTIMATION & PRIORITY:**

##### **PHASE 1 - FOUNDATION (1 settimana):**
- Design system audit e planning
- Date picker component moderno
- Base layout restructuring

##### **PHASE 2 - COMPONENTS (1-2 settimane):**
- Metrics cards redesign
- Charts library migration
- Filter bar implementation

##### **PHASE 3 - POLISH (1 settimana):**
- Mobile responsiveness
- Performance optimization
- Testing e bug fixes

##### **TOTAL ESTIMATION: 3-4 settimane**

---

### 📦 **USER STORY: ORDERS PAGE CRITICAL FIXES - COMPLETED ✅**

**COME** amministratore che gestisce ordini  
**VOGLIO** che la pagina Orders funzioni correttamente con tutti i dettagli visibili  
**COSÌ CHE** possa gestire ordini con codici corretti, status colorati, edit completo e delete funzionante

#### 📋 **ACCEPTANCE CRITERIA - ORDERS FIXES:**

##### **✅ COMPLETATI:**
- [x] **Order Code Format**: Codici ordine a 5 cifre numeriche (10001-99999) invece di timestamp lunghi
- [x] **Status Badge Colors**: Badge colorati per ogni status (PENDING=giallo, PROCESSING=viola, DELIVERED=verde, etc.)
- [x] **Single Edit Icon**: Rimossa icona edit doppia, usa solo quella standard come altre sezioni
- [x] **Edit Form Details**: Form edit mostra order items, shipping address, customer read-only
- [x] **Customer Read-Only**: Customer non selezionabile in edit mode, mostra info esistente
- [x] **Shipping Address**: Visibile nel form di edit se presente nell'ordine
- [x] **Delete Function**: Fix delete API call e gestione errori migliorata
- [x] **Order Code Validation**: Input accetta solo numeri, max 5 cifre, placeholder "12345"
- [x] **Seed Script**: Generazione ordini con codici 5 cifre (10001+ e 20001+)
- [x] **Service Layer**: generateOrderCode() aggiornato per numeri random 10000-99999

##### **🎨 IMPROVEMENTS IMPLEMENTED:**
- **Color Coding**: Status badges con colori distinti per migliore UX
- **Form Enhancement**: Edit form completo con tutti i dettagli ordine
- **Data Integrity**: Validazione rigorosa per order codes numerici
- **Error Handling**: Messaggi errore più informativi per delete failures

##### **TOTAL ESTIMATION: 1 giornata - COMPLETATO**

---

### 👥 **USER STORY: CUSTOMERS/CLIENTS PAGE LAYOUT STANDARDIZATION**

**COME** amministratore ShopMe  
**VOGLIO** che la pagina Customers abbia lo stesso layout delle altre sezioni (Products, Categories, Services)  
**COSÌ CHE** il count sia sotto il titolo e l'interfaccia sia uniforme in tutta l'applicazione

#### 📋 **ACCEPTANCE CRITERIA - CUSTOMERS LAYOUT FIX:**

##### **🎨 LAYOUT STANDARDIZATION:**
- [ ] **Header Layout**: Stesso header layout di Products/Categories/Services/FAQs
- [ ] **Title Position**: Titolo "Customers" nella stessa posizione delle altre pagine
- [ ] **Count Display**: Count clienti sotto il titolo come "47 customers" (stesso styling altre pagine)
- [ ] **Action Buttons**: Bottoni "Add Customer", "Export", "Import" allineati come altre sezioni
- [ ] **Breadcrumb**: Breadcrumb navigation consistente se presente
- [ ] **Page Spacing**: Margin e padding identici alle altre pagine

##### **📊 TABLE & CONTENT CONSISTENCY:**
- [ ] **Table Layout**: Stesso table component e styling di Products/Categories
- [ ] **Column Headers**: Header styling identico (font, color, spacing)
- [ ] **Row Styling**: Alternating rows, hover effects, selection come altre tabelle
- [ ] **Action Buttons**: Edit/Delete/View buttons con stesso styling
- [ ] **Status Badges**: Badge Active/Inactive con colori standard del design system
- [ ] **Pagination**: Stessa paginazione di Products/Categories (styling e funzionalità)

##### **🔍 FILTERS & SEARCH CONSISTENCY:**
- [ ] **Search Bar**: Search input con stesso styling delle altre pagine
- [ ] **Filter Dropdown**: Filtri (Active/Inactive, Date Range) con design uniforme
- [ ] **Clear Filters**: Bottone clear filters posizionato come altre sezioni
- [ ] **Results Count**: "Showing X of Y customers" con stesso formatting
- [ ] **No Results State**: Empty state consistente con altre pagine

##### **📱 RESPONSIVE BEHAVIOR:**
- [ ] **Mobile Layout**: Layout mobile identico a Products/Categories
- [ ] **Table Responsive**: Tabella responsive con stesso comportamento
- [ ] **Filter Drawer**: Filtri in drawer su mobile come altre sezioni
- [ ] **Action Menu**: Menu azioni mobile consistente

##### **🎯 COMPONENT REUSE:**
- [ ] **PageLayout Component**: Uso stesso PageLayout wrapper delle altre pagine
- [ ] **DataTable Component**: Riuso DataTable component esistente
- [ ] **FilterBar Component**: Uso FilterBar component standardizzato
- [ ] **ActionButton Component**: Bottoni azioni con componenti uniformi
- [ ] **EmptyState Component**: Empty state component riutilizzabile

#### 🚀 **TECHNICAL IMPLEMENTATION:**

##### **Files to Audit & Fix:**
- [ ] `frontend/src/pages/CustomersPage.tsx` - Layout audit e standardization
- [ ] `frontend/src/pages/products/ProductsPage.tsx` - Reference layout (GOOD)
- [ ] `frontend/src/pages/CategoriesPage.tsx` - Reference layout (GOOD)
- [ ] `frontend/src/pages/ServicesPage.tsx` - Reference layout (GOOD)
- [ ] `frontend/src/pages/FAQPage.tsx` - Reference layout (GOOD)
- [ ] `frontend/src/components/shared/PageLayout.tsx` - Layout wrapper component
- [ ] `frontend/src/components/shared/PageHeader.tsx` - Header component uniforme

##### **Layout Comparison Audit:**
```typescript
// STANDARD LAYOUT PATTERN (Products, Categories, Services, FAQs)
const StandardPageLayout = () => (
  <PageLayout>
    <PageHeader 
      title="Products" 
      count="47 products"
      actions={[
        <Button>Add Product</Button>,
        <Button variant="outline">Export</Button>
      ]}
    />
    <FilterBar />
    <DataTable />
    <Pagination />
  </PageLayout>
)

// CURRENT CUSTOMERS LAYOUT (DA SISTEMARE)
// Verificare se segue questo pattern o ha deviazioni
```

##### **Header Component Standardization:**
- [ ] **Title Typography**: H1 con stesso font-size, weight, color
- [ ] **Count Subtitle**: Subtitle sotto titolo con count formattato
- [ ] **Actions Container**: Container bottoni allineato a destra
- [ ] **Spacing**: Margin bottom standard prima del contenuto
- [ ] **Responsive**: Comportamento mobile identico

##### **Count Display Format:**
```typescript
// Standard count format per tutte le pagine
const formatCount = (count: number, entityName: string) => {
  const pluralEntity = count === 1 ? entityName : `${entityName}s`
  return `${count} ${pluralEntity.toLowerCase()}`
}

// Examples:
// "47 products"
// "23 categories" 
// "156 customers"
// "89 services"
// "12 faqs"
```

##### **CSS Classes Standardization:**
- [ ] **Page Container**: `.page-container` class uniforme
- [ ] **Header Section**: `.page-header` styling identico
- [ ] **Title Classes**: `.page-title` e `.page-subtitle` uniformi
- [ ] **Action Classes**: `.page-actions` container styling
- [ ] **Content Classes**: `.page-content` area principale

#### 🔍 **AUDIT CHECKLIST:**

##### **Compare Customers vs Other Pages:**
- [ ] **Header Height**: Verificare altezza header identica
- [ ] **Title Font**: Font-size, weight, color del titolo
- [ ] **Count Position**: Posizione e styling del count
- [ ] **Button Alignment**: Allineamento bottoni azioni
- [ ] **Content Spacing**: Spazio tra header e contenuto
- [ ] **Grid Layout**: Layout griglia tabella
- [ ] **Filter Position**: Posizione barra filtri

##### **Visual Consistency Check:**
- [ ] **Color Usage**: Colori primary, secondary, accent uniformi
- [ ] **Shadow Effects**: Drop shadows consistenti
- [ ] **Border Radius**: Border radius uniforme su cards/buttons
- [ ] **Hover States**: Hover effects identici
- [ ] **Focus States**: Focus indicators uniformi
- [ ] **Loading States**: Skeleton loaders consistenti

#### ⏱️ **ESTIMATION & PRIORITY:**

##### **QUICK FIX (2-3 giorni):**
- Layout audit e identificazione differenze
- Header standardization
- Count display fix

##### **TOTAL ESTIMATION: 1 settimana massimo** (fix relativamente semplice)

**PRIORITY: ALTA** - Fix veloce per coerenza UI/UX

---

## 🚨 **CHUNK OPTIMIZATION CRITICAL** (ALTISSIMA PRIORITÀ - GENNAIO 2025)

### 🧩 **USER STORY: OTTIMIZZAZIONE CHUNKING STRATEGY**

**PROBLEMA IDENTIFICATO**: Il documento `international-transportation-law.pdf` (3.4MB) genera 7602 chunks con la configurazione attuale, causando:
- ⏱️ **Performance degradata**: ~12.6 minuti solo per embeddings generation
- 🗄️ **Database overhead**: 7602 record × embedding vector = storage eccessivo  
- 🔍 **Perdita di contesto**: chunk di 500 caratteri troppo piccoli per documenti legali
- 💾 **Memory issues**: processing di migliaia di chunks simultanei

**COME** sviluppatore ShopMe  
**VOGLIO** ottimizzare la strategia di chunking per documenti grandi  
**COSÌ CHE** il sistema possa gestire PDF complessi mantenendo performance e qualità RAG

#### 📋 **ACCEPTANCE CRITERIA - CHUNK OPTIMIZATION:**

##### **🎯 CONFIGURAZIONE OTTIMIZZATA:**
- [ ] **Chunk Size Increase**: Aumentare MAX_CHUNK_SIZE da 500 a **1500-2000 caratteri**
- [ ] **Overlap Enhancement**: Aumentare CHUNK_OVERLAP da 200 a **300-400 caratteri**
- [ ] **Adaptive Chunking**: Dimensioni diverse per tipo contenuto (FAQ=800, Products=1200, Documents=2000)
- [ ] **Smart Boundaries**: Priorità a fine frase/paragrafo per mantenere contesto semantico
- [ ] **Chunk Quality**: Evitare split di parole, frasi incomplete, tabelle frammentate

##### **📊 ANALISI IMPATTO ATTUALE:**
- [x] **Current Analysis**: ✅ COMPLETED - 73 chunks totali (61 products + 10 FAQs + 2 services + 0 documents)
- [x] **Size Distribution**: ✅ COMPLETED - Products avg 363 chars, FAQs avg 195 chars, Services avg 156 chars  
- [ ] **Document Impact**: Stimare riduzione chunks per international-transportation-law.pdf (da 7602 a ~2500)
- [ ] **Performance Gain**: Calcolare riduzione tempo processing (da 12.6min a ~4.2min)
- [ ] **Storage Optimization**: Stimare riduzione storage database (~65% reduction)

##### **🔧 TECHNICAL IMPLEMENTATION:**
- [ ] **EmbeddingService Update**: Modificare parametri MAX_CHUNK_SIZE e CHUNK_OVERLAP in embeddingService.ts
- [ ] **Content-Type Specific**: Implementare chunking adattivo per Documents, FAQs, Products, Services
- [ ] **Boundary Detection**: Migliorare algoritmo split per rispettare boundaries semantici
- [ ] **Batch Processing**: Ottimizzare processing per evitare memory overflow con documenti grandi
- [ ] **Progress Tracking**: Aggiungere progress tracking per long-running operations

##### **🗄️ DATABASE MIGRATION:**
- [ ] **Chunk Regeneration**: Script per rigenerare tutti i chunks esistenti con nuova configurazione
- [ ] **Backup Strategy**: Backup chunks esistenti prima della migrazione
- [ ] **Rollback Plan**: Piano di rollback in caso di problemi
- [ ] **Index Optimization**: Ottimizzare indici database per gestire chunks più grandi
- [ ] **Performance Testing**: Test performance prima/dopo ottimizzazione

##### **📈 QUALITY ASSURANCE:**
- [ ] **Semantic Quality**: Verificare che chunks più grandi mantengano qualità semantica
- [ ] **Search Accuracy**: Test accuracy ricerca con chunks ottimizzati vs attuali
- [ ] **Context Preservation**: Verificare che contesto non venga perso con overlap aumentato
- [ ] **Edge Cases**: Test con documenti molto grandi, molto piccoli, formati diversi
- [ ] **RAG Performance**: Benchmark qualità risposte RAG prima/dopo ottimizzazione

#### ⚡ **SOLUZIONE IMMEDIATA (HOTFIX):**

##### **STEP 1 - INTERRUPT CURRENT PROCESSING:**
- [ ] **Stop Current Seed**: Interrompere processing corrente del documento PDF
- [ ] **Reset Document Status**: Impostare status da PROCESSING a UPLOADED per retry
- [ ] **Clear Partial Chunks**: Eliminare eventuali chunks parziali creati

##### **STEP 2 - QUICK CONFIGURATION UPDATE:**
- [ ] **Increase Chunk Size**: Aggiornare MAX_CHUNK_SIZE a 1500 caratteri
- [ ] **Increase Overlap**: Aggiornare CHUNK_OVERLAP a 300 caratteri  
- [ ] **Test New Config**: Test rapido con documento piccolo

##### **STEP 3 - REPROCESS DOCUMENT:**
- [ ] **Regenerate PDF Chunks**: Riprocessare international-transportation-law.pdf con nuova config
- [ ] **Monitor Performance**: Verificare riduzione tempo e chunks generati
- [ ] **Validate Quality**: Test rapido qualità search results

#### 📊 **EXPECTED RESULTS:**

##### **BEFORE OPTIMIZATION:**
- 📄 **Document Chunks**: 7602 chunks × 500 chars = 3.8M chars
- ⏱️ **Processing Time**: ~12.6 minutes  
- 💾 **Storage**: 7602 records + embeddings
- 🔍 **Context Quality**: Frammentato, perdita contesto

##### **AFTER OPTIMIZATION:**
- 📄 **Document Chunks**: ~2500 chunks × 1500 chars = 3.75M chars
- ⏱️ **Processing Time**: ~4.2 minutes (**-67% faster**)
- 💾 **Storage**: 2500 records + embeddings (**-67% storage**)
- 🔍 **Context Quality**: Migliorato, contesto preservato

#### ⏱️ **ESTIMATION:**
- **Hotfix Implementation**: 2-3 ore
- **Full Optimization**: 1-2 giorni  
- **Testing & Validation**: 1 giorno
- **TOTAL**: 2-3 giorni

#### 🚨 **PRIORITY JUSTIFICATION:**
- **CRITICAL**: Sistema attualmente bloccato su processing documento
- **PERFORMANCE**: 67% improvement in processing time
- **SCALABILITY**: Necessario per gestire documenti enterprise
- **USER EXPERIENCE**: Riduzione drastica tempi attesa
- **COST OPTIMIZATION**: Riduzione storage e compute costs

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