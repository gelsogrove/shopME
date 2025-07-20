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

## TASK #25

**TITLE**: Integrate Google Translate Node for English Conversion in RAG Search
**DESCRIPTION/ROADMAP**:

- Integrate a Google Translate node into the RAG search workflow
- Automatically convert any non-English content (especially FAQs) to English before processing
- Update backend logic to ensure all relevant content is translated to English within the RAG flow
- Test the system to confirm correct translation and improved search accuracy

**SPECIAL NOTE**:
Andrea requires that all non-English content, especially FAQs, is automatically translated to English in the RAG search process for better LLM results.

**STORY POINT**: 6
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

**TITLE**: Checkout Flow con Gestione Stock Completa
**DESCRIPTION/ROADMAP**:

#### **1. CUSTOM FUNCTION N8N** ✅
- Implementare `createOrderCheckoutLink(customerId, workspaceId, prodotti[])`
- Genera token sicuro 1 ora in `secure_tokens`
- Ritorna URL: `${FRONTEND_URL}/checkout/${token}`
- **Trigger**: Solo quando utente esprime intent di conferma ordine ("procedo", "ordino", "confermo")

#### **2. PAGINA CHECKOUT** `/checkout/:token` ✅
- **Design**: Stesso pattern di `/register` (fuori auth, responsiva)
- **Step 1**: Carrello completo
  - View prodotti dal token
  - Edit quantità (max = stock disponibile)
  - Remove prodotti
  - Add prodotti: Modal con prodotti attivi (`isActive=true AND stock>0`)
- **Step 2**: Indirizzi pre-compilati da `customer.address` e `customer.invoiceAddress`
- **Step 3**: Note + Submit finale

#### **3. SUBMIT CHECKOUT & NOTIFICHE** ✅
- Crea ordine `status: PENDING` (NO scala stock ancora)
- **Reset carrello customer** dopo ordine confermato
- **Email Customer**: "Ordine numero X preso in consegna, ti faremo sapere il prima possibile"
- **Email Admin** (`settings.adminEmail`): "Nuovo ordine da confermare numero X"
- **WhatsApp in chat**: "✅ Ordine numero X preso in consegna! Ti faremo sapere il prima possibile per la conferma."

#### **4. CONFERMA OPERATORE & NOTIFICHE** ✅
Quando operatore cambia status `PENDING → CONFIRMED`:
- **Scala stock**: `updateProductStock(productId, -quantity)` ✅
- **Email Customer**: "🎉 Ordine confermato numero X + dettagli consegna" ✅
- **Email Admin**: "Ordine X confermato e processato" ✅
- **WhatsApp in chat**: "🎉 Ordine confermato! Numero ordine: X. Ti contatteremo per i dettagli di consegna." ✅

#### **5. GESTIONE STOCK COMPLETA** ✅
- **NO scala stock su checkout** (rimane disponibile) ✅
- **Scala stock su conferma**: `PENDING → CONFIRMED` ✅
- **Ripristina stock su cancellazione**: `CONFIRMED → CANCELLED` ✅
- **getProduct**: Sempre filtrare `isActive=true AND stock>0` ✅

#### **6. PANNELLO ADMIN - STOCK MANAGEMENT** ✅
- **ProductsPage**: Row rossa per prodotti `stock = 0` ✅
- **Mostra prodotti esauriti** come "Esaurito" (non nascondere) ✅
- **Quantità Max Checkout**: Limitata a stock disponibile ✅
- **Alert visivo**: Evidenziare prodotti a stock zero ✅

#### **7. CHECKOUT UX COMPLETO** ✅
- **Modal Aggiungi Prodotti**: Implementato con stock validation ✅
- **Carrello Edit/Remove**: Quantità dinamiche con limiti stock ✅
- **Form Validation**: Campi obbligatori e controlli ✅
- **Reset Carrello**: Automatico dopo ordine completato ✅

#### **8. PROMPT AGENT AGGIORNATO** ⏳ TODO
- **Raccogliere prodotti** durante conversazione normale
- **Rilevare intent conferma**: "procedo", "ordino", "confermo", "checkout", "finalizza"
- **Solo allora** chiamare `createOrderCheckoutLink` con prodotti raccolti

#### **9. TESTING** ⏳ TODO
- Test unitari scala/ripristina stock su cambio status
- Test edge cases (stock insufficiente, prodotto disattivato)
- Test token validation e scadenza
- Test flusso email e WhatsApp completo
- Test responsività mobile

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
- DEPLOYMENT ?
- prompt con url dinamici?
- usage price sembra statico
- dentro il pannello se il token scade? gestione tokem app gestione token n8n getione tokend dell'applicativo
- dammi il pdf ? rag?
