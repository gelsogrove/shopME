## TASK #4 ✅ COMPLETED

**TITLE**: Toast Messages Standardization
**DESCRIPTION/ROADMAP**:

- ✅ **COMPLETED**: Configure Sonner for green success toasts with white text
- ✅ **COMPLETED**: Add appropriate icons: ✓ success, ❌ error, ⚠️ warning, ℹ️ info
- ✅ **COMPLETED**: Update all components using toast to new styling
- ✅ **COMPLETED**: Ensure consistent styling across entire application
- ✅ **COMPLETED**: Test toast functionality in all scenarios

**IMPLEMENTATION COMPLETED**:

- Created standardized toast utility in `/lib/toast.ts` with consistent styling
- Green success toasts (#22c55e) with white text and ✓ icon
- Red error toasts (#dc2626) with white text and ❌ icon
- Yellow warning toasts (#fbbf24) with white text and ⚠️ icon
- Blue info toasts (#3b82f6) with white text and ℹ️ icon
- Updated all components to use standardized toast utility:
  - ChatPage.tsx
  - ClientsPage.tsx
  - ProductsPage.tsx
  - Header.tsx
  - GdprSettingsTab.tsx

**SPECIAL NOTE**:
Sistema di toast completamente standardizzato! Tutti i toast ora seguono il design system di ShopMe con colori coerenti, testo bianco e icone appropriate.

**STORY POINT**: 3
**STATUS**: ✅ COMPLETED - Fully Functional

================================================================================

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

## TASK #34

**TITLE**: Manual Operator Message History Saving
**DESCRIPTION/ROADMAP**:

- Ensure that when a human operator sends a message (manual operator mode), the message is always saved to the chat history
- Guarantee full auditability and traceability of all operator actions
- Test operator/manual mode logic to confirm messages are properly stored
- Verify that both AI/LLM responses and manual operator messages appear in chat history

**SPECIAL NOTE**:
Andrea requires complete message history for all interactions, including manual operator messages, for audit and quality purposes.

**STORY POINT**: 2
**STATUS**: 🔴 Not Started

================================================================================

## TASK #35

**TITLE**: FAQ Page Conditional Pagination
**DESCRIPTION/ROADMAP**:

- On the FAQ page (/faq), hide pagination controls when there are 10 or fewer elements
- Only show pagination if there are more than 10 items
- Ensure consistent behavior with other paginated sections
- Test edge cases around the 10-item threshold

**SPECIAL NOTE**:
Andrea wants clean UI without unnecessary pagination controls when there are few items to display.

**STORY POINT**: 1
**STATUS**: 🔴 Not Started

================================================================================

## TASK #36

**TITLE**: Standardize Button Text Across CRUD Pages
**DESCRIPTION/ROADMAP**:

- Change the 'Add Categories' button to just 'Add' for consistency across all CRUD pages
- Review all other CRUD pages and ensure consistent button text
- Apply standardized button naming convention throughout the application
- Update any other non-consistent button texts found

**SPECIAL NOTE**:
Andrea requires consistent UI language across all management pages.

**STORY POINT**: 1
**STATUS**: 🔴 Not Started

================================================================================

## TASK #37

**TITLE**: Offers Page Conditional Pagination
**DESCRIPTION/ROADMAP**:

- On the Offers page (/offers), hide pagination controls when there are fewer than 10 elements
- Only show pagination if there are more than 10 items
- Ensure consistent behavior with FAQ page and other paginated sections
- Test edge cases around the 10-item threshold

**SPECIAL NOTE**:
Andrea wants clean UI without unnecessary pagination controls when there are few items to display.

**STORY POINT**: 1
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

## TASK #26

**TITLE**: Automatic Embedding Trigger on Data Change
**DESCRIPTION/ROADMAP**:

- Remove the manual embedding button from all relevant sections (documents, products, FAQs, services, etc.)
- Automatically trigger the embedding process after every add, update, or delete operation
- Ensure this behavior is consistent across all sessions and entity types
- No manual intervention required for embedding generation
- Test thoroughly to confirm embeddings are always up-to-date

**SPECIAL NOTE**:
Andrea requires a clean and maintainable database. All legacy or unused tables must be removed to avoid confusion and improve performance.hat embedding is always up-to-date and automatic. The manual embedding button is no longer desired and must be removed everywhere.

**STORY POINT**: TBD**STORY POINT**: TBD
**STATUS**: 🔵 PHASE 2tarted

================================================================================================================================================================

## TASK #23 - N8N workflow does not contain the removed filters

cumentation and technical checklist as needed
**TITLE**: Remove N8N Filter for isActive and isBlacklisted – Move Logic to Backend (LLM/Workflow Bypass)
**DESCRIPTION/ROADMAP**:

- Refactor the backend message processing logic so that:- Centralizes business logic in the backend for better maintainability and security
  - If `customer.isActive === false` **OR** `customer.isBlacklisted === true`, the backend must: or inactive customers
    - NOT call LLM (no OpenRouter, no AI response)
    - NOT call N8N (no workflow trigger)of logic
    - Only save the inbound message to history (using MessageRepository.saveMessage)
    - Return a 200 OK with `processedMessage: ""` and no error
- Remove the corresponding filter/condition from the N8N workflow:
  - Eliminate any N8N node or filter that checks `{{$json.precompiledData.customer.isActive}}` or `{{$json.precompiledData.customer.isBlacklisted}}`checks in the backend only
  - The backend will be the single source of truth for these checks
- Ensure that the logic is now identical to how `activeChatbot` is handled (manual operator mode):
  - If any of these conditions are true, the system is "muted" for AI/automation, but always logs the message
- Add/Update unit and integration tests to verify:
  - No LLM/N8N call is made when customer is inactive or blacklisted
  - Messages are always saved to history
  - N8N workflow does not contain the removed filters========================================
- Update documentation and technical checklist as needed
  (manual operator mode), the message is always saved to the chat history, just like AI/LLM responses. This guarantees full auditability and traceability of all operator actions (operator/manual mode logic).
  **RATIONALE**:- [ ] On the FAQ page (/faq), if there are 10 or fewer elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (FAQ page pagination logic)
  he 'Add Categories' button to just 'Add' for consistency across all CRUD pages (button text standardization)
- Centralizes business logic in the backend for better maintainability and security- [ ] On the Offers page (/offers), if there are fewer than 10 elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (Offers page pagination logic)
- Prevents accidental AI/automation triggers for blocked or inactive customers
- Ensures message history is always complete, regardless of customer status
- Simplifies N8N workflow and reduces duplication of logic
  ion
  **SPECIAL NOTE**:**DESCRIPTION/ROADMAP**:

- This task will remove the filter logic from N8N and enforce all checks in the backend only- Create a legal notice ('Aviso legal') PDF document.
- Applies to both REST API and WhatsApp/N8N webhook flowstion or appropriate storage).
- Must be coordinated with N8N workflow update to avoid regressions section (e.g., legal, compliance, or info page).
  gement works as expected.
  **STORY POINT**: TBD- Use this as a test case for document/PDF management features.
  **STATUS**: 🔴 Not Started

================================================================================Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.

- [ ] Ensure that when a human operator sends a message (manual operator mode), the message is always saved to the chat history, just like AI/LLM responses. This guarantees full auditability and traceability of all operator actions (operator/manual mode logic).**STATUS**: 🔴 Not Started
- [ ] On the FAQ page (/faq), if there are 10 or fewer elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (FAQ page pagination logic)- [ ] Change the 'Add Categories' button to just 'Add' for consistency across all CRUD pages (button text standardization)- [ ] On the Offers page (/offers), if there are fewer than 10 elements, the pagination controls should not be visible. Only show pagination if there are more than 10 items. (Offers page pagination logic)## TASK #30**TITLE**: Implement 'Aviso legal' PDF Upload and Integration**DESCRIPTION/ROADMAP**:- Create a legal notice ('Aviso legal') PDF document.- Upload the PDF to the system and ensure it is stored correctly (e.g., in the documents section or appropriate storage).- Integrate the PDF so it is accessible from the relevant section (e.g., legal, compliance, or info page).- Test the upload and retrieval process to verify PDF/document management works as expected.- Use this as a test case for document/PDF management features.**SPECIAL NOTE**:Andrea wants to try uploading and managing a legal notice PDF to validate the document handling flow.**STATUS**: 🔴 Not Started

# 📊 PRIORITY SUMMARY

**🔴 CRITICAL/HIGH PRIORITY (Tasks #30-#32)**:

- Total Story Points: 8
- Focus: Core services management and discount system verification
- Estimated Duration: 1-2 weeks
- Priority: Critical for customer experience

**🟡 MEDIUM PRIORITY (Tasks #3-#8, #19)**:

- Total Story Points: 26
- Focus: UX improvements, session management, cleanup
- Estimated Duration: 4-5 weeks
- Priority: Important for usability

**🔵 FUTURE/ENHANCEMENT (Tasks #14, #24-#27, #34-#38)**:

- Total Story Points: 32
- Focus: Advanced features, automation, polish
- Estimated Duration: 6-8 weeks
- Priority: Nice to have, future improvements

## 🎯 SPRINT PLANNING SUGGESTION

**🔴 CRITICAL SPRINT (1-2 weeks)**:

- Sprint 1: Tasks #30, #31, #32 (8 Story Points) - Services & Discount Verification

**🟡 MEDIUM PRIORITY SPRINTS**:

- Sprint 2: Tasks #3, #4 (8 Story Points) - Session & Toast fixes
- Sprint 3: Tasks #6, #19 (10 Story Points) - Login & Address standardization
- Sprint 4: Tasks #8, #14 (7 Story Points) - Cleanup & Automation

## 📝 IMPLEMENTATION NOTES

- All tasks follow existing project architecture (DDD backend, React frontend)
- Database changes require Prisma migration scripts
- Frontend changes must maintain existing design system consistency
- All APIs must include proper error handling and validation
- Tests should be added for new functionality
- Andrea's approval required before marking any task as "DONE"

## 🧪 TESTING STRATEGY

**CURRENT APPROACH**: Focus on discount system and services functionality first

- **Priority Testing**: Discount calculation, services listing, customer experience
- **Integration Tests**: End-to-end discount flow verification
- **Manual Testing**: Customer scenarios with different discount combinations

---

_Last updated: 2025-07-16_
_Format: Structured Task List v3.0 - Cleaned and Prioritized_

**TITLE**: Standardize Shipping Address and Invoice Address Handling
**DESCRIPTION/ROADMAP**:

- Refactor the edit form so that both Shipping Address and Invoice Address are managed as structured objects (field by field)
- Use the same field-by-field approach as currently implemented for Invoice Address
- Update backend models, DTOs, and validation to support structured shipping address
- Update frontend forms to display and edit shipping address with individual fields (not a single string)
- Remove any string-based handling for shipping address
- Test thoroughly to ensure both addresses are saved and displayed correctly

**SPECIAL NOTE**:
Andrea requires that both addresses are handled in a consistent, structured way for better data quality and user experience. The Invoice Address model is the reference.

**STORY POINT**: TBD
**STATUS**: 🔴 Not Started

================================================================================

## TASK #16 ✅ COMPLETED

**TITLE**: Remove Direct Catalog Links Without Subfolders
**DESCRIPTION/ROADMAP**:

- Identify all 'Catalog' links in the application
- Remove any direct links that do not point to a subfolder or subcategory
- Ensure navigation is clear and only shows valid, structured catalog paths
- Test navigation to confirm no orphan or dead-end links remain

**SPECIAL NOTE**:
Catalog menu has been completely removed. 'Products', 'Categories', and 'Offers' are now top-level sidebar items, as requested by Andrea.

**STORY POINT**: TBD
**STATUS**: ✅ COMPLETED

================================================================================

## TASK #17 ✅ COMPLETED

**TITLE**: Add Pagination to Orders Page
**DESCRIPTION/ROADMAP**:

- Implement pagination controls on http://localhost:3000/orders
- Update backend API to support paginated order queries if not already present
- Ensure frontend displays paginated results and navigation controls
- Maintain UI/UX consistency with other paginated sections
- Test for performance and usability with large order datasets

**SPECIAL NOTE**:
Pagination for the Orders page is now implemented and fully functional.

**STORY POINT**: TBD
**STATUS**: ✅ COMPLETED

================================================================================

## TASK #6 ✅ COMPLETED

**TITLE**: Complete Invoice Address Management System for Clients
**DESCRIPTION/ROADMAP**:

- ✅ **Database Schema Update**: Add invoiceAddress JSON field to customers table via Prisma migration
- ✅ **Backend Infrastructure**: Update Customer entity, repository, validation schemas, and API endpoints
- ✅ **Frontend Components**: Add invoice address fields to ClientSheet form (edit/create/view modes)
- ✅ **Form Validation**: Implement client and server-side validation for invoice address fields
- ✅ **Seed Data Update**: Add invoice address data to existing customers in seed script
- ✅ **Testing**: Create unit and integration tests for invoice address functionality
- ✅ **Documentation**: Update API swagger documentation for invoice address endpoints
- ✅ **Data Migration**: Ensure existing customers maintain compatibility with new address structure

**IMPLEMENTATION COMPLETED**:

- Updated Prisma schema with `invoiceAddress Json?` field in customers table
- Applied migration `20250709210239_add_invoice_address_to_customers` successfully
- Enhanced Customer entity with `InvoiceAddress` interface (9 optional fields)
- Updated CustomerRepository to handle invoice address in toDomainEntity, create, and update methods
- Extended customers controller to support invoice address in createCustomer and updateCustomer endpoints
- Added Joi validation schema for invoice address fields in customer.validation.ts
- Implemented complete frontend form in ClientSheet.tsx with 9 invoice address fields
- Added invoice address display in view mode with conditional rendering
- Updated clientsApi.ts with InvoiceAddress interface and proper typing
- Enhanced seed script with realistic invoice address data for test customers:
  - Mario Rossi: Italian invoice address with IT VAT number
  - Maria Garcia: Spanish invoice address with ES VAT number
- Created comprehensive unit tests for Customer entity with invoice address scenarios
- All 5 unit tests passing successfully

**TECHNICAL IMPLEMENTATION**:

1. **Database**: `invoiceAddress` JSONB field in customers table with structure:
   ```json
   {
     "firstName": "string",
     "lastName": "string",
     "company": "string",
     "address": "string",
     "city": "string",
     "postalCode": "string",
     "country": "string",
     "vatNumber": "string",
     "phone": "string"
   }
   ```
2. **Backend**: Updated CustomerProps interface, validation schemas, entity class, repository methods
3. **Frontend**: Added invoice address section to ClientSheet with same structure as shipping address
4. **Validation**: Joi schema validation for invoice address fields (optional fields, proper formats)
5. **Seed**: Added realistic invoice address data to all seeded customers

**SPECIAL NOTE**:
Sistema di indirizzi di fatturazione completamente implementato e funzionante. Tutti i clienti possono ora avere un indirizzo di fatturazione separato dall'indirizzo di spedizione. Compatibilità completa con clienti esistenti. Validazione completa e test passanti.

**STORY POINT**: 8
**STATUS**: ✅ COMPLETED - Fully Functional

================================================================================

## TASK #1 ✅ COMPLETED

**TITLE**: N8N Credentials Persistence Fix
**DESCRIPTION/ROADMAP**:

- ✅ Fix Docker volume persistence for N8N database (.n8n folder)
- ✅ Implement automated credential creation from .env
- ✅ Create automated backup/restore scripts for credentials
- ✅ Complete workflow import and activation automation
- ✅ Integrate with seed process for full automation

**IMPLEMENTATION COMPLETED**:

- Updated n8n_nuclear-cleanup.sh to read OPENROUTER_API_KEY from backend/.env
- Automated credential creation for Backend API and OpenRouter
- Complete workflow import, compilation, and activation
- Integrated into seed process with detailed logging
- All 7 steps of Andrea's checklist implemented:
  ✅ Query SQL ✅ Embedding ✅ N8N Credential ✅ Delete old workflow
  ✅ N8N import workflow ✅ Compila il workflow ✅ Attiva il workflow

**SPECIAL NOTE**:
Problema RISOLTO! Il setup ora è completamente automatico. Ogni volta che si fa `npm run seed`, il sistema:

1. Fa backup obbligatorio del .env
2. Legge OPENROUTER_API_KEY dal .env
3. Fa nuclear cleanup di N8N
4. Crea credenziali fresche
5. Importa e attiva il workflow
6. Sistema WhatsApp completamente funzionante

**STORY POINT**: 8
**STATUS**: ✅ COMPLETED - Fully Automated

================================================================================

## TASK #2 ✅ COMPLETED

**TITLE**: Complete Orders Management System
**DESCRIPTION/ROADMAP**:

- ✅ **COMPLETED**: Fix Delete Order functionality (routes added to API router)
- ✅ **COMPLETED**: Remove email display from orders list (show only customer name with click navigation)
- ✅ **COMPLETED**: Implement advanced filtering system (Status, Customer dropdown, Date Range, Search)
- ✅ **COMPLETED**: Enhanced Edit Order functionality with complete product/service management
- ✅ **COMPLETED**: Customer name click navigation to Customers page (`/customers/{id}`)
- ✅ **COMPLETED**: UI Consistency Fix - Interface now matches other pages (PageHeader + Table pattern)
- ✅ **COMPLETED**: Green button styling consistent with application design system
- ✅ **COMPLETED**: Filters positioned correctly in top-right area like other sections
- ⏸️ **SKIPPED**: PDF invoice generation (as requested by Andrea)

**FINAL IMPLEMENTATION STATUS**: ✅ **COMPLETED** (except PDF generation)

**🚨 UI CONSISTENCY FIXED**:

- **Problem**: Initial implementation used custom layout that was inconsistent with other pages
- **Solution**: Reverted to standard `PageHeader` + `Table` pattern used throughout the application
- **Filters**: Moved to `extraButtons` prop in top-right position (consistent with other pages)
- **Styling**: Applied `commonStyles.buttonPrimary` and `commonStyles.actionIcon` for green theme consistency
- **Layout**: Uses standard grid layout with proper spacing matching other sections
- **Table**: Standard shadcn Table component with consistent header/cell styling

**✅ IMPLEMENTATIONS DELIVERED**:

### 🚨 **1. CRITICAL FIX: Delete Order Functionality**

- **Problem**: Order routes missing from main API router
- **Solution**: Added `createOrderRouter()` to `backend/src/interfaces/http/routes/api.ts`
- **Result**: Delete order now fully functional

### 🎨 **2. UI/UX Enhancement: Email Removal & Customer Navigation**

- **Removed**: Email display from orders list (cleaner interface)
- **Added**: Clickable customer names with hover effects (`hover:text-green-600`)
- **Navigation**: `onClick={() => navigate(\`/customers/\${customer.id}\`)}`
- **Toast feedback**: Navigation confirmation messages

### 🔍 **3. ADVANCED FILTERING SYSTEM**

- **✅ Customer Filter**: Dropdown with all workspace customers (width: 160px)
- **✅ Date Range Filters**: From/To date pickers with calendar component (width: 140px each)
- **✅ Status Filter**: All order statuses with proper badge styling (width: 140px)
- **✅ Search Filter**: Order code, customer name, and product/service search (integrated in PageHeader)
- **✅ Filter Position**: Located in top-right area via `extraButtons` prop (consistent placement)
- **✅ Real-time Filtering**: Instant results without page reload

### ✏️ **4. ENHANCED EDIT ORDER WITH ITEM MANAGEMENT**

- **✅ Add Items**: Modal dialog for adding products/services to orders
- **✅ Product Management**: Quantity adjustment with +/- buttons, price calculation
- **✅ Service Management**: Add services with duration and pricing info
- **✅ Remove Items**: Delete button for each order item with confirmation
- **✅ Real-time Totals**: Automatic calculation of order totals (items + shipping + tax - discount)
- **✅ Item Type Support**: Full PRODUCT and SERVICE support
- **✅ Validation**: Required fields and business rules enforcement

### 🔗 **5. CUSTOMER NAVIGATION**

- **✅ Navigation**: Click customer name → redirect to `/customers/{customerId}`
- **✅ Router Integration**: Uses React Router `useNavigate()` hook
- **✅ User Feedback**: Toast messages for navigation actions
- **✅ Error Handling**: Graceful handling of missing customer data

### 📊 **6. UI/UX CONSISTENCY ACHIEVED**

- **✅ Standard Layout**: PageLayout → container → grid → PageHeader + Table pattern
- **✅ Button Styling**: Green theme using `commonStyles.buttonPrimary` and `commonStyles.actionIcon`
- **✅ Filter Positioning**: Top-right area via `extraButtons` prop (matches other pages)
- **✅ Table Styling**: Standard shadcn Table with consistent header and cell formatting
- **✅ Icons**: Proper sizing using `commonStyles.actionIcon` and `commonStyles.headerIcon`
- **✅ Responsive Design**: Works on desktop and mobile devices
- **✅ Loading States**: Proper loading indicators during API calls
- **✅ Error Handling**: User-friendly error messages with toast notifications
- **✅ Accessibility**: Proper ARIA labels and keyboard navigation

**STORY POINTS COMPLETED**: 13/13 (100% complete except PDF generation)

**TESTING STATUS**: ✅ All functionality tested and compiling successfully
**API INTEGRATION**: ✅ Full backend integration with workspace filtering  
**UI CONSISTENCY**: ✅ **FIXED** - Now matches existing ShopMe design patterns perfectly
**SEED DATA**: ✅ Orders created successfully and visible in interface

**DEPLOYMENT READY**: ✅ All core order management features implemented, tested, and UI-consistent.

**SPECIAL NOTE**:
Sistema ordini completamente funzionante! Implementati tutti i filtri avanzati, gestione completa degli ordini, navigazione clienti, UI consistente. Delete order risolto. Pronto per deployment.

**STORY POINT**: 13
**STATUS**: ✅ COMPLETED - Fully Functional

================================================================================

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

## TASK #4

**TITLE**: Toast Messages Standardization
**DESCRIPTION/ROADMAP**:

- Configure Sonner for green success toasts with white text
- Add appropriate icons: ✓ success, ⚠️ warning, ❌ error
- Update all components using toast to new styling
- Ensure consistent styling across entire application
- Test toast functionality in all scenarios

**SPECIAL NOTE**:
Tutti i toast di successo devono essere verdi con scritta bianca e icone appropriate. Attualmente i toast non seguono un design system coerente.

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #5 ✅ COMPLETED

**TITLE**: Analytics Dashboard Fixes
**DESCRIPTION/ROADMAP**:

- ✅ **COMPLETED**: Remove blue "Informazioni sul periodo di default" info box
- ✅ **COMPLETED**: Implement historical orders charts for past months using Recharts
- ✅ **COMPLETED**: Fix date range selector for historical data loading
- ✅ **COMPLETED**: Apply consistent design system (green colors, proper fonts, spacing)
- ✅ **COMPLETED**: Ensure charts show proper historical order data with real API data
- ✅ **COMPLETED**: Clean professional layout without cluttered information boxes

**FINAL IMPLEMENTATION STATUS**: ✅ **COMPLETED**

**✅ IMPLEMENTATIONS DELIVERED**:

### 🚨 **1. CRITICAL FIX: Blue Information Box Removal**

- **Problem**: Annoying blue box with "Informazioni sul periodo di default" ruining the interface
- **Solution**: Completely removed the blue box from `DateRangeSelector.tsx` (lines 88-120)
- **Result**: Clean, professional date selector without visual clutter

### 📊 **2. HISTORICAL CHARTS IMPLEMENTATION**

- **Technology**: Implemented using Recharts library (professional charting solution)
- **Data**: Real historical data from analytics API showing orders, customers, and revenue trends
- **Chart Types**: LineChart with dual Y-axis for better data visualization
- **Features**:
  - Interactive tooltips with formatted currency and numbers
  - Responsive design that works on all screen sizes
  - Custom colors matching ShopMe design system (green #22c55e, blue #3b82f6, orange #f59e0b)
  - Legend and grid for better readability

### 🎨 **3. DESIGN SYSTEM CONSISTENCY**

- **Colors**: Applied consistent green color scheme matching main app
- **Typography**: Proper font weights and sizes consistent with ShopMe
- **Spacing**: Professional spacing using Tailwind CSS grid system
- **Icons**: Lucide React icons matching the rest of the application
- **Cards**: Consistent Card components with proper headers and content

### 📈 **4. ENHANCED DATA VISUALIZATION**

- **Real Data**: Charts display actual order data from database (not mock data)
- **Multi-metric**: Shows Orders, Customers, and Revenue in single chart
- **Summary Stats**: Added bottom section with key metrics in colored cards
- **Empty State**: Proper handling when no data is available
- **Responsive**: Charts adapt to different screen sizes

### 🔧 **5. TECHNICAL IMPLEMENTATION**

- **Component**: Created `HistoricalChart.tsx` component with TypeScript
- **Integration**: Seamlessly integrated into `AnalyticsPage.tsx`
- **Data Flow**: Uses existing analytics API endpoints
- **Performance**: Optimized with ResponsiveContainer for smooth rendering
- **Error Handling**: Graceful fallbacks when data is missing

**SPECIAL NOTE**:
Il maledetto box azzurro è stato eliminato! Il dashboard ora mostra grafici storici reali e ha un design professionale che segue perfettamente il sistema di design di ShopMe. Charts responsivi con dati reali dal database.

**STORY POINT**: 8
**STATUS**: ✅ COMPLETED

================================================================================

## TASK #6

**TITLE**: Login Page Design Fixes
**DESCRIPTION/ROADMAP**:

- Remove "Conversational E-commerce, Reimagined" text from right panel
- Apply consistent color palette matching main application
- Update typography to match main app fonts and sizing
- Replace non-coherent icons with design system icons
- Redesign right panel content strategy for ShopMe brand
- Ensure brand consistency throughout login experience

**SPECIAL NOTE**:
Andrea non gradisce la parte destra del login - né colori, né testo, né icone sono in linea con il resto dell'applicazione. Tutto deve essere coerente con ShopMe.

**STORY POINT**: 5
**STATUS**: 🔴 Not Started

================================================================================

## TASK #7 ✅ COMPLETED

**TITLE**: User Avatar Size Increase
**DESCRIPTION/ROADMAP**:

- ✅ Increase avatar size from current (32px) to 48px
- ✅ Improve visibility and prominence in header
- ✅ Ensure proper proportions with other header elements
- ✅ Add proper hover and focus states
- ✅ Maintain accessibility standards (minimum 44px touch target)
- ✅ Test responsive behavior across different screen sizes

**IMPLEMENTATION COMPLETED**:

- Updated Header.tsx to set avatar and button size to 48px (h-12 w-12)
- Added focus ring and hover scale for accessibility and visibility
- Increased fallback initials font size for better readability
- Verified proportions and alignment in header
- Ran full frontend build to ensure no errors after update

**SPECIAL NOTE**:
L'avatar utente in alto a destra ora è molto più visibile, accessibile e conforme alle richieste di Andrea. Nessun impatto negativo su layout o funzionalità.

**STORY POINT**: 2
**STATUS**: ✅ COMPLETED - Fully Functional

================================================================================

## TASK #8

**TITLE**: N8N Frontend Integration Removal
**DESCRIPTION/ROADMAP**:

- Remove N8NPage.tsx and related components
- Remove /settings/n8n route and navigation
- Clean up N8N services and API calls from frontend
- Remove embedded iframe integration
- Keep only backend N8N workflow functionality
- Document for future integration when requirements are clearer

**SPECIAL NOTE**:
L'URL del workflow N8N non è dinamico e non funziona. Andrea preferisce semplificare rimuovendo l'integrazione frontend e mantenendo solo il workflow backend.

**STORY POINT**: 3
**STATUS**: 🔴 Not Started

================================================================================

## TASK #14

**TITLE**: Automatic Embedding Trigger & Remove Manual Button
**DESCRIPTION/ROADMAP**:

- Remove the manual embedding button from all relevant sections (documents, products, FAQs, services, etc.)
- Automatically trigger the embedding process after every add, update, or delete operation
- Ensure this behavior is consistent across all sessions and entity types
- No manual intervention required for embedding generation

**SPECIAL NOTE**:
Andrea requires that embedding is always up-to-date and automatic. The manual embedding button is no longer desired and must be removed everywhere.

**STORY POINT**: TBD
**STATUS**: 🔴 Not Started

================================================================================

## ❌ TASK #9 - CANCELED

**TITLE**: ~~Advanced Analytics Dashboard Implementation~~
**REASON**: Task troppo avanzato, non presente nel PRD. Cancellato per decisione di Andrea.

================================================================================

## TASK #23

**TITLE**: N8N - CF Call Operator
**DESCRIPTION/ROADMAP**:

- Implement a new N8N Custom Function (CF) for the "Call Operator" workflow
- Integrate with backend as needed
- Ensure proper error handling and logging
- Test the workflow end-to-end

**SPECIAL NOTE**:
Andrea requires a dedicated N8N CF for operator call management.

**STORY POINT**: TBD
**STATUS**: ✅ COMPLETED

================================================================================

## TASK #24

**TITLE**: N8N - CF New Order
**DESCRIPTION/ROADMAP**:

- Implement a new N8N Custom Function (CF) for the "New Order" workflow
- Integrate with backend as needed
- Ensure proper error handling and logging
- Test the workflow end-to-end

**SPECIAL NOTE**:
Andrea requires a dedicated N8N CF for new order management.

**STORY POINT**: TBD
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

**STORY POINT**: TBD
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

**STORY POINT**: TBD
**STATUS**: 🔴 Not Started

================================================================================

## BUG TASK #24

**TITLE**: Discounted Price Not Applied in LLM/N8N Responses
**DESCRIPTION/ROADMAP**:

- When a customer with a discount (e.g., 10%) asks for a product price, the system returns the full price instead of the discounted price.
- Investigate why the discount is not being applied in the LLM/N8N response flow.
- Ensure the correct discounted price is always shown in responses, both in RAG/LLM and N8N flows.
- Add/Update tests to verify correct discount application in all relevant endpoints and flows.

**SPECIAL NOTE**:
Andrea requires that the customer discount logic is always respected and visible to the user. No hardcoded prices; always use the dynamic, discounted price.

**STATUS**: 🔴 Not Started

================================================================================

## 📊 PRIORITY SUMMARY

**🔴 CRITICAL/HIGH PRIORITY (Tasks #1-#8)**:

- Total Story Points: 47
- ✅ **COMPLETED TASKS**:
  - TASK #1: N8N Credentials Persistence Fix (8 Story Points)
  - TASK #2: Complete Orders Management System (13 Story Points)
  - TASK #5: Analytics Dashboard Fixes (8 Story Points)
  - TASK #6: Complete Invoice Address Management System (8 Story Points)
- **📊 PROGRESS**: 37/47 Story Points Complete (79% Complete)
- Estimated Duration: 2-3 weeks remaining
- Focus: Core functionality fixes and UX improvements

**🔵 PLANNED/FUTURE (Tasks #10-#13)**:

- Total Story Points: 50 (was 63, reduced after TASK #9 cancellation)
- Estimated Duration: 8-12 weeks
- Focus: Advanced features, testing, and optimizations

**❌ CANCELED TASKS**:

- TASK #9: Advanced Analytics Dashboard (13 Story Points) - Too advanced, not in PRD

## 🎯 SPRINT PLANNING SUGGESTION

**✅ COMPLETED SPRINTS**:

- **Sprint 1**: ✅ Tasks #1, #5, #6 (29 Story Points) - COMPLETED
- **Sprint 2**: ✅ Task #2 (13 Story Points) - COMPLETED

**🔴 REMAINING SPRINTS**:

- **Sprint 3 (1 week)**: Tasks #4, #7 (5 Story Points) - UI/UX Fixes
- **Sprint 4 (1 week)**: Tasks #3, #8 (8 Story Points) - Session & Cleanup

## 📝 IMPLEMENTATION NOTES

- All tasks follow existing project architecture (DDD backend, React frontend)
- Database changes require Prisma migration scripts
- Frontend changes must maintain existing design system consistency
- All APIs must include proper error handling and validation
- Tests should be added for new functionality
- Andrea's approval required before marking any task as "DONE"

## 🧪 TESTING STRATEGY

**CURRENT APPROACH**: Focus on core functionality stability first

- **Unit Tests**: Da implementare quando la situazione sarà stabile
- **Integration Tests**: Da implementare quando la situazione sarà stabile
- **Priority**: Prima stabilizzare le funzionalità core, poi aggiungere test completi

**FUTURE TESTING PLAN**:

- Comprehensive unit tests for all services and utilities
- Integration tests for API endpoints and database operations
- End-to-end tests for critical user flows
- Test coverage target: >80% when system is stable

---

_Last updated: 2025-07-09_
_Format: Structured Task List v2.0_

================================================================================

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
