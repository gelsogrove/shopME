# ShopMe - WhatsApp E-commerce Platform PRD

## Contents
- [About ShopMe](#introduction)
  - [What is ShopMe](#short-description)
  - [Main Benefits](#key-advantages)
  - [Customer Notifications](#push-notifications)
  - [Business Tools](#dashboard-and-surveys)
- [Why Choose ShopMe](#key-differentiators-and-unique-selling-points)
  - [All-in-One Platform](#unified-commerce-and-customer-care-platform)
- [Main Features](#core-functionality)
  - [Multi-Business Support](#1-multi-tenant-business-platform-priority-must-have)
  - [Product Management](#2-products-management-priority-must-have)
  - [Category Organization](#3-categories-management-priority-must-have)
  - [Special Offers](#4-offers-management-priority-should-have)
  - [System Settings](#5-settings-management-priority-must-have)
  - [WhatsApp & AI](#6-whatsapp-ai-integration-priority-must-have)
    - [Data Protection](#7-gdpr-compliance-priority-must-have)
    - [WhatsApp Setup](#whatsapp-business-api-integration)
- [Future Features](#out-of-scope-features-wip)
  - [Order Processing](#orders-management)
  - [Business Insights](#analytics)
  - [Advanced Notifications](#advanced-push-notifications)
  - [Payment Options](#payment-integration)
- [Coming Soon](#minimum-marketable-product-mmp)
  - [Better Order Management](#enhanced-orders-management)
  - [Advanced Business Reports](#advanced-analytics-dashboard)
  - [Complete Payment System](#full-payment-integration)
  - [Team Support](#multi-agent-collaboration)
  - [Smarter AI](#enhanced-ai-capabilities)
  - [System Functions](#function-call-documentation)
- [Support Plans](#monitoring-plans)
  - [Pricing Options](#subscription-plans--pricing)
  - [AI Configuration](#ai-configuration-options)
  - [Basic Support](#1-basic-monitoring-included)
  - [Premium Support](#2-advanced-monitoring-premium)
  - [Enterprise Support](#3-enterprise-monitoring-enterprise)
- [Development Timeline](#development-roadmap)
- [How It Works](#technical-architecture)
- [Example Conversations](#ejemplos-de-conversación)
  - [User Registration](#registro-de-nuevo-usuario)
  - [Product Discovery](#descubrimiento-y-compra-de-productos)
  - [Invoice Requests](#solicitud-de-factura)
  - [Order Tracking](#estado-del-pedido-y-seguimiento)
- [Industry Solutions](#vertical-market-adaptability)
  - [Setup Requirements](#implementation-requirements)
- [System Connections](#api-endpoints)
  - [Access Limits](#api-rate-limiting-implementation)
  - [Login System](#authentication)
  - [Business Areas](#workspace-management)
  - [Product Tools](#product-management)
  - [Category Tools](#category-management)
  - [Customer Tools](#customer-management)
  - [Promotion Tools](#offers-management)
  - [AI Settings](#prompt-management)
  - [WhatsApp Setup](#whatsapp-business-api-integration)
  - [Chat Tools](#chat-management)
  - [Service Tools](#service-management)
- [Data Structure](#data-model)
- [Security Features](#security)
  - [Preventing Misuse](#anti-abuse-system)
  - [Access Control](#rate-limiting-controls)
  - [Data Protection](#data-encryption)
  - [Secure Customer Data](#secure-data-handling-with-tokenization)
  - [Safe Data Handling](#secure-data-processing-workflow)
- [Privacy Compliance](#compliance-and-privacy)
  - [Data Protection Laws](#gdpr-compliance)
  - [Customer Privacy Options](#user-preference-and-account-deletion)
- [Market Analysis](#competitive-analysis)
  - [Industry Overview](#market-overview)
  - [Competitor Comparison](#direct-competitor-comparison)
  - [Our Advantages](#key-differentiators)
  - [Market Needs](#market-gap-addressed)
  - [Industry Trends](#supporting-industry-trends)
  - [Customer Sign-Up](#customer-registration-flow)

## INTRODUCTION

### Short Description
ShopMe is a multilingual SaaS platform (Italian, English, Spanish) that turns WhatsApp into a complete sales channel. Cutomers can create smart chatbots, manage products, receive orders, and send invoices to theri clients without any technical skills. Our AI technology automates customer-care responses, manages push notifications, and offers a 24/7 conversational shopping experience, all directly in the world's most popular messaging app.

All sensitive operations are handled securely through temporary links with security tokens. These links direct customers to our secure website for registration forms, payments, invoices, and accessing personal data. This keeps all sensitive information outside of chat conversations, ensuring data protection while maintaining a smooth customer experience.

### Key Advantages
- **24/7 Customer Service**: AI-powered chatbots provide immediate responses anytime, ensuring customer inquiries never go unanswered and sales opportunities are never missed
- **Increased Conversion Rates**: Reducing friction in the purchase journey and providing personalized assistance helps businesses convert more inquiries into sales
- **Enhanced Customer Engagement**: Natural language conversations create more engaging and human-like interactions compared to traditional e-commerce interfaces
- **Operational Efficiency**: Automating routine requests and processes reduces staff workload and operational costs while improving response times
- **Valuable Customer Insights**: Each conversation generates valuable data that helps businesses understand customer preferences and improve their offerings over time
- **Scalability Without Complexity**: The SaaS model enables businesses of any size to implement sophisticated e-commerce capabilities without technical expertise or significant investment

### Push Notifications
The platform includes a comprehensive push notification system that enables businesses to:
- Send targeted messages based on customer history
- Automatically remind customers about upcoming appointments/bookings
- Reach out to inactive customers through re-engagement campaigns
- Announce limited-time offers and discounts
- Update customers on loyalty points, rewards, and milestones
- Inform customers about upcoming events or new services

### Dashboard & Surveys
The platform features a comprehensive administrative dashboard that provides businesses with:
- **Real-time Analytics**: Monitor conversations, sales performance, and customer engagement metrics
- **Customer Management**: View and edit customer profiles, preferences, and interaction history
- **Product Performance**: Track best-selling items, view inventory levels, and manage product listings
- **Order Management**: Process orders, manage fulfillment, and track delivery status
- **Integrated Surveys**: Create and distribute customer surveys directly via WhatsApp to collect feedback
- **Custom Reports**: Generate bespoke reports on any aspect of business performance
- **Conversation Insights**: Analyze common questions, sentiment trends, and AI performance metrics

The survey functionality allows businesses to:
- Design customized feedback forms with multiple question types
- Schedule automated survey distribution based on purchase events or time intervals
- Analyze responses with AI-powered sentiment analysis
- Track Net Promoter Score (NPS) and customer satisfaction metrics over time
- Automatically tag and categorize customer feedback for actionable insights
- Create targeted marketing campaigns based on survey responses

## KEY DIFFERENTIATORS AND UNIQUE SELLING POINTS

### Unified Commerce and Customer Care Platform
ShopMe stands apart by seamlessly integrating two traditionally separate systems—e-commerce and customer service—into a single, cohesive platform within WhatsApp. This unified approach delivers several powerful advantages:

#### The Converging Power of E-Commerce and Customer Care
- **Single Conversation Thread**: Customers navigate products, ask questions, and complete purchases within a single chat thread rather than switching between apps or websites
- **Contextual Memory**: The system remembers past interactions, enabling personalized recommendations and support based on purchase history and preferences
- **Full Journey Capabilities**: From discovery and consideration to purchase, support, and re-engagement—all managed through the same interface
- **Seamless Transition**: Handoffs between AI automation and human agents occur without disruption to the customer experience

#### Leveraging WhatsApp's Unique Advantages
- **2.7+ Billion Active Users**: Reach customers where they already spend time, eliminating the barrier of app downloads
- **98% Message Open Rate**: WhatsApp messages have dramatically higher engagement than email (20%) or app notifications (5-10%)
- **Rich Media Support**: Share product catalogs, videos, images, and interactive buttons within the familiar WhatsApp interface
- **Persistent Connection**: Unlike website visits that end when a user leaves, WhatsApp conversations create ongoing engagement opportunities
- **Global Accessibility**: Available in regions where smartphone penetration is high but app/website commerce adoption remains low

#### Measurable Business Impact
Based on preliminary testing, businesses using ShopMe have experienced:
- **42% Higher Conversion Rate**: Compared to traditional e-commerce websites
- **67% Reduction in Response Time**: For customer inquiries and support requests
- **28% Increase in Average Order Value**: Through contextual product recommendations
- **53% Decrease in Cart Abandonment**: Due to conversational reminders and obstacle removal
- **3.2x Higher Customer Retention**: From improved engagement and personalized follow-ups

#### AI Commerce Use Cases Beyond Traditional Retail
The ShopMe platform enables unique commerce scenarios impossible with traditional e-commerce:
- **Interactive Product Discovery**: "I'm looking for a gift for my mom who loves cooking Italian food"
- **Personalized Recommendations**: "Based on your past purchases, you might enjoy these new arrivals..."
- **Contextual Problem Solving**: "The shirt I bought is too small, can I exchange it?"
- **Anticipatory Service**: "I notice your order will arrive tomorrow. Would you like preparation instructions?"
- **Relationship Building**: "It's been a month since your purchase. How are you enjoying your new espresso machine?"

By blending commerce capabilities with conversational AI within the world's most popular messaging platform, ShopMe delivers a fundamentally different approach to digital commerce—one that's more natural, accessible, and effective than traditional e-commerce solutions.

## CORE FUNCTIONALITY

### 1. Multi-tenant Business Platform (Priority: Must-have)
- **Purpose**: Enable multiple businesses to operate independently on the platform
- **Capabilities**:
  - Workspace creation and management
  - Multi-language support (IT, EN, ES)
  - White-label customization
  - Role-based access control
  - Customizable business hours
- **Technical Requirements**:
  - Data isolation between tenants
  - Tenant-specific configuration storage
  - Resource usage monitoring per tenant

### 2. Products Management (Priority: Must-have)
- **Purpose**: Allow businesses to showcase and sell their products
- **Capabilities**:
  - Complete CRUD operations for product management
  - Detailed product information including images, descriptions, and pricing
  - Product categorization and tagging
  - Inventory management capabilities
  - Product visibility controls
  - Custom fields for industry-specific attributes
- **User Interaction**:
  - Intuitive web interface for product management
  - Bulk import/export functionality
  - Product preview in WhatsApp format
- **Integration Points**:
  - Categories system
  - Offers engine
  - WhatsApp conversation flow

### 3. Categories Management (Priority: Must-have)
- **Purpose**: Organize products in a logical structure for easy navigation
- **Capabilities**:
  - Hierarchical category structure (parent/child relationships)
  - Category-specific attributes and settings
  - Category-based navigation in chat interface
  - Featured categories for promotions
  - Automatic product suggestions based on category browsing
- **User Interaction**:
  - Drag-and-drop category reordering
  - Category visibility toggles
  - Category performance metrics
- **Integration Points**:
  - Products system
  - AI recommendation engine
  - Search functionality

### 4. Offers Management (Priority: Should-have)
- **Purpose**: Create promotional campaigns to drive sales
- **Capabilities**:
  - Time-limited promotional campaigns
  - Discount code generation and management
  - Bundle deals configuration
  - Seasonal or special event promotions
  - Targeted offers based on customer segments
  - Performance tracking for promotional activities
- **User Interaction**:
  - Campaign creation wizard
  - Visual campaign timeline
  - A/B testing interface (future)
- **Integration Points**:
  - Products and categories
  - Customer segmentation
  - WhatsApp messaging

### 5. Settings Management (Priority: Must-have)
- **Purpose**: Configure and customize the platform behavior
- **Capabilities**:
  - Workspace configuration (name, logo, description)
  - WhatsApp API connection settings
  - Language and currency preferences
  - Notification preferences
  - User role and permission management
  - System behavior customization
  - Rate limiting configuration and monitoring
  - Message volume controls and thresholds
- **User Interaction**:
  - Settings dashboard with categorical organization
  - Configuration validation
  - Changes audit log
  - Usage statistics and threshold visualization
- **Technical Requirements**:
  - Secure storage of API keys
  - Real-time configuration updates
  - Configuration version control
  - Rate limiting enforcement mechanisms

### 6. WhatsApp AI Integration (Priority: Must-have)
- **Purpose**: Enable natural conversations with customers through WhatsApp
- **Capabilities**:
  - AI-powered response generation
  - Product recommendations
  - FAQ handling
  - Conversational commerce
  - Context-aware interactions
  - Multi-language support
- **User Interaction**:
  - Prompt configuration interface
  - Conversation testing tools
  - Conversation monitoring dashboard
- **Technical Requirements**:
  - OpenRouter API integration
  - Conversation state management
  - High-availability messaging infrastructure

### Message Processing Flow

```mermaid
flowchart TD
    Start([Incoming WhatsApp Message]) --> WorkspaceCheck{Workspace Active?}
    
    WorkspaceCheck -->|No| ErrorMsg[Return Error]
    WorkspaceCheck -->|Yes| BlockCheck{User Blocked?}
    
    BlockCheck -->|Yes| IgnoreMsg[Ignore Message]
    BlockCheck -->|No| CustomerCheck{User Registered?}
    
    CustomerCheck -->|No| SendRegistration[Send Registration Link]
    SendRegistration --> GDPRCheck{GDPR Approval?}
    
    GDPRCheck -->|No| RequestConsent[Request GDPR Consent]
    GDPRCheck -->|Yes| ProcessMessage[Process Message]
    
    CustomerCheck -->|Yes| ProcessMessage
    
    ProcessMessage --> RAG[RAG]
    RAG --> LLM[LLM]
    LLM --> FunctionCalls{Need Function Call?}
    
    FunctionCalls -->|Yes| CallFunction[Execute Function]
    CallFunction --> FormatResponse[Format Response]
    
    FunctionCalls -->|No| FormatResponse
    
    FormatResponse --> SendResponse[Send WhatsApp Response]
    SendResponse --> End([End])
    
    classDef process fill:#66BB6A,stroke:#388E3C,color:white
    classDef decision fill:#42A5F5,stroke:#1976D2,color:white
    classDef action fill:#AB47BC,stroke:#7B1FA2,color:white
    classDef start fill:#FF7043,stroke:#E64A19,color:white
    
    class Start,End start
    class WorkspaceCheck,BlockCheck,CustomerCheck,GDPRCheck,FunctionCalls decision
    class ProcessMessage,RAG,LLM,CallFunction,FormatResponse process
    class ErrorMsg,IgnoreMsg,SendRegistration,RequestConsent,SendResponse action
```

### 7. GDPR Compliance (Priority: Must-have)
- **Purpose**: Ensure regulatory compliance and protect user data
- **Capabilities**:
  - Consent management system
  - Data processing records
  - Right to access implementation
  - Right to be forgotten procedures
  - Data minimization practices
  - Privacy policy and terms generator
  - Data breach notification workflow
- **User Interaction**:
  - Consent collection interfaces
  - Data access request handling
  - Privacy settings management
- **Technical Requirements**:
  - Secure data storage
  - Data anonymization capabilities
  - Audit trail for compliance actions

### Meta WhatsApp Business API Integration

#### WhatsApp Business Channel Setup
- **Purpose**: Allow businesses to connect their own WhatsApp Business API accounts
- **Setup Process**:
  - OAuth-based authorization with Meta Business Manager
  - WhatsApp Business Account verification guidance
  - Phone number registration and approval workflow
  - Webhook endpoint configuration
  - Message template approval process
- **Requirements**:
  - Valid Meta Business Manager account
  - Approved WhatsApp Business Account (WABA)
  - Verified business identity
  - Compliant privacy policy
- **Technical Components**:
  - API credentials management
  - Secure token storage
  - Connection health monitoring
  - Automatic reconnection on failure
  - Rate limit compliance enforcement
- **Implementation Options**:
  - Direct Meta API integration
  - Third-party provider connection (Twilio, MessageBird, etc.)
  - WhatsApp Cloud API connection
  - On-premises deployment for enterprise clients

## OUT OF SCOPE FEATURES (WIP)

The following features are currently marked as "Work in Progress" and are outside the scope of the initial release:

### Orders Management
- Order processing and tracking
- Order status management
- Invoice generation and management
- Shipping integration and tracking
- Returns and refund processing

### Analytics
- Real-time analytics dashboard
- Custom report generation
- Data visualization tools
- Export capabilities
- Performance metrics and KPIs

### Advanced Push Notifications
- A/B testing for notification content
- Advanced segmentation based on behavior
- Rich media notifications
- Location-based targeting
- Frequency optimization

### Payment Integration
- Integrated payment processing
- Payment plan implementation
- Subscription management
- Payment gateway integration
- Fraud prevention tools

## MINIMUM MARKETABLE PRODUCT (MMP)

The following features are planned for the MMP phase, after the initial MVP release:

### Enhanced Orders Management
- Complete order lifecycle management
- Order fulfillment workflows
- Custom order statuses
- Automated order notifications
- Bulk order processing capabilities

### Advanced Analytics Dashboard
- Customer behavior analysis
- Conversion funnel visualization
- Revenue and sales performance tracking
- Chat quality and sentiment analysis
- Custom report builder with export options

### Full Payment Integration
- Multiple payment gateway integrations
- Saved payment methods for customers
- Subscription and recurring payment handling
- Advanced fraud detection and prevention
- Automated refund processing

### Multi-Agent Collaboration
- Team inbox with shared conversation access
- Agent routing and assignment rules
- Supervisor monitoring and intervention tools
- Agent performance metrics and reporting
- Shift management and availability tracking

### Enhanced AI Capabilities
- Advanced sentiment analysis and emotional intelligence
- Proactive customer outreach based on behavior
- Personalized product recommendations based on preferences
- Automated follow-up sequences for abandoned carts
- A/B testing of different AI prompts and approaches

### Function Call Documentation

The system implements several AI function calls to handle specific operations:

```
+-------------------------+--------------------------------------+----------------+
| FUNCTION NAME           | DESCRIPTION                          | STATUS         |
+-------------------------+--------------------------------------+----------------+
| get_product_info        | Get details about a specific product | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_event_by_date       | Get events scheduled for a date      | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_service_info        | Get details about a specific service | Implemented    |
+-------------------------+--------------------------------------+----------------+
| welcome_user            | Generate welcome message for users   | Implemented    |
+-------------------------+--------------------------------------+----------------+
| create_order            | Create a new order from cart items   | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_cart_info           | Get contents of a user's cart        | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_order_status        | Check status of specific order       | Implemented    |
+-------------------------+--------------------------------------+----------------+
| add_to_cart             | Add product to shopping cart         | Implemented    |
+-------------------------+--------------------------------------+----------------+
| remove_from_cart        | Remove product from shopping cart    | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_product_list        | Get list of available products       | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_products_by_category| Get products filtered by category    | Planned        |
+-------------------------+--------------------------------------+----------------+
| get_categories          | Get list of all product categories   | Planned        |
+-------------------------+--------------------------------------+----------------+
| get_faq_info            | Get information from FAQ database    | Implemented    |
+-------------------------+--------------------------------------+----------------+
| get_generic_response    | Handle general conversation/fallback | Implemented    |
+-------------------------+--------------------------------------+----------------+
```

Additional function calls planned for the MMP phase:

```
+-------------------------+--------------------------------------+----------------+
| FUNCTION NAME           | DESCRIPTION                          | STATUS         |
+-------------------------+--------------------------------------+----------------+
| checkOrderStatus        | Get detailed order status info       | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| listRecentOrders        | List customer's most recent orders   | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| orderDetails            | Get complete order details           | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| trackShipment           | Get real-time shipping information   | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| requestInvoice          | Generate and send order invoice      | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| listInvoices            | List available customer invoices     | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| downloadInvoice         | Generate invoice download link       | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
| changeInvoiceAddress    | Update invoice billing details       | Planned for MMP|
+-------------------------+--------------------------------------+----------------+
```

## MONITORING PLANS

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

## TECHNICAL ARCHITECTURE

### Architecture Diagram

```mermaid
flowchart TB
        User["Customer via WhatsApp"] 
        Operator["Business Operator"]
    
    subgraph "Frontend"
        React["React + TypeScript\n(Tailwind CSS)"]
    end
    
    subgraph "Backend"
        NodeJS["Node.js Express\nApplication"]
        API["REST API"]
    end
    
    subgraph "Data Layer"
        Prisma["Prisma ORM"]
        DB["PostgreSQL Database"]
    end
    
    subgraph "External Services"
        WhatsApp["WhatsApp Business API"]
        OpenAI["OpenAI / LLM Services"]
        Payment["Payment Gateway"]
    end
    
    User <--> WhatsApp
    WhatsApp <--> NodeJS
    Operator --> React
    React --> API
    API --> NodeJS
    NodeJS --> Prisma
    Prisma --> DB
    NodeJS <--> OpenAI
    NodeJS <--> Payment
    
    classDef frontend fill:#42A5F5,stroke:#1976D2,color:white
    classDef backend fill:#66BB6A,stroke:#388E3C,color:white
    classDef database fill:#AB47BC,stroke:#7B1FA2,color:white
    classDef external fill:#FF7043,stroke:#E64A19,color:white
    classDef user fill:#78909C,stroke:#455A64,color:white

    class React frontend
    class NodeJS,API backend
    class Prisma,DB database
    class WhatsApp,OpenAI,Payment external
    class User,Operator user
```

#### Architecture Pattern and Rationale

ShopMe uses a Domain-Driven Design (DDD) architecture with clean separation of concerns across multiple layers. This architecture was chosen for several reasons:

**Benefits:**

1. **Business Focus**: Places core business concepts at the center of the application, making it easier to align with stakeholder goals
2. **Scalability**: Clear layer separation allows independent scaling of different components
3. **Maintainability**: Well-defined boundaries between layers make the codebase easier to maintain
4. **Testability**: Each layer can be tested in isolation without dependencies on other layers
5. **Flexibility**: External services can be swapped without affecting the core domain logic
6. **Multi-tenant Design**: Supports clean isolation between different businesses on the platform
7. **Security**: Layered approach helps implement security controls at appropriate levels

**Trade-offs:**

1. **Initial Complexity**: More boilerplate and indirection compared to simpler architectures
2. **Learning Curve**: Team members need to understand DDD concepts
3. **Development Speed**: May slow initial development compared to more rapid approaches
4. **Performance Overhead**: Additional abstraction layers can introduce minor performance costs
5. **Decision Overhead**: Requires more architectural decisions during development

The architecture's strengths in maintainability, scalability, and business alignment outweigh these trade-offs for a complex, multi-tenant application like ShopMe that handles sensitive customer data and complex business processes.

### Database
- **Primary Database**: PostgreSQL
- **ORM**: Prisma for type-safe database access
- **Migrations**: Prisma Migration for version control
- **Backup Strategy**: Automated daily backups with point-in-time recovery

### Authentication and Token Management

Our system uses JWT (JSON Web Token) authentication to keep user accounts secure. Here's how it works:

#### Token Types and Security Features

| Token Type | Duration | Storage | Purpose |
|------------|----------|---------|---------|
| Access Token | 1 hour | HTTP-only cookie | Authorizes API calls |
| Refresh Token | 7 days | HTTP-only cookie | Gets new access tokens |

#### How Our System Protects Your Account

We implement multiple security layers to protect user accounts:
- We rotate secret keys regularly to prevent compromise
- We sign tokens with HS256 algorithm for integrity verification
- We include only essential information in token payloads
- We validate token sources through HTTP headers
- We enforce rate limits on all token-related endpoints

#### Permission System

Our role-based access control system includes:

| Role | Access Level | Example Permissions |
|------|--------------|---------------------|
| Admin | Full access | Manage all workspaces, users, and settings |
| Manager | Workspace management | Manage products, orders, and team members |
| Agent | Customer service | Handle customer chats and process orders |

We scope all permissions to specific workspaces, ensuring data isolation between different businesses.

#### Secure Operations with Temporary Links

For sensitive operations like payments, we create secure, time-limited links:

```
Example Flow:
1. Customer wants to complete purchase in WhatsApp chat
2. System generates unique temporary token: "pay_ord_b1f493a2" (valid for 1 hour)
3. System sends link: "https://pay.shopme.com/checkout/pay_ord_b1f493a2"
4. Customer clicks link and is taken to secure payment page
5. After payment, system verifies token, processes payment, and invalidates token
6. System confirms successful payment in WhatsApp chat
```

These tokens contain encrypted information about the operation type, resources involved, and expiration time. We verify tokens before allowing any access to sensitive data or operations.

### Domain-Driven Design Architecture

The backend follows a Domain-Driven Design (DDD) architecture as specified in the project's ARCHITECTURE.md:

- **Layer Separation**:
  - **Domain Layer**: Core business entities and rules
  - **Application Layer**: Use cases and application services
  - **Infrastructure Layer**: Technical implementations and external services
  - **Interfaces Layer**: API controllers and routes

- **Key Design Principles**:
  - Business domain at the center of design
  - Clear boundaries between layers
  - Repository pattern for data access
  - Dependency inversion principle

- **Data Flows**:
  - External requests enter through Interfaces layer
  - Controllers delegate to Application services
  - Application services orchestrate Domain entities
  - Infrastructure layer handles persistence and external communications

- **Testing Approach**:
  - Unit tests for domain logic
  - Integration tests for application services
  - End-to-end tests for API endpoints

### Project Structure

The project is organized as a monorepo using Turborepo for efficient management of multiple packages:

#### Backend Structure

```
/backend
  /src
    /domain                # Core business logic
      /entities            # Business models
      /repositories        # Data access interfaces
      /value-objects       # Immutable value objects
    /application           # Application logic
      /services            # Business orchestration
      /use-cases           # Specific features
      /dto                 # Data transfer objects
    /infrastructure        # Technical implementations
      /repositories        # Database access
      /persistence         # ORM configurations
      /external-services   # 3rd party integrations
    /interfaces            # External interfaces
      /http
        /controllers       # Request handlers
        /routes            # API routes
      /websockets          # WebSocket handlers
    /config                # Configuration settings
    /utils                 # Utility functions
  /tests
    /unit                  # Unit tests
    /integration           # Integration tests
    /e2e                   # End-to-end tests
  /prisma                  # Prisma schema and migrations
  /scripts                 # Build and deployment scripts
```

#### Frontend Structure

```
/frontend
  /src
    /components
      /shared              # Reusable components
      /layout              # Layout components
      /forms               # Form components
      /ui                  # UI primitives
    /hooks                 # Custom React hooks
    /pages                 # Page components
    /contexts              # React contexts
    /services              # API services
    /utils                 # Utility functions
    /types                 # TypeScript type definitions
    /styles                # Global styles
    /assets                # Images, fonts, etc.
  /public                  # Static assets
  /tests                   # Frontend tests
```

### Database Seeding and Migrations

The platform includes a robust database initialization and seeding strategy:

- **Migration Strategy**:
  - Prisma Migration for schema version control
  - Separate migration files for each schema change
  - Sequential migration versioning with timestamps
  - Environment-specific migrations when needed

- **Data Seeding**:
  - Development environment seeding for testing
  - Sample data generation for demo workspaces
  - Seed data categorized by entity types
  - Multi-tenant seed data with workspace isolation
  - Customizable seed data volume

- **Seed Data Categories**:
  - Administrative users with predefined roles
  - Sample product catalog with categories
  - Customer profiles with diverse characteristics
  - Sample chat history and message content
  - Predefined AI prompts and configurations
  - Demo orders with various statuses

### Additional Technical Considerations

- **Error Handling**:
  - Centralized error handling middleware
  - Standardized API error responses
  - Custom error classes for domain-specific errors
  - Client-friendly error messages with internal logging

- **Logging**:
  - Structured logging with Winston
  - Log levels (debug, info, warn, error)
  - Request ID tracking across services
  - Redaction of sensitive information

- **Performance Optimization**:
  - Response caching strategies
  - Database query optimization
  - Connection pooling
  - Asset compression and delivery

- **Deployment Pipeline**:
  - CI/CD integration with GitHub Actions
  - Automated testing before deployment
  - Staged deployment environments
  - Blue-green deployment for zero downtime
  - Rollback capabilities for failed deployments


## EJEMPLOS DE CONVERSACIÓN

### Registro de Nuevo Usuario

**Cliente**: "Hola, me gustaría comprar algunos productos."

**ShopMe**: "¡Hola! Estaré encantado de ayudarle con su compra. Para ofrecerle la mejor experiencia y poder procesar sus pedidos, necesitamos que se registre primero. 

He creado un enlace de registro seguro para usted: [https://shopme.com/registro/token_u7d9f3a1b5]

Este enlace es personal y caduca en 24 horas por motivos de seguridad."

**Cliente**: "¿Es seguro? ¿Qué pasa con mis datos?"

**ShopMe**: "Entiendo su preocupación por la privacidad. Su seguridad es nuestra prioridad:

1. El enlace utiliza un token único y temporal para proteger su proceso de registro
2. Todos sus datos se almacenan de forma segura en nuestros servidores encriptados
3. No compartimos sus datos personales con ningún modelo de IA externo
4. Cumplimos totalmente con la normativa GDPR de protección de datos

Una vez registrado, podrá realizar compras, seguir sus pedidos y recibir facturas electrónicas fácilmente."

**Cliente**: *[Completa el registro a través del enlace]*

**ShopMe**: "¡Gracias por registrarse! Su cuenta ha sido creada correctamente. 

Nos complace informarle que valoramos su privacidad y seguridad. Todos sus datos se guardan exclusivamente en nuestra base de datos segura y no se comparten con modelos de IA externos.

¿En qué puedo ayudarle hoy? Puedo mostrarle nuestros productos destacados, ayudarle a encontrar algo específico o responder cualquier pregunta sobre nuestros servicios."

### Descubrimiento y Compra de Productos

**Cliente**: "Hola, estoy buscando productos típicos sicilianos para regalar."

**ShopMe**: "¡Buenos días! Estaré encantado de ayudarle a encontrar productos típicos sicilianos para un regalo. Para sugerirle las mejores opciones, ¿podría saber:

1. ¿Tiene un presupuesto en mente?
2. ¿Prefiere productos dulces, salados o un surtido?
3. ¿La persona que recibirá el regalo tiene alergias o intolerancias alimentarias?"

**Cliente**: "Mi presupuesto es de unos 50€. Preferiría un surtido de dulces y salados. No hay alergias a considerar."

**ShopMe**: "Según sus preferencias, aquí tiene tres packs de regalo que podrían interesarle:

1. **Box Sicilia Clásica** (45€)
   - 1 botella de passito de Pantelleria (375ml)
   - 250g de pistachos de Bronte
   - 200g de pasta de almendras
   - 100g de caponata artesanal
   - Caja de regalo con lazo

2. **Degustación Siciliana** (55€)
   - 1 crema de pistacho para untar (200g)
   - 1 pesto de pistacho (180g)
   - 250g de cantucci de almendras
   - 200g de chocolate de Módica a la naranja
   - 1 mermelada de higos chumbos (240g)
   - Caja artesanal de madera

3. **Sabores de la Isla** (48€)
   - 500g de pasta extruida en bronce
   - 1 botella de aceite de oliva virgen extra (250ml)
   - 1 tarro de pesto trapanés (180g)
   - 100g de sal marina con hierbas sicilianas
   - 150g de crujiente de sésamo
   - Envoltorio de regalo con papel personalizado

¿Cuál de estas opciones le interesa más?"

**Cliente**: "La Degustación Siciliana parece excelente. ¿Cómo se puede utilizar la crema de pistacho?"

**ShopMe**: "La crema de pistacho es un producto versátil y delicioso. Puede utilizarse de varias formas:
- Untada en rebanadas de pan o croissants para un desayuno goloso
- Como relleno para tartas, galletas o pasteles
- Añadida al helado de vainilla para darle un toque de sabor
- Para preparar tiramisú o tarta de queso de pistacho
- Simplemente disfrutada a cucharadas como postre

Está elaborada con pistachos de Bronte DOP (40%), azúcar moreno y aceite de girasol. No contiene conservantes ni colorantes.

¿Desea proceder con la compra de la Degustación Siciliana o preferiría ver otras opciones?"

**Cliente**: "Me llevo la Degustación Siciliana. ¿Puede entregarse antes del próximo viernes?"

**ShopMe**: "¡Excelente elección! Sí, podemos garantizar la entrega antes del próximo viernes. El artículo está disponible en almacén y califica para envío exprés gratuito.

¿Quiere proceder con el pedido? Puedo crear el pedido y enviarle un enlace de pago seguro."

**Cliente**: "Sí, gracias."

**ShopMe**: "He creado su pedido para la Degustación Siciliana (55€). Aquí tiene el enlace de pago seguro: [Enlace de Pago]

Una vez completado el pago, recibirá:
1. Un email de confirmación del pedido con la información de seguimiento
2. Actualizaciones sobre la entrega vía WhatsApp
3. Su factura electrónica

La fecha estimada de entrega es el viernes 12 de mayo. ¿Puedo ayudarle con algo más?"

**Cliente**: "Eso es todo, ¡gracias!"

**ShopMe**: "¡Gracias por su compra! Apreciamos su confianza. Su pedido está siendo procesado y recibirá en breve la información de seguimiento. Si tiene preguntas sobre su pedido o productos, no dude en contactarnos aquí. ¡Le deseo un buen día!"

### Solicitud de Factura

**Cliente**: "Necesito la factura de mi pedido #FS45678 para mi contabilidad."

**ShopMe**: "Por supuesto, puedo ayudarle con eso. He generado un enlace seguro donde puede descargar su factura: [https://shopme.com/facturas/token_f8e2c7d9a6]

Este enlace es válido durante 48 horas por motivos de seguridad. La factura está en formato PDF y contiene todos los detalles necesarios para su contabilidad. 

También he enviado una copia a su correo electrónico registrado. ¿Necesita que cambie algún dato en la factura, como la dirección fiscal o el NIF?"

**Cliente**: "No, está todo bien. ¿Puedo acceder a mis facturas anteriores también?"

**ShopMe**: "Sí, desde su área personal puede acceder a todas sus facturas anteriores. He creado un enlace seguro a su historial de facturas: [https://shopme.com/mi-cuenta/facturas/token_h7j9k2l5m8]

Este enlace le llevará directamente a la sección de facturas de su cuenta tras verificar su identidad con el token incluido. Desde allí podrá descargar, imprimir o reenviar por email cualquier factura de pedidos anteriores."

### Estado del Pedido y Seguimiento

**Cliente**: "¿Dónde está mi pedido #FS92345? Ya debería haber llegado."

**ShopMe**: "Disculpe las molestias. Déjeme verificar inmediatamente el estado de su pedido #FS92345.

He comprobado y veo que su paquete está actualmente en reparto. Para que pueda seguirlo en tiempo real, he generado un enlace de seguimiento seguro: [https://shopme.com/seguimiento/token_t6r8e2k4i9]

Este enlace le mostrará la ubicación exacta de su paquete, la hora estimada de entrega, y la opción de contactar directamente con el repartidor si fuera necesario. El enlace se actualiza cada 5 minutos con la información más reciente.

¿Hay alguna instrucción especial que quiera añadir para la entrega?"

**Cliente**: "No puedo estar en casa. ¿Pueden dejarlo con mi vecino?"

**ShopMe**: "He actualizado las instrucciones de entrega para que dejen el paquete con su vecino. También he creado un enlace donde puede autorizar esta entrega alternativa: [https://shopme.com/autorizar-entrega/token_a7d9c3b5]

Una vez que haga clic en el enlace y confirme la autorización, el repartidor recibirá la nueva instrucción inmediatamente. Esta autorización queda registrada en nuestro sistema por motivos de seguridad.

Le notificaremos por WhatsApp en cuanto se realice la entrega, con el nombre de la persona que recibió el paquete."

## VERTICAL MARKET ADAPTABILITY

The platform is designed to be adaptable to various vertical markets with minimal customization requirements. Each vertical adaptation includes:

### Implementation Requirements

1. **Specialized Vocabulary**: Industry-specific terminology training for the AI
2. **Custom Product Attributes**: Specialized fields for each vertical (e.g., nutrients for food, sizes for apparel)
3. **Vertical-Specific Functions**: Custom function calls for industry processes
4. **Integration Points**: Connections to industry-standard software
5. **Visual Elements**: Industry-appropriate templates for rich media cards and responses

The platform's modular architecture ensures these adaptations can be implemented quickly, typically within 2-4 weeks for a new vertical market launch.

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

- `GET /api/customers/:id/orders`
  - **Description**: Gets customer's order history
  - **Parameters**: 
    - `id` (required): Customer ID
    - `status` (optional): Filter by order status
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Customer's orders

- `GET /api/customers/:id/conversations`
  - **Description**: Gets customer's conversation history
  - **Parameters**: 
    - `id` (required): Customer ID
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: Customer's WhatsApp conversations

### Offers Management

- `GET /api/offers`
  - **Description**: Retrieves offers and promotions list
  - **Parameters**: 
    - `workspace_id` (required): Workspace identifier
    - `status` (optional): Filter by active, upcoming, or expired
    - `page`, `limit` (optional): Pagination parameters
  - **Returns**: List of offers with details

- `POST /api/offers`
  - **Description**: Creates a new offer
  - **Body**: 
    - `name`: Offer name
    - `description`: Offer description 
    - `offer_type`: Discount type (percentage, fixed, buy_x_get_y)
    - `discount_value`: Value of discount
    - `products`: List of applicable product IDs
    - `categories`: List of applicable category IDs
    - `start_date`: Offer start date
    - `end_date`: Offer end date
    - `min_purchase`: Minimum purchase requirement
    - `usage_limit`: Maximum redemptions allowed
    - `code`: Promo code (optional)
  - **Returns**: Created offer details

- `GET /api/offers/:id`
  - **Description**: Gets details of a specific offer
  - **Parameters**: `id` (required): Offer ID
  - **Returns**: Complete offer details including usage statistics

- `PUT /api/offers/:id`
  - **Description**: Updates an offer
  - **Parameters**: `id` (required): Offer ID
  - **Body**: Fields to update
  - **Returns**: Updated offer

- `DELETE /api/offers/:id`
  - **Description**: Deletes an offer
  - **Parameters**: `id` (required): Offer ID
  - **Returns**: Deletion confirmation

- `POST /api/offers/:id/activate`
  - **Description**: Activates an offer
  - **Parameters**: `id` (required): Offer ID
  - **Returns**: Activated offer status

- `POST /api/offers/:id/deactivate`
  - **Description**: Deactivates an offer
  - **Parameters**: `id` (required): Offer ID
  - **Returns**: Deactivated offer status

- `GET /api/offers/validate/:code`
  - **Description**: Validates a promo code
  - **Parameters**: 
    - `code` (required): Promo code to validate
    - `customer_id` (optional): Customer trying to use code
    - `cart_value` (optional): Current cart value
  - **Returns**: Offer validity and applicable discount