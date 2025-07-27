# Phase 0 task

- test di integrazione cancellare tutti
- mettere campo debug-mode per evtare di far salire il contatore
- Posso fare qualcos'altro per lei nel frattempo? (da togliere)
- SISTEMARE IL PRD
- dentro settinggs il campo blacklist puo' sparire
- controllare flusso blacklost sopratutto che non savli dati nel DB ci deve essre un test per questo e il PRD DEVE ESSERE AGGIORNATO
-
- Analytics Dashboard- defailt 1 mese e poi dobbiamo capire i costi mensili mostrarli
- nel campo di cljent devo poter vedere i campi GDPR Push Chatbot blacklist pre modificarli

# PHASE 1 TASKS

<<<<<<< HEAD
- ✅ **COMPLETATO: N8N integration usage tracking automatico** - €0.005 tracking integrato in MessageRepository.saveMessage() prima del salvataggio nello storico
- ⏳ **TODO: TESTARE tracking usage** - Dashboard mostra sempre €3.88, servono nuovi messaggi AI per vedere incremento €0.005
- ✅ **COMPLETATO: Mail a contact operator** - CF ContactOperator aggiornato con AI summary e email all'operatore

- ⏳ **TODO: ma il filtro posso toglierlo**
- ⏳ **TODO: n8n TOKEN**
- ⏳ **TODO: Integrare TrackUsage nel workflow N8N** - CF pronto, serve integrazione nel workflow
- 🆕 **TODO: Integrare confirmOrderFromConversation in N8N** - CF pronto, serve configurazione manuale in workflow
- CF pdf
- SISTEMARE IL PRD
- TEST DEVONO ESSERE FUNZIONANTI
=======
- devo verificare la mail
- mettere customer.blacklist a true nella chata
- ⏳ **TODO: Icona blacklist nella lista clienti** - Cliente blacklisted deve avere icona visiva nella lista
>>>>>>> main
- sistema di invoice ?
- docker name possiamo cambiarlo da shopme_n8n_unifend a shopme_n8
- CF pdf
- TEST DEVONO ESSERE FUNZIONANTI

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

## TASK #27

**TITLE**: Payment Page: Create Order and Handle Shipping Address via Call Function
**DESCRIPTION/ROADMAP**:

- On payment confirmation, trigger a call function to the backend to create a new order record
- Manage the shipping address as part of this call function flow
- Update the call function prompt to include all necessary order and shipping address details
- Ensure the backend correctly saves the order and shipping address
- Test the end-to-end flow from payment to order creation and address storage

**SPECIAL NOTE**:
Andrea requires that the payment page, once payment is confirmed, always triggers a backend call function to create the order and handle the shipping address. The prompt for the call function must be updated to reflect this logic.

**STORY POINT**: 7
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

**TITLE**: ✅ COMPLETATO - Conversational Order Flow Implementato
**DESCRIPTION/ROADMAP**:

#### **1. CUSTOM FUNCTION N8N** ✅ IMPLEMENTATO

**File**: `backend/src/chatbot/calling-functions/confirmOrderFromConversation.ts` ✅

- ✅ Implementata `confirmOrderFromConversation()` 
- ✅ Estrae prodotti dalla conversazione corrente (no carrello)
- ✅ Validazione prodotti nel database con ricerca fuzzy
- ✅ Genera token sicuro con type='conversational_order_checkout'
- ✅ Integrata in function-handler e message-repository
- ✅ Compatibile con checkout controller esistente

**ESEMPIO FLUSSO COMPLETO**:
```
1. Cliente: "Voglio maglietta rossa" → LLM traccia mentalmente
2. Cliente: "E jeans blu" → LLM aggiunge alla lista mentale  
3. Cliente: "Confermo l'ordine" → LLM chiama confirmOrderFromConversation()
4. Sistema: genera token + URL checkout 
5. Cliente: clicca link → completa checkout web
```

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

-

# PHASE 2 TASKS

- prompt con url dinamici?
- ⏳ **TODO: token viene passato?**
- - dentro il pannello se il token scade?

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

## TASK #13A

**TITLE**: API Rate Limiting Implementation
**DESCRIPTION/ROADMAP**:

- Implement comprehensive API rate limiting middleware
- Configure different rate limits per endpoint type (public vs authenticated)
- Add rate limit headers to API responses
- Implement Redis-based rate limiting for scalability
- Add monitoring and alerting for rate limit violations
- Test rate limiting behavior under load

**SPECIAL NOTE**:
Focused security task for API protection against abuse and DoS attacks.

**STORY POINT**: 3
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13B

**TITLE**: Advanced Authentication & 2FA
**DESCRIPTION/ROADMAP**:

- Implement Two-Factor Authentication (2FA) with TOTP
- Add backup codes for 2FA recovery
- Implement account lockout after failed login attempts
- Add password strength requirements and validation
- Implement secure password reset flow with email verification
- Add login attempt monitoring and suspicious activity detection

**SPECIAL NOTE**:
Enhanced authentication security for user accounts protection.

**STORY POINT**: 8
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13C

**TITLE**: Database Performance Optimization
**DESCRIPTION/ROADMAP**:

- Analyze and optimize slow database queries
- Add proper database indexes for frequently queried fields
- Implement query result caching where appropriate
- Add database connection pooling optimization
- Implement pagination for large data sets
- Add database performance monitoring and alerting

**SPECIAL NOTE**:
Database optimization for improved application performance and scalability.

**STORY POINT**: 5
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13D

**TITLE**: Security Headers & OWASP Compliance
**DESCRIPTION/ROADMAP**:

- Implement comprehensive security headers (CSP, HSTS, X-Frame-Options, etc.)
- Add input validation and sanitization across all endpoints
- Implement CSRF protection
- Add SQL injection prevention measures
- Implement XSS protection mechanisms
- Conduct security audit and fix vulnerabilities

**SPECIAL NOTE**:
OWASP compliance and security hardening for production readiness.

**STORY POINT**: 5
**STATUS**: 🔵 PHASE 2

================================================================================

## TASK #13E

**TITLE**: Comprehensive Logging & Monitoring
**DESCRIPTION/ROADMAP**:

- Implement structured logging with appropriate log levels
- Add error tracking and alerting system
- Implement application performance monitoring (APM)
- Add health check endpoints for system monitoring
- Implement log aggregation and search capabilities
- Add metrics collection for business intelligence

**SPECIAL NOTE**:
Monitoring and observability for production operations and debugging.

**STORY POINT**: 5
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

## TASK #41

**TITLE**: Integrazione Manuale confirmOrderFromConversation in N8N Workflow
**DESCRIPTION/ROADMAP**:

La nuova calling function `confirmOrderFromConversation` è stata implementata e testata nel backend, ma deve essere integrata manualmente nel workflow N8N per essere utilizzabile dal chatbot.

**STEPS RICHIESTI**:

1. **Accesso N8N Interface**:
   - Aprire l'interfaccia N8N del workspace
   - Navigare al workflow principale del chatbot

2. **Aggiungere Nuova Function**:
   - Aggiungere `confirmOrderFromConversation` alla lista delle function calling disponibili
   - Configurare i parametri richiesti:
     ```json
     {
       "name": "confirmOrderFromConversation",
       "description": "Conferma ordine dalla conversazione corrente e genera link checkout sicuro",
       "parameters": {
         "conversationContext": "string",
         "prodottiSelezionati": "array[{nome, quantita, descrizione?, codice?}]"
       }
     }
     ```

3. **Test del Flusso**:
   - Testare il conversational order flow completo:
     - Cliente: "Voglio maglietta rossa"
     - Bot: "✅ Maglietta aggiunta alla selezione"
     - Cliente: "Confermo l'ordine"  
     - Bot: Chiama `confirmOrderFromConversation()` → Genera token + URL

4. **Validazione Response**:
   - Verificare che il bot riceva correttamente:
     - `success: true`
     - `response: "🛒 Riepilogo Ordine..."`
     - `checkoutUrl: "https://frontend.com/checkout/token"`
     - `totalAmount: number`

5. **Error Handling**:
   - Testare gestione errori:
     - Prodotto non trovato
     - Parametri mancanti
     - Errori database

**ENDPOINT BACKEND**:
- Function Handler: `/api/internal/function-call`
- Function Name: `confirmOrderFromConversation`
- Method: POST

**TESTING CHECKLIST**:
- [ ] Function apparisca in lista N8N functions
- [ ] Parametri vengano passati correttamente
- [ ] Response del backend venga gestita dal workflow
- [ ] Messaggio finale contenga link checkout formattato
- [ ] Gestione errori funzioni correttamente
- [ ] Link checkout apra pagina funzionante

**FILES COINVOLTI**:
- ✅ `backend/src/chatbot/calling-functions/confirmOrderFromConversation.ts` - Implementato
- ✅ `backend/src/application/services/function-handler.service.ts` - Integrato 
- ✅ `backend/src/repositories/message.repository.ts` - Function aggiunta
- 🔧 **N8N Workflow Configuration** - DA CONFIGURARE MANUALMENTE

**SPECIAL NOTE**:
Questa integrazione deve essere fatta manualmente tramite l'interfaccia N8N perché la configurazione del workflow non è gestita via codice. La function è pronta lato backend e tutti i test unitari passano.

**STORY POINT**: 3
**STATUS**: 🟡 Ready for Manual Configuration

================================================================================

## NOTE
