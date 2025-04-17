# ShopMe – Realistic Project Task List (63 Unique Tasks)

## 📊 Stato Attuale del Progetto
**Ultimo aggiornamento:** 2023-07-04

- **Completati:** 26/63 task (41.3%)
- **In corso:** 1/63 task (1.6%)
- **Out of scope:** 16/63 task (25.4%)
- **Da iniziare:** 20/63 task (31.7%)


### 🚩 Prossimo Task Prioritario
**TASK-0029**: Add unit tests for product service
- Cover edge cases for price < 0, missing fields, image format
- Ensure proper validation and error handling
- Focus on critical business logic paths
- Write comprehensive tests for all product-related functionality


### 🏆 Progressi per Epic
- System Setup & Architecture: 12/12 completati ✅
- Authentication & 2FA: 4/10 completati, 5/10 fuori scope ⏳
- Product Management: 9/10 completati, 1/10 in corso 🔄
- Orders & Cart: 1/10 completati, 9/10 fuori scope ⏳
- Clients, GDPR & Tokenization: 4/10 completati 🔄
- AI, WhatsApp & Messaging: 1/11 completati 🔄

## 📌 Summary by Epic

- System Setup & Architecture: 12 tasks
- Authentication & 2FA: 10 tasks
- Product Management: 10 tasks (9 completati)
- Orders & Cart: 10 tasks (1 completato)
- Clients, GDPR & Tokenization: 10 tasks (4 completati)
- AI, WhatsApp & Messaging: 11 tasks (1 completato)

**Total Tasks: 63**

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
**Title**: Add unit tests for product service
**Description**:
Cover edge cases for price < 0, missing fields, image format.

- [ ] In corso

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
**Epic**: Product Management
**Title**: Enhance product category display in frontend
**Description**:
Modify the product card component to show category names instead of category IDs. Update data models and API integration to support this change.

- [x] Completed
  - Updated Product interface to include category object
  - Enhanced CategoryBadge component to handle both category strings and objects
  - Modified ProductsPage to display category names
  - Added fallback for backward compatibility with category IDs
  - Improved user experience by showing human-readable category labels

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
**Title**: Implement basic message processing API
**Description**:
Create a simple API endpoint that receives a message and returns it in uppercase as a first step toward implementing the full message processing flow.

Technical Requirements:
- Create a new endpoint to receive messages (POST /api/messages)
- Implement a basic message response service that converts text to uppercase
- Return the processed message in a chat-compatible format
- Add basic error handling
- Implement simple unit tests for the endpoint
- Create a simple UI test page to interact with the API

- [ ] In Progress
  - Created message controller with POST endpoint
  - Added message service with uppercase conversion
  - Created routes for the message API
  - Added basic error handling
  - Created test UI page at /message-test
