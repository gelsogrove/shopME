
### Subscription Plans & Pricing

#### 1. Basic Plan (€49/month)
- **Features**:
  - Single WhatsApp number connection
  - Up to 1,000 AI-powered messages/month
  - Maximum 5 products/services
  - Standard response time (24h)
  - Basic analytics dashboard
  - Email support
- **Best For**: Small businesses just starting with conversational commerce

#### 2. Professional Plan (€149/month)
- **Features**:
  - Up to 3 WhatsApp number connections
  - Up to 5,000 AI-powered messages/month
  - Maximum 100 products/services
  - Priority response time (12h)
  - Advanced analytics and reporting
  - Phone and email support
  - Custom AI training
- **Best For**: Growing businesses with established product catalogs

#### 3. Enterprise Plan (Custom pricing)
- **Features**:
  - Unlimited WhatsApp number connections
  - Custom AI message volume
  - Unlimited products/services
  - Dedicated response team (4h SLA)
  - Full API access
  - White-label options
  - Dedicated account manager
  - Custom integrations
  - On-premises deployment option
- **Best For**: Large organizations with complex needs and high volume requirements

All plans include:
- GDPR compliance tools
- Security monitoring
- Regular platform updates
- Knowledge base access

### AI Configuration Options

Under each plan, businesses can customize their AI agent with the following parameters:

| Parameter | Description | Default Value | Available Options |
|-----------|-------------|--------------|-------------------|
| **Model Selection** | AI model used for responses | GPT-3.5-turbo | GPT-4, Claude, Mistral, Llama |
| **Temperature** | Response creativity level | 0.7 | 0.1-1.0 in 0.1 increments |
| **Max Tokens** | Maximum response length | 250 | 50-1000 |
| **Top-P** | Nucleus sampling threshold | 0.95 | 0.5-1.0 |
| **Top-K** | Number of highest probability tokens to consider | 40 | 10-100 |
| **System Prompt** | Base instructions for AI | Basic retail template | Custom templates available |
| **Memory Context** | Number of previous messages to include | 10 | 1-20 |
| **Response Speed** | Balance between quality and speed | Balanced | Fast, Balanced, Quality |

Professional and Enterprise plans allow for A/B testing of different AI configurations and provide tools to analyze which settings deliver the best customer experience and conversion rates.

### 1. Basic Monitoring (Included)
- Standard usage metrics
- Basic incident reporting
- Daily status reports
- Error logging
- Performance alerts
- Monthly summary reports
- Online support portal

### 2. Advanced Monitoring (Premium)
- Real-time dashboard
- Custom alert thresholds
- 24/7 incident response
- Detailed performance analytics
- SLA guarantees
- Weekly executive reports
- Dedicated support manager

### 3. Enterprise Monitoring (Enterprise)
- High-availability monitoring
- Custom metrics integration
- Priority incident response
- Comprehensive security monitoring
- Advanced threat detection
- Custom metrics and KPIs
- Business impact analysis
- 24/7 monitoring team
- Monthly executive reports
- Predictive analytics for resource planning

## DEVELOPMENT ROADMAP

### Phase 1: Core Data Management (Months 1-2)
- Complete CRUD functionality for all core entities:
  - Products and services catalog
  - Categories and subcategories
  - Languages and localization
  - AI agents configuration
  - Offers and promotions
  - Chat history and logs
  - GDPR compliance tools
- Multi-tenant workspace architecture
- User role management and permissions
- Basic admin interface

### Phase 2: Communication Platform (Months 3-4)
- WhatsApp API integration and playground
- Chat flow builder and conversation design tools
- Administrative dashboard with basic analytics
- Customer survey and feedback system
- Conversation templates library
- Conversation testing environment
- Basic RAG implementation for knowledge retrieval
- AI model selection and configuration

### Phase 3: Monetization & Notifications (Months 5-6)
- Payment gateway integration
- Invoice generation system
- Push notification infrastructure
- Notification templates and scheduling
- Initial deployment with limited customer base
- Beta testing program with select businesses
- Performance optimization
- Security hardening

### Phase 4: Marketing & MMP Enhancements (Months 7-8)
- Marketing automation tools
- Enhanced analytics dashboard
- Customer segmentation capabilities
- Campaign management tools
- Minimum Marketable Product (MMP) feature set
- Enhanced AI capabilities
- Initial vertical market adaptations
- Integration marketplace

### Phase 5: Full Deployment & Quality Assurance (Months 9-10)
- Comprehensive end-to-end testing
- Performance benchmarking
- Security audits and penetration testing
- Scalability improvements
- Documentation completion
- Support system implementation
- Staff training programs
- Full public launch

## API ENDPOINTS

### API Rate Limiting Implementation

We protect all API endpoints with smart rate limiting to keep the system stable and prevent misuse:

| Feature | Description | Benefit |
|---------|-------------|---------|
| **User Limits** | 30 requests per minute per user | Prevents any single user from overloading the system |
| **Workspace Quotas** | Customizable daily limits per business | Allows businesses to manage their API usage |
| **Smart Throttling** | Different limits for different endpoints | Prioritizes critical operations over less important ones |

#### How You'll Know About Limits

Our API includes helpful response headers that tell you about your usage:

| Header | What It Shows | Example |
|--------|---------------|---------|
| `X-RateLimit-Limit` | Maximum allowed requests | `X-RateLimit-Limit: 30` |
| `X-RateLimit-Remaining` | Requests left in current period | `X-RateLimit-Remaining: 28` |
| `X-RateLimit-Reset` | Seconds until limit resets | `X-RateLimit-Reset: 45` |

When you reach a limit, our system:
1. Returns a `429 Too Many Requests` status code
2. Sends a JSON response explaining the issue
3. Includes a `Retry-After` header telling you when to try again

Business owners can adjust these limits in their workspace settings, with options to set different limits for various API operations or temporarily increase limits during high-traffic periods.

### Authentication

- `POST /api/auth/login`

  - **Description**: Authenticates a user and returns a JWT token
  - **Body**: `email`, `password`
  - **Returns**: JWT token, user information

- `POST /api/auth/logout`

  - **Description**: Logs out the current user
  - **Headers**: `Authorization` with JWT token
  - **Returns**: Success message

- `GET /api/auth/me`

  - **Description**: Gets the authenticated user's information
  - **Headers**: `Authorization` with JWT token
  - **Returns**: User profile information

### Workspace Management

- `GET /api/workspaces`

  - **Description**: Retrieves all workspaces accessible to the user
  - **Headers**: `Authorization` with JWT token
  - **Returns**: List of workspaces with access

- `POST /api/workspaces`

  - **Description**: Creates a new workspace
  - **Body**: `name`, `description`, `settings`
  - **Returns**: Created workspace details

- `GET /api/workspaces/:id`

  - **Description**: Gets details of a specific workspace
  - **Parameters**: `id` (required): Workspace identifier
  - **Returns**: Complete workspace details

- `PUT /api/workspaces/:id`

  - **Description**: Updates a workspace's information
  - **Parameters**: `id` (required): Workspace identifier
  - **Body**: Fields to update
  - **Returns**: Updated workspace

- `DELETE /api/workspaces/:id`

  - **Description**: Deletes a workspace
  - **Parameters**: `id` (required): Workspace identifier
  - **Returns**: Deletion confirmation

### Product Management

- `GET /api/products`
  - **Description**: Retrieves product list with filtering options
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `category_id` (optional): Filter by category
    - `page`, `limit` (optional): Pagination parameters
    - `search` (optional): Search by product name or description
    - `sort` (optional): Sort by price, name, created_at, etc.
    - `order` (optional): asc or desc
  - **Returns**: Paginated list of products with metadata

- `POST /api/products`
  - **Description**: Creates a new product
  - **Body**: `name`, `description`, `price`, `category_id`, `images`, `stock`, `attributes`, `tax_rate`, `sku`, `barcode`
  - **Returns**: Created product details

- `GET /api/products/:id`
  - **Description**: Gets details of a specific product
  - **Parameters**: `id` (required): Product ID
  - **Returns**: Complete product details including variants and related products

- `PUT /api/products/:id`
  - **Description**: Updates a product
  - **Parameters**: `id` (required): Product ID
  - **Body**: Fields to update
  - **Returns**: Updated product

- `DELETE /api/products/:id`
  - **Description**: Deletes a product
  - **Parameters**: `id` (required): Product ID
  - **Returns**: Deletion confirmation

- `POST /api/products/:id/images`
  - **Description**: Uploads product images
  - **Parameters**: `id` (required): Product ID
  - **Body**: Image files (multipart/form-data)
  - **Returns**: Updated product with image URLs

- `DELETE /api/products/:id/images/:image_id`
  - **Description**: Removes a product image
  - **Parameters**: 
    - `id` (required): Product ID
    - `image_id` (required): Image ID to delete
  - **Returns**: Updated product images

### Category Management

- `GET /api/categories`
  - **Description**: Retrieves category list
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `parent_id` (optional): Filter by parent category
    - `include_products` (optional): Include product count
  - **Returns**: List of categories with hierarchical structure

- `POST /api/categories`
  - **Description**: Creates a new category
  - **Body**: `name`, `description`, `parent_id`, `image`, `display_order`
  - **Returns**: Created category details

- `GET /api/categories/:id`
  - **Description**: Gets details of a specific category
  - **Parameters**: `id` (required): Category ID
  - **Returns**: Category details with optional child categories

- `PUT /api/categories/:id`
  - **Description**: Updates a category
  - **Parameters**: `id` (required): Category ID
  - **Body**: Fields to update
  - **Returns**: Updated category

- `DELETE /api/categories/:id`
  - **Description**: Deletes a category
  - **Parameters**: `id` (required): Category ID
  - **Returns**: Deletion confirmation

- `GET /api/categories/:id/products`
  - **Description**: Gets all products in a category
  - **Parameters**: 
    - `id` (required): Category ID
    - `include_subcategories` (optional): Include products from subcategories
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Products in the category

### Customer Management

- `GET /api/customers`
  - **Description**: Retrieves customer list
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `page`, `limit` (optional): Pagination parameters
    - `search` (optional): Search by name, email, or phone
    - `sort` (optional): Sort by created_at, name, etc.
  - **Returns**: Paginated list of customers

- `POST /api/customers`
  - **Description**: Creates a new customer
  - **Body**: `name`, `email`, `phone`, `whatsapp_id`, `address`, `notes`, `custom_fields`
  - **Returns**: Created customer details

- `GET /api/customers/:id`
  - **Description**: Gets details of a specific customer
  - **Parameters**: `id` (required): Customer ID
  - **Returns**: Complete customer details including order history

- `PUT /api/customers/:id`
  - **Description**: Updates a customer
  - **Parameters**: `id` (required): Customer ID
  - **Body**: Fields to update
  - **Returns**: Updated customer

- `DELETE /api/customers/:id`
  - **Description**: Deletes a customer
  - **Parameters**: `id` (required): Customer ID
  - **Returns**: Deletion confirmation

