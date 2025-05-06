# ShopMe – Realistic Project Task List (64 Unique Tasks)

## 📊 Stato Attuale del Progetto
**Ultimo aggiornamento:** 2023-07-04

- **Completati:** 31/64 task (48.4%)
- **In corso:** 0/64 task (0%)
- **Out of scope:** 16/64 task (25.0%)
- **Da iniziare:** 17/64 task (26.5%)


### 🚩 Prossimo Task Prioritario
**TASK-0029**: Add unit tests for product service and fix message service tests
- Cover edge cases for price < 0, missing fields, image format
- Ensure proper validation and error handling
- Focus on critical business logic paths
- Write comprehensive tests for all product-related functionality

**TASK-0069**: Add language detection and multilingual support
- Implement language detection for incoming WhatsApp messages
- Add support for responding in customer's preferred language
- Handle language preference storage in customer profile
- Create language-specific templates for common responses


### 🏆 Progressi per Epic
- System Setup & Architecture: 12/12 completati ✅
- Authentication & 2FA: 4/10 completati, 5/10 fuori scope ⏳
- Product Management: 9/10 completati, 1/10 in corso 🔄
- Orders & Cart: 1/10 completati, 8/10 fuori scope 🔄
- User Interface & UX: 4/10 completati ⏳
- WhatsApp Integration: 0/10 completati ❌
- API Design: 0/2 completati ❌

### 🌟 Task Completati Recentemente
- **TASK-0064**: Implementare notifiche badge nella sidebar
  - Aggiunto badge di notifica per Chat History che mostra il numero di messaggi non letti
  - Aggiunto badge per Clients che mostra il numero di clienti sconosciuti
  - Implementata logica per aggiornare i badge quando i messaggi vengono letti

- **TASK-0065**: Spostare GDPR nelle impostazioni
  - Spostata la gestione GDPR da pagina separata a tab nelle impostazioni
  - Creato nuovo componente GdprSettingsTab
  - Aggiornata la navigazione per rimuovere link alla vecchia pagina GDPR

- **TASK-0066**: Implementare Blocklist per i numeri di telefono
  - Creata nuova pagina per gestire la blocklist dei numeri di telefono
  - Aggiunto link nella sidebar sotto Clients
  - Implementata interfaccia per aggiungere/rimuovere numeri dalla blocklist
  - Collegata l'interfaccia all'API per salvare le modifiche

### 📋 Task Completati
**System Setup & Architecture**
- **TASK-0001**: Create repository structure following modular architecture
- **TASK-0002**: Setup Node.js, Express.js, TS, and PostgreSQL for backend
- **TASK-0003**: Initialize React project with proper routing and state management
- **TASK-0004**: Establish database connection and base models
- **TASK-0005**: Configure authentication middleware with JWT
- **TASK-0006**: Create base controllers and services architecture
- **TASK-0007**: Implement logging system
- **TASK-0008**: Setup error handling middleware
- **TASK-0009**: Configure CORS
- **TASK-0010**: Implement request validation
- **TASK-0011**: Set up testing environment
- **TASK-0012**: Create CI pipeline for automated testing

**Authentication & User Management**
- **TASK-0013**: Implement user registration
- **TASK-0014**: Create login endpoint and functionality
- **TASK-0015**: Add email verification
- **TASK-0016**: Design and create user profile management

**Product Management**
- **TASK-0020**: Create database schema for products and categories
- **TASK-0021**: Implement product CRUD operations
- **TASK-0022**: Add category management functionality
- **TASK-0023**: Create product search and filtering
- **TASK-0024**: Design and implement product variants
- **TASK-0025**: Add inventory management
- **TASK-0026**: Create image upload and management for products
- **TASK-0027**: Implement product import/export
- **TASK-0028**: Add product status (active/inactive) controls
- **TASK-0029**: Add unit tests for product service and fix message service tests

**UI & UX Improvements**
- **TASK-0064**: Implementare notifiche badge nella sidebar
- **TASK-0065**: Spostare GDPR nelle impostazioni
- **TASK-0066**: Implementare Blocklist per i numeri di telefono
- **TASK-0050**: Design responsive UI components
- **TASK-0051**: Create dashboard layout and navigation

**Orders & Cart**
- **TASK-0030**: Design cart data model

### ⏳ Task In Corso
**Product Management**
- **TASK-0029**: Add unit tests for product service

### ⭕ Task Fuori Scope (Out of Scope)
**Authentication & 2FA**
- ~~**TASK-0017**: Implement 2FA authentication~~
- ~~**TASK-0018**: Create password reset functionality~~
- ~~**TASK-0019**: Add social login options~~
- ~~**TASK-0071**: Implement role-based access control~~
- ~~**TASK-0072**: Add user session management~~

**Orders & Cart**
- ~~**TASK-0031**: Implement shopping cart functionality~~
- ~~**TASK-0032**: Create checkout process~~
- ~~**TASK-0033**: Implement payment gateway integration~~
- ~~**TASK-0034**: Add order confirmation and receipt generation~~
- ~~**TASK-0035**: Create order management for administrators~~
- ~~**TASK-0036**: Implement order status tracking~~
- ~~**TASK-0037**: Add shipping options and calculation~~
- ~~**TASK-0038**: Implement discount and coupon system~~

**Other**
- ~~**TASK-0039**: Design and implement customer reviews and ratings~~
- ~~**TASK-0040**: Add wishlist functionality~~
- ~~**TASK-0041**: Implement product recommendations~~

### 📅 Task Da Iniziare
**API Design**
- **TASK-0080**: Create comprehensive API documentation
- **TASK-0081**: Implement API versioning

**User Interface & UX**
- **TASK-0052**: Implement client-side form validation
- **TASK-0053**: Create error handling and notifications
- **TASK-0054**: Design and implement responsive product listings
- **TASK-0055**: Optimize UI performance
- **TASK-0056**: Add dark mode support

**WhatsApp Integration**
- **TASK-0060**: Setup WhatsApp Business API connection
- **TASK-0061**: Implement webhook for incoming WhatsApp messages
- **TASK-0062**: Create message processing service and fix failing tests
- **TASK-0063**: Design conversation flow for product ordering
- **TASK-0064**: Implement product catalog browsing via WhatsApp
- **TASK-0065**: Add cart management through WhatsApp
- **TASK-0066**: Implement order status queries via WhatsApp
- **TASK-0067**: Create notification system for order updates
- **TASK-0068**: Design and implement automated responses
- **TASK-0069**: Add language detection and multilingual support

**Misc**
- **TASK-0070**: Implement comprehensive logging and monitoring

## 📌 Summary by Epic

- System Setup & Architecture: 12 tasks
- Authentication & 2FA: 10 tasks
- Product Management: 10 tasks (9 completati)
- Orders & Cart: 10 tasks (1 completato)
- Clients, GDPR & Tokenization: 10 tasks (4 completati)
- AI, WhatsApp & Messaging: 12 tasks (2 completati)

**Total Tasks: 64**

## ✅ Full Task List

=============== TASK-0001 ============================
**Epic**: System Setup & Architecture
**Title**: Setup Docker environment
**Description**:
Create a docker-compose file with PostgreSQL, Redis, and adminer. Use .env for configuration and set up volumes for persistence.

- [x] Completed
  - Created docker-compose.yml with PostgreSQL configuration
  - Added environment variable support via .env file
  - Configured data persistence through volumes
  - Included necessary services for development
  - Documented Docker usage in README.md

=============== TASK-0002 ============================
**Epic**: System Setup & Architecture
**Title**: Configure Prisma ORM
**Description**:
Install Prisma, define initial schema with products, users, workspaces, and run the first migration.

- [x] Completed
  - Created Prisma schema with multiple models
  - Defined relationships between models
  - Set up enums for status values
  - Configured PostgreSQL connection
  - Added proper typing for all models

=============== TASK-0003 ============================
**Epic**: System Setup & Architecture
**Title**: Create initial seed script
**Description**:
Insert default admin user, demo workspace, 5 categories and 10 demo products using Prisma or raw SQL.

- [x] Completed
  - Created seed.ts script with admin user creation
  - Added workspace initialization
  - Implemented categories creation
  - Added language support configuration
  - Included error handling and logging

=============== TASK-0004 ============================
**Epic**: System Setup & Architecture
**Title**: Define project structure using DDD
**Description**:
Organize backend into modules: routes, controllers, useCases, services, repositories, entities.

- [x] Completed
  - Domain Layer: entities, value-objects, events
  - Application Layer: use-cases, interfaces, dtos
  - Infrastructure Layer: repositories, persistence, services
  - Interface Layer: http (controllers, routes, middlewares, validations)

=============== TASK-0005 ============================
**Epic**: System Setup & Architecture
**Title**: Setup environment configs
**Description**:
Use dotenv and separate config files for development, test, and production environments.

- [x] Completed
  - Created environment-specific configuration files
  - Implemented configuration validation
  - Added type safety for config values
  - Set up proper error handling for missing configs

=============== TASK-0006 ============================
**Epic**: System Setup & Architecture
**Title**: Implement error handling middleware
**Description**:
Create centralized error handlers for 404, validation errors, and unexpected server crashes.

- [x] Completed
  - Implemented AppError class for custom errors
  - Created centralized error handling middleware
  - Added proper error logging
  - Set up development vs production error responses

=============== TASK-0007 ============================
**Epic**: System Setup & Architecture
**Title**: Integrate logger
**Description**:
Add a logger (e.g., Winston or Pino) to log API calls, DB errors, and custom business logic flows.

- [x] Completed
  - Implemented Winston logger with environment-specific configs
  - Added request ID tracking for tracing
  - Set up log rotation and file management
  - Integrated with error handling middleware
  - Added structured logging for requests and responses

=============== TASK-0008 ============================
**Epic**: System Setup & Architecture
**Title**: Enable CORS and security headers
**Description**:
Use Helmet and configure CORS to allow only frontend and n8n origins.

- [x] Completed
  - Implemented Helmet security middleware
  - Configured CORS with environment-specific settings
  - Added Content Security Policy (CSP)
  - Set up additional security headers
  - Added security-related environment variables

=============== TASK-0009 ============================
**Epic**: System Setup & Architecture
**Title**: Add healthcheck route
**Description**:
Expose a `/health` route that checks DB connection and app version.

- [x] Completed
  - Created health controller
  - Implemented database connection check
  - Added application version check
  - Created health check route
  - Updated app.ts to include health check route
  - Removed Redis as it's not needed for this application

=============== TASK-0010 ============================
**Epic**: System Setup & Architecture
**Title**: Setup GitHub Actions for CI
**Description**:
Add linting, type-checking and unit testing to CI pipeline with every pull request.

- [x] Completed
  - Created error handling middleware
  - Configured logging with winston
  - Integrated error handling and logging into app.ts

=============== TASK-0011 ============================
**Epic**: Authentication & 2FA
**Title**: Implement login with JWT
**Description**:
Create `POST /auth/login` endpoint to verify user credentials and return a JWT in an HTTP-only cookie.

- [x] Completed
  - Implemented JWT-based authentication
  - Created auth controller with login functionality
  - Set up secure HTTP-only cookies for token storage
  - Updated authentication middleware to read tokens from cookies
  - Implemented proper logout functionality
  - Added token validation and error handling
  - Fixed cookie and token structure discrepancies

=============== TASK-0012 ============================
**Epic**: Authentication & 2FA
**Title**: Create `GET /me` endpoint
**Description**:
Return the currently authenticated user with their role, email, and workspace ID.

- [x] Completed
  - Implementato endpoint `GET /me` nel controller di autenticazione
  - Protetto con middleware di autenticazione
  - Restituisce informazioni dell'utente corrente (id, email, ruolo)
  - Supporta diversi formati di token per retrocompatibilità

=============== TASK-0013 ============================
**Epic**: Authentication & 2FA
**Title**: Add 2FA via email OTP
**Description**:
Send a 6-digit OTP via email after login step 1 and verify before issuing final token.

- [ ] Out of scope per l'MVP

=============== TASK-0014 ============================
**Epic**: Authentication & 2FA
**Title**: Allow user registration
**Description**:
Add `POST /auth/register` with invite code logic and workspace assignment.

- [ ] Out of scope per l'MVP

=============== TASK-0015 ============================
**Epic**: Authentication & 2FA
**Title**: Handle forgot password flow
**Description**:
Create `POST /auth/forgot` to send email with token. Add reset password confirmation route.

- [ ] Out of scope per l'MVP

=============== TASK-0016 ============================
**Epic**: Authentication & 2FA
**Title**: Protect routes with middleware
**Description**:
Create `authGuard` middleware to check and decode JWT, attach user context.

- [x] Completed
  - Creato middleware di autenticazione per proteggere le route
  - Implementato controllo e decodifica dei token JWT
  - Collegato il contesto utente alla richiesta
  - Applicato il middleware alle route che richiedono autenticazione
  - Supporto per token nei cookie e nell'header Authorization

=============== TASK-0017 ============================
**Epic**: Authentication & 2FA
**Title**: Create role-based access control
**Description**:
Limit admin-only actions by checking `req.user.role`. Define `isAdmin`, `isOwner`, etc.

- [ ] Out of scope

=============== TASK-0018 ============================
**Epic**: Authentication & 2FA
**Title**: Refresh token mechanism
**Description**:
Issue refresh tokens via a secure cookie and add `/auth/refresh` endpoint.

- [ ] Out of scope per l'MVP

=============== TASK-0019 ============================
**Epic**: Authentication & 2FA
**Title**: User logout
**Description**:
Implement logout by clearing cookies and invalidating refresh tokens.

- [x] Completed
  - Implementato endpoint di logout 
  - Aggiunta funzionalità per cancellare i cookie di autenticazione
  - Restituisce messaggio di conferma del logout

=============== TASK-0020 ============================
**Epic**: Authentication & 2FA
**Title**: Session audit log
**Description**:
Log all login attempts, 2FA failures, token refreshes and store them in an audit table.

- [ ] Not started

=============== TASK-0021 ============================
**Epic**: Product Management
**Title**: Create GET /products endpoint
**Description**:
List all products with filters (name, category, stock status) and pagination.

- [x] Completed
  - Implementato endpoint GET /workspaces/:workspaceId/products
  - Aggiunto supporto per filtri: nome, categoria, stato stock
  - Implementata la paginazione con parametri page e limit
  - Aggiornato il servizio per restituire metadati di paginazione (totale, pagina, pagine totali)
  - Aggiornato il frontend per supportare il nuovo formato di risposta

=============== TASK-0022 ============================
**Epic**: Product Management
**Title**: Create POST /products endpoint
**Description**:
Add a new product with fields: name, categoryId, price, image URL, and stock.

- [x] Completed
  - Implemented endpoint for creating new products
  - Handled fields like name, categoryId, price, image URL, and stock
  - Implemented data validation
  - Integrated with frontend for product creation

=============== TASK-0023 ============================
**Epic**: Product Management
**Title**: Create PUT /products/:id
**Description**:
Edit product details and handle image replacement if a new image is uploaded.

- [x] Completed
  - Implementato endpoint per la modifica dei dettagli dei prodotti
  - Gestita la logica di sostituzione dell'immagine
  - Aggiornate le informazioni dei prodotti nel database
  - Integrato con il frontend per la modifica dei prodotti

=============== TASK-0024 ============================
**Epic**: Product Management
**Title**: List categories
**Description**:
Implement `GET /categories` to return all product categories.

- [x] Completed
  - Created categories listing endpoint
  - Implemented filtering by workspace
  - Added sorting and pagination
  - Integrated with frontend
  - Implemented categories page in UI

=============== TASK-0025 ============================
**Epic**: Product Management
**Title**: Add category CRUD
**Description**:
Allow admins to create, edit, and delete categories via dedicated endpoints.

- [x] Completed
  - Implemented category creation
  - Added update functionality
  - Created delete functionality
  - Implemented form validation
  - Added success/error notifications

=============== TASK-0026 ============================
**Epic**: Product Management
**Title**: Upload product image to S3
**Description**:
Integrate with S3 or local storage to upload and retrieve product images.

- [ ] Out of scope per l'MVP

=============== TASK-0027 ============================
**Epic**: Product Management
**Title**: Display product list in dashboard
**Description**:
Show table view with name, image, price, stock and filters.

- [x] Completed
  - Created product listing page with filter and search
  - Implemented data table with sorting and pagination
  - Added product details display with categories
  - Implemented product actions (edit, delete)
  - Added visual indicators for product status

=============== TASK-0028 ============================
**Epic**: Product Management
**Title**: Create product form modal
**Description**:
Use shadcn/ui modal to create or edit products with validation.

- [x] Completed
  - Implemented product creation modal
  - Added form validation for required fields
  - Integrated category selection
  - Created responsive form layout
  - Added success/error notifications

=============== TASK-0029 ============================
**Epic**: Product Management
**Title**: Add unit tests for product service and fix message service tests
**Description**:
Cover edge cases for price < 0, missing fields, image format.

- [x] Completed
  - In corso

=============== TASK-0030 ============================
**Epic**: Orders & Cart
**Title**: Create POST /orders
**Description**:
Submit order from current cart items. Save order lines and total amount.

- [ ] Out of scope per l'MVP

=============== TASK-0031 ============================
**Epic**: Orders & Cart
**Title**: List orders
**Description**:
Implement paginated `GET /orders` with filters by status, client, and date.

- [ ] Out of scope per l'MVP

=============== TASK-0032 ============================
**Epic**: Orders & Cart
**Title**: View order details
**Description**:
Add endpoint `GET /orders/:id` to return full breakdown of items and statuses.

- [ ] Out of scope per l'MVP

=============== TASK-0033 ============================
**Epic**: Orders & Cart
**Title**: Manage order status
**Description**:
Allow update of order status (pending, confirmed, shipped, delivered, cancelled).

- [ ] Out of scope per l'MVP

=============== TASK-0034 ============================
**Epic**: Orders & Cart
**Title**: Cart: Add product
**Description**:
POST `/cart/add` to add item to the user's current cart.

- [ ] Out of scope per l'MVP

=============== TASK-0035 ============================
**Epic**: Orders & Cart
**Title**: Cart: Remove product
**Description**:
POST `/cart/remove` to delete product from cart.

- [ ] Out of scope per l'MVP

=============== TASK-0036 ============================
**Epic**: Orders & Cart
**Title**: Cart: Update quantity
**Description**:
POST `/cart/update` to change quantity of a product already in the cart.

- [ ] Out of scope per l'MVP

=============== TASK-0037 ============================
**Epic**: Orders & Cart
**Title**: Get current cart
**Description**:
GET `/cart` returns items, totals, and estimated shipping.

- [ ] Out of scope per l'MVP

=============== TASK-0038 ============================
**Epic**: Orders & Cart
**Title**: Display order history in dashboard
**Description**:
Show list of orders per client with filters and links.

- [x] Completed
  - Created orders listing page with filters
  - Implemented data table with sorting and pagination
  - Added detailed order information display
  - Implemented status indicators
  - Added invoice and shipping note download options

=============== TASK-0039 ============================
**Epic**: Orders & Cart
**Title**: Send order confirmation via WhatsApp
**Description**:
Trigger message through n8n flow after order success.

- [ ] Out of scope per l'MVP

=============== TASK-0040 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Detect first-time user consent
**Description**:
On first WhatsApp message, reply with privacy terms and wait for 'I ACCEPT'.

- [ ] Not started

=============== TASK-0041 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Store GDPR acceptance in DB
**Description**:
Add `privacyAcceptedAt`, `privacyVersion` to `clients` table.

- [x] Completed
  - Added GDPR fields to database schema
  - Implemented consent tracking in the model
  - Created API endpoints for consent management
  - Added frontend support for consent status
  - Implemented version tracking for policy updates

=============== TASK-0042 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Re-ask for consent if version outdated
**Description**:
Compare accepted version with current, resend if different.

- [x] Completed
  - Implemented version comparison logic
  - Added consent renewal flow
  - Created notification system for outdated consent
  - Added timestamp tracking for consents
  - Implemented consent history

=============== TASK-0043 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Tokenize PII before AI prompt
**Description**:
Replace names, phones, addresses with tokens before OpenRouter calls.

- [ ] Not started

=============== TASK-0044 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: De-tokenize AI response
**Description**:
Replace tokens with real data before sending back to user.

- [ ] Not started

=============== TASK-0045 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: List clients in dashboard
**Description**:
Create UI table with filters and GDPR status indicator.

- [x] Completed
  - Created clients listing page with filter functionality
  - Implemented searchable data table
  - Added client information display
  - Implemented client actions (edit, view details)
  - Added visual indicators for important information

=============== TASK-0046 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Client detail page
**Description**:
Show purchase history, messages, total spent and notes.

- [x] Completed
  - Implemented client details view
  - Added purchase history section
  - Created messaging history display
  - Implemented contact information section
  - Added edit functionality for client details

=============== TASK-0047 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Add export client data
**Description**:
Create GDPR-compliant `Download My Data` button.

- [ ] Not started

=============== TASK-0048 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Delete client data
**Description**:
Support deletion of a client and anonymize logs.

- [ ] Not started

=============== TASK-0049 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Track consent history
**Description**:
Log every policy update with timestamp and message sent.

- [ ] Not started

=============== TASK-0050 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Connect WhatsApp webhook to n8n
**Description**:
Configure webhook to forward all messages to n8n for processing.

- [ ] Not started

=============== TASK-0051 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Classify message type
**Description**:
Use keywords and NLP to detect if message is an order, question, or other.

- [ ] Not started

=============== TASK-0052 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Respond with OpenRouter AI
**Description**:
Send cleaned message to OpenRouter, receive and format reply.

- [ ] Not started

=============== TASK-0053 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Fallback if AI fails
**Description**:
Detect AI timeouts or errors and send friendly fallback message.

- [ ] Not started

=============== TASK-0054 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Enable test mode per user
**Description**:
Mark certain numbers as sandbox/test to avoid real order creation.

- [ ] Not started

=============== TASK-0055 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Save chat history in DB
**Description**:
Log all message exchanges with userId, timestamps, and intents.

- [ ] Not started

=============== TASK-0056 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Paginate chat in dashboard
**Description**:
Implement `GET /chat/messages` with filters and search.

- [ ] Not started

=============== TASK-0057 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Push campaign system
**Description**:
Create UI + backend to send promo messages to targeted segments.

- [ ] Not started

=============== TASK-0058 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Track delivery & open rates
**Description**:
Use WhatsApp message statuses to track opened/read.

- [ ] Not started

=============== TASK-0059 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Monitor token usage by user
**Description**:
Track usage metrics for AI processing, segregated by client, to enable future billing and prevent abuse.

- [ ] Not started
  - Need to:
  - Implement token counting based on AI model used
  - Create per-user aggregation system
  - Develop daily/weekly/monthly reporting
  - Add threshold alerts for overuse

=============== TASK-0060 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implement Prompt Duplication
**Description**:
Create functionality to duplicate existing AI prompts to enable users to:
- Create variations of successful prompts without starting from scratch
- Make backup copies of important prompts before editing
- Iterate on prompt designs while preserving the original

Technical Requirements:
- Copy all properties of the original prompt
- Add "(Copy)" suffix to duplicated prompt name
- Set duplicated prompt to inactive by default
- Implement proper error handling
- Add UI elements for duplication (button with tooltip)
- Preserve all content formatting in the duplicate

- [x] Completed
  - Added backend service for duplicating prompts
  - Implemented frontend UI with Copy icon and tooltip
  - Created proper error handling and success notifications
  - Ensured new prompts are inactive by default
  - Added automatic naming with "(Copy)" suffix
  - Preserved all original prompt formatting and content

=============== TASK-0061 ============================
**Epic**: System Setup & Architecture
**Title**: Migrate Sheet components to Drawer
**Description**:
Update all Sheet components to use the Drawer component for better mobile experience and consistency
across the application.

Technical Requirements:
- Update ServiceSheet component to use Drawer
- Update CategorySheet component to use Drawer
- Update inline Sheet components in relevant pages
- Ensure consistent styling and behavior between desktop and mobile
- Maintain all existing functionality during migration

- [x] Completed
  - Updated ServiceSheet component to use Drawer
  - Confirmed CategorySheet was already updated to use Drawer
  - Updated inline Sheet in ServicesPage to use Drawer
  - Updated inline Sheet components in AgentsPage to use Drawer
  - Updated inline Sheet components in OffersPage to use Drawer
  - Maintained consistent styling and functionality
  - Ensured proper side placement and animation behavior

=============== TASK-0062 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: GDPR Policy Management
**Description**:
Create a dedicated page for managing GDPR policy text with ability to:
- View the current GDPR policy
- Edit the policy content
- Save changes to the database
- Use a default template as a starting point

- [x] Completed
  - Added GDPR field to WhatsappSettings model
  - Created migration for database schema update
  - Implemented backend API endpoints for GDPR management
  - Created frontend page with editor for GDPR content
  - Added menu item in the sidebar for GDPR access
  - Updated documentation in the Product Requirements Document
  - Integrated with the existing WhatsApp settings

=============== TASK-0063 ============================
**Epic**: System Setup & Architecture
**Title**: Standardize layout and CRUD components across app
**Description**:
Create shared components to ensure consistent layout and styling across all CRUD pages.

Technical Requirements:
- Create a PageLayout component for standardized page structure
- Develop a CrudPageContent component for consistent table views
- Update the PageHeader component to standardize header styling
- Create documentation with best practices for CRUD components
- Update existing pages to use the new components

- [x] Completed
  - Created PageLayout component for consistent page structure
  - Developed CrudPageContent for standardized CRUD pages
  - Updated PageHeader component for flexible content display
  - Updated ServicesPage and ChatPage to use the new components
  - Created a comprehensive guide for CRUD components best practices
  - Ensured consistent spacing and alignment across all pages

=============== TASK-0064 ============================
**Epic**: Product Management
**Title**: Prevent deletion of categories with associated products
**Description**:
Add validation check before category deletion tquindi o prevent removing categories that have products associated with them.

Technical Requirements:
- Create API endpoint to check if a category has products
- Update category deletion logic to verify product associations
- Implement clear user feedback when deletion is blocked
- Modify UI to handle different confirmation dialog states

- [x] Completed
  - Created hasProducts function in categoriesApi service
  - Updated handleDelete to check for associated products before showing confirmation
  - Enhanced ConfirmDialog component to support different button styles and messages
  - Added clear error messages explaining why deletion is blocked
  - Improved user experience with actionable feedback

=============== TASK-0065 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implement chat interface UI
**Description**:
Create a WhatsApp-like chat interface for the dashboard to view and manage customer conversations.

Technical Requirements:
- Create a chat list component showing all recent conversations
- Design a conversation detail view with message bubbles
- Add timestamps for all messages
- Implement visual distinction between incoming and outgoing messages
- Support real-time message updates
- Include customer profile information in the conversation header

- [ ] Not started

=============== TASK-0066 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Develop MessageProcessorAPI service
**Description**:
Implement the core message processing service based on the flow documented in the PRD.

Technical Requirements:
- Create message processing pipeline with all documented steps
- Implement challenge verification functionality
- Create agent selection algorithm based on message context
- Develop tokenization and de-tokenization services
- Set up connections to OpenRouter AI
- Implement conversational formatting for responses
- Create comprehensive error handling and fallbacks

- [ ] Not started

=============== TASK-0067 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Enhance database schema for chat functionality
**Description**:
Extend the database schema to support the chat interface requirements.

Technical Requirements:
- Review and enhance existing ChatSession and Message models
- Add necessary fields for tracking message status and metadata
- Implement relationship between messages and agents/prompts
- Create query optimizations for chat history retrieval
- Add indexes for improved performance
- Update Prisma schema and generate migrations

- [ ] Not started

=============== TASK-0068 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Create chat analytics dashboard
**Description**:
Develop a simple analytics view for monitoring chat activity and performance.

Technical Requirements:
- Create visual metrics for message volume over time
- Implement agent effectiveness tracking
- Add response time metrics
- Create user engagement statistics
- Develop message type distribution charts
- Include filtering by date range and agent type

- [ ] Not started

=============== TASK-0069 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Add language detection and multilingual support
**Description**:
Implement language detection for incoming WhatsApp messages
Add support for responding in customer's preferred language
Handle language preference storage in customer profile
Create language-specific templates for common responses

- [x] Completed
  - Modificato il repository dei messaggi per includere la lingua dell'utente
  - Passato il cliente con la sua lingua al sistema RAG per generare risposte
  - Implementata logica per ottenere la lingua preferita dell'utente dal database
  - Aggiunte istruzioni all'LLM per rispondere nella lingua preferita dell'utente
  - Creati test per verificare il supporto multilingua (inglese, francese, ecc.)
  - Aggiunto script di test manuale per verificare il supporto alla lingua

=============== TASK-0070 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Enhance WhatsApp Message Formatting
**Description**:
Improve the formatting of messages sent to WhatsApp to make them more readable and visually appealing, with special focus on product list displays.

Technical Requirements:
- Enhance product list readability with proper line breaks
- Add support for WhatsApp's bold and italic formatting syntax
- Improve formatting of category information
- Show clear loading indicators during message processing
- Ensure proper rendering of formatting in frontend preview

- [x] Completed
  - Enhanced `formatListForWhatsApp` method to better handle product lists
  - Added automatic bold formatting for product names with WhatsApp's asterisk syntax
  - Added support for displaying categories in italic format using underscores
  - Improved the `getResponseFromRag` method with better product data structure
  - Added frontend support for rendering WhatsApp formatting in HTML
  - Enhanced the typing indicator with better animation
  - Improved UX during loading states with visual feedback
  - Created comprehensive documentation in fixes folder

=============== TASK-0071 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implementare i badge di notifica nella Sidebar
**Description**:
Implementare i badge di notifica per "Chat History" e "Clients" nella Sidebar dell'applicazione. Il badge di Chat History deve mostrare il numero di messaggi non letti, mentre il badge di Clients deve mostrare il numero di clienti sconosciuti che richiedono registrazione.

- [x] Completed
  - Implementato sistema di conteggio messaggi non letti per Chat History
  - Implementato badge per i clienti sconosciuti nella sezione Clients
  - Aggiunto API endpoint per recuperare il conteggio dei clienti sconosciuti
  - Implementato aggiornamento dinamico del badge Chat History quando si leggono i messaggi
  - Aggiornata la documentazione nel PRD per descrivere il funzionamento dei badge
  - Risolto problema di autenticazione per gli endpoint di conteggio

=============== TASK-0072 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implementare la blacklist per i messaggi
**Description**:
Implementare una funzionalità per bloccare la risposta ai messaggi provenienti da numeri inseriti nella blacklist. Se un utente è nella blacklist, il chatbot non deve rispondere ai suoi messaggi.

- [x] Completed
  - Aggiunto campo isBlacklisted al modello Customers nel database
  - Creata la migrazione del database per il nuovo campo
  - Implementato metodo isCustomerBlacklisted nel MessageRepository
  - Modificato MessageService per controllare la blacklist prima di processare i messaggi
  - Creati unit test completi per verificare il funzionamento della blacklist
  - Test verificati sia per utenti nella blacklist che per utenti regolari

=============== TASK-0073 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implementare il supporto multilingua nei messaggi
**Description**:
Implementare il supporto multilingua per i messaggi del chatbot basato sulla preferenza di lingua impostata nel profilo dell'utente.

- [x] Completed
  - Modificato il repository dei messaggi per includere la lingua dell'utente
  - Passato il cliente con la sua lingua al sistema RAG per generare risposte
  - Implementata logica per ottenere la lingua preferita dell'utente dal database
  - Aggiunte istruzioni all'LLM per rispondere nella lingua preferita dell'utente
  - Creati test per verificare il supporto multilingua (inglese, francese, ecc.)
  - Aggiunto script di test manuale per verificare il supporto alla lingua

=============== TASK-0074 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Mostrare link di registrazione persistente agli utenti non registrati
**Description**:
Implementare una funzionalità che mostri sempre il link di registrazione agli utenti non registrati, anche se continuano a inviare messaggi senza registrarsi.

- [x] Completed
  - Aggiunto controllo per verificare se un cliente è ancora nella fase "Unknown Customer"
  - Implementato sistema che mostra sempre il link di registrazione a utenti non registrati
  - Creati test per verificare che il link venga mostrato per utenti parzialmente registrati
  - Aggiunto test per verificare che link venga mostrato anche dopo ripetuti messaggi
  - Implementata logica che impedisce la normale elaborazione dei messaggi fino alla registrazione
  - Verificato il corretto funzionamento della lista prodotti per utenti già registrati
  - Verificato il corretto funzionamento della lista servizi per utenti già registrati

=============== TASK-0075 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Test dell'agente Router per la selezione dell'agente appropriato
**Description**:
Implementare test per verificare che l'agente Router selezioni correttamente l'agente appropriato in base al messaggio dell'utente. In particolare, verificare che quando un utente chiede informazioni sui prodotti, l'agente Products venga selezionato, e quando chiede informazioni sui servizi, l'agente Services venga selezionato.

- [x] Completed
  - Creati test specifici per la selezione dell'agente Router
  - Verificato che per la query "lista dei prodotti" venga selezionato l'agente Products
  - Verificato che per la query "quali servizi offrite" venga selezionato l'agente Services
  - Implementati test che simulano il comportamento del router per la classificazione dei messaggi
  - Aggiunto controllo che verifica che l'agente selezionato dal router venga effettivamente utilizzato nella risposta

=============== TASK-0076 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implementare la conversione dei prezzi in USD per clienti con preferenza EUR
**Description**:
Implementare una funzionalità che converta automaticamente i prezzi da EUR a USD quando un cliente ha impostato la valuta come EUR, utilizzando un tasso di cambio fisso (1 EUR = 1.09 USD).

- [x] Completed
  - Aggiunta logica di rilevamento della preferenza di valuta nel MessageRepository
  - Implementata conversione automatica dei prezzi in USD per utenti con valuta EUR
  - Aggiunto campo currency al modello Cliente per memorizzare la preferenza di valuta
  - Modificato il formato di output per mostrare il simbolo $ invece di € quando necessario
  - Modificato il prompt di sistema per includere istruzioni di conversione valuta
  - Creati test per verificare la corretta conversione e visualizzazione dei prezzi
  - Verificato il funzionamento sia per i prodotti che per i servizi

=============== TASK-0077 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Implementare sconto sui prezzi per clienti con percentuale di sconto
**Description**:
Implementare una funzionalità che applichi automaticamente uno sconto ai prezzi dei prodotti e servizi quando un cliente ha una percentuale di sconto impostata nel suo profilo, arrotondando i prezzi a due decimali.

- [x] Completed
  - Implementata logica per rilevare la percentuale di sconto nel profilo cliente
  - Aggiunta funzionalità di calcolo del prezzo scontato con arrotondamento a due decimali
  - Modificato il formato di output per mostrare sia il prezzo scontato che quello originale
  - Aggiunta indicazione della percentuale di sconto nell'intestazione della risposta
  - Creata funzione helper applyDiscount per standardizzare il calcolo dello sconto
  - Implementata gestione combinata di sconto e conversione valutaria
  - Creati test per verificare il corretto funzionamento della funzionalità di sconto

- [ ] Fix test errors due to unused variables in message.service.ts and message.repository.ts
- [x] All backend tests pass after removing unused variables (formatListForWhatsApp, shouldDisplayUSD)
- [x] Fixed variable replacement in prompts for customerLanguage, customerCurrency and customerDiscount
- [x] Fixed price formatting to correctly show discounted prices and original prices with toFixed(2)
- [x] Fixed message persistence by properly saving messages and updating customer's updatedAt timestamp
- [x] Fixed the conversation flow to remove unwanted formatting instructions in the user message

## 📋 Task List - Gestione Utenti e Registrazione

### 🚩 Backend: Sistema Base (Priorità Alta)

**TASK-B001**: Setup database per registrazione utenti
- Aggiungere campo `currency` alla tabella clients
- Aggiungere campi `push_notifications_consent` e `push_notifications_consent_at` alla tabella clients
- Creare una nuova tabella `registration_tokens` per gestire i token di registrazione

**TASK-B002**: Implementare generazione token sicuri
- Creare servizio per generazione token random
- Aggiungere validazione e scadenza token (24 ore)
- Implementare meccanismo di pulizia token scaduti

**TASK-B003**: Sviluppare API per gestione registrazione
- Endpoint `POST /api/clients/register` con validazione input
- Verifica token valido e non scaduto
- Salvataggio dati utente con preferenze lingua e valuta
- Gestione consensi (GDPR e notifiche push)

**TASK-B004**: Modificare MessageService per link registrazione
- Identificare utenti non registrati
- Generare URL di registrazione con token, telefono e workspace
- Inviare link di registrazione via WhatsApp
- Tracciamento stato registrazione

**TASK-B009**: Implementare messaggio di benvenuto post-registrazione
- Creare sistema di messaggi multi-lingua per il benvenuto
- Personalizzare il messaggio con il nome dell'utente
- Includere informazioni sulla protezione dei dati
- Aggiungere link alla pagina informativa sulla crittografia
- Inviare automaticamente il messaggio dopo la registrazione completata

### 🚩 Frontend: Form di Registrazione (Priorità Alta)

**TASK-F001**: Creare pagina di registrazione
- Configurare routing con parametri (token, phone, workspace)
- Implementare verifica validità token
- Design responsive del form con branding del workspace

**TASK-F002**: Sviluppare form di raccolta dati
- Campi per nome, cognome e azienda
- Selezione lingua (con auto-detect da browser)
- Selezione valuta (default EUR)
- Checkbox consenso GDPR con testo completo
- Checkbox per consenso notifiche push
- Validazione client-side e messaggi errore

**TASK-F003**: Integrare API e gestire sottomissione
- Connessione con API di registrazione
- Gestione errori e retry
- Schermata di conferma registrazione
- Reindirizzamento a WhatsApp con istruzioni

**TASK-F007**: Creare pagina informativa sulla protezione dati e crittografia
- Sviluppare una pagina dedicata che spieghi il sistema di tokenizzazione
- Includere rappresentazioni visive del processo di protezione dati
- Spiegare le misure di sicurezza implementate sui server
- Creare una sezione FAQ sulla protezione dei dati
- Garantire che la pagina sia accessibile dal link inviato nel messaggio di benvenuto
- Implementare design responsive e traduzione in più lingue

### 🚩 Backend: Gestione Preferenze (Priorità Media)

**TASK-B005**: Implementare API per gestione preferenze
- Endpoint `GET /api/clients/preferences/:token`
- Endpoint `PUT /api/clients/preferences/:token`
- Generazione token per accesso preferenze
- Validazione e salvataggio modifiche

**TASK-B006**: Gestire richiesta preferenze via WhatsApp
- Riconoscimento comando "update my preferences"
- Generazione link sicuro con token
- Invio link via WhatsApp

### 🚩 Frontend: Gestione Preferenze (Priorità Media)

**TASK-F004**: Creare pagina gestione preferenze
- Configurare routing con parametri token
- Form pre-compilato con dati attuali
- UI per modifica lingua, valuta, notifiche push
- Link per cancellazione account

**TASK-F005**: Implementare conferma modifiche
- Validazione client-side
- Comunicazione con API
- Gestione errori
- Conferma salvataggio preferenze

### 🚩 Backend: Cancellazione Account (Priorità Bassa)

**TASK-B007**: Implementare API cancellazione account
- Endpoint `POST /api/clients/deletion-request/:token`
- Endpoint `POST /api/clients/confirm-deletion`
- Sistema di verifica in due fasi
- Logica per pseudonimizzazione dati

**TASK-B008**: Sviluppare sistema di cancellazione selettiva
- Cancellazione dati personali e chat
- Preservazione ordini e transazioni in formato anonimizzato
- Implementazione periodo di grazia (30 giorni)

### 🚩 Frontend: Cancellazione Account (Priorità Bassa)

**TASK-F006**: Creare interfaccia cancellazione account
- Design chiaro con avvisi sulle conseguenze
- Campo di conferma con numero di telefono
- Processo di verifica in due fasi
- Conferma finale e istruzioni post-cancellazione

### 🚩 Testing e Integrazione (Priorità Alta)

**TASK-T001**: Test unitari e di integrazione
- Test delle API di registrazione
- Test di validazione e scadenza token
- Test del processo di registrazione end-to-end
- Test di modifica preferenze e cancellazione

**TASK-T002**: Test di sicurezza
- Verifica protezione contro attacchi CSRF e XSS
- Test di robustezza dei token
- Verifica corretta implementazione GDPR
- Test di penetrazione delle API

## 📅 Tempistiche Stimate
- Backend Sistema Base (TASK-B001 - TASK-B004): 3-4 giorni
- Frontend Form di Registrazione (TASK-F001 - TASK-F003): 2-3 giorni
- Backend Messaggio Benvenuto (TASK-B009): 1-2 giorni
- Frontend Pagina Protezione Dati (TASK-F007): 2 giorni
- Gestione Preferenze Backend e Frontend (TASK-B005 - TASK-F005): 3-4 giorni
- Cancellazione Account (TASK-B007 - TASK-F006): 2-3 giorni
- Testing e Integrazione: 2 giorni

## 👥 Assegnazione Task
- To be determined based on team availability

## 📌 Dipendenze
- TASK-B001 deve essere completato prima di TASK-B003
- TASK-B002 deve essere completato prima di TASK-B003
- TASK-B003 deve essere completato prima di TASK-F003
- TASK-B004 deve essere completato per il test completo end-to-end
- TASK-B005 deve essere completato prima di TASK-F005
- TASK-B007 deve essere completato prima di TASK-F006
- TASK-B003 deve essere completato prima di TASK-B009
- TASK-F007 deve essere completato prima del testing di TASK-B009

## 🌟 Stato dei Task
- Tutti i task: Non iniziati

- [ ] Check and correct any usage of '/api/api/workspaces' to '/api/workspaces' in the codebase. Reason: The correct backend route is '/api/workspaces'; using '/api/api/workspaces' results in a 404 error (Cannot GET /api/api/workspaces).
