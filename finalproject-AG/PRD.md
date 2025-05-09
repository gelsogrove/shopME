# ShopMe - WhatsApp E-commerce Platform

## Executive Overview

ShopMe is a revolutionary SaaS platform that transforms WhatsApp into a powerful e-commerce channel by connecting businesses directly with customers through intelligent, automated conversations. Built on the foundations of AI and conversational commerce, ShopMe enables businesses to provide seamless shopping experiences and exceptional customer service through the world's most popular messaging app.

### Why ShopMe Matters

In today's digital landscape, businesses face numerous challenges:

- Customer support is increasingly expected to be available 24/7
- Consumer attention is fragmented across multiple platforms
- Traditional e-commerce requires customers to download apps or navigate websites
- Small and medium businesses lack resources for comprehensive digital solutions

ShopMe solves these challenges by meeting customers where they already are—on WhatsApp, with over 2 billion active users worldwide. Our solution eliminates friction in the shopping journey by enabling complete transactions through natural conversation, without requiring customers to leave their preferred messaging platform.

### Core Benefits

1. **24/7 Customer Service**: Our AI-powered chatbots provide immediate responses at any time, ensuring customer queries never go unanswered and sales opportunities are never missed.

2. **Increased Conversion Rates**: By reducing friction in the purchase journey and providing personalized assistance, businesses can convert more inquiries into sales.

3. **Enhanced Customer Engagement**: Natural language conversations create more engaging and human-like interactions compared to traditional e-commerce interfaces.

4. **Operational Efficiency**: Automation of routine inquiries and processes reduces staff workload and operational costs while improving response times.

5. **Rich Customer Insights**: Every conversation generates valuable data that helps businesses understand customer preferences and improve their offerings over time.

6. **Scalability Without Complexity**: The SaaS model allows businesses of any size to implement sophisticated e-commerce capabilities without technical expertise or major investments.

ShopMe represents the next evolution in e-commerce—one where commerce happens conversationally, businesses are always available, and shopping is as simple as sending a message.

## 1. Project Vision

The ShopMe project aims to develop a WhatsApp-based e-commerce platform that leverages the WhatsApp Business API and AI technology to automate client support and order management. Designed as a Software as a Service (SaaS) solution, the platform enables businesses to create their own white-labeled e-commerce presence with minimal setup. The goal is to provide immediate and continuous 24/7 assistance, enhancing client experience and streamlining business operations.

### 1.1 Initial Use Case: Italian Products Chatbots

As our first implementation, the platform will be specialized in selling high-quality Italian products. Users will be able to:

**Product Discovery and Information**:

- Access detailed product information
- Receive personalized product recommendations
- Learn about producers' stories and traditional production methods

**Order Management**:

- Place orders directly through WhatsApp chatbot
- Receive immediate order confirmations
- Track shipment status
- Download invoices and fiscal documents
- Manage returns and complaints

**Customer Support**:

- Request product information and recommendations
- Get advice on product pairings and usage
- Receive post-sale assistance
- Access FAQ and product guides

### 1.2 Future Industry Expansion

While the initial MVP focuses exclusively on e-commerce for Italian products, the platform is architecturally designed to support future expansion into various service-based industries including:

**Gym & Fitness Centers**:

- Class booking and membership management
- Personal training session scheduling
- Workout plan delivery through messaging
- Fitness goal tracking and progress updates

**Restaurants & Cafes**:

- Table reservations and wait list management
- Digital menu browsing via chat interface
- Special event bookings (private dining, catering)
- Delivery coordination through messaging

**Hotels & Accommodations**:

- Room booking and availability checking via WhatsApp
- Automated check-in/check-out reminders
- Special requests handling through chat interface
- Room service ordering through messaging

This planned expansion will be developed in future phases after the core e-commerce functionality is successfully implemented and validated in the marketplace.

The platform is designed for any business that offers products or services to clients, from retail stores and service providers to hospitality businesses like hotels, restaurants, gyms, and fitness centers. This versatility allows businesses to not only sell products but also manage appointments, reservations, and memberships through conversational interfaces.

## 2. User Journey

### Administrator Experience

- Access a web dashboard to:
  - Create and manage multiple workspaces.
  - Configure WhatsApp channels (phone numbers, API tokens, webhooks).
  - Customize AI prompts, add products (with photos, text, pricing,offerts), and organize them into service categories.
  - Manage products, services, and clients through intuitive interfaces.

### End User Experience

- Interact exclusively through WhatsApp:
  - **Initial Contact**: New users receive a welcome message introducing the service.
  - **Registration Process**:
    - For unregistered users, the system automatically generates and sends a unique registration link via WhatsApp.
    - The link directs users to a secure web-based registration form.
    - The registration form collects essential information:
      - First Name (required)
      - Last Name (required)
      - Company Name (required)
      - Language preference selection (required) - Default language is detected from user's browser
      - Currency preference selection (required) - Default EUR
      - GDPR consent with full text of the privacy policy displayed for review
      - Push notification consent checkbox with label: "Are you interested to receive offers with push notifications? You will be able to unsubscribe whenever you want" (optional)
      - Submit button to complete registration
    - Upon successful submission, the user is registered in the system and can immediately continue their interaction through WhatsApp.
    - A personalized welcome message is sent in the user's selected language, confirming their registration and explaining data protection measures, including a link to a dedicated page with detailed information about the encryption system used to protect their data.
  - **Returning Users**: Existing users receive a personalized greeting and can request information, place orders, and receive communications.
  - **Continuous Experience**: All subsequent interactions happen seamlessly within WhatsApp, creating a frictionless shopping experience.

## 3. Objectives

### Business Goals

- Significantly reduce client service time through automation.
- Provide 24/7 client support.
- Build client loyalty through future push campaigns (e.g., greetings, promotions, appointment reminders).
- Enable businesses of all types to engage with clients through familiar messaging interfaces.
- Create a versatile platform adaptable to various industries and business models.

### Non-Goals (MVP)

- **Integrated Payment System and Workable Payment Plan:**

  - This combines the original "Implement an integrated payment system" and "Usage and a workable plan for payments."
  - It's crucial to state that _both_ the _implementation_ and a _detailed plan_ are out of scope for the MVP.
  - **Rationale:** Even a high-level plan has design implications. If you defer _all_ payment considerations, you risk architectural issues later. However, in the MVP, the _actual integration_ and _full payment flow_ are not required.

- **Usage Statistics and Analytics:**

  - This is clearer than just "Usage" and separates it from other concerns.
  - **Rationale:** Gathering and displaying detailed analytics can be complex. The MVP should focus on core functionality.

- **Push Campaigns and Marketing Automation:**

  - This is more specific than just "Push campaigns."
  - **Rationale:** Marketing automation features are often added later to enhance user engagement.

- **Advanced Authentication and Security:**

  - This groups related security features.
  - Includes:
    - JSON Web Tokens (JWT) for authentication (if you're using a simpler auth for MVP)
    - 2FA authentication (Two-Factor Authentication)
    - "Forgot Password" functionality
    - "Create User" (if you're handling user creation in a very basic way for MVP)
  - **Rationale:** While basic security is essential, more complex auth can be deferred.

- **Scalability and Monitoring Infrastructure:**

  - This is more specific than just "scale and monitor the system."
  - **Rationale:** While you need to _design_ for scalability, the _full infrastructure_ and monitoring setup can be iterative.
    - For MVP, you might handle scaling manually or with basic tools.
    - Detailed performance monitoring and automated scaling can come later.

- **Comprehensive GDPR Compliance Implementation:**

  - This is carefully worded. You **must** _consider_ GDPR from the start, but the _full and polished implementation_ can be phased.
  - **Rationale:**

    - You can't ignore privacy. Design must be privacy-preserving.
    - However, features like detailed consent management, data portability exports, and full audit logs can be developed iteratively.
    - The _core_ principles (data minimization, security) _must_ be in place.

- **Product Image Upload to S3/Cloud Storage:**

  - Integration with cloud storage services for product image upload and management.
  - **Rationale:** While product image management is important, the MVP can use simpler approaches like URL references to existing images. Full integration with S3 or similar cloud storage services will be implemented in future versions.

  - development environments and monitoring infrastructure can be phased.
  - Product offerts

### Out of Scope Features

These features have been determined to be completely out of scope for the current version of the product. Unlike Non-Goals (MVP) which will be implemented in future phases, these features are not planned for implementation in the immediate roadmap.

1. **Order Management System:**

   - Complete order processing and tracking
   - Order status management
   - Invoice generation and management
   - Shipping integration and tracking
   - Returns and refunds processing
   - **Rationale:** After evaluation, we've determined that the full order management system requires significant integration with external systems (payment, shipping, etc.) and complex business logic that would extend beyond our current development capacity. Users can still browse products and interact with the chatbot, but actual order processing will need to be handled through external systems.

2. **Marketing Campaign Management:**

   - Campaign creation and scheduling
   - A/B testing tools
   - Campaign analytics
   - Audience segmentation
   - **Rationale:** Marketing campaign features require complex integration with analytics and user behavior tracking systems that are beyond our current scope.

3. **Advanced Analytics Dashboard:**
   - Real-time analytics
   - Custom report generation
   - Data visualization tools
   - Export capabilities
   - **Rationale:** Advanced analytics require significant data processing and storage capabilities that are not aligned with our current infrastructure plans.

## 4. Technical Architecture

- **Frontend**: React (latest version) with shadcn/ui library and Tailwind CSS to accelerate development.
- **Backend**: Node.js with Domain Driven Design (DDD) pattern.
- **Database**: PostgreSQL.
- **SaaS Architecture**: Multi-tenant design with complete data isolation betwee in man workspaces.
- **AI Service**: OpenRouter (RAG) with data pseudonymization.
- **WhatsApp Integration**: Official Meta API.
- **Security**: HTTPS, JWT tokens, encrypted sensitive data in the database.
- **Environments**: Development, test, and production; each workspace can activate debug mode with a test number.

### Frontend Implementation

The frontend will be built using Vite and React, coupled with Tailwind CSS and shadcn/ui for styling. This architecture provides several advantages:

- **Fast Development**: Vite's lightning-fast HMR (Hot Module Replacement)
- **API Proxy**: Built-in proxy configuration for seamless API integration
- **Component isolation**: Clear separation of concerns with modular components
- **Type Safety**: Full TypeScript support
- **Styling**: Utility-first approach with Tailwind CSS for rapid development
- **UI Components**: Shadcn/ui for consistent and accessible components

#### Core API Integration

The frontend communicates with the backend through a RESTful API architecture organized into these major categories:

1. **Authentication API**:
   - Login/Register flows
   - JWT token management
   - User session handling

2. **Workspace API**:
   - Workspace management
   - Settings and configurations
   - User permissions

3. **Products API**:
   - Product catalog management
   - Categories CRUD
   - Image upload handling

4. **Orders API**:
   - Order processing
   - Cart management
   - Order status tracking

5. **Clients API**:
   - Client profile management
   - Purchase history
   - GDPR compliance

6. **Settings API**:
   - Workspace configuration
   - User preferences
   - System settings
   - Phone Number Blocklist: Ability to block specific phone numbers from interacting with the system, preventing potential abuse by adding phone numbers to a blocklist. Messages from these numbers will be automatically ignored.

7. **Chat API**:
   - Chat history management
   - Message handling
   - WhatsApp integration

8. **Prompt API**:
   - AI prompt management
   - Prompt testing
   - Language configurations

9. **Analytics API**:
   - Usage statistics
   - Performance metrics
   - Business intelligence

The frontend uses a proxy configuration to route all `/api/*` requests to the backend server, handling CORS and other cross-origin concerns automatically.

##### Detailed API Endpoints

###### Authentication

- `POST /api/auth/login`
  - **Description**: Authenticates a user and returns a JWT token
  - **Body**: `email`, `password`
  - **Returns**: JWT token, user information

- `POST /api/auth/logout`
  - **Description**: Logs out the current user
  - **Headers**: `Authorization` with JWT token
  - **Returns**: Success message

- `POST /api/auth/refresh`
  - **Description**: Refreshes the JWT token
  - **Headers**: `Authorization` with current JWT token
  - **Returns**: New JWT token

- `GET /api/auth/me`
  - **Description**: Gets the current authenticated user's information
  - **Headers**: `Authorization` with JWT token
  - **Returns**: User profile information

###### Chat Management

- `GET /api/chats`
  - **Description**: Retrieves all chats for the workspace
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: List of chats with basic information

- `GET /api/chat/:id`
  - **Description**: Retrieves details of a specific chat
  - **Parameters**: `id` (required): Chat identifier
  - **Returns**: Chat details including messages

- `GET /api/chat/:id/messages`
  - **Description**: Retrieves messages for a specific chat
  - **Parameters**: `id` (required): Chat identifier, `page`, `limit`
  - **Returns**: Paginated list of messages

- `POST /api/chat/message`
  - **Description**: Sends a new message in a chat
  - **Body**: `chat_id`, `content`, `sender_type`
  - **Returns**: Created message details

- `PUT /api/chat/message/:id/read`
  - **Description**: Marks messages as read
  - **Parameters**: `id` (required): Message identifier
  - **Returns**: Updated message status

###### Prompt Management

- `GET /api/prompt/:phone`
  - **Description**: Retrieves the active prompt for a specific phone number
  - **Parameters**: `phone` (required): WhatsApp phone number
  - **Returns**: Active prompt text, language configurations, context settings
  - **Note**: Only one prompt can be active per phone number at any time

- `GET /api/prompts`
  - **Description**: Retrieves all prompts in the workspace
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: List of prompts with active/inactive status

- `POST /api/prompt`
  - **Description**: Creates a new prompt
  - **Body**: `prompt_text`, `reference_phone`, `workspace_id`, `active` (boolean)
  - **Returns**: Created prompt details
  - **Note**: If `active` is set to true, any previously active prompt for the same phone number will be automatically deactivated

- `PUT /api/prompt/:id`
  - **Description**: Updates an existing prompt
  - **Parameters**: `id` (required): Prompt ID
  - **Body**: `prompt_text`, `active` (boolean)
  - **Returns**: Updated prompt details
  - **Note**: If `active` is set to true, any previously active prompt for the same phone number will be automatically deactivated

- `DELETE /api/prompt/:id`
  - **Description**: Deletes a prompt
  - **Parameters**: `id` (required): Prompt ID
  - **Returns**: Success message

- `POST /api/prompt/test-session`
  - **Description**: Creates a temporary test session with an alternative prompt
  - **Body**: `prompt_text`, `reference_phone`, `workspace_id`, `session_duration` (minutes)
  - **Returns**: Session ID and expiration time
  - **Note**: This allows testing alternative prompts without modifying the active production prompt

- `GET /api/prompt/test-session/:id`
  - **Description**: Retrieves a test session prompt
  - **Parameters**: `id` (required): Session ID
  - **Returns**: Test prompt details and remaining session time

- `DELETE /api/prompt/test-session/:id`
  - **Description**: Ends a test session early
  - **Parameters**: `id` (required): Session ID
  - **Returns**: Success message

###### Notification Management

- `GET /api/notifications`
  - **Description**: Retrieves all notifications for the workspace
  - **Parameters**: `workspace_id` (required), `page`, `limit`
  - **Returns**: Paginated list of notifications

- `POST /api/notifications`
  - **Description**: Creates a new push notification
  - **Body**: `title`, `message`, `target_users`, `schedule_time`
  - **Returns**: Created notification details

- `PUT /api/notifications/:id`
  - **Description**: Updates a notification's status or content
  - **Parameters**: `id` (required): Notification ID
  - **Body**: `status`, `title`, `message`
  - **Returns**: Updated notification details

- `DELETE /api/notifications/:id`
  - **Description**: Deletes a notification
  - **Parameters**: `id` (required): Notification ID
  - **Returns**: Success message

###### Product and Category Management

- `GET /api/products`
  - **Description**: Retrieves complete product list
  - **Parameters**: `workspace_id` (required), `category_id`, `page`, `limit`
  - **Returns**: Paginated list of products

- `POST /api/products`
  - **Description**: Creates a new product
  - **Body**: `name`, `description`, `price`, `category_id`, `images`, `stock`
  - **Returns**: Created product details

- `PUT /api/products/:id`
  - **Description**: Updates a product
  - **Parameters**: `id` (required): Product ID
  - **Body**: Product details to update
  - **Returns**: Updated product details

- `DELETE /api/products/:id`
  - **Description**: Deletes a product
  - **Parameters**: `id` (required): Product ID
  - **Returns**: Success message

- `GET /api/categories`
  - **Description**: Retrieves product categories
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: List of categories with products count

- `POST /api/categories`
  - **Description**: Creates a new category
  - **Body**: `name`, `description`, `parent_id`
  - **Returns**: Created category details

- `PUT /api/categories/:id`
  - **Description**: Updates a category
  - **Parameters**: `id` (required): Category ID
  - **Body**: Category details to update
  - **Returns**: Updated category details

- `DELETE /api/categories/:id`
  - **Description**: Deletes a category
  - **Parameters**: `id` (required): Category ID
  - **Returns**: Success message

###### Service Management

- `GET /api/services`
  - **Description**: Retrieves list of available services
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: List of services

- `POST /api/services`
  - **Description**: Creates a new service
  - **Body**: `name`, `description`, `price`, `duration`
  - **Returns**: Created service details

- `PUT /api/services/:id`
  - **Description**: Updates a service
  - **Parameters**: `id` (required): Service ID
  - **Body**: Service details to update
  - **Returns**: Updated service details

- `DELETE /api/services/:id`
  - **Description**: Deletes a service
  - **Parameters**: `id` (required): Service ID
  - **Returns**: Success message

###### Order Management

- `GET /api/orders`
  - **Description**: Retrieves all orders
  - **Parameters**: `workspace_id` (required), `status`, `page`, `limit`
  - **Returns**: Paginated list of orders

- `GET /api/orders/:id`
  - **Description**: Retrieves details of a specific order
  - **Parameters**: `id` (required): Order ID
  - **Returns**: Complete order details with items

- `POST /api/orders`
  - **Description**: Creates a new order
  - **Body**: Order details including products, quantities, client information
  - **Returns**: Created order details

- `PUT /api/orders/:id`
  - **Description**: Updates an order's status or details
  - **Parameters**: `id` (required): Order ID
  - **Body**: Order details to update
  - **Returns**: Updated order details

- `DELETE /api/orders/:id`
  - **Description**: Cancels/deletes an order
  - **Parameters**: `id` (required): Order ID
  - **Returns**: Success message

###### Client Management

- `GET /api/clients`
  - **Description**: Retrieves list of clients
  - **Parameters**: `workspace_id` (required), `page`, `limit`
  - **Returns**: Paginated list of clients

- `GET /api/clients/:id`
  - **Description**: Retrieves client details
  - **Parameters**: `id` (required): Client identifier
  - **Returns**: Complete client profile with order history

- `POST /api/clients`
  - **Description**: Creates a new client
  - **Body**: Client details including name, phone, email
  - **Returns**: Created client details

- `PUT /api/clients/:id`
  - **Description**: Updates client information
  - **Parameters**: `id` (required): Client identifier
  - **Body**: Updated client details
  - **Returns**: Updated client profile

- `POST /api/clients/register`
  - **Description**: Handles registration from WhatsApp-generated registration link
  - **Body**: `first_name`, `last_name`, `company`, `phone` (pre-filled), `workspace_id` (pre-filled), `language`, `currency`, `gdpr_consent` (boolean), `push_notifications_consent` (boolean, optional)
  - **Returns**: Registration confirmation and redirect to WhatsApp with instructions to continue the conversation
  - **Note**: This endpoint is specifically designed for the web form accessed via the registration link sent through WhatsApp to new users

###### Cart Management

- `GET /api/cart/:user_id`
  - **Description**: Retrieves user's cart
  - **Parameters**: `user_id` (required): User identifier
  - **Returns**: Cart contents with product details

- `POST /api/cart`
  - **Description**: Adds a product to the cart
  - **Body**: `user_id`, `product_id`, `quantity`
  - **Returns**: Updated cart contents

- `PUT /api/cart`
  - **Description**: Modifies a product in the cart
  - **Body**: `cart_id`, `product_id`, `quantity`
  - **Returns**: Updated cart contents

- `DELETE /api/cart`
  - **Description**: Removes a product from the cart
  - **Body**: `cart_id`, `product_id`
  - **Returns**: Updated cart contents

###### Workspace Management

- `GET /api/workspaces`
  - **Description**: Retrieves all workspaces for the user
  - **Headers**: `Authorization` with JWT token
  - **Returns**: List of workspaces user has access to

- `POST /api/workspaces`
  - **Description**: Creates a new workspace
  - **Body**: `name`, `description`, `settings`
  - **Returns**: Created workspace details

- `PUT /api/workspaces/:id`
  - **Description**: Updates workspace settings
  - **Parameters**: `id` (required): Workspace ID
  - **Body**: Workspace details to update
  - **Returns**: Updated workspace details

- `DELETE /api/workspaces/:id`
  - **Description**: Deletes a workspace
  - **Parameters**: `id` (required): Workspace ID
  - **Returns**: Success message

###### Settings Management

- `GET /api/settings`
  - **Description**: Retrieves workspace settings
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: All workspace settings

- `PUT /api/settings`
  - **Description**: Updates workspace settings
  - **Body**: `workspace_id`, settings to update
  - **Returns**: Updated settings

###### AI Configuration Settings

- `GET /api/settings/ai`
  - **Description**: Retrieves AI generation settings for the workspace
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Returns**: Current AI configuration parameters including temperature, top_p, and top_k values

- `PUT /api/settings/ai`
  - **Description**: Updates AI generation parameters
  - **Parameters**: `workspace_id` (required): Workspace identifier
  - **Body**:
    ```
    {
      "temperature": float, // Value between 0.0-1.0 controlling randomness
      "top_p": float,       // Nucleus sampling parameter (0.0-1.0)
      "top_k": integer,     // Limits token selection to top K options
      "max_tokens": integer // Maximum tokens to generate in responses
    }
    ```
  - **Returns**: Updated AI settings

The AI configuration settings control how the AI model generates responses:

- **Temperature**: Controls randomness. Lower values (e.g., 0.2) make responses more focused and deterministic, while higher values (e.g., 0.8) make output more creative and diverse.
- **Top_p (Nucleus Sampling)**: Controls diversity by dynamically selecting from tokens whose cumulative probability exceeds the top_p value. Lower values (e.g., 0.5) make responses more focused, while higher values allow for more variety.
- **Top_k**: Limits the model to consider only the top k most likely tokens at each step, reducing the chance of generating low-probability or irrelevant tokens.
- **Max Tokens**: Defines the maximum length of generated responses to control verbosity and resource usage.

These parameters allow workspace administrators to fine-tune the AI behavior to match their specific business needs, brand voice, and customer communication style.

###### User Management

- `GET /api/users/:phone`
  - **Description**: User identification and profile retrieval
  - **Parameters**: `phone` (required): User's phone number
  - **Returns**: User profile information

- `GET /api/users`
  - **Description**: Retrieves all users in the workspace
  - **Parameters**: `workspace_id` (required), `role`, `page`, `limit`
  - **Returns**: Paginated list of users

- `POST /api/users`
  - **Description**: Creates a new user
  - **Body**: `email`, `password`, `name`, `role`, `workspace_id`
  - **Returns**: Created user details

- `PUT /api/users/:id`
  - **Description**: Updates user information
  - **Parameters**: `id` (required): User ID
  - **Body**: User details to update
  - **Returns**: Updated user details

- `DELETE /api/users/:id`
  - **Description**: Deletes a user
  - **Parameters**: `id` (required): User ID
  - **Returns**: Success message

###### Analytics API

- `GET /api/analytics/overview`
  - **Description**: Retrieves general statistics
  - **Returns**: Total active users, total messages, revenue, growth percentages

- `GET /api/analytics/recent-activity`
  - **Description**: Retrieves recent activities
  - **Returns**: New registrations, added products, received orders, activity timestamps

###### Dashboard API

- `GET /api/dashboard/stats`
  - **Description**: Retrieves statistics for the dashboard
  - **Parameters**: `period` (optional): daily/weekly/monthly
  - **Returns**: Active Users count, Total Messages count, Revenue, Growth percentages

**Cross-cutting Requirements**:

- All APIs are protected by JWT tokens
- Communication exclusively via HTTPS
- Request logging and tracking
- Standardized error handling

### OpenRouter Integration and Data Flow

The system uses OpenRouter's Retrieval Augmented Generation (RAG) capabilities to power the AI-assisted interactions within the platform. Here's how the data flows:

```mermaid
sequenceDiagram
    participant Customer as Customer
    participant WhatsApp as WhatsApp
    participant API as ShopMe API
    participant AI as OpenRouter AI
    participant DB as Database

    Customer->>WhatsApp: Sends message
    WhatsApp->>API: Forwards message via webhook
    API->>DB: Checks client context & history
    API->>API: Tokenizes personal data
    API->>AI: Sends tokenized data for processing
    AI->>API: Returns AI response
    API->>API: De-tokenizes response
    API->>WhatsApp: Forwards response
    WhatsApp->>Customer: Delivers response
```

1. **Data Collection**: When a WhatsApp message is received from a client, it arrives through the Meta API.

2. **Pre-processing**: The backend identifies any personal or sensitive information in the incoming message.

3. **Pseudonymization**: Before sending data to OpenRouter, all personal identifiers are replaced with tokens (see Security section on Pseudonymization for details).

4. **AI Processing**: The tokenized data is sent to OpenRouter, which generates contextually appropriate responses based on the prompt templates and product information.

5. **Post-processing**: The backend replaces any tokens in the AI response with the actual personal data before sending the response back to the client.

6. **Response Delivery**: The final processed response is sent to the client via the WhatsApp API.

This architecture ensures that no personally identifiable information (PII) is exposed to external AI services while maintaining the conversational quality and personalization of responses.

### Hosting and Infrastructure

The application will be hosted on Heroku's cloud platform, providing the following services:

1. **Application Hosting**:

   - Node.js runtime environment for the backend
   - Automatic scaling and load balancing
   - SSL/TLS encryption
   - Continuous deployment integration

2. **Database**:

   - Heroku Postgres for primary database
   - Automated backups and point-in-time recovery
   - Database metrics and monitoring
   - Connection pooling

3. **Storage Solutions**:

   - Bucketeer add-on for S3-compatible file storage
   - Used for storing invoices, product images, and documents
   - Automatic backup and versioning
   - CDN integration for faster file delivery

4. **Deployment Strategy**:
   - Git-based deployment workflow
   - Review apps for pull requests
   - Staging and production environments
   - Zero-downtime deployments

### Environment Setup and CI/CD Pipeline (Out of Scope for MVP)

The following environment structure and CI/CD pipeline represents the target infrastructure state that will be implemented in future phases after the MVP release. This section is explicitly excluded from the MVP scope as outlined in Section 3 (Non-Goals). When implemented in future versions, the application will utilize three distinct environments with a comprehensive CI/CD pipeline to ensure quality, reliability, and efficient deployment:

#### 1. Environment Structure (out of scope for MVP)\*\*

- **Development (dev)**

  - Purpose: Active development and feature implementation
  - URL structure: `https://dev.shopme.app` or `https://dev-[feature-branch].shopme.app`
  - Database: Separate dev database with anonymized production data
  - Deployed on: Heroku development dynos
  - WhatsApp integration: Testing phone number with Meta API sandbox
  - Features:
    - Debug tools and extended logging
    - Feature flags for in-development capabilities
    - Automatic database schema reset option
    - Performance monitoring with non-optimized assets

- **Staging (staging)**

  - Purpose: Pre-production testing, QA, and UAT
  - URL structure: `https://staging.shopme.app`
  - Database: Clone of production database with anonymized sensitive data
  - Deployed on: Heroku standard dynos
  - WhatsApp integration: Testing phone number with full API capabilities
  - Features:
    - Production-like environment
    - A/B testing capabilities
    - Performance testing tools
    - Automated test suite execution
    - Security scanning

- **Production (prod)**
  - Purpose: Live environment for end users
  - URL structure: `https://shopme.app` and client subdomains
  - Database: Production database with regular backups
  - Deployed on: Heroku performance dynos with auto-scaling
  - WhatsApp integration: Client production phone numbers
  - Features:
    - High availability configuration
    - Optimized performance
    - Comprehensive monitoring
    - Automated rollback capabilities
    - Regular security audits

#### 2. CI/CD Pipeline

- **Continuous Integration**

  - Platform: GitHub Actions
  - Triggered on: Pull request creation and updates
  - Steps:
    - Static code analysis (ESLint, TypeScript checking)
    - Unit test execution
    - Integration test execution
    - Build process verification
    - Bundle size analysis
    - Dependency vulnerability scanning
    - Code coverage reporting
  - Pass criteria: All tests pass, no critical vulnerabilities, code coverage above 80%

- **Continuous Deployment**

  - **Development Deployment**

    - Trigger: Merge to development branch
    - Target: Development environment
    - Process: Automated deployment with post-deployment tests
    - Notification: Slack alerts for team

  - **Staging Deployment**

    - Trigger: Manual promotion from development
    - Target: Staging environment
    - Process:
      - Database migration verification
      - Automated deployment
      - Smoke test execution
      - End-to-end test suite execution
      - Performance benchmark comparison
    - Notification: Slack alerts for team and QA

  - **Production Deployment**
    - Trigger: Manual promotion from staging
    - Approval: Required from technical lead and product owner
    - Schedule: During defined maintenance windows (non-peak hours)
    - Target: Production environment
    - Process:
      - Database backup
      - Blue/green deployment
      - Canary testing (initial 10% traffic)
      - Gradual rollout with health monitoring
      - Automated rollback if health checks fail
    - Notification: Slack alerts for all stakeholders

#### 3. Quality Assurance Process

- **Automated Testing**

  - Unit tests: Jest for frontend and backend logic
  - Integration tests: API endpoint testing with Supertest
  - End-to-end tests: Cypress for critical user journeys
  - Performance tests: k6 for load testing
  - Accessibility tests: pa11y for WCAG compliance

- **Manual Testing**

  - UAT sessions with stakeholders in staging
  - Exploratory testing by QA team
  - Cross-browser compatibility testing
  - Mobile responsiveness testing

- **Monitoring and Observability**
  - Error tracking: Sentry for frontend and backend errors
  - Performance monitoring: New Relic for application performance
  - Log management: Papertrail for centralized logging
  - Synthetic monitoring: Uptime checks every 5 minutes
  - Real user monitoring: Performance metrics from actual users

#### 4. Disaster Recovery

- **Backup Strategy**

  - Database: Hourly incremental backups, daily full backups
  - Storage: Redundant storage with versioning
  - Configuration: Infrastructure as Code with version control

- **Recovery Process**
  - Defined runbooks for common failure scenarios
  - Regular recovery drills (quarterly)
  - Maximum tolerable downtime: 1 hour
  - Recovery time objective (RTO): 30 minutes
  - Recovery point objective (RPO): 1 hour

This multi-environment approach combined with a robust CI/CD pipeline ensures reliable, consistent deployments while maintaining high quality standards across the application lifecycle.

## 5. Acceptance Criteria

- Fully operational CRUD functionality for workspaces, products, prompts, services, languages, and users.
- Chatbot responses generated within seconds.
- API communication protected via JWT tokens.
- Intuitive dashboard with 2FA authentication.
- Anti-abuse protection system that automatically blocks users sending more than 8 messages per minute.
- Manual blocking functionality allowing administrators to block specific users directly from the chat interface when necessary.

### Anti-Abuse System

To prevent system abuse and ensure fair resource allocation, the platform implements an automated rate-limiting mechanism:

- If a user sends more than 8 messages within a 60-second window, their profile status is automatically changed to "blocked"
- The system responds with a message: "Your number has been blocked due to improper use. Please contact the administrator to unblock it."
- Administrators can view blocked users in the dashboard and manually unblock legitimate users
- The system maintains logs of blocking events for security analysis

Additionally, administrators can manually block problematic users directly from the chat interface:

- A block button in the chat header allows for immediate blocking of the current user
- When manually blocked, users receive notification about their blocked status
- Administrators can view and manage all blocked users from a centralized section in the dashboard
- Block/unblock actions are logged for audit purposes

This dual approach (automatic and manual blocking) protects against spam attacks, prevents AI resource waste, and ensures a smooth experience for all legitimate users. Rate limits and blocking policies are configurable by workspace administrators to accommodate different business needs and usage patterns.

## 6. Key Features

1. **User Management:**

   - Registration and Login: Secure authentication and profile management.
   - Password Recovery: Functionality for credential reset.

2. **Product Catalog:**

   - Product Display: List and detailed view of products with images, descriptions, and prices.
   - Search and Filtering: Tools to search products by category, price, popularity, etc.
   - Categories: Management of product categories for better organization.

3. **WhatsApp Cart Management:**

   - Conversational Interface: Allows users to manage their cart via WhatsApp messages.
   - Add/Remove Products: Commands to add or remove products from the cart.
   - Cart Status Display: Sending cart summaries and updates via WhatsApp.

4. **Checkout and Online Payments:**

   - Order Confirmation: After cart management on WhatsApp, the user is redirected to a web platform to confirm the order.
   - Online Payments: Secure and integrated payment procedure on the online platform.

5. **AI Integration:**

   - RAG Implementation: Retrieval Augmented Generation for better business context with customer data.
   - Customizable Prompts: Configure AI responses to reflect business voice and policies.
   - Context Awareness: AI understands conversation history and user preferences.
   - Data Pseudonymization: Privacy protection when processing data with external models.
   - Automatic Translations: Support for multiple languages in the same conversation.
   - Prompt Testing: Ability to test alternative prompts in isolated sessions without affecting the active production prompt. This allows administrators to safely experiment with different AI behaviors before deploying them to customers.
   - Prompt Duplication: Ability to duplicate existing prompts to create variations or backups, maintaining the original structure while allowing modifications to the copy. This feature enables users to iterate on existing successful prompts without starting from scratch.

6. **Order Management and Tracking:**

   > ⚠️ Note: This feature has been moved to Out of Scope. See "Out of Scope Features" section for details.

   The following functionality was originally planned but is now out of scope:

   - Order History: View past purchases and current order status
   - Shipment Tracking: Real-time updates on shipment status
   - Invoice Management: Generate and download invoices
   - Returns Processing: Handle product returns and refunds

   For the current version, users can browse products and interact with the chatbot, but actual order processing will need to be handled through external systems.

7. **Client Management:**

   - Client Profiles: Maintain comprehensive records of all clients.
   - Purchase History: Track client purchasing patterns and preferences.
   - Communication Log: Access past interactions with clients.
   - User Blocking: Ability to block specific users from interacting with the system through the chat interface, preventing potential abuse.
   - Reservation Management: Track and manage client bookings and appointments (future expansion).
   - Push Notifications: Send targeted messages for marketing, reminders, and loyalty programs.

8. **Chat History:**

   - Conversation Logs: Review and analyze WhatsApp conversations with clients.
   - Message Search: Search through chat history for specific information.

9. **Usage Analytics:**

   - Usage Monitoring: Collection and analysis of platform usage data to understand user behavior.
   - Usage Reports: Generation of reports and statistics to improve experience and optimize features.

10. **Administrative Dashboard:**

- Content Management: Tools to add, modify, or remove products and categories.
- Reports and Analysis: Statistics on sales, traffic, and system performance.

11. **Reservation and Booking System (Future Expansion):**

    - Appointment Scheduling: Allow clients to book services via WhatsApp.
    - Table Reservations: Enable restaurant booking management.
    - Room Bookings: Handle hotel room reservations.
    - Class Registrations: Manage gym class sign-ups and attendance.
    - Capacity Management: Track availability and prevent overbooking.
    - Automated Reminders: Send notifications before appointments.

12. **Push Notification Campaigns:**
    - Targeted Messaging: Send personalized offers based on client history.
    - Automatic Reminders: Notify clients about upcoming appointments or reservations.
    - Re-engagement Campaigns: Reach out to inactive clients.
    - Special Promotions: Announce limited-time offers and discounts.
    - Loyalty Programs: Update clients on points, rewards, and milestones.
    - Event Notifications: Inform clients about upcoming events or new services.

## 6.5 WhatsApp Messaging Flow API

The platform implements a comprehensive messaging flow through the `MessageProcessorAPI` that handles all WhatsApp communications. This API serves as the core middleware between incoming WhatsApp messages and AI-powered responses.

### 6.5.1 Flow Architecture

The messaging flow follows this sequence:

1. **Reception**: Incoming messages from WhatsApp are received via webhook
2. **Challenge Verification**: System checks if the workspace is active
3. **User Identification**: System identifies the user and checks if they're new or existing
4. **Agent Selection**: For existing users, the appropriate specialized agent is selected based on message context
5. **Context Loading**: User data, order history, and previous messages are retrieved
6. **Data Protection**: Personal data is tokenized before processing
7. **AI Processing**: The tokenized message is processed by OpenRouter AI
8. **Response Formatting**: AI response is made conversational
9. **Data Restoration**: Tokens are replaced with actual user data
10. **History Tracking**: The exchange is logged in the chat history
11. **Delivery**: The response is sent back to the user via WhatsApp

### 6.5.2 Implementation

The API is implemented through the following core function:

```javascript
try {
  // Check if challenge is active
  if (!isChallengeActive()) {
    inactiveMessage = getInactiveMessage()
    sendMessage(inactiveMessage)
    return
  }

  let systemResp
  const message = GetQuestion()
  const userID = GetUserId()
  const userInfo = getUserData(userID)
  const isNewUser = isPresent(userInfo) ? false : true

  if (isNewUser) {
    // New link to the registration form
    return "LINK"
  } else {
    // 0. GET DATA
    routerAgent = getRouterAgent()
    const agentSelected = GetAgentDedicatedFromRouterAgent(routerAgent, message)
    const prompt = loadPrompt(agentSelected)
    const orders = getOrders()
    const products = getProducts()
    const historyMessages = GetHistory("last 30 messages")

    // 1. TOKENIZE (ora restituisce anche la mappa)
    const { fakeMessage, fakeUserInfo, tokenMap } = Tokenize(message, userInfo)

    // 2. OPENROUTER
    systemResp = getResponse(
      prompt,
      agentSelected,
      historyMessages,
      fakeMessage,
      fakeUserInfo,
      orders,
      products
    )
    // Attach a calling function when we have the order details
    // Attach a calling function when we have to send the invoices

    // 4. CONVERSIONAL RESPONSE
    systemResp = conversationalResponse(
      "metti la frase in maniera discorsiva:" + systemResp
    )

    // 5. DETOKENIZE
    const resp = Detokenize(systemResp, systemResp)

    // 6. SAVE TO HISTORY
    saveToChatHistory(userID, agentSelected, message, resp)

    return resp
  }
} catch (error) {
  console.error("Errore in main:", error)
}
```

### 6.5.3 Database Requirements

To support this messaging flow, the database includes the following key entities:

- **ChatSession**: Tracks ongoing conversations with metadata
- **Message**: Stores individual messages with direction, content, and status
- **Prompts**: Stores AI agent configurations and prompts
- **Customers**: Contains user data and preferences

These models support the conversational interface shown in the platform's chat interface:

![Chat Interface](https://path-to-chat-interface-image.png)

The interface provides:

- List of recent conversations on the left panel
- Detailed conversation view on the right panel
- Real-time message exchange with timestamps
- Order tracking and status information
- Clear visual distinction between incoming and outgoing messages

## 7. Database Model

The application uses PostgreSQL as its database system, with Prisma ORM for data access and migration management. Below is the complete database schema defined in Prisma:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Workspace {
  id                  String            @id @default(cuid())
  name                String
  slug                String            @unique
  whatsappPhoneNumber String?
  whatsappApiKey      String?
  notificationEmail   String?
  webhookUrl          String?
  isActive            Boolean           @default(true)
  language            String            @default("ENG")
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt
  isDelete            Boolean           @default(false)
  currency            String            @default("EUR")
  challengeStatus     Boolean           @default(false)
  wipMessages         Json?             @default("{\"it\": \"Lavori in corso. Contattaci più tardi.\", \"en\": \"Work in progress. Please contact us later.\", \"es\": \"Trabajos en curso. Por favor, contáctenos más tarde.\", \"pt\": \"Em manutenção. Por favor, contacte-nos mais tarde.\"}")
  description         String?
  messageLimit        Int               @default(50)
  blocklist           String?           @default("")
  url                 String?
  welcomeMessages     Json?             @default("{\"it\": \"Benvenuto!\", \"en\": \"Welcome!\", \"es\": \"¡Bienvenido!\"}")
  carts               Carts[]
  categories          Categories[]
  chatSessions        ChatSession[]
  customers           Customers[]
  events              Events[]
  faqs                FAQ[]
  languages           Languages[]
  orders              Orders[]
  products            Products[]
  prompts             Prompts[]
  services            Services[]
  users               UserWorkspace[]
  whatsappSettings    WhatsappSettings?
}

model Categories {
  id          String     @id @default(uuid())
  name        String
  description String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  isActive    Boolean    @default(true)
  workspaceId String
  slug        String
  workspace   Workspace  @relation(fields: [workspaceId], references: [id])
  products    Products[]

  @@unique([slug, workspaceId])
  @@map("categories")
}

model Languages {
  id          String    @id @default(uuid())
  name        String    // e.g. 'Italiano', 'Español', 'English', 'Português'
  code        String    // 'IT', 'ESP', 'ENG', 'PRT'
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  isActive    Boolean   @default(true)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("languages")
}

model Products {
  id          String        @id @default(uuid())
  name        String
  description String?
  price       Float
  stock       Int           @default(0)
  sku         String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  isActive    Boolean       @default(true)
  workspaceId String
  categoryId  String?
  slug        String        @unique
  status      ProductStatus @default(ACTIVE)
  image       String?
  cartItems   CartItems[]
  orderItems  OrderItems[]
  category    Categories?   @relation(fields: [categoryId], references: [id])
  workspace   Workspace     @relation(fields: [workspaceId], references: [id])

  @@map("products")
}

model Customers {
  id                         String        @id @default(uuid())
  name                       String
  email                      String
  phone                      String?
  address                    String?
  company                    String?
  discount                   Float?        @default(0)
  language                   String?       @default("ENG")
  currency                   String?       @default("EUR")
  notes                      String?
  serviceIds                 String[]      @default([])
  isBlacklisted              Boolean       @default(false)
  createdAt                  DateTime      @default(now())
  updatedAt                  DateTime      @updatedAt
  isActive                   Boolean       @default(true)
  workspaceId                String
  last_privacy_version_accepted String?
  privacy_accepted_at        DateTime?
  push_notifications_consent Boolean       @default(false)
  push_notifications_consent_at DateTime?
  cart                       Carts?
  chatSessions               ChatSession[]
  workspace                  Workspace     @relation(fields: [workspaceId], references: [id])
  orders                     Orders[]
  activeChatbot              Boolean       @default(true)

  @@map("customers")
}

model Orders {
  id             String          @id @default(uuid())
  status         String
  total          Float
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  customerId     String
  workspaceId    String
  items          OrderItems[]
  customer       Customers       @relation(fields: [customerId], references: [id])
  workspace      Workspace       @relation(fields: [workspaceId], references: [id])
  paymentDetails PaymentDetails?

  @@map("orders")
}

model OrderItems {
  id        String   @id @default(uuid())
  quantity  Int
  price     Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  orderId   String
  productId String
  order     Orders   @relation(fields: [orderId], references: [id])
  product   Products @relation(fields: [productId], references: [id])

  @@map("order_items")
}

model Carts {
  id          String      @id @default(uuid())
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  customerId  String      @unique
  workspaceId String
  items       CartItems[]
  customer    Customers   @relation(fields: [customerId], references: [id])
  workspace   Workspace   @relation(fields: [workspaceId], references: [id])

  @@map("carts")
}

model CartItems {
  id        String   @id @default(uuid())
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  cartId    String
  productId String
  cart      Carts    @relation(fields: [cartId], references: [id])
  product   Products @relation(fields: [productId], references: [id])

  @@map("cart_items")
}

model Prompts {
  id          String    @id @default(uuid())
  name        String
  content     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  isActive    Boolean   @default(true)
  workspaceId String
  temperature Float?    @default(0.7)
  top_k       Int?      @default(40)
  top_p       Float?    @default(0.9)
  department  String?
  isRouter    Boolean   @default(false)
  messages    Message[]
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("prompts")
}

model User {
  id              String          @id @default(uuid())
  email           String          @unique
  passwordHash    String
  firstName       String?
  lastName        String?
  status          UserStatus      @default(ACTIVE)
  lastLogin       DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  role            UserRole        @default(MEMBER)
  twoFactorSecret String?
  gdprAccepted    DateTime?
  phoneNumber     String?
  otpTokens       OtpToken[]
  passwordResets  PasswordReset[]
  workspaces      UserWorkspace[]

  @@map("users")
}

model UserWorkspace {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  workspaceId String
  role        UserRole  @default(MEMBER)
  user        User      @relation(fields: [userId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@unique([userId, workspaceId])
  @@map("user_workspaces")
}

model WhatsappSettings {
  id          String    @id @default(uuid())
  phoneNumber String    @unique
  apiKey      String
  webhookUrl  String?
  settings    Json?     @default("{}")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspaceId String    @unique
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  gdpr        String?   @db.Text

  @@map("whatsapp_settings")
}

model PaymentDetails {
  id               String        @id @default(uuid())
  provider         String
  status           PaymentStatus @default(PENDING)
  amount           Float
  currency         String        @default("EUR")
  providerResponse Json?         @default("{}")
  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt
  orderId          String        @unique
  order            Orders        @relation(fields: [orderId], references: [id])

  @@map("payment_details")
}

model ChatSession {
  id          String    @id @default(uuid())
  status      String    @default("active")
  context     Json?     @default("{}")
  startedAt   DateTime  @default(now())
  endedAt     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspaceId String
  customerId  String
  customer    Customers @relation(fields: [customerId], references: [id])
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  messages    Message[]

  @@map("chat_sessions")
}

model Message {
  id            String           @id @default(uuid())
  direction     MessageDirection
  content       String
  type          MessageType      @default(TEXT)
  status        String           @default("sent")
  aiGenerated   Boolean          @default(false)
  metadata      Json?            @default("{}")
  read          Boolean          @default(false)
  createdAt     DateTime         @default(now())
  updatedAt     DateTime         @updatedAt
  chatSessionId String
  promptId      String?
  chatSession   ChatSession      @relation(fields: [chatSessionId], references: [id])
  prompt        Prompts?         @relation(fields: [promptId], references: [id])

  @@map("messages")
}

model PasswordReset {
  id        String    @id @default(uuid())
  userId    String
  token     String    @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])

  @@map("password_resets")
}

model OtpToken {
  id        String    @id @default(uuid())
  userId    String
  otpHash   String
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime  @default(now())
  user      User      @relation(fields: [userId], references: [id])

  @@map("otp_tokens")
}

model RegistrationToken {
  id            String    @id @default(uuid())
  token         String    @unique
  phoneNumber   String
  workspaceId   String
  expiresAt     DateTime
  usedAt        DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("registration_tokens")
}

model Language {
  id        String   @id @default(cuid())
  code      String   @unique // 'IT', 'ESP', 'ENG', 'PRT'
  name      String   // 'Italiano', 'Español', 'English', 'Português'
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Services {
  id          String    @id @default(cuid())
  name        String
  description String
  price       Float
  currency    String    @default("EUR")
  isActive    Boolean   @default(true)
  workspaceId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("services")
}

model Events {
  id          String    @id @default(cuid())
  name        String
  description String
  startDate   DateTime
  endDate     DateTime
  location    String
  price       Float
  currency    String    @default("EUR")
  isActive    Boolean   @default(true)
  maxAttendees Int?
  currentAttendees Int? @default(0)
  workspaceId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("events")
}

model FAQ {
  id          String    @id @default(cuid())
  question    String
  answer      String    @db.Text
  isActive    Boolean   @default(true)
  workspaceId String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id])

  @@map("faqs")
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum WorkspaceStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

enum ProductStatus {
  ACTIVE
  INACTIVE
  DRAFT
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  COMPLETED
  FAILED
  REFUNDED
}

enum MessageDirection {
  INBOUND
  OUTBOUND
}

enum MessageType {
  TEXT
  IMAGE
  DOCUMENT
  LOCATION
  CONTACT
}

enum ChannelType {
  WHATSAPP
  TELEGRAM
  MESSENGER
  LINE
}

enum UserRole {
  ADMIN
  OWNER
  MEMBER
}
```

### Key Database Models

1. **Workspace**: Central entity that contains configuration for each tenant's instance
2. **User and UserWorkspace**: Handles authentication and workspace membership
3. **Products and Categories**: Core e-commerce product catalog
4. **Customers**: User profiles who interact with the system
5. **Orders and OrderItems**: Handles purchase transactions
6. **Carts and CartItems**: Shopping cart functionality
7. **ChatSession and Message**: Support for conversational interactions
8. **Services and Events**: Extended offering capabilities
9. **Prompts**: AI conversation templates

This schema implements a multi-tenant architecture with complete data isolation between workspaces, ensuring security and scalability.

## 8. Backend Architecture and Implementation

### Overview

The backend system of this PDR application will be developed using Node.js with the Express.js framework, adopting the Domain-Driven Design (DDD) architectural pattern and implemented as a monorepo using Turborepo. This architecture allows for efficient code organization, shared dependencies, and optimized builds across multiple packages.

The monorepo structure, powered by Turborepo, provides several key benefits:

- Centralized code management with shared configurations
- Optimized build pipeline with intelligent caching
- Consistent development experience across packages
- Efficient dependency management
- Standardized tooling and processes

### Key Features

#### Multilingual Welcome Messages

The system supports configurable welcome messages in multiple languages:

- **Languages**: Italian (IT), English (EN), and Spanish (ES)
- **Storage**: Welcome messages are stored in the Workspace settings as JSON data
- **Configuration**: Admin users can customize welcome messages for each language through the Settings interface
- **Usage**: The appropriate language version is automatically selected based on:
  - User's explicit language preference (if set)
  - Initial greeting language detection (Hola → Spanish, Hello → English, Ciao → Italian)
  - Workspace default language (fallback)
- **Format**: Messages can include emojis and formatting for a friendly, engaging experience

This feature ensures users receive culturally appropriate greetings that establish the right tone for the conversation from the very beginning, enhancing the personalization of the customer experience.

### Monorepo Structure

```
.
├── apps/
│   ├── web/          # Next.js frontend application
│   └── backend/      # Node.js backend application
├── packages/
│   ├── eslint-config/    # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/              # Shared UI components
├── package.json     # Root package.json
└── turbo.json      # Turborepo configuration
```

### Security Implementation

System security is a priority. Therefore, security measures recommended by OWASP will be implemented, including:

- Input validation to prevent injection attacks
- Secure session management to protect user authentication
- Protection against SQL injection and Cross-Site Scripting (XSS) to ensure data integrity
- JWT token validation and refresh mechanisms
- Rate limiting and request throttling
- Security headers implementation
- CORS policy configuration

### Technical Stack and Organization

#### Core Technologies

- Node.js with Express.js
- PostgreSQL with Prisma ORM
- Redis for caching
- Docker for containerization

#### Architecture Layers

1. **Routes Layer**

   - API endpoint definitions
   - Request validation
   - Response formatting
   - Error handling middleware

2. **Use Cases Layer**

   - Business logic implementation
   - Transaction management
   - Event handling
   - Service orchestration

3. **Services Layer**

   - Domain logic
   - External service integration
   - Data transformation
   - Business rules enforcement

4. **Repository Layer**
   - Data access patterns
   - Query optimization
   - Cache management
   - Data persistence

### Development Guidelines

#### Project Structure

```
src/
├── config/         # Configuration files
├── routes/         # API routes
├── useCases/      # Business logic
├── services/      # Domain services
├── repositories/  # Data access
├── models/        # Data models
├── middleware/    # Custom middleware
├── utils/         # Utility functions
└── tests/         # Test files
```

#### Code Organization

- Clear separation of concerns
- Dependency injection pattern
- Repository pattern for data access
- Factory pattern for object creation
- Strategy pattern for flexible algorithms

### Error Handling and Logging

- Centralized error handling
- Structured logging with Winston
- Request ID tracking
- Performance monitoring
- Error reporting and alerting

### Documentation

- Swagger/OpenAPI documentation
- API endpoint documentation
- Database schema documentation
- Development setup guide
- Deployment instructions

### Development Workflow

- Git workflow guidelines
- Code review process
- Testing requirements
- CI/CD pipeline configuration
- Environment management

### Monitoring and Maintenance

- Health check endpoints
- Performance metrics
- Resource monitoring
- Backup strategies
- Scaling guidelines

### Docker Architecture

The ShopMe platform utilizes a simplified containerized architecture with Docker to ensure consistency across development, testing, and production environments. The system is built with a minimalist approach, focusing only on essential containers:

#### Container Architecture

- **PostgreSQL Container**:

  - Image: PostgreSQL 14
  - Purpose: Primary database storing all application data
  - Ports: 5432
  - Volumes: Database data, periodic backups
  - Configuration: Optimized for performance with appropriate memory allocation and connection pooling

 

#### Deployment Strategy

This streamlined two-container approach is consistent across both local development and production environments:

**Local Development:**

- Docker Compose orchestrates both containers

- Local volume mounts for easy development and debugging
- Environment variables managed through .env files (not committed to version control)

**Production (Heroku):**

- Both containers deployed using Heroku container registry
- PostgreSQL configured with Heroku PostgreSQL add-on for managed database service
- Environment variables managed through Heroku config vars
- Automated backups configured for both containers

This minimalist container strategy reduces operational complexity while providing all necessary functionality for the application. The frontend and API are deployed using Heroku's standard buildpacks rather than containers, further simplifying the architecture.

This architecture will ensure a robust, secure, and scalable backend system, in line with the digitization and resilience objectives of the PDR.

- Delivery services (to fulfill orders)
- Service providers (who assist in operating our platform)
- Legal authorities (when required by law)

We never sell your personal data to third parties.

6. YOUR RIGHTS UNDER GDPR

You have the right to:

- Access your personal data
- Correct inaccurate data
- Delete your data ("right to be forgotten")
- Restrict or object to processing
- Data portability
- Withdraw consent at any time

To exercise these rights, send a message with "DATA REQUEST" to our customer service.

7. DATA RETENTION

We retain your data for as long as necessary to provide services and comply with legal obligations. Order information is kept for [X] years for tax and accounting purposes.

8. UPDATES TO THIS POLICY

We may update this policy periodically. When we make significant changes, we will notify you and request fresh consent where required by law.

9. CONTACT US

If you have questions about this Privacy Policy, please contact our Data Protection Officer at [EMAIL].

By replying "I ACCEPT", you confirm that you have read and understood this Privacy Policy and consent to the collection and use of your information as described.

```

This template will be customized for each workspace with specific business information, retention periods, and contact details. The system tracks the version and timestamp of acceptance for compliance purposes.

### User Preferences Management and Account Deletion

To ensure full control over their data and comply with GDPR requirements, the platform provides users with comprehensive self-service options for managing their account:

#### 1. User Preferences Management

- **Access Method**: Users can request a preferences management link through WhatsApp with the command "update my preferences"
- **Security**: The link contains a secure, time-limited token valid for 24 hours
- **Editable Information**:
  - Personal details (name, company)
  - Language preference
  - Currency preference
  - Push notification settings
  - Communication preferences
- **Process Flow**:
  1. User requests preferences update link via WhatsApp
  2. System generates a secure token and creates a unique URL
  3. URL is sent to user via WhatsApp
  4. User accesses the web interface with pre-filled current settings
  5. User makes desired changes and submits the form
  6. System updates the profile and confirms changes
  7. User receives confirmation message via WhatsApp

#### 2. Account Deletion Process

- **Access Method**: Within the preferences management page, users have access to an "Delete My Account" option
- **Confirmation Process**:
  - Users must type their phone number to confirm deletion
  - A clear warning about the permanent nature of deletion is shown
  - Two-step verification with a WhatsApp confirmation message
- **Data Handling**:
  - **Deleted Immediately**:
    - Personal identifying information (name, email, contact details)
    - Chat history and conversation logs
    - Preferences and consent records
  - **Preserved Data**:
    - Order records (anonymized with a reference ID)
    - Transaction history (required for legal and financial records)
    - Aggregate usage statistics (fully anonymized)
- **Technical Implementation**:
  - User record is not physically deleted but pseudonymized
  - Name is replaced with "Deleted User"
  - Contact information is nullified
  - A deletion timestamp is recorded
  - Associated chat history is physically deleted
- **Confirmation**:
  - User receives final confirmation of account deletion
  - Instructions for data recovery during grace period (30 days)
  - Contact information for any questions about remaining data

#### 3. API Endpoints

- `GET /api/clients/preferences/:token`
  - **Description**: Retrieves user preferences for editing using a secure token
  - **Returns**: Current user preferences and profile information

- `PUT /api/clients/preferences/:token`
  - **Description**: Updates user preferences
  - **Body**: Modified user preferences
  - **Returns**: Confirmation of updates applied

- `POST /api/clients/deletion-request/:token`
  - **Description**: Initiates account deletion process
  - **Body**: `phone_confirmation` (user's phone for verification)
  - **Returns**: Confirmation and next steps for two-factor verification

- `POST /api/clients/confirm-deletion`
  - **Description**: Completes account deletion after two-factor verification
  - **Body**: `verification_code` sent via WhatsApp
  - **Returns**: Final confirmation of account deletion

This comprehensive approach ensures users maintain control over their data while the platform preserves necessary information for legal and business continuity purposes.

## Multi-Tenant Architecture Implementation

The ShopMe platform follows a strict multi-tenant architecture where each client business operates within its own isolated workspace. This architectural approach ensures data isolation, security, and scalability.

### Workspace-Based Data Isolation

1. **Database Implementation**:

   - Every major entity in the database includes a `workspace_id` foreign key reference
   - Database constraints enforce that entities can only be associated with a single workspace
   - Queries are always scoped to a specific workspace_id to prevent data leakage between tenants
   - Database triggers enforce workspace data isolation on insert/update operations

2. **API Request Filtering**:

   - All API endpoints (except authentication) require a workspace context
   - Workspace identification is handled through:
     - Explicit `workspace_id` parameter for GET requests
     - `workspace_id` field in request bodies for POST/PUT requests
     - JWT token payload containing workspace context for authenticated requests
   - API middleware automatically applies workspace filtering to all database queries
   - Attempts to access data across workspaces are blocked with 403 Forbidden responses

3. **User-Workspace Relationship**:
   - Users can be associated with multiple workspaces through the `user_workspaces` junction table
   - Each user-workspace association has a specific role (admin, manager, agent, etc.)
   - Session management includes the active workspace context
   - Workspace switching requires explicit user action and re-establishing session context

### Security Measures for Tenant Isolation

1. **Query Layer Security**:

   - ORM/Repository layer implements workspace filtering as non-bypassable middleware
   - Raw SQL queries are prohibited; all database access goes through workspace-aware repositories
   - Workspace validation occurs at controller, service, and repository levels (defense in depth)

2. **Resource Allocation**:

   - Each workspace has configurable resource limits (API rate limits, storage quotas, etc.)
   - Resource monitoring tracks usage per workspace
   - Tenant isolation prevents resource consumption by one tenant from affecting others

3. **Data Export/Import**:
   - Data export functions include workspace validation
   - Bulk operations maintain workspace context for all affected records
   - ETL processes enforce workspace boundaries

The multi-tenant architecture ensures that:

- Each client's data remains completely isolated from other clients
- API requests are always scoped to the requesting client's workspace
- Database operations maintain tenant boundaries at all times
- Users with access to multiple workspaces can only operate within one workspace context at a time

This approach enables the system to securely serve multiple businesses while maintaining strict data separation and optimizing resource utilization.

### Security

#### Authentication and Authorization

The system implements a secure authentication mechanism using JSON Web Tokens (JWT) stored in HTTP-only cookies:

1. **JWT-based Authentication**:
   - Tokens are stored in HTTP-only cookies to prevent JavaScript access
   - Tokens are secure, with appropriate expiration times
   - CSRF protection is implemented
   - Fallback to Authorization headers for backward compatibility

2. **Login Process**:
   - User submits credentials (email/password)
   - System validates credentials against the database
   - Upon successful authentication, a JWT token is generated and stored in an HTTP-only cookie
   - User information is returned to the frontend (without the token)

3. **Authentication Middleware**:
   - Checks for token in cookies first, then falls back to Authorization header
   - Verifies token validity and signature
   - Attaches user context to the request for downstream use
   - Handles authentication errors appropriately

4. **Logout Process**:
   - Clears the HTTP-only cookie on the server
   - Removes user data from local storage on the client
   - Redirects to login page

5. **Access Control**:
   - Role-based authorization (Admin, Owner, Standard User)
   - Workspace-specific permissions
   - Resource-level access controls

The token payload contains the user's ID, email, and role, allowing for proper authorization checks across the application.

### WhatsApp Settings Management

- `GET /api/whatsapp-settings/:workspaceId/gdpr`

  - **Description**: Retrieves the GDPR policy content for a workspace
  - **Parameters**: `workspaceId` (required): Workspace identifier
  - **Returns**: GDPR policy text

- `PUT /api/whatsapp-settings/:workspaceId/gdpr`

  - **Description**: Updates the GDPR policy content for a workspace
  - **Parameters**: `workspaceId` (required): Workspace identifier
  - **Body**: `gdpr` (required): GDPR policy text
  - **Returns**: Updated WhatsApp settings

- `GET /api/gdpr/default`

  - **Description**: Retrieves the default GDPR policy text template
  - **Returns**: Default GDPR policy content

## 5. User Interface

### 5.1 Dashboard Layout

The dashboard follows a modern, clean design with an emphasis on usability and efficiency:

- **Navigation**: Left sidebar with clear category icons
- **Content Area**: Center-aligned with responsive design
- **Controls**: Positioned consistently at the top of content sections
- **Data Display**: Organized in tables and cards with consistent spacing

### 5.2 Color Schema

The application follows a consistent color scheme to maintain brand identity:

- **Primary**: Green (#10b981) - Used for primary actions, buttons, and key UI elements
- **Secondary**: Gray (#6b7280) - Used for secondary elements, text, and borders
- **Accent**: Blue (#3b82f6) - Used sparingly for highlighting important information
- **Neutral**: White (#f9fafb) - Used for backgrounds and spacing
- **Error**: Red (#ef4444) - Used for errors, alerts, and destructive actions
- **Warning**: Yellow (#f59e0b) - Used for warnings and caution notifications
- **Success**: Green (#10b981) - Used for success messages and confirmations

### 5.3 Notification Badges

The application implements a notification badge system in the sidebar navigation to alert users about pending actions and items requiring attention:

#### Chat History Badge

- **Purpose**: Displays the total count of unread messages across all chat conversations
- **Visual Appearance**: A small red circular badge containing a white number
- **Behavior**:
  - Initially shows a count of 2 unread messages when the application loads
  - Updates in real-time when new messages arrive
  - When a user opens a chat, the associated messages are marked as read
  - The badge count decreases as messages are read
  - The badge disappears completely when all messages are read (count equals zero)
  - After reading all messages, the Chat History icon remains without a badge until new unread messages arrive

#### Clients Badge

- **Purpose**: Indicates the number of unknown customers who require identification or profile completion
- **Visual Appearance**: Similar red circular badge with white number
- **Behavior**:
  - Shows a consistent count of 2 unknown clients by default
  - Represents customers who have contacted the business but haven't been properly profiled
  - When administrators properly identify and categorize these clients, the badge count should update
  - Serves as a reminder to maintain clean and complete customer records

#### Implementation Details

- Badge counts are stored in component state variables and updated through API calls
- The system updates badge counts in these scenarios:
  - On initial page load
  - When a user reads messages
  - When a new message arrives (via polling or websocket)
  - When customer profiles are updated
- The badge visual style is consistent across the application:
  - Size: Compact (16-20px diameter)
  - Position: Upper right corner of the associated navigation item
  - Color: Red background (#ef4444) with white text
  - Animation: Subtle entrance animation when count changes

This notification system improves workflow efficiency by providing visual cues for pending actions, helping administrators prioritize their tasks and ensure timely responses to customers.

