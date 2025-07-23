## TASK #24

**TITLE**: N8N - CF New Order
**DESCRIPTION/ROADMAP**:

- Implement a new N8N Custom Function (CF) for the "New Order" workflow
- Integrate with backend as needed
- Ensure proper error handling and logging
- Test the workflow end-to-end

**SPECIAL NOTE**:
Andrea requires a dedicated N8N CF for new order management.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #38

**TITLE**: Implement 'Aviso legal' PDF Upload and Integration
**DESCRIPTION/ROADMAP**:

- Create a legal notice ('Aviso legal') PDF document
- Upload the PDF to the system and ensure it is stored correctly (e.g., in the documents section or appropriate storage)
- Integrate the PDF so it is accessible from the relevant section (e.g., legal, compliance, or info page)
- Test the upload and retrieval process to verify PDF/document management works as expected
- Use this as a test case for document/PDF management features

**SPECIAL NOTE**:
Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.

**STATUS**: 🔴 Not Started

================================================================================

## TASK #39

**TITLE**: Checkout Flow con Gestione Stock Completa
**DESCRIPTION/ROADMAP**:

#### **1. CUSTOM FUNCTION N8N** ✅ IMPLEMENTATO
**File**: `backend/src/chatbot/calling-functions/createOrderCheckoutLink.ts`
- Implementa `createOrderCheckoutLink(customerId, workspaceId, prodotti[])`
- Genera token sicuro crypto SHA256 con scadenza 1 ora
- Salva in `secure_tokens` table con type='checkout' e payload prodotti
- Ritorna URL: `${FRONTEND_URL}/checkout/${token}`
- **Validazioni**: Customer exists, Workspace exists, Prodotti array non vuoto
- **Trigger**: Solo quando utente esprime intent di conferma ordine

#### **2. PAGINA CHECKOUT COMPLETA** ✅ IMPLEMENTATO  
**File**: `frontend/src/pages/CheckoutPage.tsx` + Route `/checkout/:token`
- **Design**: Pattern identico a `/register` (fuori auth, responsive)
- **Token Validation**: API call a `/api/checkout/token/:token`
- **Pre-fill Data**: Indirizzi da `customer.address` e `customer.invoiceAddress`

**STEP 1 - Carrello Avanzato**:
- View prodotti dal token con quantità/prezzo
- Edit quantità (max = stock disponibile) con controlli real-time
- Remove prodotti con conferma
- **Add Modal**: Prodotti attivi filtrati `isActive=true AND stock>0`
  - Lista prodotti con stock indicators
  - Selezione quantità con limiti stock
  - Validazione disponibilità prima aggiunta

**STEP 2 - Indirizzi Smart**:
- Pre-compilazione automatica da customer data
- Checkbox "Stesso indirizzo fatturazione"
- Validazione campi obbligatori

**STEP 3 - Conferma & Submit**:
- Riepilogo completo ordine
- Campo note aggiuntive
- Submit con loading states

#### **3. API BACKEND COMPLETO** ✅ IMPLEMENTATO
**Files**: `backend/src/interfaces/http/routes/checkout.routes.ts` + `checkout.controller.ts`
- **GET `/api/checkout/token/:token`**: Validazione token + return customer/prodotti data
- **POST `/api/checkout/submit`**: Creazione ordine completa con notifiche
- **Order Creation**: Status PENDING, OrderCode auto-gen `ORD-YYYYMMDD-XXX`
- **Cart Reset**: Automatic cartItems cleanup dopo submit
- **Error Handling**: Comprehensive con status codes appropriati

#### **4. NOTIFICHE MULTI-CHANNEL** ✅ IMPLEMENTATO
**Su Submit Checkout**:
- **Email Customer** (text semplice): "Ordine X preso in consegna, verrai contattato"
- **Email Admin** (`settings.adminEmail`): "Nuovo ordine X da confermare"  
- **WhatsApp** (salva in chat): "✅ Ordine X preso in consegna! Ti faremo sapere il prima possibile"

**Su Conferma Operatore** (`PENDING → CONFIRMED`):
- **Email Customer**: "🎉 Ordine X confermato! Ti contatteremo per consegna"
- **Email Admin**: "Ordine X confermato e processato"
- **WhatsApp**: "🎉 Ordine confermato! Numero X. Ti contatteremo per dettagli consegna"

#### **5. STOCK SERVICE COMPLETO** ✅ IMPLEMENTATO
**File**: `backend/src/application/services/stock.service.ts`
- **NO scala stock su checkout** (rimane disponibile per altri)
- **Auto-scala su conferma**: `PENDING → CONFIRMED` con validazione stock
- **Auto-ripristina su cancellazione**: `CONFIRMED/SHIPPED → CANCELLED`
- **Stock Logging**: Audit trail di tutte le modifiche stock
- **Insufficient Stock Handling**: Graceful degradation con warnings

#### **6. ADMIN PANEL AGGIORNATO** ✅ IMPLEMENTATO
**Files**: `frontend/src/pages/ProductsPage.tsx` + `DataTable.tsx` + `CrudPageContent.tsx`
- **Row Rosse Stock 0**: Styling condizionale `bg-red-50 border-l-4 border-red-500`
- **Status Indicators**: "Out of Stock", "Low Stock", "Available" con colori
- **Product Filtering**: API params `?active=true&inStock=true`
- **Stock Display**: Numerico con color coding (rosso/arancione/verde)

#### **7. PRODUCT API FILTERING** ✅ IMPLEMENTATO
**Files**: `backend/src/repositories/product.repository.ts` + `product.controller.ts`
- **New Filters**: `ProductFilters.inStock` e `ProductFilters.active`
- **Repository Logic**: `WHERE stock > 0 AND isActive = true`
- **Controller Params**: Query string parsing per `active=true&inStock=true`
- **Checkout Integration**: Modal prodotti usa filtri automaticamente

#### **8. UX/UI COMPLETO** ✅ IMPLEMENTATO
**Features Avanzate**:
- **Progress Steps**: Visual 1→2→3 con colori dinamici
- **Loading States**: Spinners, disabled buttons, skeleton screens
- **Error Handling**: Toast notifications, form validation, retry logic
- **Responsive**: Mobile-first design, touch-friendly controls
- **Accessibility**: Proper labels, focus management, screen reader support

#### **9. PROMPT AGENT INTEGRATION** ⏳ TODO
- **Raccogliere prodotti** durante conversazione normale
- **Rilevare intent conferma**: "procedo", "ordino", "confermo", "checkout", "finalizza"
- **Solo allora** chiamare `createOrderCheckoutLink` con prodotti raccolti

#### **10. TESTING SUITE** ⏳ TODO
- Test unitari scala/ripristina stock su cambio status
- Test edge cases (stock insufficiente, prodotto disattivato)
- Test token validation e scadenza
- Test flusso email e WhatsApp completo
- Test responsività mobile
- Integration tests end-to-end

**STORY POINT**: 10
**STATUS**: 🟢 COMPLETATO - Checkout Flow + Stock Management + UI Completi, TODO: Solo Agent Prompt + Testing

================================================================================

blockuser

# PHASE 2 TASKS

## TASK #3

**TITLE**: Extended Session Duration (1 Hour)
**DESCRIPTION/ROADMAP**:

- Configure JWT with 1 hour expiration (3600 seconds)
- Implement silent token refresh before expiration
- Add activity-based session renewal (reset timer on user activity)
- Create session monitoring and validation
- Implement graceful session expiry handling
- Add optional session time indicator

**SPECIAL NOTE**:
Andrea vuole lavorare 1 ora senza dover rifare il login. Attualmente la sessione scade troppo presto causando interruzioni del lavoro. Implementare refresh automatico silenzioso.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #10

**TITLE**: Advanced WhatsApp Features
**DESCRIPTION/ROADMAP**:

- Implement rich media support (images, documents)
- Integrate WhatsApp Business API features
- Add template message management
- Create automated response system
- Implement message scheduling
- Add bulk messaging capabilities

**SPECIAL NOTE**:
Funzionalità avanzate WhatsApp per il futuro. Richiede integrazione con WhatsApp Business API ufficiale.

**STORY POINT**: 21
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13

**TITLE**: Security & Performance Optimization
**DESCRIPTION/ROADMAP**:

- Implement comprehensive API rate limiting
- Add advanced authentication (2FA)
- Optimize database queries for performance
- Add frontend performance monitoring
- Implement security headers and OWASP compliance
- Add comprehensive error logging and monitoring

**SPECIAL NOTE**:
Task di ottimizzazione generale per sicurezza e performance. Da implementare quando le funzionalità core sono stabili.

**STORY POINT**: 13
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #15

**TITLE**: Full Application Responsiveness
**DESCRIPTION/ROADMAP**:

- Review all frontend pages and components to ensure they are fully responsive
- Test on various devices and screen sizes (mobile, tablet, desktop)
- Fix any layout, overflow, or usability issues
- Maintain design system consistency and accessibility

**SPECIAL NOTE**:
Andrea requires that the entire application is fully responsive for a seamless user experience on all devices.

**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #18

**TITLE**: Database Cleanup: Remove Unused Tables
**DESCRIPTION/ROADMAP**:

- Identify all tables in the database that are no longer used by the application
- Remove unused tables from the Prisma schema
- Create and run proper Prisma migrations to drop these tables
- Ensure no code references or dependencies remain for removed tables
- Test the system thoroughly to confirm no regressions or errors
- Update documentation and ERD if necessary

**SPECIAL NOTE**:
**SPECIAL NOTE**:
Andrea requires a clean and maintainable database. All legacy or unused tables must be removed to avoid confusion and improve performance.

**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2

================================================================================

## NOTE

- SECUIRTY owasp
- prompt con url dinamici?
- usage price sembra statico
- dentro il pannello se il token scade? gestione tokem app gestione token n8n getione tokend dell'applicativo
- dammi il pdf ? rag?

- usage price sembra statico nella dashboard
- Ordine e carrello e pagamento
- fattura scaricabile
- wip messge
