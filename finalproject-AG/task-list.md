# ShopMe – Realistic Project Task List (60 Unique Tasks)

## 📌 Summary by Epic

- System Setup & Architecture: 10 tasks
- Authentication & 2FA: 10 tasks
- Product Management: 10 tasks
- Orders & Cart: 10 tasks
- Clients, GDPR & Tokenization: 10 tasks
- AI, WhatsApp & Messaging: 10 tasks

**Total Tasks: 60**

## ✅ Full Task List

=============== TASK-0001 ============================
**Epic**: System Setup & Architecture
**Title**: Setup Docker environment
**Description**:
Create a docker-compose file with PostgreSQL, Redis, and adminer. Use .env for configuration and set up volumes for persistence.

- [ ] Not started

=============== TASK-0002 ============================
**Epic**: System Setup & Architecture
**Title**: Configure Prisma ORM
**Description**:
Install Prisma, define initial schema with products, users, workspaces, and run the first migration.

- [ ] Not started

=============== TASK-0003 ============================
**Epic**: System Setup & Architecture
**Title**: Create initial seed script
**Description**:
Insert default admin user, demo workspace, 5 categories and 10 demo products using Prisma or raw SQL.

- [done ] Not started

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

- [ ] Not started

=============== TASK-0012 ============================
**Epic**: Authentication & 2FA
**Title**: Create `GET /me` endpoint
**Description**:
Return the currently authenticated user with their role, email, and workspace ID.

- [ ] Not started

=============== TASK-0013 ============================
**Epic**: Authentication & 2FA
**Title**: Add 2FA via email OTP
**Description**:
Send a 6-digit OTP via email after login step 1 and verify before issuing final token.

- [ ] Not started

=============== TASK-0014 ============================
**Epic**: Authentication & 2FA
**Title**: Allow user registration
**Description**:
Add `POST /auth/register` with invite code logic and workspace assignment.

- [ ] Not started

=============== TASK-0015 ============================
**Epic**: Authentication & 2FA
**Title**: Handle forgot password flow
**Description**:
Create `POST /auth/forgot` to send email with token. Add reset password confirmation route.

- [ ] Not started

=============== TASK-0016 ============================
**Epic**: Authentication & 2FA
**Title**: Protect routes with middleware
**Description**:
Create `authGuard` middleware to check and decode JWT, attach user context.

- [ ] Not started

=============== TASK-0017 ============================
**Epic**: Authentication & 2FA
**Title**: Create role-based access control
**Description**:
Limit admin-only actions by checking `req.user.role`. Define `isAdmin`, `isOwner`, etc.

- [ ] Not started

=============== TASK-0018 ============================
**Epic**: Authentication & 2FA
**Title**: Refresh token mechanism
**Description**:
Issue refresh tokens via a secure cookie and add `/auth/refresh` endpoint.

- [ ] Not started

=============== TASK-0019 ============================
**Epic**: Authentication & 2FA
**Title**: User logout
**Description**:
Implement logout by clearing cookies and invalidating refresh tokens.

- [ ] Not started

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

- [ ] Not started

=============== TASK-0022 ============================
**Epic**: Product Management
**Title**: Create POST /products endpoint
**Description**:
Add a new product with fields: name, categoryId, price, image URL, and stock.

- [ ] Not started

=============== TASK-0023 ============================
**Epic**: Product Management
**Title**: Create PUT /products/:id
**Description**:
Edit product details and handle image replacement if a new image is uploaded.

- [ ] Not started

=============== TASK-0024 ============================
**Epic**: Product Management
**Title**: Create DELETE /products/:id
**Description**:
Soft-delete a product and mark as unavailable instead of deleting.

- [ ] Not started

=============== TASK-0025 ============================
**Epic**: Product Management
**Title**: List categories
**Description**:
Implement `GET /categories` to return all product categories.

- [ ] Not started

=============== TASK-0026 ============================
**Epic**: Product Management
**Title**: Add category CRUD
**Description**:
Allow admins to create, edit, and delete categories via dedicated endpoints.

- [ ] Not started

=============== TASK-0027 ============================
**Epic**: Product Management
**Title**: Upload product image to S3
**Description**:
Integrate with S3 or local storage to upload and retrieve product images.

- [ ] Not started

=============== TASK-0028 ============================
**Epic**: Product Management
**Title**: Display product list in dashboard
**Description**:
Show table view with name, image, price, stock and filters.

- [ ] Not started

=============== TASK-0029 ============================
**Epic**: Product Management
**Title**: Create product form modal
**Description**:
Use shadcn/ui modal to create or edit products with validation.

- [ ] Not started

=============== TASK-0030 ============================
**Epic**: Product Management
**Title**: Add unit tests for product service
**Description**:
Cover edge cases for price < 0, missing fields, image format.

- [ ] Not started

=============== TASK-0031 ============================
**Epic**: Orders & Cart
**Title**: Create POST /orders
**Description**:
Submit order from current cart items. Save order lines and total amount.

- [ ] Not started

=============== TASK-0032 ============================
**Epic**: Orders & Cart
**Title**: List orders
**Description**:
Implement paginated `GET /orders` with filters by status, client, and date.

- [ ] Not started

=============== TASK-0033 ============================
**Epic**: Orders & Cart
**Title**: View order details
**Description**:
Add endpoint `GET /orders/:id` to return full breakdown of items and statuses.

- [ ] Not started

=============== TASK-0034 ============================
**Epic**: Orders & Cart
**Title**: Manage order status
**Description**:
Allow update of order status (pending, confirmed, shipped, delivered, cancelled).

- [ ] Not started

=============== TASK-0035 ============================
**Epic**: Orders & Cart
**Title**: Cart: Add product
**Description**:
POST `/cart/add` to add item to the user's current cart.

- [ ] Not started

=============== TASK-0036 ============================
**Epic**: Orders & Cart
**Title**: Cart: Remove product
**Description**:
POST `/cart/remove` to delete product from cart.

- [ ] Not started

=============== TASK-0037 ============================
**Epic**: Orders & Cart
**Title**: Cart: Update quantity
**Description**:
POST `/cart/update` to change quantity of a product already in the cart.

- [ ] Not started

=============== TASK-0038 ============================
**Epic**: Orders & Cart
**Title**: Get current cart
**Description**:
GET `/cart` returns items, totals, and estimated shipping.

- [ ] Not started

=============== TASK-0039 ============================
**Epic**: Orders & Cart
**Title**: Display order history in dashboard
**Description**:
Show list of orders per client with filters and links.

- [ ] Not started

=============== TASK-0040 ============================
**Epic**: Orders & Cart
**Title**: Send order confirmation via WhatsApp
**Description**:
Trigger message through n8n flow after order success.

- [ ] Not started

=============== TASK-0041 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Detect first-time user consent
**Description**:
On first WhatsApp message, reply with privacy terms and wait for 'I ACCEPT'.

- [ ] Not started

=============== TASK-0042 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Store GDPR acceptance in DB
**Description**:
Add `privacyAcceptedAt`, `privacyVersion` to `clients` table.

- [ ] Not started

=============== TASK-0043 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Re-ask for consent if version outdated
**Description**:
Compare accepted version with current, resend if different.

- [ ] Not started

=============== TASK-0044 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Tokenize PII before AI prompt
**Description**:
Replace names, phones, addresses with tokens before OpenRouter calls.

- [ ] Not started

=============== TASK-0045 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: De-tokenize AI response
**Description**:
Replace tokens with real data before sending back to user.

- [ ] Not started

=============== TASK-0046 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: List clients in dashboard
**Description**:
Create UI table with filters and GDPR status indicator.

- [ ] Not started

=============== TASK-0047 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Client detail page
**Description**:
Show purchase history, messages, total spent and notes.

- [ ] Not started

=============== TASK-0048 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Add export client data
**Description**:
Create GDPR-compliant `Download My Data` button.

- [ ] Not started

=============== TASK-0049 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Delete client data
**Description**:
Support deletion of a client and anonymize logs.

- [ ] Not started

=============== TASK-0050 ============================
**Epic**: Clients, GDPR & Tokenization
**Title**: Track consent history
**Description**:
Log every policy update with timestamp and message sent.

- [ ] Not started

=============== TASK-0051 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Connect WhatsApp webhook to n8n
**Description**:
Configure webhook to forward all messages to n8n for processing.

- [ ] Not started

=============== TASK-0052 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Classify message type
**Description**:
Use keywords and NLP to detect if message is an order, question, or other.

- [ ] Not started

=============== TASK-0053 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Respond with OpenRouter AI
**Description**:
Send cleaned message to OpenRouter, receive and format reply.

- [ ] Not started

=============== TASK-0054 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Fallback if AI fails
**Description**:
Detect AI timeouts or errors and send friendly fallback message.

- [ ] Not started

=============== TASK-0055 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Enable test mode per user
**Description**:
Mark certain numbers as sandbox/test to avoid real order creation.

- [ ] Not started

=============== TASK-0056 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Save chat history in DB
**Description**:
Log all message exchanges with userId, timestamps, and intents.

- [ ] Not started

=============== TASK-0057 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Paginate chat in dashboard
**Description**:
Implement `GET /chat/messages` with filters and search.

- [ ] Not started

=============== TASK-0058 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Push campaign system
**Description**:
Create UI + backend to send promo messages to targeted segments.

- [ ] Not started

=============== TASK-0059 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Track delivery & open rates
**Description**:
Use WhatsApp message statuses to track opened/read.

- [ ] Not started

=============== TASK-0060 ============================
**Epic**: AI, WhatsApp & Messaging
**Title**: Monitor token usage by user
**Description**:
Log and chart token count and average cost per interaction.

- [ ] Not started
